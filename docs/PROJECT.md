# Ninja Adventure — Project brief and phased execution

Status: planning complete, implementation not yet verified. Product owner directs work from ChatGPT, develops/reviews in VS Code, and is new to Codex.

## Product vision
A private, non-commercial LEGO NINJAGO-themed immersive adventure, guided by Master Wu, for approximately eight-year-old children, combining physical play, riddles and local digital experiences. Exactly two rival teams accumulate complementary clues. Their finale succeeds only through cooperation: **«UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES»**.

## Non-negotiables
- Run from a **local** computer without internet during the event. Locally served site, local media and no runtime requests to external services.
- Two-day event with different participants each day; data must reset/configure per session in a later milestone.
- Separate operator display and public show on an external extended monitor; operator triggers transitions.
- Video is embedded in a designed frame, not fullscreen. Narrative and visual identity unmistakably evoke LEGO NINJAGO, Master Wu, the dojo, ninja powers and ancient mysteries; UI layouts and any newly produced supporting artwork should be original.
- Physical test outcomes are manually adjudicated. For those tests the public screen shows number, title and brief description.
- Content such as tasks and clues should be configurable without editing view logic.
- Favor accessible typography, clear controls, large-screen readability, mouse/keyboard operation and graceful media failures.
- Maintain the NINJAGO theme and Master Wu as story guide. This is an unofficial personal event, not an official LEGO product. Do not publish or redistribute copyrighted source media unless usage rights allow it; keep user-provided show assets local and outside the public Git repository. Personal use does not automatically clear all rights.

## Chosen implementation
Vue 3 + Composition API + TypeScript + Vite. Small SPA without backend and without unnecessary runtime dependencies. Local JSON/CSV input for later content; browser-local state where appropriate. For the first prototype, a simple two-window synchronization mechanism is enough. Use current compatible stable versions rather than blindly pinning unverified numbers.

## Milestone plan
### M0 — Repo and working agreements
- GitHub repository present, project brief and Codex instructions committed.
- Set up user machine: VS Code, Git, Node LTS, official Vue extension and Codex extension.

### M1 — First playable slice (next)
- Screen 1: cinematic **LEGO NINJAGO** birthday-adventure introduction, references to Master Wu and an ancient secret, a clear focal point and prominent «COMENZAR AVENTURA» button.
- Screen 2: **Master Wu** presentation with placeholder/user-provided local MP4 inside decorative dojo/temple frame.
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
The user-provided local Master Wu video/audio/illustrations are not yet supplied to the repo. Implement a resilient placeholder so coding and UI review can proceed.
