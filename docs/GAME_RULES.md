# ORDEL — GAME RULES

**Document:** `docs/GAME_RULES.md`
**Status:** Authoritative game rules specification
**Product:** Ordel
**Initial game mode:** Classic
**Initial language:** Swedish (`sv-SE`)
**Last updated:** 2026-08-23

---

## 1. PURPOSE

This document defines the authoritative gameplay rules for Ordel.

It is the source of truth for:

- game-engine behavior
- server-side move validation
- scoring
- board rules
- tile behavior
- dictionary validation
- turn progression
- game completion
- game-result calculation

Claude Code MUST NOT infer missing rules from:

- Wordfeud
- Scrabble
- Alfapet
- other word games
- personal assumptions

If a required rule is not defined here, do not silently invent it.

Instead:

1. identify the ambiguity,
2. document the required decision,
3. request a product decision if necessary,
4. update this document once decided.

The implementation and automated tests must conform to this specification.

---

## 2. GAME PHILOSOPHY

Ordel is a strategic Swedish word game built around a generous and descriptive
interpretation of language.

The game should reward:

- vocabulary
- creativity
- board awareness
- strategic tile placement
- risk management
- linguistic curiosity

Ordel deliberately differs from more restrictive word games by accepting a
broader representation of words and names that are genuinely used in Swedish
language and culture.

The guiding dictionary principle is:

> If it is an established word or name that people genuinely use in Swedish,
> Ordel should generally prefer saying yes rather than no.

Generous does NOT mean arbitrary.

A sequence of letters does not become valid merely because someone has written
it somewhere.

---

## 3. INITIAL GAME MODE

The initial game mode is:

**ORDEL CLASSIC**

Classic is:

- two-player
- turn-based
- asynchronous by default
- played on a 15 × 15 board
- played with seven tiles per player
- based on a shared hidden tile bag
- automatically validated by Ordel

Future game modes may modify these rules.

Examples:

- Live
- Quick
- Daily
- Random Board
- Tournament

Those modes must define explicit rule overrides.

Unless an override exists, this document defines Classic behavior.

---

## 4. PLAYERS

Classic supports exactly:

**2 players**

Each player has:

- a private tile rack
- a score
- a turn state
- a player identity

Players cannot see the exact contents of the opponent's rack.

The number of tiles remaining in the shared tile bag MAY be visible.

---

## 5. BOARD

Classic uses:

**15 columns × 15 rows**

Total:

**225 board cells**

Each cell may contain:

- no tile
- one committed tile

A board cell can never contain multiple tiles.

---

## 6. BOARD COORDINATES

The game engine must use a deterministic coordinate system.

Recommended conceptual model:

- rows: 0–14
- columns: 0–14

The UI may display coordinates differently or not display them at all.

Internal coordinates must remain stable for:

- move validation
- persistence
- replay
- debugging
- tests

---

## 7. CENTER CELL

The center cell is:

row 7
column 7

using zero-based coordinates.

The first scoring move of the game must place at least one newly placed tile on
the center cell.

The visual treatment of the center cell is a design-system concern and does
not affect gameplay.

---

## 8. CLASSIC BONUS CELLS

Classic uses the versioned board configuration:

`ordel-classic-board-1`

The board uses four bonus types:

**DL**
Double Letter

**TL**
Triple Letter

**DW**
Double Word

**TW**
Triple Word

The center cell is a START cell and has no score multiplier.

Human-readable coordinates use columns A–O and rows 1–15.

### TW

A5
A11
E1
E15
K1
K15
O5
O11

### DW

B2
B14
C6
C10
F3
F6
F10
F13
J3
J6
J10
J13
M6
M10
N2
N14

### TL

B8
D7
D9
E5
E11
G4
G12
H2
H14
I4
I12
K5
K11
L7
L9
N8

### DL

A8
C3
C13
D4
D12
F8
G7
G9
H1
H6
H10
H15
I7
I9
J8
L4
L12
M3
M13
O8

### START

H8

The board configuration must be represented as data and must not be hardcoded
into UI components.

Future board configurations may coexist with this version without changing
active or historical games.

---

## 9. BONUS CELL CONSUMPTION

A bonus cell applies only when a tile is first committed onto that cell.

Once occupied, the bonus is considered consumed.

