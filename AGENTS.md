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

## Current milestone (M1)
Implement and verify exactly: (1) cinematic intro with START GAME, (2) original master/mentor presentation scene with a local video embedded in a designed screen, (3) simple operator control in a separate window, with scene transitions synchronized locally. Good empty-media states and responsive design are required. Do not start the full game engine, player import, account systems, database, online multiplayer, or deployment in M1.

## Working procedure
1. Inspect the repo, summarize current state, and define a short plan before edits.
2. Work one milestone at a time; require authorization for destructive operations, secrets, remote writes, commits, pushes, or deployments. The owner's 2026-11-14 CTA/seal request explicitly authorizes commits and pushes to feat/upgrade-prologue-art in rsdelapaz/ninjago-game, without merging main or publishing private media. Normal file edits within the authorized milestone are allowed.
3. Create/modify the minimum files needed. Never add speculative infrastructure or many subagents just to simulate a team.
4. Before reporting success, run applicable tests, TypeScript checks, lint and production build; record exact commands and outcomes. If a command cannot run, say so.
5. Explain changed files, how to run locally, how to test two windows, any missing media assets, and known limitations.
6. Keep `docs/PROJECT.md` updated when decisions materially change; do not replace stated requirements silently.

## Specialist disciplines, on demand
Game/narrative designer; child-activity facilitator; frontend/UI/UX; audiovisual/illustration; QA/accessibility; music (Suno); voice/audio (ElevenLabs). Activate only when work needs their expertise. For external tool research, use official vendor documentation first, then dated practical guides/YouTube and labeled community reports/Reddit. Distinguish verified specifications from anecdotal claims, and check licenses and costs before proposing integrations.
