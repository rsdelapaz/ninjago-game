# El secreto del maestro Wu

Introducción local para una aventura personal de cumpleaños ambientada en NINJAGO. Vue 3 + TypeScript + Vite; ilustración generada para este proyecto, sin imágenes, fuentes ni servicios remotos en ejecución.

## Visualizar en local

Requiere Node.js 22.12+ o Node.js 24 LTS y npm. Desde la raíz:

```powershell
npm ci
npm run dev
```

Abre http://127.0.0.1:5173 en el navegador. Para la pantalla del evento, mueve esa ventana al monitor extendido y maximízala; la composición principal está pensada para 1920 × 1080. No hay activación automática de pantalla completa ni reproducción automática del vídeo.

Para utilizar la compilación de producción:

```powershell
npm run build
npm run preview
```

Abre http://127.0.0.1:4173. No abras `dist/index.html` con `file://`. Después de instalar dependencias, la aplicación se sirve y funciona sin internet.

## Qué incluye

- `src/App.vue`: composición por capas con Wu y Kai, sello propio LET’S GO, título con volumen, CTA de inicio y transición. El foco se mueve al título al cambiar de escena.
- `src/WuMessage.vue`: reproductor local dentro de un marco de misión dorado; aviso si el vídeo falta o no es compatible.
- `src/MonasteryBackdrop.vue`: fondo vectorial de respaldo, conservado para cuando falte la ilustración.
- `src/style.css`: portada de videojuego, marco de dojo, energía elemental, partículas, estados del botón, diseño adaptable y movimiento reducido.
- `public/private-media/ninjago-key-art.png`: ilustración privada generada con la herramienta integrada de imágenes, 1672 × 941, aproximadamente 2,5 MB; no se versiona. El prompt final está en `docs/PROJECT.md`.
- Configuración mínima de Vite/TypeScript y dependencias bloqueadas en `package-lock.json`.
- `docs/PROJECT.md`: corrección creativa del propietario y alcance actual documentados.

No se han cambiado reglas, equipos o pistas. El control del operador y la sincronización entre ventanas siguen pendientes: abrir dos ventanas permite revisar la escena en ambas, pero cada una conserva su propio estado. Esto todavía no completa M1.

## Medios privados

No hay vídeo ni música aportados. Para reproducir el mensaje, guarda tu MP4 en `public/private-media/master-wu.mp4` y vuelve a entrar en la segunda escena. Se muestra en 16:9 con controles nativos, sin autoplay y sin solicitar pantalla completa. Si falta o falla, aparece un aviso. La reproducción de un vídeo real queda pendiente de que el organizador lo aporte; conviene usar MP4 H.264/AAC compatible con el navegador y preparar sus subtítulos.

La ilustración de Wu y Kai es una generación nueva, no una descarga de arte oficial. `public/private-media/` queda excluido de Git salvo su marcador vacío. Conserva una copia local de la ilustración: un clon del repositorio no la incluirá y mostrará el fondo vectorial de respaldo. Vite copia los medios privados al compilar; mantén esos builds privados. Solo se publica el código fuente en la rama autorizada; estos medios y los builds locales siguen siendo privados.

## Verificación

Realizada el 14 de noviembre de 2026, Node 24.19.0:

- `npm run build`: correcto; ejecuta `vue-tsc --noEmit` y `vite build` (Vite 8.3.8).
- `git diff --check`: correcto.
- `npm run dev`: servidor iniciado; peticiones HTTP a `/` y `/src/App.vue` responden 200.
- `node .preview.local/smoke.mjs`: correcto, prueba temporal mediante el protocolo DevTools de Edge sin instalar herramientas. Comprueba carga del arte, inicio con Tab/Enter, foco en el título, aviso de vídeo ausente, retorno, cinco anchos sin desbordamiento horizontal, movimiento reducido, ausencia de excepciones JS y de peticiones externas.
- Capturas revisadas: `.preview.local/intro-1920.png`, `video-1920.png`, `intro-320.png` y `video-320.png`. El directorio de verificación se conserva localmente y no se versiona.
- No hay scripts de lint ni suite de pruebas permanente; no se han ejecutado esos comandos inexistentes.
- Pendiente ensayo en monitor externo y reproducción con el vídeo real del organizador. No se ha implementado sincronización entre ventanas.

Prueba manual: pulsa Tab hasta COMENZAR AVENTURA, activa con Enter o Espacio, comprueba el aviso de Wu y vuelve al inicio. Activa la preferencia del sistema de movimiento reducido: la niebla y la entrada deben quedar estáticas. Desconecta internet después de arrancar el servidor y repite.

En el entorno de ejecución de Codex, el enlace de instalación de npm dio `EPERM` al resolver un directorio AppData. Se verificó el build con el mismo script mediante:

```powershell
$env:NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main'
node --preserve-symlinks --preserve-symlinks-main C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js run build
```

Este ajuste solo afecta a esa terminal; no es necesario en una instalación habitual de npm.

