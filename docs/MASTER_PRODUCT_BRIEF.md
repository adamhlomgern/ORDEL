# MASTER PRODUCT BRIEF

## Modern Social Word Game — iOS First

Status: Living master document
Initial phase: V0.1
Primary platform: iPhone
Initial distribution: Expo Go
Language at launch: Swedish
Monetization during beta: None

---

## 1. PURPOSE OF THIS DOCUMENT

This document is the product, UX, technical, architectural and development
source of truth for this project.

It is intended to be read and used continuously by Claude Code throughout
development.

Do NOT attempt to implement everything described in this document at once.

The product will be built incrementally according to the version roadmap.

Before beginning any implementation phase:

1. Read this entire document.
2. Read the current ROADMAP.md.
3. Read ARCHITECTURE.md.
4. Read GAME_RULES.md.
5. Read DECISIONS.md.
6. Inspect the existing codebase.
7. Determine the current version and completed acceptance criteria.
8. Produce an implementation plan for ONLY the requested version.
9. Identify risks, dependencies and architectural implications.
10. Implement incrementally.
11. Test the implementation.
12. Update documentation.
13. Mark acceptance criteria complete only when actually verified.

Never silently change fundamental product behavior, architecture, game rules,
database design or UX principles.

If a decision has long-term consequences, document it in DECISIONS.md.

---

## 2. PRODUCT VISION

Build a modern, premium-feeling social word game inspired by the fundamental
appeal of asynchronous board-based word games such as Wordfeud and Scrabble.

The goal is NOT to create a feature-heavy mobile game.

The goal is to create the best digital environment for playing a strategic
word game with friends and other people.

The experience should feel:

- calm
- intelligent
- tactile
- modern
- Scandinavian
- social without becoming a social network
- competitive without becoming stressful
- premium without requiring payment
- simple for casual players
- deep for serious players

The core philosophy:

"Play a word. Put the phone away."

The application should respect the player's time.

Do not optimize for meaningless screen time.

---

## 3. THE CORE PRODUCT PROBLEM

Existing word games have proven that asynchronous word games have an extremely
strong core loop.

However, many existing products suffer from combinations of:

- dated interfaces
- unclear dictionary behavior
- weak player discovery
- shallow profiles
- limited statistics
- poor match history
- intrusive advertising
- confusing bots
- weak competitive systems
- outdated social features
- external tournament infrastructure
- little support for actually learning words
- limited real-time play
- mobile-game engagement clutter

This product should preserve the proven game loop while rebuilding the
surrounding experience for modern mobile users.

---

## 4. CORE PRODUCT PROMISES

The product should eventually communicate four fundamental promises:

1. REAL PEOPLE
Players should understand who they are playing.

2. CLEAR WORD RULES
The game should explain why words are accepted or rejected.

3. NO NONSENSE
No casino mechanics, artificial currencies, energy systems or manipulative
engagement mechanics.

4. GREAT WORD PLAY
The board, tiles, scoring and act of placing a word must feel excellent.

---

## 5. TARGET USERS

There are two primary player archetypes.

### 5.1 Casual social player

Example behavior:

- plays primarily against friends or family
- checks the app several times per day
- does not care much about rankings
- wants to immediately understand whose turn it is
- wants a pleasant board
- may use chat
- expects notifications
- may have several games running simultaneously

This player must NEVER be forced into competitive systems.

### 5.2 Competitive word player

Example behavior:

- plays frequently
- wants skill rating
- studies statistics
- cares about vocabulary
- wants matchmaking
- may participate in leagues or tournaments
- wants match analysis
- wants historical performance data

The application should become deep enough for this user without making the
casual player's interface complicated.

---

## 6. NON-GOALS

Do NOT turn this product into a conventional free-to-play mobile game.

Do not implement:

- coins
- gems
- energy
- lives
- loot boxes
- paid gameplay advantages
- paid wildcards
- paid tile swaps
- score boosters
- forced daily rewards
- reward chests
- artificial countdown pressure
- gameplay-affecting purchases

Future monetization may include:

