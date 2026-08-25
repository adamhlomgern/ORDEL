# Ordel — Design System (V0.0)

No component library exists yet — deliberately (`MASTER_PRODUCT_BRIEF.md`
section 50 warns against premature giant component libraries, and section 53
says V0.0 should not build much UI).

## What exists today

A single token file: `apps/mobile/src/design/tokens.ts`, exporting `colors`,
`spacing`, `radii`, and `typography`. These are used directly in
`HomeScreen.tsx` — there is no `Button`/`Card`/`Text` primitive layer yet.

The palette leans into the intended direction from
`MASTER_PRODUCT_BRIEF.md` section 19 (Scandinavian, calm, warm, restrained) —
warm off-white background, dark warm ink text, a muted deep-green accent — but
it is a starting point, not a final brand decision.

## When to grow this

Promote tokens into `packages/design-system` (or similar) only once a second
consumer needs them (e.g. a future web companion), or once V0.1/V0.2 UI work
needs shared primitives like `Button`, `Card`, `Tile`, `Rack`, `BoardCell`
(the list in `MASTER_PRODUCT_BRIEF.md` section 50). Until then, keep it in
`apps/mobile` to avoid an abstraction with only one caller.