If a future word uses an existing tile positioned on a previously used bonus
cell, that bonus does NOT activate again.

---

## 10. BONUS ORDER

Letter multipliers apply before word multipliers.

Example conceptual order:

1. determine base value of newly placed letters
2. apply applicable DL/TL multipliers
3. calculate base word value
4. apply applicable DW/TW multipliers

If multiple word multipliers apply to the same newly created word, they
multiply together.

Examples:

two DW cells:

2 × 2 = 4× word value

two TW cells:

3 × 3 = 9× word value

---

## 11. TILE RACK

Each player normally holds:

**7 tiles**

After a successful scoring move, the player draws tiles from the shared bag
until:

- the rack contains seven tiles, or
- the tile bag becomes empty

whichever occurs first.

---

## 12. TILE BAG

Ordel Swedish Classic uses the versioned tile configuration:

`ordel-sv-tiles-1`

The tile bag contains exactly:

**100 tiles**

consisting of:

- 98 letter tiles
- 2 blank tiles

Distribution and score values:

| Letter | Count | Points |
|---|---:|---:|
| A | 8 | 1 |
| B | 2 | 4 |
| C | 1 | 8 |
| D | 4 | 1 |
| E | 7 | 1 |
| F | 2 | 3 |
| G | 3 | 2 |
| H | 2 | 2 |
| I | 5 | 1 |
| J | 1 | 7 |
| K | 3 | 2 |
| L | 4 | 1 |
| M | 3 | 2 |
| N | 6 | 1 |
| O | 5 | 2 |
| P | 2 | 4 |
| Q | 1 | 10 |
| R | 8 | 1 |
| S | 8 | 1 |
| T | 8 | 1 |
| U | 3 | 4 |
| V | 2 | 3 |
| W | 1 | 6 |
| X | 1 | 8 |
| Y | 1 | 7 |
| Z | 1 | 10 |
| Å | 2 | 4 |
| Ä | 2 | 3 |
| Ö | 2 | 4 |
| Blank | 2 | 0 |

This is the initial Ordel beta balance.

It is intentionally versioned and may be adjusted after analysis of real match
data and game simulations.

Any future tile configuration must receive a new version identifier.

Existing games always retain the tile configuration with which they were
created.

---

## 13. SWEDISH LETTER SET

Ordel's Swedish system may support:

A–Z
Å
Ä
Ö

including:

W
Q

W and Q are intentionally allowed as potential physical tiles because Ordel's
dictionary includes modern Swedish usage, loanwords, names, brands and other
categories where these letters occur.

Exact frequency and score values remain TBD.

---

## 14. CASE NORMALIZATION

Gameplay is case-insensitive.

Examples:

`volvo`

`Volvo`

`VOLVO`

are treated as the same sequence of letters.

The engine should normalize submitted words into a canonical form before
dictionary validation.

The UI may use uppercase tile lettering.

---

## 15. SWEDISH LETTER IDENTITY

The following are distinct letters:

A ≠ Å

A ≠ Ä

O ≠ Ö

Normalization must NEVER collapse:

Å -> A

Ä -> A

Ö -> O

for gameplay validation.

---

## 16. BLANK TILES

Ordel supports blank tiles.

A blank tile:

- may represent any supported playable letter
- has a score value of 0
- retains its selected letter for the remainder of the game
- remains distinguishable internally from a normal tile

Example:

A blank selected as `Ö` behaves linguistically as Ö but contributes:

**0 letter points**

The UI must visually distinguish blank-derived letters from ordinary tiles.

---

## 17. SELECTING A BLANK LETTER

When a player places a blank tile, they must choose which letter it represents
before the move can be submitted.

The selected letter becomes immutable once the move is committed.

Before submission, the player may remove the blank and select another letter.

---

## 18. VALID SCORING MOVE

A scoring move consists of one or more newly placed tiles.

All newly placed tiles must:

1. be placed on previously empty cells,
2. belong to the active player's rack,
3. lie within one row OR one column,
4. form a valid connected placement,
5. satisfy first-move or connectivity requirements,
6. create only valid words.

The player may not move already committed board tiles.

---

## 19. SINGLE-TILE MOVES

A player may place a single tile.

The resulting board must still satisfy all normal:

- connectivity
- word formation
- dictionary