- optional subscription
- cosmetic themes
- advanced analytics
- enhanced historical statistics
- AI analysis

But paid users must NEVER receive gameplay advantages.

During all V0.x beta development:

THERE IS NO MONETIZATION.

Do not build:

- subscriptions
- ads
- payment infrastructure
- premium feature gates
- purchase SDKs

unless explicitly requested in a future roadmap revision.

---

## 7. TECHNOLOGY STACK

Primary stack:

Frontend:

- React Native
- Expo
- TypeScript

Backend:

- Supabase

Backend capabilities:

- PostgreSQL
- Supabase Auth
- Supabase Realtime
- Row Level Security
- Edge Functions where appropriate
- Storage only where necessary

Development:

- Claude Code
- Git
- GitHub

Initial distribution:

- Expo Go

Later distribution:

- Expo Development Build
- TestFlight
- Apple App Store

Future:

- Android should be possible without rewriting the application.

---

## 8. EXPO GO REQUIREMENT

Until explicitly changed:

ALL V0.x versions should remain compatible with Expo Go whenever reasonably
possible.

Do not introduce native dependencies requiring a custom development build when
an Expo Go-compatible implementation exists.

Before adding any dependency:

1. Verify Expo compatibility.
2. Explain why the dependency is required.
3. Prefer maintained dependencies.
4. Avoid unnecessary packages.

When the product eventually requires functionality incompatible with Expo Go,
document the reason and migration path before changing the development model.

---

## 9. ENGINEERING PRINCIPLES

Prioritize:

1. Correctness
2. Maintainability
3. Simplicity
4. Security
5. Performance
6. Developer experience

Avoid premature abstraction.

Do not build infrastructure for hypothetical V2 functionality unless current
architecture would otherwise create a major migration problem.

Prefer boring, reliable technology.

Do not create unnecessary services.

Supabase should remain the primary backend unless there is a documented reason
to introduce something else.

---

## 10. REPOSITORY STRUCTURE

Prefer a structure conceptually similar to:

/
  apps/
    mobile/

  packages/
    game-engine/
    dictionary/
    shared/
    types/

  supabase/
    migrations/
    functions/
    seed/

  docs/
    PRODUCT.md
    ARCHITECTURE.md
    ROADMAP.md
    GAME_RULES.md
    DATABASE.md
    DESIGN_SYSTEM.md
    DECISIONS.md
    TESTING.md

Exact implementation may evolve if there is a strong technical reason.

Do not restructure the repository casually.

---

## 11. GAME ENGINE

The game engine is one of the most important components of the project.

It MUST be separated from React Native UI.

The engine should be written as framework-independent TypeScript.

It must not depend on:

- React
- React Native
- Expo
- Supabase
- UI state
- navigation

Conceptually:

GameState + Move -> GameResult

Example:

makeMove(gameState, proposedMove)

returns something conceptually equivalent to:

{
  valid: true,
  score: 34,
  wordsCreated: [...],
  resultingGameState: ...
}

The engine should eventually support:

- board configuration
- tile distribution
- tile values
- tile bag
- racks
- placement validation
- adjacency rules
- first move rules
- word extraction
- dictionary validation
- scoring
- premium squares
- blank tiles
- passing
- swapping tiles
- resigning
- end-game detection
- final score adjustment
- winner calculation
- deterministic replay

Game rules must have automated tests.

Game engine correctness takes priority over UI development.

---

## 12. SERVER AUTHORITY

The client must never be authoritative about competitive game state.

The client may calculate previews locally for responsiveness.

Example:

Player places a word.

Client:
"Estimated score: 32"

When submitted:

Client -> Server

Server verifies:

- authenticated player
- game membership
- correct turn
- game status
- tile ownership
- placement legality
- dictionary validity
- score
- resulting board
- rack update
- tile bag
- next player
- game completion

Only validated server state is persisted.

Never trust client-submitted scores.

Never allow the client to directly mutate authoritative match state in an
unsafe way.

Use database transactions/RPC/server-side logic where atomicity is required.

---

## 13. DICTIONARY ARCHITECTURE

