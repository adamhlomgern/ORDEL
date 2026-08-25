# Ordel — Dictionary Source Registry

Stub, per `DICTIONARY_POLICY.md` section 61: a machine/human-readable registry
of every external lexical source used to build `ordel-sv`, so licensing is
never left to developer memory.

No external source has been imported yet — V0.0 ships only a small, clearly
labeled dev-only fixture (`packages/dictionary/src/devWordList.ts`,
`ordel-sv-dev-0.0.0`), which is **not** derived from any of these sources and
requires no attribution.

This registry will be filled in as the real `ordel-sv-1.0` pipeline is built
(`DICTIONARY_POLICY.md` sections 4-15, 60-77). Expected entries, per source:

| Field                              | Description                              |
| ---------------------------------- | ---------------------------------------- |
| Source name                        | e.g. "SALDO"                             |
| Provider                           | e.g. Sprakbanken                         |
| Dataset version                    | exact version/snapshot used              |
| Download/source location           | where it was retrieved                   |
| License                            | applicable license                       |
| Required attribution               | exact text/format required               |
| Date retrieved                     | when the snapshot was taken              |
| Modifications performed            | any transformation applied before import |
| Included in production dictionary? | yes/no, which dictionary version         |

**Gate:** per `DICTIONARY_POLICY.md` section 62, no external dataset may be
imported into production merely because it is publicly downloadable — license
must be identified and attribution requirements recorded here _before_ the
data enters the build pipeline.