requirements.

A single newly placed tile may create multiple words simultaneously.

---

## 20. FIRST MOVE

The first scoring move:

- must include the center cell
- must create at least one valid word
- otherwise follows normal placement rules

A pass or tile swap before the first scoring move does not remove the center
requirement.

The first successful scoring move must still cross the center.

---

## 21. CONNECTIVITY AFTER FIRST MOVE

After the first scoring move, every subsequent scoring move must connect to the
existing committed board.

Connection may occur by:

- extending an existing word
- crossing an existing word
- placing adjacent tiles that form valid words
- using existing tiles between newly placed tiles

A move may not create an isolated second group of words elsewhere on the board.

---

## 22. SAME-LINE REQUIREMENT

All newly placed tiles in a scoring move must share:

- the same row

OR

- the same column

Existing committed tiles may occur between newly placed tiles.

Example:

Existing:

C _ T

Player adds:

A

to form:

CAT

This can be valid if all other rules are satisfied.

---

## 23. ALL CREATED WORDS MUST BE VALID

A move may create:

- one main word
- one or more crosswords

Every newly created or modified word produced by the move must be valid in the
dictionary version assigned to the game.

If ANY newly created word is invalid:

the entire move is invalid.

No partial acceptance occurs.

### 23A. MINIMUM WORD LENGTH

A valid playable word must contain at least:

**2 letters**

Single-letter words are never playable in Ordel Classic, regardless of whether
a single letter could technically represent:

- a name
- an abbreviation
- a symbol
- another lexical entity

This applies to both main words and crosswords.

---

## 24. WORD VALIDATION MODEL

Ordel uses:

**automatic pre-commit validation**

There is no challenge system in Classic.

Players are free to experiment with placements before committing.

An invalid proposed move:

- does not consume the turn
- does not change authoritative game state
- does not affect score
- does not permanently remove tiles from the rack

The player may modify the placement and try again.

---

## 25. GENEROUS DICTIONARY PRINCIPLE

Ordel uses a broader dictionary philosophy than traditional restrictive word
games.

The Swedish dictionary should include a high-quality Swedish lexical base plus
the curated:

**Ordel Extended Dictionary**

Potential valid categories include:

- standard Swedish words
- valid inflections
- established loanwords
- slang
- colloquial language
- internet language
- youth language
- dialectal words with established usage
- archaic Swedish
- technical terminology
- abbreviations
- initialisms
- acronyms
- brands
- product names
- geographical names
- personal names
- established proper nouns
- profanity
- sexual vocabulary
- vulgar vocabulary
- potentially offensive vocabulary
- derogatory vocabulary

The existence of an offensive meaning is NOT by itself grounds for excluding a
word.

---

## 26. FULL ORDEL PROPER-NOUN POLICY

Ordel uses the broad:

**FULL ORDEL** policy.

This means established proper nouns may be valid.

Examples of categories:

- brands
- companies
- countries
- cities
- regions
- geographical features
- culturally established personal names
- notable names
- other established proper nouns

Conceptually, words such as:

VOLVO
IKEA
SVERIGE
STOCKHOLM
ZLATAN
ADA

may be valid if they meet Ordel's dictionary inclusion criteria.

This does NOT mean every possible personal name, username, business name or
one-off invented string is automatically valid.

Proper nouns must still satisfy documented inclusion criteria.

---

## 27. DICTIONARY INCLUSION STANDARD

Ordel is generous but curated.

A candidate should have evidence of established usage.

Potential evidence may include:

- authoritative dictionaries
- language corpora
- established publications
- reference works
- public databases
- widespread documented usage
- reputable terminology sources
- established cultural usage

A word does NOT qualify merely because:

- one person used it once
- it exists as a username
- it appears in random generated text
- a player claims their friends use it
- it can theoretically be constructed

Exact editorial inclusion procedures should be documented separately in:

`DICTIONARY_POLICY.md`

before public launch.

---

## 28. OFFENSIVE AND SENSITIVE WORDS

Ordel's dictionary is descriptive rather than normative.

A word must not be rejected solely because its meaning or use may be:

- offensive
- vulgar
- sexual
- insulting
- derogatory
- taboo
- politically sensitive
- historically offensive

Where appropriate, dictionary metadata should describe register.