Dictionary behavior is a core product feature.

Never hardcode vocabulary inside UI components.

Create a dictionary abstraction.

Conceptually:

DictionaryProvider

Methods may include:

validateWord(word)
getDefinition(word)
getMetadata(word)
getDictionaryVersion()

Every game must store:

language
dictionary identifier
dictionary version

Example:

language: sv-SE
dictionary: <provider>
dictionary_version: 1.0.0

A dictionary update must never unexpectedly change the rules of an existing
game.

Licensing must be verified before shipping any dictionary dataset.

Do not scrape or redistribute copyrighted dictionaries without explicit legal
permission.

Initial requirement:

Swedish.

Future architecture should allow additional languages.

---

## 14. WORD TRANSPARENCY

A rejected word should eventually explain WHY it was rejected.

Bad:

"Invalid word."

Better:

"KATTERNA is not accepted in the Swedish dictionary used by this match."

Future capabilities:

- word lookup
- definitions
- dictionary source/version
- save word
- personal vocabulary
- report questionable word

These are later features and must not block the initial MVP.

---

## 15. CORE GAME LOOP

The fundamental asynchronous loop is:

Notification
↓
Open game
↓
Understand board
↓
Evaluate rack
↓
Place tiles
↓
See score preview
↓
Submit move
↓
Receive satisfying feedback
↓
Opponent's turn
↓
Leave application

The final step is intentional.

Do not design the product around keeping players inside the application.

---

## 16. GAME MODES — LONG TERM

Potential modes:

CLASSIC
Asynchronous gameplay.
Players respond whenever convenient.

QUICK
Asynchronous but with shorter expected response windows.

LIVE
Real-time timed gameplay.

AI
Play against transparent AI opponents.

DAILY
Shared daily word challenge.

RANKED
Skill-based competitive games.

TOURNAMENT
Structured competitive events.

Only CLASSIC is required initially.

Do not implement future modes prematurely.

---

## 17. BOARD TYPES

Long-term board options may include:

Classic
Random
Balanced Random
Daily Board
Experimental/Chaos

Initial implementation:

CLASSIC BOARD ONLY.

Random board may follow after the game engine is proven.

Board configuration should nevertheless be data-driven rather than completely
hardcoded into rendering logic.

---

## 18. UX PRINCIPLES

The product should feel immediately understandable.

Avoid:

- excessive modal dialogs
- hidden critical actions
- tiny touch targets
- unnecessary menus
- excessive badges
- gamification clutter
- visual noise
- excessive onboarding
- unexplained icons

Prioritize:

- large touch targets
- obvious hierarchy
- immediate feedback
- predictable navigation
- excellent typography
- subtle animation
- tactile interaction
- accessibility

---

## 19. VISUAL DIRECTION

Desired aesthetic:

- Scandinavian
- calm
- tactile
- warm
- contemporary
- premium
- intelligent
- restrained

Avoid looking like:

- children's educational software
- casino apps
- generic SaaS
- cheap mobile games
- direct Wordfeud clone
- direct Scrabble clone

The interface should establish its own visual identity.

Potential visual inspiration:

- physical board games
- paper
- wood
- high-quality editorial typography
- subtle depth
- restrained motion

Do not overuse gradients, glassmorphism or decorative effects.

---

## 20. BOARD UX

The board is the product's most important interactive surface.

Required eventually:

- smooth pan/zoom where necessary
- clear premium squares
- readable existing words
- clear distinction between committed and currently placed tiles
- drag-and-drop tiles
- tap-based placement alternative
- remove tile from proposed move
- clear score preview
- clear active direction
- responsive tile rack
- blank tile selection
- accessible interaction

Interactions should feel tactile.

Use subtle haptic feedback where Expo Go allows it.

Do not sacrifice reliability for flashy animations.

---

## 21. SCORE EXPLANATION

Players should understand scoring.

During placement:

Show predicted total score.

Later versions may provide breakdown:

STOL = 12
AR = 8
Double Word = +20

Do not overwhelm casual users.

Detailed explanations should be progressive disclosure.

---

