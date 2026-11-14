# Ninja Adventure — Project brief and phased execution

Status: opening scene implemented; validation results are recorded in README.md. The rest of M1 remains pending. Product owner directs work from ChatGPT, develops/reviews in VS Code, and is new to Codex.

## Creative correction approved by the owner — 2026-11-14
The explicit owner instruction supersedes the earlier generic-ninja direction in this brief and AGENTS.md: this is a personal, private, non-commercial LEGO NINJAGO birthday adventure, with master Wu as narrative protagonist. It must not be rewritten as a generic fantasy adventure. Earlier original-character requirements below are historical and superseded by this correction.

The opening is «EL SECRETO DEL MAESTRO WU», with the subtitle «Una antigua misión. Dos equipos de ninjas. Un secreto que solo podrán descubrir juntos» and action «COMENZAR AVENTURA». Art direction: Monastery of Spinjitzu inspiration, original layered vector scenery, dark mountains, gold details, lantern light and drifting mist. Primary composition: 1920 × 1080, responsive to smaller windows. No external visual references or media were supplied; this artwork is a provisional original interpretation, not official franchise art.

Only original visuals and organizer-supplied local media may be used. Do not automatically download third-party protected assets. Keep organizer media in ignored `public/private-media/`; Vite copies that folder into local builds, so those builds must also remain private. No publication, commit or push is authorized.

Current authorized slice: opening and provisional second scene with a readable missing-message state and return action. Operator synchronization, embedded video playback and other M1 work remain pending; game rules, teams and clues are unchanged. No audio or video has been supplied.

Technical references: https://vuejs.org/api/sfc-script-setup.html (typed Composition API), https://vuejs.org/api/general.html#nexttick (focus after scene changes), https://vite.dev/guide/assets.html#the-public-directory (local media), https://vite.dev/guide/ (local development and build).

## Product vision
An immersive, cinematic, original ninja adventure for approximately eight-year-old children, combining physical play, riddles and local digital experiences. Exactly two rival teams accumulate complementary clues. Their finale succeeds only through cooperation: **«UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES»**.

## Non-negotiables
- Run from a **local** computer without internet during the event. Locally served site, local media and no runtime requests to external services.
- Two-day event with different participants each day; data must reset/configure per session in a later milestone.
- Separate operator display and public show on an external extended monitor; operator triggers transitions.
- Video is embedded in a designed frame, not fullscreen; cinematic ninja-fantasy visuals with original characters and artwork.
- Physical test outcomes are manually adjudicated. For those tests the public screen shows number, title and brief description.
- Content such as tasks and clues should be configurable without editing view logic.
- Favor accessible typography, clear controls, large-screen readability, mouse/keyboard operation and graceful media failures.
- Avoid copied brand logos, recognizable trademark character likenesses and third-party licensed assets without permission.

## Chosen implementation
Vue 3 + Composition API + TypeScript + Vite. Small SPA without backend and without unnecessary runtime dependencies. Local JSON/CSV input for later content; browser-local state where appropriate. For the first prototype, a simple two-window synchronization mechanism is enough. Use current compatible stable versions rather than blindly pinning unverified numbers.

## Milestone plan
### M0 — Repo and working agreements
- GitHub repository present, project brief and Codex instructions committed.
- Set up user machine: VS Code, Git, Node LTS, official Vue extension and Codex extension.

### M1 — First playable slice (next)
- Screen 1: cinematic intro, strong visual focal point, prominent START GAME button.
- Screen 2: mentor presentation with placeholder/embedded local MP4 inside decorative monitor/temple frame.
- Operator page/window starts the experience and navigates between the two screens; separate show display receives changes reliably on same machine.
- Public interface in Spanish, with optional concise English thematic taglines if explicitly approved.
- Clearly documented local launch; verify without network after dependencies are installed.
- Acceptance: build succeeds; no remote assets; transition works across two windows; missing video shows a useful fallback; playable with keyboard and on extended display.

### M2 — Session and teams
- Session setup/reset for two different days.
- CSV import of participants (name, gender, age), validation and preview; manual/random assignment to exactly two teams.
- Editable team names; optional name catalog from local CSV; editable team colors.

### M3 — Challenges and clue administration
- Content-driven challenge definitions, human-entered results, public challenge display, clue release; simple recovery/resume.

### M4 — Finale and rehearsal
- Complementary clue validation, cooperative finale, local multimedia, full offline rehearsal, backup and operator guide.

## Acceptance and release gates
No milestone is done based only on generated source. Require actual build/test evidence and an operator smoke test. Fix blocking faults before visual polish. Do not add libraries, cloud infrastructure, authentication or multi-agent orchestration unless a demonstrated need arises.

## Deliverables
Working source repository, README setup/run instructions, user/operator guide, decisions and validation notes. The first MVP may use CSS illustrative assets until bespoke art/music/video is available. Do not claim that placeholder imagery is approved final art.

## Open assets (not blockers for M1)
The original local mentor video/audio/illustrations are not yet supplied to the repo. Implement a resilient placeholder so coding and UI review can proceed.