Possible metadata:

`vulgar`

`offensive`

`derogatory`

`archaic`

`historically_derogatory`

`slang`

`informal`

Validity does not constitute endorsement.

The application should not unnecessarily promote offensive terms through
features such as random featured words.

---

## 29. DICTIONARY METADATA

Dictionary entries should be capable of storing metadata.

Conceptually:

word
normalized_word
valid
language
source
category
register
definition_reference
added_version
deprecated_version

Not every field must be implemented in V0.1.

The architecture should allow expansion.

---

## 30. DICTIONARY VERSIONING

Every game must store its dictionary version.

Example:

language: `sv-SE`

dictionary: `ordel-sv`

dictionary_version: `1.0.0`

Once a game begins, its dictionary version is LOCKED.

If:

Ordel Swedish 1.1

is released while a game uses:

Ordel Swedish 1.0

that game continues using 1.0 until completion.

A dictionary update must never change legal moves halfway through an active
game.

### 30A. ORDEL SWEDISH V1 DATA STRATEGY

The initial Swedish dictionary is identified as:

`ordel-sv-1.0`

Ordel does not use SAOL as its directly embedded game database.

The initial dictionary is constructed from multiple permitted lexical sources.

The intended source layers are:

1. SALDO / SALDO morphology
   Primary Swedish lexical and morphological base.

2. Språkrådet new-word data
   Additional modern Swedish vocabulary.

3. Swedish name data
   Established Swedish personal names.

4. Official Swedish geographical-name data
   Established place names.

5. Ordel Extended
   A curated Ordel-maintained layer containing additional accepted vocabulary
   such as slang, abbreviations, brands, companies, culturally established
   names, internet language and other documented usage.

Exact source licensing, attribution, import rules and editorial criteria are
defined separately in:

`DICTIONARY_POLICY.md`

The game engine must depend on the resulting versioned Ordel dictionary, not
directly on any individual external source.

### 30B. PLAYABLE WORD NORMALIZATION

Playable words consist of letter sequences supported by the Ordel tile system.

Case is ignored.

Punctuation and whitespace must NOT simply be stripped to manufacture playable
forms.

For example:

`t.ex.`

does not automatically become:

`TEX`

and:

`NEW YORK`

does not automatically become:

`NEWYORK`

A normalized form containing removed punctuation, whitespace or other
characters is playable only if that exact normalized form is explicitly
present in the Ordel dictionary.

The same principle applies to:

- hyphenated words
- abbreviations
- multi-word proper nouns
- brands
- company names

Dictionary imports must explicitly define accepted playable forms.

---

## 31. WORD INFORMATION

Long-term Ordel UX should allow a player to inspect why a word is accepted.

Examples:

VOLVO
Valid in Ordel
Brand / proper noun
Ordel Extended

DEFFA
Valid in Ordel
Slang · verb

HUNDAR
Valid in Ordel
Swedish word · inflected form

This feature is not required for the earliest game-engine milestone, but the
dictionary architecture must not prevent it.

---

## 32. INVALID WORD FEEDBACK

Avoid generic feedback where more useful information is available.

Instead of only:

"Ogiltigt ord"

prefer conceptually:

"KATTERNA finns inte i ordlistan som används i den här matchen."

If multiple invalid words are created, the UI should be capable of identifying
them.

---

## 33. WORD SUGGESTIONS

Future feature:

When a word is rejected, a player may suggest it for dictionary review.

Conceptually:

"Tycker du att ordet borde finnas i Ordel?"

[Föreslå ord]

Suggestions do NOT make the word immediately valid.

They feed an editorial review process.

Potential future aggregate data:

- number of attempted uses
- number of unique players attempting it
- frequency over time

Not required for V0.1.

---

## 34. SCORING A WORD

The score of each newly formed word is calculated from:

- tile base values
- applicable newly activated letter multipliers
- applicable newly activated word multipliers

Existing committed tiles contribute their ordinary tile value.

Previously consumed bonus cells do not reactivate.

Blank tiles always contribute:

0 points

even when representing a high-value letter.

---

## 35. MULTIPLE WORDS IN ONE MOVE

If a move creates multiple valid words:

each newly created word scores.

A newly placed tile may therefore contribute to more than one word.