## 22. HOME SCREEN

Home should answer one question immediately:

"What should I do?"

Primary grouping:

YOUR TURN

Games requiring action.

WAITING

Games waiting for opponents.

Each game card should communicate at minimum:

- opponent
- score
- game type
- turn state
- time context

Primary action:

NEW GAME

Avoid a giant undifferentiated list.

---

## 23. NAVIGATION — TARGET STRUCTURE

Long-term navigation may include:

HOME
Active games.

PLAY
Game modes and matchmaking.

SOCIAL
Friends, requests, recent opponents.

PROFILE
Statistics, history, settings.

For V0.1 use the simplest navigation structure that supports current scope.

Do not expose empty future tabs.

---

## 24. PLAYER PROFILE — LONG TERM

Potential information:

username
avatar
rating
highest rating
games played
wins
losses
draws
win rate
average score
average word score
highest scoring word
longest word
bingos
average response time
games completed
games resigned
favorite mode

Do not collect statistics that are not useful.

---

## 25. HEAD-TO-HEAD

Future profile relationship:

"You have played 87 games."

Wins:
Player A 46
Player B 39
Draws 2

Additional future information:

- recent results
- highest score
- largest victory
- favorite matchup statistics

This should reinforce long-term social play.

Not required in V0.1.

---

## 26. CHAT

Chat should remain secondary to gameplay.

Eventually support:

- match chat
- mute
- block
- report
- chat preference

Potential preferences:

Chatty
Occasional
Game only

Safety must take priority over engagement.

Do not implement chat before core gameplay is stable unless explicitly included
in the active version.

---

## 27. PLAYER DISCOVERY

Long-term discovery may include:

- friends
- recent opponents
- username search
- random matchmaking
- similar skill
- preferred game pace
- language
- social preference

Avoid dating-app behavior.

The goal is finding good opponents.

---

## 28. MATCHMAKING

Future matchmaking signals may include:

- rating
- language
- preferred mode
- completion rate
- response speed
- social preference

Never expose sensitive personal information.

Initial V0.1 does not require matchmaking.

---

## 29. RATING

Future competitive rating should use a documented, mathematically coherent
system.

Possible approaches include Elo or Glicko-style systems.

Do not invent arbitrary rating changes.

Rating is not required for initial friend games.

---

## 30. AI PLAYERS

Future AI opponents must ALWAYS be explicitly identified as AI.

Example:

NOVA
AI · Medium

Never create artificial human identities intended to trick users.

Potential difficulty:

Beginner
Casual
Intermediate
Advanced
Expert

Future AI Coach may analyze completed games.

AI assistance must never reveal optimal moves during a competitive active game.

---

## 31. MATCH REPLAY

The architecture should make deterministic replay possible.

Every submitted move should be persisted in a structured way.

Future replay UI:

Move 1
Move 2
Move 3
...

The player can step through board history.

This also helps:

- debugging
- disputes
- analytics
- AI analysis

Do not store only the final board.

---

## 32. DAILY CHALLENGE

Future feature.

Every player receives the same board/rack situation.

Goal:

Find the highest scoring move.

Potential result:

"You scored 64.
Top 18% today.
Maximum possible: 78."

Daily should be skill-based rather than reward-currency based.

---

## 33. TOURNAMENTS

Future native tournament infrastructure.

Possible formats:

- elimination
- round robin
- Swiss
- leagues

Do not rely on external tournament websites once native tournaments are built.

Not MVP.

---

## 34. CLUBS

Future lightweight group feature.

Examples:

Family
Friends
Office
Local club

Capabilities may include:

- group leaderboard
- internal games
- mini tournament
- member statistics

Do NOT build a full social network.

---

## 35. STATISTICS

Long-term statistics:

rating
win rate
average match score
average move score
best word
longest word
bingos
response time
completion rate
match history

Potential derived playstyle:

Offense
Board control
Vocabulary
Consistency
Risk

Derived statistics must be explainable.

Do not generate fake pseudo-scientific metrics.

---

## 36. PERSONAL VOCABULARY

Future differentiating feature.

