#!/usr/bin/env node
// Supabase's local edge-runtime container only bind-mounts supabase/functions/
// into its filesystem — a relative import reaching outside it (e.g.
// ../../packages/game-engine/src/index.ts) resolves fine as far as Deno's
// module graph is concerned, but the file is invisible inside the container,
// so it fails at worker boot with "Module not found" (discovered while
// implementing V0.1 Milestone C — see docs/DECISIONS.md). Production
// `supabase functions deploy` does not have this limitation (it bundles the
// resolved graph), but local `supabase start` / `supabase functions serve`
// do. This script copies the three workspace packages the Edge Functions
// depend on into supabase/functions/_vendor/ (gitignored, regenerated here)
// so deno.json's import map can point at paths inside the mounted directory.
// Re-run this after any change to packages/{types,dictionary,game-engine}.

import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const vendorDir = join(rootDir, 'supabase', 'functions', '_vendor');
const packages = ['types', 'dictionary', 'game-engine'];

// Deno's native resolver (unlike the "bundler" moduleResolution used
// everywhere else in this repo) requires explicit extensions on relative
// specifiers. Cross-package `@ordel/*` specifiers are untouched — those go
// through deno.json's import map, not this rewrite.
const RELATIVE_IMPORT = /from\s+(['"])(\.\.?\/[^'"]+)\1/g;

function addTsExtension(filePath) {
  const original = readFileSync(filePath, 'utf8');
  const rewritten = original.replace(RELATIVE_IMPORT, (match, quote, specifier) => {
    if (/\.[a-zA-Z0-9]+$/.test(specifier)) {
      return match; // already has an extension
    }
    return `from ${quote}${specifier}.ts${quote}`;
  });
  if (rewritten !== original) {
    writeFileSync(filePath, rewritten);
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts')) {
      addTsExtension(full);
    }
  }
}

rmSync(vendorDir, { recursive: true, force: true });
mkdirSync(vendorDir, { recursive: true });

for (const pkg of packages) {
  const src = join(rootDir, 'packages', pkg, 'src');
  const dest = join(vendorDir, pkg, 'src');
  cpSync(src, dest, { recursive: true, filter: (path) => !path.endsWith('.test.ts') });
  walk(dest);
  console.log(`Synced packages/${pkg}/src -> supabase/functions/_vendor/${pkg}/src`);
}