Any bonus underneath that newly placed tile applies appropriately to every new
word containing that tile according to the scoring rules.

The total move score is:

sum of all newly created word scores

plus any applicable SJUA bonus.

---

## 36. SCORE PREVIEW

Before submission, the client should display a predicted score when possible.

Example:

**38 p**

This preview is NOT authoritative.

When the player submits:

the server independently validates and calculates the move.

The server-calculated score is authoritative.

---

## 37. SJUA

If a player uses all seven tiles from a full seven-tile rack in a single valid
scoring move, the player receives:

# SJUA

Bonus:

**+50 points**

This bonus is added after normal scoring of all words created by the move.

Example:

Word scoring:
72

SJUA:
+50

Move total:
122

The user-facing Swedish term is:

**SJUA**

Example UI:

> SJUA
> Alla 7 brickor
> +50

---

## 38. SJUA ELIGIBILITY

SJUA requires:

- exactly seven newly placed rack tiles
- all seven were part of the player's rack at the beginning of that turn's
  scoring placement

- the move is valid

Using fewer than seven tiles never grants SJUA.

If fewer than seven tiles are available because the tile bag is nearly empty,
using the entire smaller rack does NOT count as SJUA.

---

## 39. TURN ACTIONS

On a player's active turn, the player may perform exactly one committed action:

1. PLAY
2. PASS
3. SWAP
4. RESIGN

RESIGN may additionally be allowed outside the player's active turn as defined
below.

Only one turn action may be committed.

---

## 40. PLAY

PLAY submits the currently proposed tile placement.

The server validates:

- game status
- player membership
- turn ownership
- rack ownership
- board placement
- connectivity
- dictionary validity
- scoring
- tile refill
- resulting state

If valid:

- move is committed
- score is added
- tiles are removed from rack
- replacement tiles are drawn
- board is updated
- move is recorded
- turn advances

If invalid:

- authoritative state does not change
- turn remains with the player

---

## 41. MOVE IMMUTABILITY

Before PLAY is successfully committed:

the player may freely:

- place tiles
- remove tiles
- rearrange tiles
- change blank selections

After the server successfully commits PLAY:

the move is final.

Classic has no undo after successful submission.

---

## 42. PASS

A player may pass.

PASS:

- scores 0
- does not alter the rack
- consumes the player's turn
- advances to the opponent
- counts as a scoreless turn toward automatic game termination

---

## 43. TILE SWAP

A player may exchange one or more rack tiles.

A swap is allowed only when at least:

**7 tiles remain in the shared bag before the swap**

The player may select:

1–7 tiles

subject to rack size.

The selected tiles are temporarily removed.

The same number of replacement tiles are randomly drawn.

The removed tiles are then returned to the shared bag.

This prevents the player from immediately drawing one of the exact tiles they
just returned during that same swap operation.

SWAP:

- scores 0
- consumes the turn
- advances to opponent
- counts as a scoreless turn

---

## 44. SCORELESS-TURN COUNTER

Ordel tracks consecutive committed turns without scoring.

The following count as scoreless turns:

- PASS
- SWAP

A successful scoring PLAY resets the counter to:

0

After:

**4 consecutive scoreless turns**

the game ends automatically.

Invalid proposed moves do not count because they were never committed.

RESIGN and TIMEOUT terminate the game separately and do not use this mechanism.

---

## 45. RESIGN

A player may resign from an active game.

Unlike ordinary turn actions:

RESIGN may be performed even when it is not the resigning player's turn.

The UI should require confirmation.

Example:

> Ge upp matchen?
>
> Matchen avslutas och din motståndare vinner.

Upon confirmation:

- game ends immediately
- resigning player receives a loss
- opponent receives a win
- game is marked as ended by resignation

Do not create an artificial score such as:

500–0

The recorded board score remains the actual board score.

Competitive systems may separately process the result as win/loss.

---

## 46. CLASSIC TEMPO

Classic supports configurable turn limits.

Initial tempo presets:

### LUGN

7 days per turn

### NORMAL

72 hours per turn

### SNABB

24 hours per turn

### INGEN GRÄNS

No automatic turn timeout

Default:

**NORMAL — 72 hours**

The exact naming may be refined through UX work without changing the underlying
rules.

---

## 47. TURN TIMER