Players may:

- inspect played words
- save interesting words
- view definitions
- see first encounter
- build a personal vocabulary history

Potential annual summary:

unique words played
new words encountered
highest scoring word
favorite letter
matches
opponents

Not MVP.

---

## 37. NOTIFICATIONS

Notifications must be useful, not noisy.

Primary initial notification:

"Your turn against <player>."

Future preferences:

Immediate
Bundled
Smart

Never send meaningless engagement notifications.

---

## 38. ACCESSIBILITY

Build accessibility into components from the beginning.

Consider:

- Dynamic Type
- VoiceOver labels
- contrast
- reduced motion
- touch target size
- color-independent premium-square identification

Never make critical game information understandable only through color.

---

## 39. AUTHENTICATION

Keep onboarding friction low.

Initial options should be chosen based on Expo/Supabase reliability.

Potential:

- email magic link / OTP
- Sign in with Apple later

Do not require unnecessary profile information.

Minimum identity:

- account
- unique username/display identity

Guest mode may be considered but should not create unnecessary account
migration complexity.

---

## 40. PRIVACY

Collect as little personal information as possible.

Do not require:

- real name
- birth date
- gender
- address
- contacts

unless a future feature has a clear reason and user consent.

Design database access using Row Level Security from the beginning.

Never expose another user's private account information.

---

## 41. DATABASE — CONCEPTUAL MODEL

Likely entities:

profiles
friendships
games
game_players
moves
messages
ratings
notifications/preferences
reports
blocks

Future:

clubs
club_members
tournaments
tournament_entries
daily_challenges
daily_attempts
saved_words

Do NOT create every future table immediately.

DATABASE.md should document the current schema.

All database changes should use migrations.

Never manually rely on undocumented production database changes.

---

## 42. GAME DATA

A game should conceptually know:

id
status
language
dictionary
dictionary_version
board_type
created_at
started_at
completed_at
current_turn_player
game configuration

Players should conceptually know:

player_id
rack
score
turn order
status

Moves should preserve:

move number
player
action type
placements
words created
score
timestamp

The exact schema should be designed carefully before implementation.

Avoid storing critical state in multiple conflicting sources.

---

## 43. REALTIME

Supabase Realtime may be used to make opponent moves appear without manual
refreshing.

However:

Realtime is a synchronization mechanism, not the source of truth.

PostgreSQL remains authoritative.

The app must recover correctly if:

- connection drops
- realtime message is missed
- app is backgrounded
- app is killed
- user changes device

On opening a game, fetch authoritative current state.

---

## 44. OFFLINE / BAD NETWORK BEHAVIOR

Users may have unreliable mobile connections.

The app should clearly distinguish:

- tiles placed locally
- move submitting
- move confirmed by server
- submission failed

Never make a player believe a move succeeded when the server did not persist it.

Do not silently duplicate moves after retry.

---

## 45. SECURITY

Use:

- Supabase RLS
- authenticated operations
- server validation
- safe environment variables
- database constraints
- transactional game operations

Never expose service-role credentials in the client.

Never trust:

- player score
- tile ownership
- turn identity
- game completion
- rating change

when supplied by the client.

---

## 46. TESTING

Testing is mandatory for the game engine.

At minimum test:

- legal first move
- illegal first move
- disconnected placement
- occupied square
- invalid word
- valid word
- crossing words
- letter multiplier
- word multiplier
- multiple multipliers
- blank tiles
- rack removal
- tile refill
- pass
- swap
- end-game condition
- final scoring
- deterministic state transition

Regression tests should be added whenever a game-rule bug is discovered.

UI testing may initially be lighter but critical flows should eventually have
integration tests.

---

## 47. ERROR HANDLING

Never leave users at generic technical errors where a useful explanation is
possible.

Prefer:

"Couldn't submit your move. Check your connection and try again."

over:

"RPC_FAILED_500"

Developer errors should still be logged appropriately.

---

## 48. ANALYTICS

During earliest private development, analytics are optional.

Before larger beta, consider privacy-conscious analytics for:

- onboarding completion
- game created
- game started
- move submitted
- game completed
- rematch
- abandonment

Do not track every tap merely because it is possible.

Never send actual private chat content to analytics.

---

## 49. DEVELOPMENT ENVIRONMENTS

Keep development and production concerns separated.

At minimum plan for:

development
production

A staging environment may be introduced when needed.

Never casually run destructive migrations against production.

Seed data should support local/development testing.

---

## 50. DESIGN SYSTEM

Create reusable primitives instead of styling every screen independently.

Potential primitives:

Screen
Text
Button
IconButton
Card
Avatar
Divider
Sheet
Modal
Input
GameCard
Tile
Rack
BoardCell
Badge

Centralize:

spacing
typography
radii
shadows
colors
motion
touch targets

Avoid premature giant component libraries.

---

## 51. PERFORMANCE

The board must remain responsive.

Avoid unnecessary re-rendering of every board cell when one tile changes.

Profile before complex optimization.

Prioritize perceived responsiveness:

dragging
placing
removing
zooming
submitting

should feel immediate.

---

## 52. VERSIONING PHILOSOPHY

Every development version has:

Goal
Scope
Non-scope
Acceptance criteria

Do not leak features from future versions into the active implementation unless
they are necessary architectural foundations.

At the end of each version:

1. Run tests.
2. Run type checking.
3. Run linting.
4. Test primary flows manually.
5. Review database security.
6. Update documentation.
7. Record important decisions.
8. Produce a concise completion report.
9. Do not mark version complete with known blocking bugs.

---

## 53. V0.0 — FOUNDATION

GOAL:

Create a clean, maintainable foundation.

Implement:

- repository structure
- Expo React Native TypeScript app
- Supabase setup
- environment handling
- navigation foundation
- basic design tokens
- game-engine package
- dictionary abstraction
- testing framework
- documentation structure

Do NOT build large amounts of UI.

Acceptance:

- app launches through Expo Go
- TypeScript passes
- lint passes
- tests run
- Supabase development connection works
- architecture documented
- no secrets committed

---

## 54. V0.1 — FIRST COMPLETE GAME

GOAL:

Two known users can play a complete Swedish word game from beginning to end.

Implement:

Authentication
Username/profile
Friend/user connection sufficient for testing
Create game
Invite/select opponent
Accept/start if necessary
Classic board
Tile rack
Tile bag
Turn order
Place tiles
Remove/reposition proposed tiles
Score preview
Submit move
Server validation
Dictionary validation
Opponent receives updated state
Pass
Swap
Resign
Game completion
Winner/result
Basic home screen
YOUR TURN
WAITING

No:

chat
rating
random matchmaking
AI
daily
tournaments
monetization

Acceptance:

Two separate accounts on separate devices can complete an entire match without
developer intervention.

---

## 55. V0.2 — GAME FEEL

GOAL:

Make playing a word feel excellent.

Focus:

- board interaction
- tile dragging
- tap placement if useful
- animations
- haptic feedback
- score feedback
- turn transitions
- loading states
- empty states
- connection failure UX
- visual polish
- accessibility

Acceptance:

Core gameplay feels stable and pleasant enough for repeated daily use.

No major game-rule changes unless bugs are discovered.

---

## 56. V0.3 — SOCIAL CORE

GOAL:

Make repeated friend play excellent.

Implement:

- friend management
- recent opponents
- rematch
- match chat
- mute
- block
- basic reporting
- head-to-head basic history
- notification preferences

Acceptance:

A small friend group can use the app continuously without needing external
coordination.

---

## 57. V0.4 — PRIVATE BETA

GOAL:

Prepare for a meaningful private beta.

Implement:

- onboarding polish
- robust error handling
- reporting flow
- crash monitoring if appropriate
- basic product analytics
- stronger profile
- match history
- replay foundation
- beta feedback mechanism
- performance audit
- security audit
- database audit

Distribution remains Expo Go unless explicitly changed.

Acceptance:

The product is safe and stable enough for approximately 10–50 invited testers.

---

## 58. V0.5 — MATCHMAKING

GOAL:

Allow players to find good opponents without already knowing them.

Implement:

- random matchmaking
- player rating
- matchmaking preferences
- completion-rate safeguards
- game pace indicators
- recent opponent handling

Potential preferences:

language
skill
pace
chat preference

Acceptance:

A player can enter without friends and reliably find an appropriate human
opponent.

---

## 59. V0.6 — DEPTH

GOAL:

Make long-term play meaningful.

Implement:

- advanced statistics
- richer match history
- full replay
- dictionary lookup
- word details
- saved words
- personal vocabulary foundation
- richer head-to-head

Acceptance:

Players can understand and explore their playing history without affecting the
simplicity of the main game loop.

---

## 60. V0.7 — LIVE

GOAL:

Introduce a fundamentally different usage mode.

Implement:

LIVE games.

Explore:

per-turn timer
total-player clock

Choose one through testing.

Live architecture must account for:

- disconnects
- reconnects
- backgrounding
- clock authority
- abandonment
- synchronization

Do not reuse asynchronous assumptions blindly.

Acceptance:

Two users can reliably complete a timed live match.

---

## 61. V0.8 — DAILY

GOAL:

Create a lightweight skill-based daily ritual.

Implement:

- shared daily board/rack
- attempts
- score
- percentile
- solution reveal
- history

No reward currency.

Acceptance:

Every player receives the same valid challenge and results are comparable.

---

## 62. V0.9 — COMPETITIVE SYSTEM

Potential:

- ranked mode refinement
- seasons
- leagues
- native tournaments
- leaderboards

This version requires separate detailed planning before implementation.

Do NOT treat this section as sufficient specification.

---

## 63. V1.0 — PUBLIC RELEASE

Goal:

Public iPhone release.

Before V1.0:

- move from Expo Go workflow where required
- configure production build
- Apple Developer setup
- TestFlight
- App Store metadata
- privacy information
- terms/privacy documents
- production Supabase configuration
- production monitoring
- backup/recovery considerations
- rate limiting
- abuse prevention
- final accessibility audit
- performance audit
- security audit
- beta feedback review

V1.0 should NOT mean every long-term feature exists.

V1.0 means:

The core product is sufficiently good, stable and understandable for public
distribution.

---

## 64. POST V1 POSSIBILITIES

Possible future work:

AI opponents
AI Coach
clubs
tournaments
additional languages
Android
web companion
year-in-words summaries
cosmetic themes
optional paid subscription
advanced competitive analytics

These are possibilities, NOT commitments.

---

## 65. PRODUCT DECISION RULE

When considering a feature, ask:

Does this improve:

A. playing words,
B. playing with people,
C. understanding the game,
D. improving at the game,
or
E. maintaining a healthy competitive ecosystem?

If none apply, question why the feature exists.

---

## 66. SIMPLICITY RULE

Every new feature has a complexity cost.

Prefer:

one excellent way to do something

over:

five mediocre options.

Do not expose configuration merely because the architecture supports it.

---

## 67. MOBILE-FIRST RULE

Primary target is iPhone.

Design interactions for touch first.

Do not create desktop-style interfaces scaled down to mobile.

However, keep business logic platform-independent so Android can be added
later.

---

## 68. COPY AND LANGUAGE

Initial UI language:

Swedish.

Code:
English.

Database naming:
English.

Technical documentation:
English.

User-facing copy:
Swedish.

Keep UI copy:

short
clear
human
non-technical

Avoid excessive exclamation marks and childish gamification language.

---

## 69. SOURCE OF TRUTH

Avoid duplicated state.

Examples:

Database:
authoritative persisted multiplayer state.

Game engine:
authoritative game-rule implementation.

Client state:
temporary presentation/interactions.

Realtime:
transport/synchronization.

Never allow several independent implementations of scoring or validation to
drift apart.

---

## 70. CLAUDE CODE WORKFLOW

For EVERY version, Claude must first respond internally/through its working
plan with:

CURRENT STATE

What currently exists?

TARGET

What does this version require?

GAP

What is missing?

PLAN

What files/components/database changes are required?

