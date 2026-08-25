import type { DictionaryProvider, WordMetadata } from './DictionaryProvider';
import { DEV_DICTIONARY_VERSION, DEV_WORD_LIST, type DevWordEntry } from './devWordList';

interface Entry {
  definition: string | null;
  metadata: WordMetadata;
}

/** Case-insensitive; never strips or collapses Å/Ä/Ö (DICTIONARY_POLICY.md section 37). */
function normalize(word: string): string {
  return word.toUpperCase();
}

/**
 * A trivial in-memory DictionaryProvider backed by a small fixture word list.
 * Suitable for V0.0 development/tests only — see devWordList.ts.
 */
export class InMemoryDictionaryProvider implements DictionaryProvider {
  private readonly entries: Map<string, Entry>;
  private readonly version: string;

  constructor(entries: DevWordEntry[] = DEV_WORD_LIST, version: string = DEV_DICTIONARY_VERSION) {
    this.version = version;
    this.entries = new Map(
      entries.map((entry) => [
        normalize(entry.word),
        { definition: entry.definition ?? null, metadata: entry.metadata },
      ]),
    );
  }

  validateWord(word: string): boolean {
    return this.entries.has(normalize(word));
  }

  getDefinition(word: string): string | null {
    return this.entries.get(normalize(word))?.definition ?? null;
  }

  getMetadata(word: string): WordMetadata | null {
    return this.entries.get(normalize(word))?.metadata ?? null;
  }

  getDictionaryVersion(): string {
    return this.version;
  }
}