For timed asynchronous games, the timer begins when the previous committed turn
successfully transfers control to the next player.

The server is authoritative for timeout calculation.

The client must not determine whether a player has timed out based solely on
its local clock.

---

## 48. TIMEOUT

If the active player's allowed turn duration expires:

- the game ends
- timed-out player loses
- opponent wins
- reason is recorded as TIMEOUT

The board score remains the actual board score.

A timeout victory is a result state, not an artificial score adjustment.

---

## 49. TIMEOUT NOTIFICATIONS

The product may warn users before timeout.

Potential reminders:

- 24 hours remaining
- 6 hours remaining
- 1 hour remaining

Exact notification behavior belongs to product/notification configuration and
may differ by tempo.

Notifications must not determine actual timeout state.

Server time remains authoritative.

---

## 50. NO-LIMIT GAMES

When tempo is:

INGEN GRÄNS

a player does not automatically lose due to turn inactivity.

The game may remain active until ended through:

- normal completion
- scoreless-turn termination
- resignation
- future administrative rules if required

---

## 51. NORMAL END CONDITION

A game normally ends when:

1. the shared tile bag is empty, AND
2. one player successfully plays their final rack tile(s)

The triggering move scores normally before final score adjustment.

---

## 52. END BY SCORELESS TURNS

The game also ends after:

**4 consecutive scoreless committed turns**

as defined earlier.

When this occurs:

neither player is considered to have "played out."

Final rack deductions are applied as defined below.

---

## 53. FINAL RACK DEDUCTION — PLAYED OUT

If Player A empties their rack while the tile bag is empty:

For each player:

calculate the total base value of tiles remaining on their rack.

Player A has:

0

Suppose Player B has:

10 points of tiles remaining.

Then:

Player B:
-10

Player A:
+10

Thus the player who played out receives the value deducted from the opponent.

---

## 54. FINAL RACK DEDUCTION — SCORELESS END

If the game ends due to four consecutive scoreless turns:

each player's remaining rack value is deducted from their own score.

Example:

Player A remaining rack:
8 points

Player B remaining rack:
11 points

Final adjustment:

Player A:
-8

Player B:
-11

Neither player receives the other's deduction.

---

## 55. RESIGNATION AND FINAL SCORE

Resignation determines winner and loser directly.

Do not apply normal "played out" score transfer merely because the game ended.

The final displayed score may preserve the actual board scores at resignation.

The result must clearly indicate:

**Won by resignation**

or equivalent Swedish UI copy.

---

## 56. TIMEOUT AND FINAL SCORE

Timeout determines winner and loser directly.

Do not apply the normal played-out score transfer.

Preserve actual board scores.

The result must clearly indicate that the game ended due to timeout.

---

## 57. DRAW

If a normally completed game's final adjusted scores are equal:

the game is a:

**DRAW**

Classic does not use an artificial tiebreaker.

Example:

402–402

Result:

OAVGJORT

Future tournament rules may define additional tournament-specific tiebreakers.

---

## 58. RANDOMIZATION

Random behavior includes:

- initial tile bag shuffle
- initial rack draw
- subsequent tile draws
- swap replacement draws
- potentially starting-player selection

Randomization must be performed using a sufficiently reliable server-side
mechanism.

Clients must not be allowed to choose their own tiles.

---

## 59. STARTING PLAYER

For ordinary Classic games, the starting player should be selected randomly
unless a future mode explicitly defines another rule.

The selected starting player receives the first turn.

Starting-player selection must be stored as part of authoritative game state.

---

## 60. SERVER AUTHORITY

All committed gameplay is server-authoritative.

The client may preview.

The server decides.

The client must never be trusted for:

- score
- rack ownership
- tile identity
- tile draw
- word validity
- current turn
- timer expiry
- final result
- scoreless-turn count

---

## 61. ATOMIC MOVE SUBMISSION

A committed PLAY must be processed atomically.

Conceptually, the operation includes:

1. lock/read current authoritative game state
2. verify game active
3. verify player
4. verify turn
5. verify submitted tile identities belong to rack
6. verify cells are available
7. validate placement
8. derive all created words
9. validate all words
10. calculate score
11. apply SJUA if eligible
12. commit tiles to board
13. remove used rack tiles
14. draw replacement tiles
15. update score
16. record move
17. reset scoreless-turn counter
18. determine end condition
19. apply final scoring if needed
20. advance turn if game remains active
21. persist resulting authoritative state

