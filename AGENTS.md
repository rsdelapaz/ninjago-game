# Instructions for Codex — Ninja Adventure

Read `docs/PROJECT.md` before changing code. This repo is a specific immersive ninja adventure, **not** a theme-agnostic game engine.

## Mission and priorities
- Deliver a reliable, cinematic, accessible experience for a children's birthday event (approx. 8 years old).
- Prioritize a working local/offline MVP over polish or framework building: **better done than perfect**.
- Use Spanish for user-facing copy unless the product brief specifies otherwise.
- No runtime internet, remote fonts, remote images, analytics, hosted APIs, or cloud dependency. Development-time dependency installation is allowed.
- Approved creative direction: a personal, private, non-commercial NINJAGO birthday adventure with master Wu, as recorded in docs/PROJECT.md. Preserve the approved local scenes. Do not download official logos or third-party assets. Public source may include original vector scenery and the original LET'S GO seal; organizer media and the local fan illustration stay ignored in public/private-media/. The interface must not display the word LEGO. This approval does not imply a third-party license or permission to publish private media.

## Technical direction
- Vue 3, Composition API, `<script setup lang="ts">`, TypeScript, Vite. Use current stable releases compatible with a supported Node.js LTS; check actual package metadata rather than guessing versions.
- Keep components small, state explicit, dependencies minimal, and content/configuration separated from rendering.
- Use relative local assets and support serving the compiled app from a loopback HTTP server. Do not assume `file://` supports module bundles.
- Primary display on external extended monitor; operator/admin in a separate browser window on the same computer. A simple `BroadcastChannel` can synchronize windows; design a fallback when needed.
- Videos play **inside an illustrated stage/frame** and never trigger automatic fullscreen. Provide controls and a readable fallback if missing. No required autoplay with sound.
- Physical challenges are adjudicated by a human and results manually entered. Never invent automated sensors or scoring.

## Gameplay invariant
- Exactly two teams compete in physical, intellectual, digital, and manual challenges and receive clue fragments. Final riddle requires combining both teams' clues; neither team alone can solve it.
- Final message: «UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES».
- Two different sessions on consecutive days; configurable participants imported from CSV (name, gender, age), manual/random assignment, two editable team names with CSV-based suggestions, and team colors. Do not implement all of this before the approved opening-scene MVP.

## Current authorized slice — Hito 06: El despertar de los clanes (2026-11-15)
The Hito 06 order supersedes earlier no-commit/no-push restrictions for this iteration: after successful code checks and a public-source privacy audit, commit the preserved local work and Hito 06 changes and push ONLY origin/feat/upgrade-prologue-art. No main changes, merge, force push, reset or clean. Known browser smoke restrictions alone do not block this development commit; document missing captures and visual checks accurately.

Build the approved ceremony into an individual ninja-seal constellation, with modest captain distinction, original clan emblems and a shared central bond. Use complete names (captain first, others Spanish alphabetical); show every member across deterministic groups when needed, identical in both windows and responsive. Replay/skip/group controls affect visual presentation only, never config or ceremony decisions. Reuse catalogue, state machine, handshake, reset and isolation protections. Names use variable-length existing lists, escalating short Spanish Wu reactions, empty-scroll manual fallback and accepted-name celebration; no forced rejection except confirmed duplicate names. Preserve approved opening/video and private assets; no new dependency or runtime network. Validate code and audit all accumulated local source before the authorized publication.

## Previous authorized slices (historical; release restrictions superseded above)
Latest usability/reset order: sort every participant display with the shared Spanish Intl.Collator (base sensitivity, numeric), without reordering persisted arrays; public captains first, others alphabetical. Group add-member candidates into unassigned then opposing members, each sorted. New profiles get three editable humorous suggestions per team; never backfill existing empty lists. Explicit active-profile reset in Configuration/JSON offers export, requires acknowledgement, restores empty teams/default suggestions/media references, clears ceremony and returns navigation/public to opening. Reuse coordinated writes and the recovery journal, reject stale reviewed state, retain other profiles/drafts/history/legacy keys and physical media. Keep all earlier uncommitted changes and do not commit/push.

