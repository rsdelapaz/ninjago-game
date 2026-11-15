# Ninja Adventure — Project brief and phased execution

Current status (2026-11-15): profile-based command center in local implementation; two initial profiles, modular dashboard and generic scene navigation. See the current architecture section at the end and README for validation. Historical decisions below are retained as history; the latest profile requirements supersede session-based administration and earlier Git publication authorizations. Product owner directs work from ChatGPT, develops/reviews in VS Code, and is new to Codex.

## Creative correction approved by the owner — 2026-11-14
The explicit owner instruction supersedes the earlier generic-ninja direction in this brief and AGENTS.md: this is a personal, private, non-commercial LEGO NINJAGO birthday adventure, with master Wu as narrative protagonist. It must not be rewritten as a generic fantasy adventure. Earlier original-character requirements below are historical and superseded by this correction.

The opening is «EL SECRETO DEL MAESTRO WU», with the subtitle «Una antigua misión. Dos equipos de ninjas. Un secreto que solo podrán descubrir juntos» and action «COMENZAR AVENTURA». Art direction: Monastery of Spinjitzu inspiration, original layered vector scenery, dark mountains, gold details, lantern light and drifting mist. Primary composition: 1920 × 1080, responsive to smaller windows. No external visual references or media were supplied; this artwork is a provisional original interpretation, not official franchise art.

Only original visuals and organizer-supplied local media may be used. Do not automatically download third-party protected assets. Keep organizer media in ignored `public/private-media/`; Vite copies that folder into local builds, so those builds must also remain private. The owner explicitly authorized source commits and pushes on 2026-11-14 to rsdelapaz/ninjago-game, branch feat/upgrade-prologue-art. This supersedes the earlier no-push instruction. No merge to main or media publication is authorized.

Current authorized slice: visual upgrade of the opening and second scene. The opening uses a private, newly generated NINJAGO fan illustration featuring Wu, Kai and supporting ninjas around an epic monastery. The interface must never contain the word LEGO. An original red square SVG seal says LET'S GO without copying an official logo; its letterforms use paths without fonts. Red, blue, green, white and gold energy, dimensional title lettering and a prominent game-start CTA replace the earlier subdued direction.

The second scene now embeds `public/private-media/master-wu.mp4` with native controls, no autoplay and inline playback, inside a layered gold dojo frame. Missing or unsupported video shows a readable fallback. No actual video has been supplied, so playback with the organizer's media remains to be rehearsed. Operator synchronization is now implemented; game rules, teams and clues are unchanged.

Artwork: `public/private-media/ninjago-key-art.png`, generated with the built-in image generation tool, inspected and copied into the workspace. This directory is deliberately ignored by Git. The original vector monastery remains the fallback if the illustration is unavailable. Browser smoke verification and screenshots are recorded in README.md. The previous visual pass was local only; the current request authorizes source commit and push.

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

## Final artwork generation prompt — visual upgrade, 2026-11-14
Built-in image generation, no downloaded reference images. Final prompt:

> Use case: stylized-concept. Asset type: local background artwork for a private children's NINJAGO adventure game, widescreen 16:9. Create an exceptionally polished vibrant 3D animated adventure game key art, cinematic toy-like NINJAGO characters. Master Wu prominently on the RIGHT third: kind elderly yellow face, long white beard, wide straw conical hat, white and gold robes, holding wooden staff, wise inviting expression. Kai prominently on LEFT third in dynamic heroic pose, red ninja suit and red mask with yellow eyes area, wielding a glowing flame sword, sculpted toy-like proportions. Smaller green ninja high left and blue ninja high right optional in background. Majestic multi-tier Spinjitzu monastery behind center with gold roof trim, monumental stone stairs, hovering mountain islands, beautiful turquoise twilight sky and clouds, luminous green energy spiral behind Wu, orange fire arc beside Kai and blue lightning behind. Strong depth, spectacular rim lighting, premium children's videogame splash illustration, rich saturated crimson, cobalt, emerald, white, gold. CRITICAL COMPOSITION: characters positioned to far left and right, lower and middle CENTRAL 45 percent contains only atmospheric dark teal stairs and haze, relatively uncluttered and dark so HTML game title and button will be overlaid and readable. Wide shot, full characters, not cropped heads. Warm heroic and adventurous, not scary. NO TEXT, NO LETTERS, NO LOGOS, no watermark. Newly generated fan illustration, do not copy an existing poster or website.