RISKS

What could break?

TEST PLAN

How will completion be verified?

Only then implement.

---

## 71. CHANGE CONTROL

Before making a change outside active version scope:

STOP.

Determine whether it is:

A. required dependency
B. bug fix
C. architectural necessity
D. unrelated future feature

A–C may proceed with documentation.

D should be added to roadmap/backlog instead.

Do not implement D.

---

## 72. DATABASE CHANGE CONTROL

Every schema change:

1. Create migration.
2. Document purpose.
3. Review RLS implications.
4. Consider existing data.
5. Consider rollback/recovery.
6. Update DATABASE.md.

Never mutate production schema manually as an undocumented shortcut.

---

## 73. DEPENDENCY CONTROL

Before adding a package:

Ask:

Can this be implemented reasonably with existing dependencies?

If package is justified:

- confirm maintenance
- confirm Expo compatibility
- confirm license
- confirm bundle impact
- document unusual dependencies

Avoid dependency accumulation.

---

## 74. BUG POLICY

When a bug is discovered:

1. Reproduce.
2. Determine root cause.
3. Add regression test where practical.
4. Fix root cause.
5. Verify adjacent behavior.
6. Do not simply patch the visible symptom.

Game-rule bugs should almost always receive automated regression tests.

---

## 75. UX REVIEW AFTER EACH VERSION

After functional completion, explicitly audit:

- hierarchy
- clarity
- touch targets
- navigation
- loading
- errors
- empty states
- accessibility
- visual consistency
- unnecessary complexity

Do not consider "it works" equivalent to "it is finished."

---

## 76. TECHNICAL DEBT

Do not perform giant speculative refactors.

Record meaningful technical debt in ROADMAP.md or a dedicated debt section.

Address debt when:

- it creates bugs
- slows current development
- creates security problems
- blocks an upcoming version

---

## 77. BACKWARD COMPATIBILITY

Once real users have active games:

Never change game-state formats casually.

Consider migrations/versioning for:

- game state
- dictionary
- board configuration
- rules

An old active game should remain playable after an application update.

---

## 78. OBSERVABILITY

As beta grows, ensure we can diagnose:

- failed move submission
- corrupted game state
- auth failures
- realtime failures
- unexpected game-engine errors

Logs must not unnecessarily expose private user information.

---

## 79. SUCCESS METRICS

Early beta should prioritize qualitative success.

Questions:

Do people finish matches?

Do they start rematches?

Do they understand the board?

Do they understand invalid words?

Do they return without being artificially prompted?

Does playing feel satisfying?

Later metrics may include:

game completion rate
rematch rate
weekly active players
moves/player
friend-game retention
matchmaking completion
crash-free sessions

Do NOT optimize vanity metrics.

---

## 80. THE MOST IMPORTANT RULE

Do not lose the simplicity of the product while improving its depth.

A user who only wants to play one ongoing word game against their mother should
be able to do that without understanding:

ratings,
leagues,
daily challenges,
AI,
analytics,
tournaments,
or any other advanced system.

The basic experience must always remain:

Open app.
See whose turn it is.
Play a word.
Continue with your day.

---

## 81. INITIAL EXECUTION INSTRUCTION

We are currently starting V0.0.

DO NOT immediately implement the entire application.

Your first task is:

1. Inspect the existing repository, if any.
2. Read this master brief completely.
3. Propose the concrete V0.0 architecture.
4. Propose the repository/file structure.
5. Design the initial Supabase strategy.
6. Design the framework-independent game-engine architecture.
7. Identify decisions that must be made before V0.1.
8. Identify any assumptions in this brief that should be reconsidered.
9. Create a detailed implementation plan for V0.0.
10. Present the plan before making major architectural decisions.

Once V0.0 is approved, implement it.

After V0.0 passes its acceptance criteria:

STOP.

Provide a completion report.

Do not begin V0.1 until explicitly instructed.

---

## 82. FINAL PRODUCT PRINCIPLE

We are not trying to build more features than Wordfeud.

We are trying to build a better word game.

Every interaction should earn its place.
