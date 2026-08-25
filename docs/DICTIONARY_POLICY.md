# ORDEL — DICTIONARY POLICY

**Document:** `docs/DICTIONARY_POLICY.md`
**Status:** Authoritative dictionary and lexical policy
**Product:** Ordel
**Initial language:** Swedish (`sv-SE`)
**Initial dictionary:** `ordel-sv-1.0`
**Last updated:** 2026-08-24

---

## 1. PURPOSE

This document defines how Ordel constructs, maintains, validates and versions
its playable Swedish dictionary.

It is the source of truth for:

- lexical source selection
- word inclusion
- word exclusion
- inflections
- proper nouns
- personal names
- geographical names
- brands
- abbreviations
- slang
- offensive vocabulary
- normalization
- manual editorial additions
- player word suggestions
- dictionary versioning
- source attribution

GAME_RULES.md defines how dictionary validation affects gameplay.

This document defines what the dictionary contains.

Claude Code MUST NOT invent additional lexical rules when implementing the
dictionary pipeline.

If a case is not covered here, flag it for editorial/product review.

---

## 2. CORE PHILOSOPHY

Ordel uses a:

**DESCRIPTIVE, GENEROUS, CURATED**

dictionary philosophy.

The central principle is:

> If a word or name has established use in Swedish language or Swedish
> cultural context, Ordel should generally prefer accepting it rather than
> rejecting it.

Ordel is intentionally more permissive than traditional restrictive word-game
dictionaries.

However:

**generous does not mean arbitrary.**

A letter sequence must have defensible linguistic, cultural, technical or
onomastic existence.

The dictionary must not accept random strings merely because they can be found
somewhere on the internet.

---

## 3. ORDEL DICTIONARY

The authoritative playable dictionary is:

`ordel-sv`

The initial version is:

`ordel-sv-1.0`

The game engine validates against Ordel's generated dictionary.

It must NOT perform live validation directly against:

- SAOL
- SALDO
- Språkbanken
- Lantmäteriet
- external search engines
- third-party APIs

External datasets are INPUTS.

The generated Ordel dictionary is the gameplay SOURCE OF TRUTH.

---

## 4. DICTIONARY LAYERS

Ordel Swedish is assembled from multiple lexical layers.

Initial architecture:

1. STANDARD SWEDISH
2. MODERN / NEW WORDS
3. PERSONAL NAMES
4. GEOGRAPHICAL NAMES
5. ORDEL EXTENDED

Each accepted playable form is normalized into the unified Ordel dictionary.

Duplicate forms are merged rather than duplicated.

A word may therefore have multiple sources/categories.

---

## 5. LAYER 1 — STANDARD SWEDISH

Primary source:

**SALDO / SALDO morphology**

Purpose:

- standard Swedish vocabulary
- lexical entries
- morphological information
- inflected forms

SALDO-derived data forms the primary general-language foundation of Ordel
Swedish.

The dictionary importer should preserve source provenance.

Example conceptually:

word:
hundar

lemma:
hund

source:
saldo

category:
standard

---

## 6. INFLECTIONS

Ordel accepts valid Swedish inflected forms.

Examples conceptually include:

hund
hundar
hundens
hundarnas

provided the forms are legitimately generated or represented by the approved
lexical/morphological source.

Ordel does NOT restrict gameplay to dictionary headwords.

Morphological generation must use source data/rules.

Claude Code must NOT attempt to create Swedish inflections using ad-hoc string
rules.

For example:

adding `-ar` to arbitrary nouns is NOT a valid implementation.

---

## 7. COMPOUND WORDS

Swedish allows productive compounding.

This creates a special problem for word games because theoretically valid
compounds can be created almost indefinitely.

For V1:

**Ordel does NOT automatically accept every theoretically possible Swedish
compound.**

A compound must either:

- exist in an approved source,
- exist in Ordel Extended,
- or have been explicitly approved editorially.

Example:

A linguistically conceivable compound is not automatically playable merely
because its individual components are valid.

Future versions may introduce controlled compound analysis.

That must be separately specified and tested before activation.

---

## 8. LAYER 2 — MODERN AND NEW WORDS

Primary initial source:

**Språkrådet / Isof new-word data distributed by Språkbanken**

Purpose:

- newer vocabulary
- emerging Swedish usage
- terminology that may postdate older lexical resources