## Approved CTA and public-source release — 2026-11-14
Preserve the approved local composition and private illustration. The CTA now uses a gold bevel, original energy icon, matching hover/keyboard focus, pressure/flash and a guarded 360 ms exit into the existing scene reveal. Reduced motion disables animation and skips the exit delay. The header brand is removed to reveal the green ninja. A small original red square seal sits on the dark lower-left rock area; mobile places it in document flow to avoid overlaps. No new game phases or operator features are included.

Public commits include source, original SVG and documentation only. Keep private-media and dist ignored. Copy authorized private media separately to the event computer before building; the vector monastery and readable video placeholder remain usable without it. The private fan illustration is not evidence of a franchise license.

## Current slice: START GAME and local organizer
The owner authorizes commit and push on feat/upgrade-prologue-art. START GAME replaces the historical CTA text. A red/gold ninja-emblem silhouette replaces the rectangular button without changing approved scenery or the video component. Organizer view: /?screen=admin, opening a named public window. Scene selection and restart synchronize via BroadcastChannel with storage-event fallback; validated localStorage state recovers the current scene on reload. Same browser profile and origin are required. This is a local operator view without authentication, not a secure account system. Video playback remains manual and is not synchronized. No later gameplay phases are included.
References: https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API and https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event .
The organizer's MP4 is now available locally and loads successfully; previous missing-video notes describe earlier iterations. It remains ignored and is not part of the public source release.

## Centro de mando: decisiones definitivas

Este apartado sustituye el alcance anterior del panel. La misma aplicación estática funciona desde HTTP local sin internet o desde un servidor web: no hay modos online/offline, indicadores que cambien reglas, servicios de nube obligatorios ni sincronización entre orígenes. Las ventanas deben compartir origen (protocolo, host y puerto), perfil y navegador. El almacenamiento pertenece a ese origen; mover la configuración entre servidores se hace mediante JSON local.

- `SessionConfig` en `src/session.ts`: `schemaVersion: 1`, identificador, nombre y fecha civil ISO; participantes con IDs estables, nombre y edad/género opcionales; nombres propuestos; modo manual/automatic; tupla de exactamente dos equipos con ID, nombre, color hexadecimal y referencias a miembros exclusivos. Los IDs permanecen estables al editar/guardar; importación y copia regeneran sesión, participantes y equipos, remapeando las referencias.
- `GameProgress` contiene únicamente sesión, escena y revisión en esta fase. Se guarda por sesión en claves separadas, nunca en JSON de configuración. Cambiar de sesión recupera su escena; una copia o importación comienza sin progreso. El estado anterior de presentación se conserva y se recupera como sesión sin configurar si aún no existe estado nuevo.
- El reparto Fisher–Yates equilibra el número de miembros (diferencia máxima uno), sin ponderar edad/género. Solo se ejecuta a petición explícita; cambiar de modo, recargar o importar no sortea. Cambiar manualmente un miembro lo retira de su equipo anterior. Se muestran los no asignados.
- Importación JSON local de hasta 1 MB, validación estricta de tipos, versión, fechas, listas, IDs, pertenencia exclusiva y referencias. Campos desconocidos y documentos con progreso se rechazan. Se muestra una previsualización completa y se requiere confirmar la creación como nueva sesión. No hay importación sobre una sesión existente ni eliminación de sesiones.
- La edición usa borradores; guardar sobre una sesión existente, descartar cambios, quitar participantes, repetir reparto y reiniciar presentación requieren confirmación. Se detectan escrituras sobre configuraciones cambiadas en otra ventana sin sobrescribirlas. El almacenamiento local no es un sistema de colaboración concurrente.
- `FullBackup` reserva un contrato distinto para una futura copia de seguridad completa. No hay botón, importador ni exportador de backups todavía; el exportador actual solo admite configuración.
- No se implementan CSV, puntuaciones, desafíos ni fases posteriores. La portada y el reproductor aprobados no se rediseñan.

La aplicación sigue siendo local al navegador, sin autenticación. Los JSON pueden contener nombres de menores: consérvalos de forma privada; no se añaden al repositorio. Borrar datos del navegador elimina los datos guardados de ese origen. Los recursos privados siguen excluidos de Git y cualquier build que los contenga debe permanecer privado.