Latest stabilization order: fix reactive proxy cloning using explicit validated plain data, test real Vue reactivity, and do not hide computed errors with generic catches. Operator scene/ceremony actions must synchronously obtain/open the named public window and wait for a fresh mounted-app handshake before changing live state; preview selection must remain local. Provide readiness/error/recovery feedback. Add confirmed multi-member team assignment/transfers and captain actions on the member list; preserve exclusive membership. Preparation requires members/captains, not final names/colors. Add clear operator/children/continue guidance, short humorous Wu reactions based on proposal indexes, and original CSS/SVG refinements using approved local art. No new dependencies or media downloads. Keep these changes uncommitted and unpushed; the owner manages Git in VS Code.

The latest director order authorizes a complete local opening -> team ceremony -> existing Wu video flow. Add one optional captain per team (must be a member), compatible v2 JSON normalization without rewriting old records, cinematic team banners and one ceremony state machine. Ceremony phases: arrival, team 1 color/name, team 2 color/name, final teams, existing video. Offer exactly two data-defined colors at a time, no repeated final colors or names; names use each team's suggestions with yes/no and manual fallback on exhaustion. The operator alone confirms choices. Require both teams to have members and a captain before starting; never fabricate participants. Keep configuration and per-profile ceremony progress separate; persist confirmed decisions, support back/reload/resume, same-origin synchronization and rejection of stale writes. Keep private media and approved opening/video composition. No scoring, challenges, clues, users, backend, new audio/video generation or external runtime requests.

All ceremony changes remain local WITHOUT commit or push until a new order. The base command-center commit was separately authorized and completed; it does not authorize committing this milestone. Do not repeat blocked headless Edge launches as a validation gate; document browser smoke/captures as pending when unavailable and provide normal-browser rehearsal steps.

## Historical slice — profile command center (2026-11-15)
The latest owner request supersedes the session-based organizer: exactly two initial profiles (colegio, urbanizacion), independent ProfileConfig schema v2 and GameProgress, initially unnamed/uncolored/empty teams, per-team suggestions, per-profile media folders, explicit legacy conversion without deletion, generic stable-ID scene control, responsive modular dashboard. Preserve approved public art/video. No backend, remote runtime dependencies, connectivity modes, scoring or later game phases. Keep legacy schema-v1 source only for recovery and regression tests.

All changes must remain local in this iteration. No commit, push, merge, reset, clean, destructive Git operations or publication without NEW authorization. This replaces every earlier publication authorization below.

## Historical milestone (M1)
The latest owner requirement expands the authorized organizer slice into session configuration: separate SessionConfig and GameProgress; participants, exactly two teams, explicit balanced assignment, versioned JSON preview/import/export and duplication. Implement these without changing the approved public artwork, CTA or video. No CSV, scoring, challenges or later gameplay logic is authorized in this slice. The same static application must work on local or web servers without connectivity-dependent rules, cross-origin synchronization or required cloud services.

Implement and verify exactly: (1) cinematic intro with START GAME, (2) original master/mentor presentation scene with a local video embedded in a designed screen, (3) simple operator control in a separate window, with scene transitions synchronized locally. Good empty-media states and responsive design are required. Do not start the full game engine, player import, account systems, database, online multiplayer, or deployment in M1.

## Working procedure
1. Inspect the repo, summarize current state, and define a short plan before edits.
2. Work one milestone at a time; require authorization for destructive operations, secrets, remote writes, commits, pushes, or deployments. The earlier 2026-11-14 Git publication authorization is superseded: the current profile iteration must remain local. Normal file edits within the authorized milestone are allowed.
3. Create/modify the minimum files needed. Never add speculative infrastructure or many subagents just to simulate a team.
4. Before reporting success, run applicable tests, TypeScript checks, lint and production build; record exact commands and outcomes. If a command cannot run, say so.
5. Explain changed files, how to run locally, how to test two windows, any missing media assets, and known limitations.
6. Keep `docs/PROJECT.md` updated when decisions materially change; do not replace stated requirements silently.

## Specialist disciplines, on demand
Game/narrative designer; child-activity facilitator; frontend/UI/UX; audiovisual/illustration; QA/accessibility; music (Suno); voice/audio (ElevenLabs). Activate only when work needs their expertise. For external tool research, use official vendor documentation first, then dated practical guides/YouTube and labeled community reports/Reddit. Distinguish verified specifications from anecdotal claims, and check licenses and costs before proposing integrations.