Inclusion in a new-word source makes a lexical item eligible for Ordel.

However, the importer must still apply Ordel's playable-form rules.

Multi-word expressions and punctuation-dependent expressions are not
automatically collapsed into board words.

---

## 9. LAYER 3 — PERSONAL NAMES

Ordel uses the:

**FULL ORDEL proper-noun policy.**

Personal names may therefore be valid gameplay words.

Initial data source:

**Swedish Names 2023 / Svenska namn 2023**

Initial automatic inclusion threshold:

**at least 100 people**

A name appearing in the source with a reported frequency of at least 100
people is eligible for automatic inclusion.

Example conceptually:

ADA → valid if threshold/source criteria are satisfied.

A name below the threshold is NOT automatically invalid forever.

It may be added manually through Ordel Extended if it has sufficient cultural,
historical or other established relevance.

---

## 10. WHY THE NAME THRESHOLD EXISTS

The source contains a very large number of spelling variants and rare names.

Ordel should recognize ordinary and established names without turning every
extremely rare spelling variation into a strategic two- or three-letter word.

The threshold is therefore an editorial/balance filter.

It is versioned policy.

Future versions may change the threshold after analysis.

A threshold change must NOT alter active games.

---

## 11. NOTABLE PERSONAL NAMES

Names of notable people may be included through Ordel Extended regardless of
the general population threshold.

Example conceptually:

ZLATAN

Eligibility requires established cultural/public usage.

The existence of one private person with a name does not by itself establish
notability.

Editorial additions should record why the form was accepted.

---

## 12. SURNAMES

Common or culturally established surnames may be accepted.

Automatic surname import is NOT part of `ordel-sv-1.0` unless a separately
approved dataset and threshold are added.

Notable surnames may be included through Ordel Extended.

---

## 13. LAYER 4 — GEOGRAPHICAL NAMES

Ordel accepts established geographical proper nouns.

Primary Swedish source:

**Lantmäteriet official place-name data**

Potential categories include:

- cities
- towns
- villages
- municipalities
- regions
- lakes
- rivers
- islands
- mountains
- other officially established geographical names

Examples conceptually:

SVERIGE
STOCKHOLM
VÄNERN
ÖREBRO

may be playable when present in the approved dictionary.

---

## 14. INTERNATIONAL GEOGRAPHICAL NAMES

Ordel Extended may include established Swedish forms of international
geographical names.

Examples conceptually:

LONDON
PARIS
TOKYO
EUROPA

Inclusion should be based on established Swedish usage.

A dedicated international geographic dataset may be added later.

Do not automatically import arbitrary global place-name databases into V1.

---

## 15. LAYER 5 — ORDEL EXTENDED

Ordel Extended is the editorial layer maintained specifically for Ordel.

It exists to cover established language that the primary datasets do not
adequately represent.

Potential categories include:

- slang
- youth language
- internet language
- colloquial language
- modern loanwords
- abbreviations
- initialisms
- acronyms
- technical terms
- professional terminology
- brands
- companies
- products
- notable personal names
- notable surnames
- international proper nouns
- popular-culture vocabulary
- gaming terminology
- dialect
- archaic vocabulary
- profanity
- sexual vocabulary
- vulgar vocabulary
- offensive vocabulary
- derogatory vocabulary

Ordel Extended is NOT a dumping ground for unverified strings.

Every manually accepted entry requires provenance.

---

## 16. ORDEL EXTENDED ENTRY REQUIREMENTS

A manually added entry should contain at minimum:

- playable form
- normalized form
- category
- evidence/source note
- date added
- dictionary version introduced

Where appropriate:

- lemma
- register
- language origin
- display label
- sensitivity metadata
- external reference
- editorial note

Example conceptual record:

word:
DEFFA

normalized_word:
DEFFA

category:
slang

register:
informal

source:
ordel_extended

evidence:
documented Swedish usage

introduced_version:
1.0

---

## 17. ESTABLISHED USAGE STANDARD

For manually curated words, Ordel should ask:

> Is there reasonable evidence that this lexical form is genuinely used by a
> broader linguistic, cultural or specialist community?

Useful evidence may include:

- established dictionaries
- language corpora
- reputable journalism
- books
- academic publications
- official terminology
- industry terminology
- established online communities
- widespread public usage
- official company/brand usage
- reference works
- government/public datasets