Validation closure: the organizer confirmed “Funciona” for the requested physical offline rehearsal with the local server running: save, reload and public-window scene changes. This is user-confirmed manual evidence, distinct from automated external-request blocking. Five unit tests, typecheck, production build, command-center browser smoke and git diff --check passed in the implementation run.

## Current architecture — profiles, 2026-11-15

This section supersedes session administration and earlier release permissions. The director authorized the local base commit on 2026-11-15. Push, merge, reset, clean and deployment remain unauthorized. The approved public artwork, CTA and inline video composition remain unchanged; only profile media inputs and a discreet active-profile label are added.

- ProfileConfig schemaVersion 2 replaces active SessionConfig. IDs are colegio and urbanizacion. Both start with zero participants and exactly two teams whose memberIds and suggestedNames are empty, and name/color are null. Each team has its own suggestions, final name, color and exclusive membership. The random draw remains balanced by count and explicit only. Unnamed/uncolored teams are valid drafts, not fictional prepared teams.
- GameProgress is separate: active profile ID, stable scene ID, monotonic revision and tie-break token. First use requires a profile choice; subsequent loads recover the selection. Switching profile or replacing its configuration resets the public screen to the first scene. No gameplay progress is included in JSON. Old progress keys remain untouched.
- scenes.ts defines stable IDs, order and type. Presentation numbers derive from sorted order; previous/next/number selection and preview never use numbers as IDs. A preview is clearly separate from the live public state.
- Profile data is saved independently at ninja-profile-v2:<id>; presentation at ninja-control-v3. BroadcastChannel and storage fallback synchronize same-origin windows. Config changes refresh public media without transmitting participant names over the channel. No internet-dependent rules or required services exist.
- Legacy SessionConfig source is named LegacySessionConfig and retained only for explicit recovery/regression. SessionManager.vue and TeamEditor.vue are retained local source from the previous iteration and are not mounted or bundled in the active dashboard. Previous ninja-config-v1, ninja-progress-v1 and ninja-presentation-v1/v2 keys are never deleted. In Configuration and JSON, an organizer selects a legacy record, previews conversion and confirms the target profile replacement. No automatic guess maps old groups to profiles. Original raw records, including unconvertible records, remain downloadable.
- Saved-profile replacements keep a local history copy before writing, and stale editors cannot overwrite newer storage. Drafts remain separate per profile in the open dashboard; switching modules or profiles preserves them. Closing/reloading with pending drafts triggers the native warning; drafts are not an autosave or durable backup. Invalid drafts show a validation message and cannot be saved.
- Media filenames are local basenames only: public/private-media/<profile>/<filename>. No paths, URLs, data URLs or binaries are accepted in configuration JSON. Both profiles initially refer to ninjago-key-art.png and master-wu.mp4. Existing shared originals were COPIED to each folder only if the target did not already exist; originals were not moved or deleted. These are independent copies, not a fallback to the other profile. Missing resources retain vector scenery/readable video fallback.
- Profile import is strict version-2 JSON with preview and explicit replacement confirmation. A source profile can be deliberately imported into the active target; only its profile ID is rebound, references and saved assignments remain intact. Existing saved configuration is archived locally, and dirty drafts require explicit discard confirmation as part of replacement. No media is included.
- UX: persistent header/profile selector/save status, sidebar modules on desktop, compact module navigation on mobile; summary, participants, teams, media, presentation, configuration/JSON. Dashboard styles are isolated under .command-center. References: Vue form bindings https://vuejs.org/guide/essentials/forms.html; lifecycle cleanup https://vuejs.org/api/composition-api-lifecycle.html#onunmounted; reload/close warning https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event .

Base commit validation (2026-11-15): typecheck and production build repeated with exit 0; 10/10 unit tests passed using npm-cli.js via Node with both preserve-symlinks flags and matching NODE_OPTIONS. Browser smoke is PENDING DUE TO ENVIRONMENT, not passed: Edge/Mojo failed with Access is denied (0x5), leaving port 9223 unavailable. The director explicitly accepted this environmental limitation for the local commit and instructed no further headless launch attempt. No lint script exists. Browser smoke outside the restricted environment, screen-reader audit and a new physical network-disconnection rehearsal remain pending. No new application functionality is added during consolidation; no push is authorized.