Referencias oficiales: [Vue y TypeScript en script setup](https://vuejs.org/api/sfc-script-setup.html), [actualización del DOM con nextTick](https://vuejs.org/api/general.html#nexttick), [recursos locales de Vite](https://vite.dev/guide/assets.html#the-public-directory).

## Entrega CTA y sello — 14 de noviembre de 2026

Se conserva la composición local aprobada. El CTA dorado incorpora biseles, profundidad, icono vectorial propio, halo, hover y foco de teclado, presión y salida cinematográfica de 360 ms con bloqueo de activaciones repetidas. Movimiento reducido elimina animaciones y la espera de salida. La cabecera deja visible al ninja verde. `src/assets/lets-go.svg` es un sello cuadrado rojo original con letras dibujadas como trazados, sin fuentes externas; ocupa una zona oscura inferior izquierda y pasa al flujo normal en móvil.

Archivos de esta entrega (incluidos los cambios locales anteriores): `src/App.vue`, `src/style.css`, `src/WuMessage.vue`, `src/assets/lets-go.svg`, `AGENTS.md`, `.gitignore`, `docs/PROJECT.md` y este README. No se añaden dependencias.

### Traslado al equipo del evento

1. Clona o actualiza `feat/upgrade-prologue-art` y ejecuta `npm ci`.
2. Copia por separado y de forma privada `public/private-media/ninjago-key-art.png` desde este equipo al mismo directorio del equipo del evento. Añade el MP4 autorizado como `public/private-media/master-wu.mp4` si está disponible. No los subas a GitHub.
3. Ejecuta `npm run build` después de copiar los medios y `npm run preview`. Abre http://127.0.0.1:4173. El build contiene los medios privados: no lo publiques.
4. Sin ilustración aparece el monasterio vectorial; sin vídeo aparece el mensaje legible. No hace falta internet durante el evento.
5. Comprueba inicio con ratón, Enter y Espacio; retorno al inicio; preferencia de movimiento reducido y monitor extendido. Usa el panel del organizador descrito abajo para sincronizar las ventanas.

### Validación de esta entrega

- `npm run typecheck` y `npm run build`: correctos mediante el ajuste `NODE_OPTIONS` y la ruta explícita de npm documentados arriba. Los comandos directos de npm fallaron por `EPERM` al resolver AppData; el código compila con el mismo npm y sus scripts.
- `node .preview.local/smoke.mjs`: correcto en Edge headless, sobre servidor de desarrollo local.
- `node .preview.local/cta-smoke.mjs`: correcto sobre el build de producción en 4173; ambas escenas a 1920 × 1080, 1366 × 768 y 390 × 844, Enter, Espacio, ratón, bloqueo de doble activación, foco del título, reducción de movimiento, vídeo ausente, ilustración bloqueada y fondo vectorial visible. Sin excepciones JavaScript ni peticiones HTTP externas. Los 404 de medios ausentes son esperados.
- Capturas locales `final-intro-*`, `final-video-*`, `final-hover.png` y `final-no-art.png` en `.preview.local/`, excluidas de Git.
- Sin scripts de lint ni suite permanente. Pendiente reproducción con vídeo real, lector de pantalla y ensayo físico con monitor externo. Los scripts smoke locales requieren Edge con DevTools en 9223 y no se distribuyen.
- `git diff --check`: correcto.

## Iteración START GAME y organizador

CTA aprobado para esta iteración: **START GAME**, rojo con silueta de emblema ninja, puntas metálicas doradas, núcleo legible y shuriken integrado. Conserva teclado, presión, transición y movimiento reducido. No se modifica el reproductor de vídeo.

Para probar:
1. `npm run build` y `npm run preview`; abre http://127.0.0.1:4173 para el botón público.
2. Abre http://127.0.0.1:4173/?screen=admin y pulsa «Abrir ventana pública». Si el navegador bloquea la ventana, usa el enlace alternativo.
3. Mueve la ventana pública al monitor externo. Prueba inicio, vídeo y reinicio desde el panel; recarga la ventana pública: recupera la última escena.
4. Usa el mismo navegador, perfil, host y puerto. BroadcastChannel sincroniza las escenas; el evento storage es el respaldo. La reproducción y el tiempo del vídeo no se sincronizan y no hay autoplay.

El panel es una vista local separada y sin enlace público, **sin autenticación**. No incluye datos personales. El estado `ninja-presentation-v1` contiene solo escena y revisión. Si el almacenamiento está bloqueado, el panel avisa y la persistencia no está disponible. No se implementan participantes, equipos ni nuevas fases.

Los apartados de verificación anteriores son registros históricos. En esta iteración: typecheck y build correctos con la ruta de npm y NODE_OPTIONS documentados; el smoke antiguo falla porque espera vídeo ausente y ahora existe un MP4 válido. La prueba adaptada bloquea ese recurso para ensayar el fallback. No hay script de lint ni suite permanente. Los medios de `public/private-media/`, los builds y las capturas siguen excluidos de Git.

Validación actual: `node .preview.local/admin-smoke.mjs` correcto: comunicación bidireccional entre dos ventanas, recuperación tras recarga, reinicio, fallback sin BroadcastChannel y apertura de ventana pública. `node .preview.local/new-cta-smoke.mjs` verifica el CTA en producción, las tres resoluciones objetivo, teclado/ratón, protección de doble activación, movimiento reducido y recursos bloqueados. Capturas revisadas localmente. `git diff --check` correcto. Los scripts de verificación y sus capturas permanecen locales; no se publican con los medios.