No single source type is mandatory in every case.

Editorial judgment is allowed.

---

## 18. INSUFFICIENT EVIDENCE

The following alone are generally insufficient:

- one social-media post
- one player's claim
- one username
- one private person's name
- autogenerated text
- obvious typo
- random Urban-Dictionary-style submission without Swedish usage evidence
- a domain name existing
- a company registration existing with no broader lexical relevance

These may still trigger further investigation.

They do not automatically qualify.

---

## 19. BRANDS

Established brands may be playable.

Examples conceptually:

IKEA
VOLVO
SPOTIFY

Brand validity is based on established use of the name as a recognizable
lexical/proper-name form.

Trademark ownership does not determine gameplay validity.

Ordel's dictionary inclusion is descriptive.

Brand metadata should identify the category:

`brand`

Ordel should avoid presenting inclusion as affiliation, sponsorship or
endorsement.

---

## 20. COMPANY NAMES

Established company names may be accepted where a playable single-token form
exists.

Example:

SPOTIFY

A multi-word legal company name does not automatically create a concatenated
playable word.

Example:

`EXAMPLE COMPANY AB`

does not automatically produce:

`EXAMPLECOMPANYAB`

Each accepted playable form must exist explicitly in the dictionary.

---

## 21. PRODUCT NAMES

Established product names may be accepted through Ordel Extended.

The same evidence and normalization requirements apply as for brands.

Product model numbers or arbitrary alphanumeric identifiers are not valid
unless future rules explicitly support them.

---

## 22. ABBREVIATIONS

Established abbreviations may be valid.

Examples conceptually:

AI
VD
EU
DNA

Case does not matter during gameplay.

Punctuation must not be automatically stripped to create new forms.

Example:

`t.ex.`

does NOT automatically become:

`TEX`

unless `TEX` itself is explicitly approved as a playable dictionary form.

---

## 23. INITIALISMS AND ACRONYMS

Established initialisms and acronyms may be playable.

They are treated as letter sequences.

They must satisfy:

- minimum word length
- allowed character rules
- explicit dictionary inclusion

The fact that an arbitrary sequence can stand for something somewhere does
not make it valid.

---

## 24. SLANG

Established Swedish slang is explicitly welcome in Ordel.

Slang does not need to appear in a traditional normative dictionary to
qualify.

Possible evidence includes:

- corpus usage
- dictionaries of contemporary language
- journalism
- sustained online/community usage
- cultural prevalence

Where useful:

register:
slang

or:

register:
informal

should be stored.

---

## 25. INTERNET LANGUAGE

Established internet vocabulary may be valid.

This includes:

- internet-native words
- memes that have become lexicalized
- gaming language
- social-media vocabulary
- common digital abbreviations

Ephemeral random memes are not automatically accepted.

The key distinction is:

**lexicalized usage vs temporary string.**

---

## 26. LOANWORDS

Loanwords used in Swedish may be accepted even when their origin is another
language.

Ordel does not require a word to be historically Swedish.

Established Swedish usage is the important criterion.

Examples may include words retaining letters such as:

W
Q
X
Z

This is one reason the Ordel Swedish tile set contains W and Q.

---

## 27. DIALECT

Documented dialectal Swedish words may be accepted.

The source/metadata should identify them where practical.

A word does not need nationwide usage to exist linguistically.

However, a word used only within one private household or friend group is not
automatically considered dialect.

---

## 28. ARCHAIC WORDS

Established historical/archaic Swedish vocabulary may be accepted.

Where appropriate:

register:
archaic

may be stored.

Ordel does not remove a legitimate word merely because it has become uncommon.

---

## 29. TECHNICAL AND SPECIALIST VOCABULARY

Established specialist terminology may be accepted.

Potential domains:

- medicine
- technology
- science
- law
- construction
- gaming
- computing
- finance
- crafts
- engineering
- other professional fields

Obscurity alone is not grounds for exclusion.

---

## 30. OFFENSIVE LANGUAGE

Ordel is descriptive rather than normative.

A word is NOT excluded merely because it is:

- offensive
- insulting
- vulgar
- sexual
- obscene
- derogatory
- historically offensive
- socially sensitive

If the word genuinely exists and otherwise satisfies Ordel's inclusion
criteria, it may be playable.

---

## 31. SENSITIVE METADATA