A partial move must never be persisted.

---

## 62. IDEMPOTENCY / DUPLICATE SUBMISSION

Mobile networks are unreliable.

A player may press PLAY and the client may retry because the response was lost.

The backend must protect against accidentally committing the same move twice.

Move submission should therefore use an idempotency mechanism or equivalent
transaction-safe design.

A network retry must never:

- duplicate tiles
- score twice
- consume two turns
- draw extra tiles

---

## 63. REALTIME

Realtime updates may be used to inform the opponent that a move occurred.

Realtime is NOT the authoritative game state.

When opening or resuming a game:

the client must be able to fetch the latest authoritative state from the
backend.

The game must remain correct if:

- a realtime event is missed
- the app was backgrounded
- the app was killed
- connection was temporarily lost

---

## 64. LOCAL PROPOSED MOVE

Tiles being arranged before submission are local/transient state.

They do not become authoritative merely because they appear on the board.

The UI must distinguish:

- committed tiles
- currently proposed tiles

If the app closes before submission:

the proposed move MAY be restored locally as a convenience in the future, but
it remains uncommitted.

---

## 65. SUBMISSION STATES

The UI should distinguish:

READY

SUBMITTING

CONFIRMED

FAILED

Do not show a move as permanently completed before server confirmation.

If submission fails due to connectivity:

the player should be able to retry safely.

---

## 66. MOVE HISTORY

Every committed action must be recorded.

Action types should conceptually include:

PLAY
PASS
SWAP
RESIGN
TIMEOUT
GAME_END

For PLAY, preserve enough information to reconstruct the move:

- move number
- player
- newly placed tiles
- blank assignments
- words created
- score
- SJUA bonus
- resulting relevant state
- timestamp

This history must support deterministic match replay.

---

## 67. DETERMINISTIC REPLAY

The architecture must make it possible to reconstruct a completed game's board
progression.

Future UI may allow:

Move 1
Move 2
Move 3
...

Replay is useful for:

- players
- debugging
- disputes
- statistics
- AI analysis
- regression investigation

Do not persist only the final board.

---

## 68. GAME RULE VERSIONING

Every game should eventually store a:

`rules_version`

Example:

`classic-1.0.0`

This protects active historical games from future rule changes.

A future change such as:

SJUA +50 -> another value

must not silently alter the rules of games already in progress.

---

## 69. BOARD VERSIONING

Every game must store its board configuration/version.

Example:

`ordel-classic-board-1`

Future board balancing must not mutate the rules of active games.

---

## 70. TILE DISTRIBUTION VERSIONING

Every game must store the tile distribution/value configuration used when the
game was created.

Example:

`ordel-sv-tiles-1`

This allows future balancing without corrupting historical games.

---

## 71. COMPLETE GAME CONFIGURATION

Conceptually, a Classic game should be reproducible from configuration similar
to:

mode:
classic

rules_version:
classic-1.0.0

language:
sv-SE

dictionary:
ordel-sv

dictionary_version:
1.0.0

board_configuration:
ordel-classic-board-1

tile_configuration:
ordel-sv-tiles-1

tempo:
normal

turn_duration:
72h

This exact storage format is not mandated.

The principle is mandatory.

---

## 72. INVALID OR STALE CLIENT STATE

A client may submit a move based on an outdated board.

Example:

- player opens game
- state changes elsewhere
- client attempts stale submission

The server must reject the stale action safely.

The client should then:

1. fetch latest authoritative state
2. explain that the game changed
3. restore the user to a valid state

Never attempt to merge incompatible game states automatically.

---

## 73. MULTIPLE DEVICES

A player may eventually use multiple devices.

The backend must remain correct if the same account has the game open on two
devices.

Only the first valid committed action against the current authoritative turn
state should succeed.

A second stale submission must fail safely.

---

## 74. CHEATING RESISTANCE

The system cannot prevent a player from consulting external word tools.

However, the application itself must not expose hidden competitive information.

Never send an opponent's private rack to another player's client.

Never send future tile-bag order to clients.

Only send information a player is entitled to know.

---

## 75. FUTURE LIVE MODE