Where appropriate, entries may contain:

register:
vulgar

register:
offensive

register:
derogatory

register:
historically_derogatory

register:
sexual

These labels describe usage.

They do not affect gameplay validity by themselves.

---

## 32. VALIDITY IS NOT ENDORSEMENT

A valid Ordel word means only:

> This lexical form is accepted for gameplay.

It does NOT mean:

- Ordel endorses the term
- Ordel recommends using it about another person
- the term is socially appropriate
- the term is neutral
- the term is preferred modern terminology

The product should make this distinction clear where necessary.

---

## 33. PROMOTION OF SENSITIVE WORDS

Sensitive words may be playable without being promoted.

Features such as:

- word of the day
- onboarding examples
- marketing
- celebratory dictionary discoveries
- random featured words

should be capable of excluding entries marked with sensitive metadata.

Gameplay validity and promotional eligibility are separate concepts.

---

## 34. PLAYABLE CHARACTER SET

Swedish Ordel V1 gameplay uses:

A–Z
Å
Ä
Ö

No digits.

No punctuation.

No spaces.

No emoji.

No symbols.

Case is ignored.

---

## 35. MINIMUM LENGTH

Playable words must contain at least:

**2 letters**

Single-character lexical items are not playable in Classic.

---

## 36. CASE NORMALIZATION

All playable forms are normalized to uppercase for dictionary lookup.

Examples:

Ada
ADA
ada

normalize to:

ADA

Case must not create separate gameplay entries.

---

## 37. DIACRITICS

Swedish letters must be preserved.

Å
Ä
Ö

must NEVER normalize to:

A
A
O

These are different gameplay letters.

Other foreign diacritics require explicit handling.

---

## 38. FOREIGN DIACRITICS

The V1 tile set does not contain letters such as:

É
Ü
Ç
Ñ

A source word containing unsupported characters is NOT automatically
playable.

An adapted Swedish spelling may be playable if that adapted form is itself
established and explicitly present.

Do NOT blindly strip diacritics.

Example principle:

`É` must not automatically become `E`.

---

## 39. WHITESPACE

Whitespace is not allowed inside a playable form.

Multi-word expressions are not automatically concatenated.

Example:

NEW YORK

does NOT automatically become:

NEWYORK

If NEWYORK were independently approved as a playable lexical form, it could
exist separately.

---

## 40. HYPHENS

Hyphens are not supported on the V1 board.

A hyphenated source entry is NOT automatically converted by deleting the
hyphen.

Example:

A-B

does not automatically become:

AB

An unhyphenated form must independently qualify for inclusion.

---

## 41. PUNCTUATION

Punctuation is not supported on the V1 board.

The importer must not manufacture playable words by indiscriminately deleting:

.
,
'
:
;
-
/
&
or other punctuation.

Explicit playable forms must be defined.

---

## 42. DIGITS

Digits are not supported in V1 playable words.

Examples containing:

0–9

must not be imported as gameplay forms unless a separate letter-only lexical
form independently qualifies.

Future game modes may revisit this.

---

## 43. DUPLICATES

Multiple sources may produce the same normalized word.

Example conceptually:

SALDO → AI
Nyord → AI
Ordel Extended → AI

The gameplay dictionary should contain one normalized playable form:

AI

but preserve multiple provenance records where useful.

Validity is boolean.

Provenance may be plural.

---

## 44. SOURCE PRECEDENCE

Source precedence does NOT normally determine validity.

If a form is valid from one approved source, another source need not confirm
it.

However, provenance quality matters for:

- metadata
- editorial review
- conflicting entries
- removals
- debugging

Ordel Extended may explicitly override an automatic import decision where a
documented editorial reason exists.

---

## 45. AUTOMATIC IMPORT FILTER

Every imported candidate must pass a deterministic normalization/filter stage.

Conceptually:

SOURCE ENTRY
↓
extract candidate form
↓
normalize case
↓
validate supported characters
↓
apply source-specific rules
↓
apply minimum length
↓
apply threshold if relevant
↓
deduplicate
↓
store provenance
↓
ACCEPT / REJECT

The pipeline must produce logs/statistics for rejected entries.

---

## 46. IMPORT REPRODUCIBILITY

Dictionary builds must be reproducible.

Given:

- the same source snapshots
- the same importer version
- the same editorial data
- the same policy version