Live mode is NOT defined by this document.

Do not assume Classic timeout behavior is suitable for Live.

Live will require explicit rules for:

- clocks
- disconnects
- reconnects
- backgrounding
- forfeits
- synchronization

Create a separate rules extension before implementing Live.

---

## 76. FUTURE RANDOM BOARD

Random Board is NOT part of initial Classic.

The game engine must nevertheless support alternative board configurations.

Do not hardcode Classic bonus positions throughout business logic.

---

## 77. FUTURE AI

AI opponents must obey exactly the same game rules and dictionary rules as
human players unless an explicitly named training mode states otherwise.

AI must never receive illegal access to hidden future tile draws when choosing
moves.

---

## 78. TEST REQUIREMENTS

The game engine must have automated tests covering at minimum:

### Placement

- valid first move through center
- invalid first move missing center
- valid horizontal placement
- valid vertical placement
- disconnected placement
- placement on occupied cell
- use of existing letters between new tiles
- single-tile placement

### Dictionary

- valid standard word
- valid inflection
- valid Ordel Extended word
- valid proper noun
- valid brand
- valid slang
- valid offensive/vulgar word
- invalid random string
- one invalid crossword invalidates full move

### Scoring

- normal letters
- DL
- TL
- DW
- TW
- multiple word multipliers
- crossing words
- multiple words in one move
- blank tile
- consumed bonus cell
- SJUA +50

### Rack

- correct tile removal
- correct refill
- partial refill when bag nearly empty
- empty bag

### Turns

- PLAY
- PASS
- SWAP
- RESIGN
- invalid action by wrong player
- duplicate submission

### Swap

- one tile
- multiple tiles
- insufficient bag size
- exchanged tiles cannot be immediately redrawn during the same operation

### Game ending

- player plays out
- final rack deduction
- scoreless-turn ending
- resignation
- timeout
- draw

### Versioning

- game remains tied to dictionary version
- game remains tied to board configuration
- game remains tied to tile configuration
- game remains tied to rules version

Whenever a gameplay bug is discovered:

add a regression test before or alongside the fix.

---

## 79. RULES AND CONFIGURATION STATUS

The following V0.1 game configurations are now defined:

### Classic board

`ordel-classic-board-1`

Status:
DEFINED

### Swedish tile distribution and letter values

`ordel-sv-tiles-1`

Status:
DEFINED FOR INITIAL BETA

The configuration may be rebalanced in a future version based on simulation
and real gameplay data.

### Swedish dictionary

`ordel-sv-1.0`

Status:
DATA STRATEGY DEFINED

The exact import pipeline, licensing attribution and editorial inclusion rules
must be completed in:

`DICTIONARY_POLICY.md`

before the dictionary implementation is considered production-ready.

### Minimum word length

2 letters

Status:
DEFINED

### Remaining prerequisite

The primary remaining rules-related prerequisite for implementation is the
completion of:

`DICTIONARY_POLICY.md`

Claude Code must not invent missing dictionary editorial policies.

---

## 80. V0.1 RULE COMPLETION GATE

Before V0.1 can be declared gameplay-complete:

- `ordel-classic-board-1` is implemented and tested
- `ordel-sv-tiles-1` is implemented and tested
- `ordel-sv-1.0` is generated through the approved dictionary pipeline
- `DICTIONARY_POLICY.md` is completed
- all required source attribution is implemented
- Ordel Extended V1 exists
- game engine is implemented
- server-authoritative validation is implemented
- automated rule tests pass
- two-device complete-game testing passes

The board and tile configuration are no longer open product decisions.

They must not be replaced with Scrabble, Wordfeud or other configurations by
Claude Code.

---

## 81. AUTHORITATIVE PRINCIPLE

When UI behavior, database behavior and game-engine behavior disagree:

this document defines intended game behavior.

If implementation reveals that a rule here is technically problematic or
creates poor gameplay:

do not silently change the implementation.

Raise the issue.

Make a product decision.

Update GAME_RULES.md.

Then update implementation and tests.

---

## 82. FINAL RULE PRINCIPLE

Ordel should be generous about language and strict about gameplay.

Language should invite experimentation.

Game state should be deterministic.

Scoring should be transparent.

Players should understand why a move succeeds or fails.

And the server must always know exactly what happened.