the build should generate the same playable dictionary.

Do not depend on uncontrolled live search results during a production build.

---

## 47. SOURCE SNAPSHOTS

Every dictionary release should record which source version/snapshot was used.

Conceptually:

dictionary:
ordel-sv-1.0

saldo:
<source version/date>

nyord:
<source version/date>

names:
2023 dataset / source revision

places:
<download date/version>

ordel_extended:
<repository revision>

This allows historical reconstruction.

---

## 48. DICTIONARY VERSIONING

Every published dictionary receives an immutable version.

Examples:

ordel-sv-1.0
ordel-sv-1.1
ordel-sv-2.0

A released version must never silently change contents.

If words are added or removed:

create a new dictionary version.

---

## 49. ACTIVE GAME LOCKING

Every game stores its dictionary version at creation.

A game created with:

ordel-sv-1.0

uses:

ordel-sv-1.0

until completion.

If `ordel-sv-1.1` launches during the match, the active match does not change.

This is mandatory.

---

## 50. ADDING WORDS

New valid words may be introduced in a later dictionary version.

Reasons include:

- new source data
- new slang
- new brand
- emerging terminology
- player suggestion
- previous omission
- corrected importer
- editorial addition

The change affects new games using the new version.

---

## 51. REMOVING WORDS

Words may occasionally need removal.

Potential reasons:

- source/import error
- typo incorrectly imported
- unsupported normalization
- data corruption
- word never met inclusion criteria
- duplicate processing bug

A word must NOT be removed merely because somebody finds its meaning
offensive.

Removal creates a new dictionary version.

Existing games retain their old dictionary.

---

## 52. DEPRECATION

Instead of deleting historical records, the dictionary system should support
conceptual deprecation.

Example:

introduced:
1.0

deprecated:
1.3

This allows:

- historical match validation
- replay
- auditing
- explaining old games

---

## 53. PLAYER WORD SUGGESTIONS

When a submitted word is invalid, Ordel may allow:

**Föreslå ord**

A suggestion records a candidate for editorial review.

It does NOT alter the current match.

It does NOT immediately add the word.

---

## 54. SUGGESTION DATA

Future suggestion records may include:

- normalized candidate
- original submitted form
- dictionary version
- timestamp
- anonymized/appropriate usage statistics
- number of unique attempts
- editorial status

Potential statuses:

PENDING
REVIEWING
ACCEPTED
REJECTED
DUPLICATE

Exact moderation tooling is outside V0.1.

---

## 55. ATTEMPT FREQUENCY

Frequency of rejected attempts may inform editorial priority.

Example:

A valid-looking word attempted by 2,000 players should probably be reviewed
before one attempted once.

Attempt frequency is evidence of relevance.

It is NOT proof of validity.

---

## 56. EDITORIAL REVIEW

A human editor should be able to determine:

ACCEPT
REJECT
NEEDS_RESEARCH

For accepted entries, the editor should assign:

- playable form
- category
- evidence/provenance
- optional register
- target dictionary release

Editorial changes should be reviewable in source control or equivalent
auditable history.

---

## 57. ORDEL EXTENDED STORAGE

Ordel Extended should be maintained as structured source data.

Recommended conceptual fields:

id
display_form
normalized_form
lemma
category
register
source_note
source_url_or_reference
editorial_note
introduced_version
deprecated_version
promotion_eligible

The exact implementation belongs in ARCHITECTURE.md / DATABASE.md.

Do not maintain the authoritative list as an undocumented array buried in
application code.

---

## 58. DEFINITIONS

Gameplay validity does NOT require Ordel to own or reproduce dictionary
definitions.

V1 may validate words without displaying full definitions.

If definitions are displayed later:

only use definition content for which Ordel has appropriate rights.

Do not scrape or reproduce protected dictionary definitions merely because a
word itself appears there.

---

## 59. WORD DETAIL UX

The architecture should support future word detail such as:

DEFFA

✓ Giltigt i Ordel

Slang · verb

Source category:
Ordel Extended

or:

ADA

✓ Giltigt i Ordel

Förnamn

The exact UI is not part of this policy.

---

## 60. ATTRIBUTION

All external datasets must be used according to their applicable licenses.

Where attribution is required, Ordel must provide it.

The application should contain an accessible area such as:

Settings
→ About Ordel
→ Language data / Språkdata

The exact presentation is a UX decision.

Required attribution information must also be retained in the repository.

---

## 61. LICENSE REGISTRY

The project should maintain a machine/human-readable registry for lexical
sources.

Recommended file:

`docs/DICTIONARY_SOURCES.md`

or equivalent structured metadata.

For each source record:

- source name
- provider
- dataset version
- download/source location
- license
- required attribution
- date retrieved
- modifications performed
- whether included in production dictionary

Do not rely on developer memory for licensing.

---

## 62. SOURCE LICENSE GATE

No external lexical dataset may be imported into production merely because it
is publicly downloadable.

Before inclusion:

1. identify the license
2. confirm intended use is permitted
3. record attribution requirements
4. record source/version
5. only then add it to the production pipeline

If licensing is unclear:

do not ship the data until resolved.

---

## 63. SAOL POLICY

SAOL may be useful as:

- editorial reference
- linguistic research reference
- manual verification source where permitted

Ordel must NOT assume that the current SAOL database can simply be copied into
the application.

Only SAOL-derived datasets with explicitly compatible licensing may be
programmatically incorporated.

The playable dictionary must never depend on unauthorized scraping of
svenska.se or similar services.

---

## 64. SOURCE-SPECIFIC POLICY — SALDO

SALDO / SALDO morphology is the primary V1 lexical base.

The importer should extract playable Swedish forms according to the source
structure rather than guessing morphology.

Preserve sufficient provenance to identify SALDO-derived entries.

Exact parser behavior must be covered by automated tests.

---

## 65. SOURCE-SPECIFIC POLICY — NEW WORDS

Språkrådet new-word data supplements the base.

For each source entry:

- inspect/extract the lexical candidate
- apply playable-character rules
- do not automatically collapse multi-word entries
- do not automatically remove punctuation
- preserve provenance

---

## 66. SOURCE-SPECIFIC POLICY — NAMES

For the initial names dataset:

automatic inclusion requires:

frequency >= 100

and:

- supported characters
- minimum two letters
- no spaces
- no unsupported punctuation after source parsing

Do not combine spelling variants automatically.

Each actual playable spelling is evaluated independently.

---

## 67. SOURCE-SPECIFIC POLICY — PLACE NAMES

Official Swedish place-name data may supply geographic entries.

For V1:

automatically include only forms that already constitute a directly playable
single-token form after case normalization.

Do not concatenate multi-word place names.

Do not delete hyphens merely to create playable forms.

Additional established forms may be added manually through Ordel Extended.

---

## 68. QUALITY ASSURANCE

Before publishing a dictionary version, run automated validation.

At minimum verify:

- no words shorter than two letters
- no unsupported characters
- no whitespace
- no digits
- normalized uniqueness
- source provenance exists
- version metadata exists
- sensitive metadata has valid values
- names satisfy configured threshold unless manually overridden
- no accidental punctuation stripping

---

## 69. DICTIONARY STATISTICS

Each build should output statistics such as:

- total playable forms
- unique forms
- count by source
- count by category
- count by length
- count by first letter
- count containing Å
- count containing Ä
- count containing Ö
- count containing W
- count containing Q
- rejected candidate count
- rejection reasons

These statistics are useful for both QA and game balancing.

---

## 70. TILE-BALANCE INTEGRATION

Dictionary statistics should be usable by the game-balance tooling.

The project should be able to calculate:

- letter frequency across playable forms
- positional letter frequency
- word-length distribution
- Q/W/X/Z usefulness
- short-word availability
- two-letter word count

This can later inform:

`ordel-sv-tiles-2`

Do not automatically alter tile values when the dictionary changes.

Tile configuration changes require an explicit product/game-balance decision.

---

## 71. TWO-LETTER WORD AUDIT

Because Ordel accepts:

- abbreviations
- names
- modern language
- proper nouns

the number of two-letter words may be substantially larger than in traditional
word games.

Before public release:

produce a dedicated list of all valid two-letter words.

Review it manually for:

- accidental imports
- obscure name variants
- abbreviation explosion
- malformed source data
- balance problems

Two-letter words are strategically powerful.

They require stricter QA even though Ordel remains generous.

---

## 72. THREE-LETTER WORD AUDIT

A similar automated report should be generated for three-letter words.

Manual review is not necessarily required for every three-letter standard
Swedish word.

However, short entries from:

- names
- abbreviations
- brands
- Ordel Extended

should be easy to inspect.

---

## 73. SECURITY / CLIENT EXPOSURE

Dictionary validation must be authoritative server-side.

A local dictionary may optionally exist for:

- responsive preview
- offline assistance
- caching

but the server decides whether a committed word is valid.

Client modification must never allow an invalid move to be committed.

---

## 74. PERFORMANCE

Word validation is a critical gameplay path.

The production representation should support very fast exact membership
queries.

The implementation should not parse large source XML/JSON files during a
player's move.

Source datasets are processed during the dictionary build/import process.

Runtime validation uses the generated optimized dictionary.

---

## 75. TEST REQUIREMENTS

Automated tests must cover at minimum:

### Standard words

- base form accepted
- valid inflection accepted
- unsupported generated inflection rejected

### Names

- name >= threshold accepted
- name below threshold not automatically accepted
- manually approved notable name accepted

### Places

- valid single-token place accepted
- multi-word place not concatenated automatically

### Brands

- approved brand accepted
- arbitrary company string rejected

### Abbreviations

- approved abbreviation accepted
- punctuation not blindly stripped

### Slang

- approved slang accepted

### Sensitive language

- approved offensive word remains valid
- sensitivity metadata does not invalidate gameplay

### Normalization

- lowercase/uppercase equivalent
- Å preserved
- Ä preserved
- Ö preserved
- foreign diacritics not blindly stripped
- spaces rejected
- punctuation rejected
- digits rejected
- one-letter form rejected

### Versioning

- old version remains immutable
- new version may add words
- deprecated word remains valid in historical version

### Provenance

- imported words retain source
- merged entries may retain multiple sources

---

## 76. V1 BUILD PIPELINE

Target conceptual pipeline:

SALDO / morphology
        │
        ▼
standard Swedish forms
        │
        ├─────────────┐
        │             │
Nyord ──┤             │
Names ──┤             │
Places ─┤             │
        │             │
        ▼             │
source-specific filters
        │
        ▼
normalization
        │
        ▼
character / length validation
        │
        ▼
Ordel Extended
        │
        ▼
deduplication + provenance merge
        │
        ▼
QA validation
        │
        ▼
short-word audit
        │
        ▼
dictionary build
        │
        ▼
`ordel-sv-1.0`

The implementation may optimize the stages differently.

The resulting behavior must follow this policy.

---

## 77. V1 RELEASE GATE

`ordel-sv-1.0` is ready for gameplay testing when:

- SALDO importer works
- morphological forms are correctly extracted
- new-word importer works
- name importer with >=100 threshold works
- place-name importer works
- initial Ordel Extended data structure exists
- normalization rules are implemented
- provenance is retained
- licensing registry exists
- attribution requirements are documented
- automated dictionary tests pass
- dictionary statistics are generated
- all two-letter forms have been audited
- representative three-letter extended forms have been reviewed
- generated dictionary is immutable/versioned
- server can validate against the generated version

The dictionary does NOT need to be linguistically perfect before private beta.

Private beta should itself help discover missing and questionable words.

---

## 78. BETA PHILOSOPHY

During private beta, dictionary problems are expected.

Players should be encouraged to report:

- missing legitimate words
- incorrectly accepted forms
- questionable names
- missing slang
- outdated terminology
- normalization problems

Dictionary iteration should be treated as a core part of product development.

A dictionary issue should not require an app release if the architecture
supports server-side versioned dictionary releases.

However, active matches must never silently switch dictionary versions.

---

## 79. PRODUCT PRINCIPLE

Ordel should be:

**generous about whether language exists**

while remaining:

**strict about whether the submitted letter sequence actually represents that
language.**

The goal is not to make every submission valid.

The goal is to reduce the frustrating situation where a player knows a real,
established word or name exists but a traditional word-game dictionary refuses
to recognize it.

---

## 80. AUTHORITATIVE RULE

When there is disagreement between:

- importer behavior
- database contents
- UI copy
- gameplay validation
- this policy

this document defines the intended lexical behavior.

Do not silently work around disagreements.

Raise the issue.

Make a product/editorial decision if necessary.

Update this document.

Then update:

- importer
- dictionary data
- tests
- affected dictionary version

accordingly.
