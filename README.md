# El secreto del maestro Wu

> **Guía vigente: Hito 06 — El despertar de los clanes (15/11/2026).** Consulta el apartado final y «Partida completa de demostración» para el arranque con npm recuperado. Las secciones previas son históricas. El director autoriza en este hito commit y push de fuente auditada exclusivamente a `feat/upgrade-prologue-art`, sin publicar medios ni capturas privadas.

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

## Centro de mando ninja: sesiones y equipos

En `/?screen=admin` encontrarás la selección de sesiones, participantes, equipos, nombres propuestos e importación/exportación. La portada y el vídeo conservan su diseño.

1. Pulsa **Nueva sesión**, edita nombre y fecha y añade participantes. Edad y género son opcionales. Guarda la configuración para conservar el borrador.
2. Edita los nombres y colores de los dos equipos. Asigna cada ninja con su selector; puede quedar sin asignar. Para repartir aleatoriamente, elige **Automático** y pulsa **Sortear y guardar reparto equilibrado**. Confirma el nuevo reparto. Cambiar de modo no sortea. El resultado queda guardado y no se repite al recargar.
3. Pulsa **Usar en la presentación** después de guardar. La escena de cada sesión se conserva independientemente. El panel indica si el borrador corresponde a la sesión activa.
4. **Exportar configuración JSON** descarga la configuración del borrador, sin progreso. **Seleccionar JSON local** valida y muestra una previsualización, incluidos todos los campos en un desplegable. **Confirmar: crear sesión nueva** regenera IDs y conserva asignaciones y referencias, sin sobrescribir la original. Las versiones desconocidas o archivos con progreso se rechazan.
5. **Duplicar borrador sin progreso** crea y guarda una copia independiente de la configuración actual, sin activar ni modificar la sesión original. No se copian escenas ni progreso.

El guardado es explícito; se confirma antes de reemplazar una configuración existente. Si otra ventana ya la cambió, el guardado se rechaza; cambia de sesión y vuelve a seleccionarla para releerla. No existe borrado de sesiones. Si falla localStorage, se muestra un aviso; conserva el borrador y expórtalo antes de cerrar. La misma aplicación sirve en HTTP local o alojamiento web, sin depender de internet. No sincroniza servidores ni orígenes: usa JSON para trasladar configuraciones. No hay backend, contraseña ni copia de seguridad completa; `FullBackup` solo define el contrato futuro independiente.

Modelos y almacenamiento: `src/session.ts` y `src/sessionStorage.ts`. Configuración en `ninja-config-v1:<id>`, progreso en `ninja-progress-v1:<id>` y selección de presentación en `ninja-presentation-v2`. El estado histórico `ninja-presentation-v1` no se borra. Los nombres solo se usan en el panel, no se transmiten por BroadcastChannel.

### Pruebas reproducibles de esta iteración

- `npm test`: pruebas de Node sin dependencias nuevas; ida y vuelta JSON, reparto equilibrado y conservado, IDs y referencias en copias, asignación exclusiva y rechazo de datos inválidos. El aislamiento de procesos se desactiva porque el entorno de ejecución restringe spawn. Se requiere un Node con soporte de eliminación de tipos de TypeScript (Node 22.12+ o 24 LTS).
- `npm run typecheck`, `npm run build`, `git diff --check`.
- `npm run preview` y `npm run test:smoke`: requiere Edge/Chromium iniciado con DevTools en el puerto 9223. Usa un contexto aislado y participantes sintéticos; no borra el almacenamiento real. Verifica reparto guardado y recarga, importación desde archivo con previsualización y conservación de miembros, duplicación sin progreso, sincronización entre ventanas y respaldo sin BroadcastChannel, y panel a 1920×1080, 1366×768 y 390×844. Bloquea peticiones HTTP ajenas al servidor local; no se detectan peticiones externas ni excepciones JavaScript. El archivo sintético temporal queda en `.preview.local/`, ignorado por Git.
- No hay script de lint. Los smoke históricos de `.preview.local/` son privados y pueden asumir ausencia de vídeo o el antiguo estado global; el nuevo smoke versionado es el vigente para el centro de mando.

Para el ensayo físico obligatorio: instala dependencias antes, inicia el servidor local, desconecta Wi-Fi/Ethernet manteniendo activo el servidor y prueba panel/pública, guardar, sortear, recargar, exportar e importar. La prueba automatizada bloquea internet en el navegador, pero **no sustituye la desconexión física del ordenador**. El organizador ha confirmado «Funciona» al ensayo solicitado con Wi-Fi/Ethernet desconectados y servidor local activo: guardar, recargar y cambiar de escena en la ventana pública. Comprobación manual confirmada por el usuario, independiente del smoke automatizado.

Resultados de esta ejecución: **5 pruebas unitarias correctas**, typecheck correcto, build correcto y smoke del centro de mando correcto. El smoke incluye exportación del JSON generado por la interfaz, importación del mismo archivo y rechazo de guardado desde un editor desactualizado. Se comprueba también generación de IDs sin `crypto.randomUUID` para servidores HTTP no seguros, usando `crypto.getRandomValues`. Referencia: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues . El ensayo físico solicitado con adaptadores de red desconectados está confirmado por el organizador («Funciona»).

## Guía actual: perfiles — 15/11/2026

El Centro de Mando utiliza **Colegio** y **Urbanización**. Al entrar por primera vez se solicita un perfil; la elección queda guardada. No se inventan participantes ni nombres definitivos: cada perfil nace con dos equipos vacíos, sin nombre ni color. El ID de cada equipo sí existe desde su creación.

### Abrir y preparar

```powershell
npm ci
npm run dev
```

Abre `http://127.0.0.1:5173/?screen=admin`. Para probar producción, ejecuta `npm run build`, después `npm run preview` y abre `http://127.0.0.1:4173/?screen=admin`. No uses `file://`. Si el puerto está ocupado, usa el que indique Vite. La variante local y la alojada usan exactamente el mismo código, sin modos online/offline, backend ni servicios obligatorios. Las ventanas sincronizadas deben usar el mismo origen, perfil de navegador y puerto.

- **Cabecera:** perfil activo siempre visible, selector, estado de guardado y apertura de la pantalla pública. Cambiar de perfil pide confirmación y vuelve la pantalla pública al inicio. La configuración del otro perfil no cambia. Los borradores se conservan por perfil mientras el panel esté abierto; vuelve a cada uno y guarda antes de cerrar. El navegador advierte al recargar/cerrar con borradores pendientes. No es autoguardado: los cambios persisten solo con **Guardar cambios** o el sorteo explícito. Los avisos nativos de cierre dependen de las restricciones del navegador.
- **Resumen:** participantes reales, dos equipos, no asignados y tres comprobaciones de configuración. «0/3» no significa que haya un error; muestra un perfil aún sin preparar. La disponibilidad de medios se comprueba en su módulo, sin simular un estado listo.
- **Participantes:** añade, modifica o quita ninjas (con confirmación). Los IDs son estables; edad y género son opcionales. No hay importación CSV ni funciones de puntuación/desafíos.
- **Equipos:** cada uno tiene títulos sugeridos propios, nombre definitivo libre o seleccionado con autocompletado, color y miembros. Los nombres y colores sin definir son válidos. La asignación individual retira al participante de su equipo anterior y permite dejarlo sin asignar. El sorteo por número de integrantes solo se ejecuta al elegir «Automático» y pulsar **Sortear y guardar reparto**, con confirmación. Cargar, importar y cambiar de perfil no repiten el sorteo.
- **Recursos multimedia:** edita nombres de archivo y comprueba la imagen/vídeo locales. Los archivos deben copiarse a la carpeta del perfil por separado; escribir un nombre no sube ni copia un archivo. Se admiten nombres locales PNG/JPG/WebP y MP4/WebM, sin rutas externas, `../`, datos embebidos ni binarios en JSON.
- **Presentación:** anterior, siguiente, número y vista previa. La selección de una miniatura solo cambia la vista previa; **Mostrar esta escena** envía el cambio al público. Los extremos de la secuencia deshabilitan anterior/siguiente. Los números se derivan del orden del catálogo, nunca se guardan como IDs. El vídeo conserva sus controles nativos, reproducción manual y marco aprobado; no se sincroniza su tiempo de reproducción.
- **Configuración y JSON:** exporta el borrador validado, sin progreso ni binarios. Selecciona un JSON de esquema 2, revisa los datos y confirma el reemplazo del perfil activo. Se puede importar deliberadamente Colegio dentro de Urbanización: cambia el ID del perfil destino y conserva las referencias internas y el reparto; los medios se buscan en la carpeta del destino. Se guarda una copia local de la configuración persistida anterior antes del reemplazo. Si hay borrador sin guardar, la confirmación avisa de que se descartará. No se ofrece copia de seguridad completa.

### Migración sin pérdida de datos

No se adivina qué grupo antiguo corresponde a cada perfil. Las claves anteriores `ninja-config-v1:*`, `ninja-progress-v1:*`, `ninja-presentation-v1` y `ninja-presentation-v2` permanecen intactas. En **Configuración y JSON → Recuperación de datos anteriores**, elige una configuración, pulsa **Previsualizar conversión**, revisa y confirma reemplazo del perfil activo. Los participantes, asignaciones, nombres, colores y sugerencias se convierten; los títulos sugeridos compartidos antiguos se copian a las sugerencias de ambos equipos. La fecha y el nombre de la antigua configuración permanecen en el original descargable. El progreso anterior no se mezcla con el perfil nuevo. Un registro inválido tampoco se borra: se permite descargar su original para recuperarlo.

`src/session.ts` conserva el parser `LegacySessionConfig` para esa conversión y sus pruebas. Los componentes antiguos `SessionManager.vue` y `TeamEditor.vue` se conservan como código local previo, pero no están montados ni incluidos en la interfaz activa. El modelo operativo es `ProfileConfig` en `src/profile.ts`.

### Recursos privados por perfil

```text
public/private-media/
  colegio/
    ninjago-key-art.png
    master-wu.mp4
  urbanizacion/
    ninjago-key-art.png
    master-wu.mp4
```

En este equipo se han **copiado** los dos originales compartidos a ambas carpetas únicamente cuando el destino no existía. No se han movido, borrado ni reemplazado archivos existentes. Los vídeos copiados tienen el mismo SHA-256 que el original. A partir de ahora puedes sustituir cada copia de forma independiente. La aplicación no recurre a la carpeta de otro perfil ni al archivo compartido cuando falte un recurso: muestra el monasterio vectorial o el aviso de vídeo ausente.

Para el equipo del evento, copia privadamente **las dos carpetas completas**, añade los recursos autorizados de cada perfil y compila después. Los JSON no trasladan medios. Vite incluye los recursos privados en `dist/`: no publiques esos builds. `.gitignore` deja visibles solo los marcadores `.gitkeep` y excluye los medios reales. Las capturas y archivos sintéticos de prueba quedan en `.preview.local/`, ignorado. No se han publicado nombres de menores, configuraciones ni backups.

### Arquitectura y archivos

- `profile.ts`: esquema 2, validación, equipos, reparto, URL local de recursos y conversión de esquema anterior.
- `profileStorage.ts`: dos configuraciones independientes, historial local y protección ante escrituras desactualizadas.
- `scenes.ts`: catálogo de escenas con ID estable, orden, tipo y título. `usePresentation.ts`: selección de perfil, progreso independiente de la configuración, BroadcastChannel y respaldo mediante storage.
- `useProfileDraft.ts`: borradores por perfil, guardado explícito, validación y protección de cierre.
- `OrganizerPanel.vue`, `command-center.css`: dashboard responsive por módulos. `ProfileChooser.vue`, `ProfileTeams.vue`, `ProfileResources.vue`, `ProfileTransfer.vue`, `SceneController.vue` y `ParticipantEditor.vue`: módulos y controles.
- `App.vue` y `WuMessage.vue`: únicamente conexión al perfil, referencias de medios, reinicio de componentes y etiqueta discreta del perfil; se conserva su diseño aprobado.

Claves nuevas: `ninja-profile-v2:colegio`, `ninja-profile-v2:urbanizacion`, `ninja-control-v3` y `ninja-profile-history:<perfil>:<marca>`. No se eliminan automáticamente registros previos ni historial. Si otra ventana modifica el perfil mientras editas, el guardado se rechaza: exporta tu borrador y usa **Descartar borrador** para releer el guardado. Las copias de historial son locales, no una copia de seguridad completa ni un servicio en nube. El almacenamiento del navegador puede agotarse o borrarse; exporta las configuraciones antes del evento. El panel no incorpora autenticación.

### Verificación de esta iteración

- `npm test`: regresión del esquema anterior y modelos nuevos, incluidos perfiles iniciales vacíos, aislamiento, ida/vuelta JSON, referencias y validación, sorteo, migración sin borrado, historial/guardado desactualizado y catálogo de escenas.
- `npm run typecheck` y `npm run build` (con el ajuste local de npm/NODE_OPTIONS documentado más arriba).
- `npm run test:smoke`: servidor preview activo en 4173 y Edge/Chromium con DevTools en 9223. Usa un contexto de navegador aislado y datos explícitamente sintéticos. Comprueba primer uso con teclado, selección persistida, equipos vacíos, aislamiento de borradores/configuración/medios, sorteo persistido, exportación e importación confirmada, migración sin pérdida, navegación anterior/siguiente/número/preview, pantalla pública, recursos ausentes y sincronización sin BroadcastChannel. Recorre todos los módulos a 1920×1080, 1366×768, 768×1024 y 390×844; bloquea HTTP ajeno al servidor local y comprueba que no se intenten peticiones externas ni se lancen excepciones JavaScript.
- `git diff --check`. No hay script de lint ni auditoría automática de lector de pantalla. No se ha realizado despliegue web ni un nuevo ensayo físico de desconexión en esta iteración; el ensayo físico confirmado por el organizador corresponde a la versión anterior. La prueba actual bloquea internet en el navegador manteniendo accesible el servidor local.
- Capturas locales: `.preview.local/profiles-overview-1920.png`, `profiles-overview-1366.png`, `profiles-overview-768.png`, `profiles-overview-390.png`, `profiles-teams-1920.png`, `profiles-teams-390.png`, `profiles-presentation-1920.png` y `profiles-presentation-390.png`. Los resúmenes muestran los perfiles vacíos reales de primer uso, sin nombres ficticios presentados como participantes reales.

La orden del director del 15/11/2026 autoriza cerrar el commit base local. No autoriza push, merge, reset, clean ni despliegue. Los cambios previos sin commit se han conservado y adaptado a los nuevos requisitos.

Cierre del commit base (15/11/2026): typecheck y build repetidos con código 0; 10/10 pruebas unitarias superadas. npm recuperado mediante Node con --preserve-symlinks y --preserve-symlinks-main y NODE_OPTIONS equivalente. Smoke: PENDIENTE POR ENTORNO; el intento anterior terminó con ECONNREFUSED en 127.0.0.1:9223 porque Edge/Mojo no pudo arrancar por Access is denied (0x5). No se considera superado ni se reintenta como condición del commit, por orden expresa del director. No hay script de lint. Pendientes el smoke en una terminal normal, la auditoría con lector de pantalla y el ensayo físico sin red de esta versión. No se implementan funcionalidades nuevas en este cierre.

## Partida completa de demostración — guía vigente, 15/11/2026

Recorrido: **START GAME → dos equipos y sus capitanes → color 1 → nombre 1 → color 2 → nombre 2 → equipos definitivos → vídeo del maestro Wu**. El público no ve controles de ceremonia. La portada, su CTA y el reproductor existentes conservan su diseño. No hay fases de desafíos, puntos o pistas en este MVP.

### Arranque local con el npm recuperado

Desde la raíz, con las dependencias ya instaladas, ejecuta en PowerShell:

```powershell
$npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source -Parent) 'node_modules\npm\bin\npm-cli.js'
if (!(Test-Path -LiteralPath $npmCli)) { throw 'No se encuentra npm-cli.js en la instalación detectada.' }
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = '--preserve-symlinks --preserve-symlinks-main'
    node --preserve-symlinks --preserve-symlinks-main $npmCli run build
    if ($LASTEXITCODE -ne 0) { throw 'Build fallido: no iniciar la partida.' }
    node --preserve-symlinks --preserve-symlinks-main $npmCli run preview -- --port 4173 --strictPort
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
}
```

Mantén esta terminal y el servidor abiertos durante la partida. Abre `http://127.0.0.1:4173/?screen=admin` en Edge, Chrome o Firefox actual. Se necesitan Web Locks para coordinar las escrituras; HTTP en 127.0.0.1 funciona como contexto seguro. Usa el mismo navegador, perfil y origen para las dos ventanas. No uses `file://`, no se necesita internet durante el juego.

### Preparación y recorrido, sin intervención técnica durante el juego

1. Elige **Colegio** o **Urbanización**. En **Participantes**, introduce los nombres reales localmente. No se crean participantes de ejemplo. Guarda los cambios.
2. En **Equipos**, asigna integrantes manualmente o elige **Automático → Sortear y guardar reparto**. Después del reparto, elige **Capitán del equipo** en cada uno. Debe ser uno de sus integrantes. Si lo mueves o eliminas, la designación se invalida; un nuevo sorteo conserva únicamente capitanes que sigan en su equipo. Se permiten borradores incompletos, pero la ceremonia queda bloqueada hasta guardar dos equipos con integrantes y capitán.
3. Escribe **Títulos sugeridos** propios para cada equipo, uno por línea. Para probar SÍ/NO, prepara dos o tres por equipo. Puedes dejar los nombres definitivos y colores sin definir: se elegirán en público. Guarda. Exporta una copia JSON privada antes del evento.
4. Pulsa **Abrir pantalla pública**, muévela al monitor extendido y maximízala. En el panel, abre **Presentación**. Desde la portada pública pulsa **START GAME**, o selecciona la ceremonia en el catálogo y **Mostrar esta escena**. Aparecen dos estandartes neutrales con todos los integrantes y el capitán primero, con insignia especial. Los nombres/colores definitivos permanecen ocultos en esta fase, aunque estuvieran guardados de una partida anterior.
5. En el panel pulsa **Avanzar fase**. Wu ofrece exactamente dos colores al equipo 1. Confirma el elegido y avanza. Los colores se definen en `src/ceremony.ts`; el segundo equipo recibe dos opciones que excluyen el color ya confirmado para el primero.
6. En la fase de nombre, el público ve una propuesta cada vez. **SÍ · Aceptar nombre** la guarda; **NO · Siguiente propuesta** pasa a la siguiente. Cuando se agotan, introduce y confirma el nombre elegido en el formulario del panel. El nombre no puede coincidir con el del otro equipo, ignorando mayúsculas y espacios. Avanza después de confirmar.
7. Repite color/nombre con el equipo 2. Al avanzar aparecen los dos equipos definitivos, sus colores, nombres, capitanes y miembros. **Continuar al mensaje de Wu** abre el vídeo existente. Inicia la reproducción con sus controles nativos: no hay autoplay sonoro ni fullscreen automático.

### Recuperación y consistencia

- **Fase anterior** conserva las decisiones. Una propuesta aceptada no se pierde al volver. Para cambiarla, rechaza la propuesta actual y revisa las siguientes o llega al nombre manual. Los botones solo se habilitan cuando la fase lo permite.
- Recargar panel o pública recupera el perfil, escena y fase guardados. Cambiar de perfil vuelve a su portada, preservando su progreso independiente. Seleccionar **El despertar de los equipos** en el catálogo retoma la fase de ese perfil. **Volver a la portada** no borra decisiones. **Repetir ceremonia** requiere confirmación y vuelve al inicio: conserva los nombres/colores almacenados, pero hay que confirmarlos otra vez.
- Cambiar y guardar la preparación o importar una configuración modificada reinicia las confirmaciones de la ceremonia. Los nombres/colores que figuren en el JSON se conservan; primero se presentan los equipos neutrales. Si una configuración editada invalida el vídeo o la ceremonia, la vista vuelve a portada con aviso. Guarda la preparación antes de comenzar y utiliza los controles de ceremonia para las elecciones durante la partida.
- Un segundo panel no puede sobrescribir silenciosamente configuración o progreso más recientes. Si otro panel ha cambiado algo, se rechaza la operación. Conserva/exporta el borrador, revisa el estado y descártalo para releer la configuración. Los campos se bloquean durante una escritura; no son un autosave.
- `ProfileConfig` sigue en esquema 2 con `captainId: string | null` por equipo. Los JSON v2 anteriores sin ese campo se normalizan sin reescribir el original; la conversión legacy deja los capitanes sin designar. JSON exporta configuración y capitanes, nunca fase ni confirmaciones. No se eliminan datos legacy.
- El progreso de ceremonia está en `ninja-ceremony-v1:<perfil>`; la escena activa sigue en `ninja-control-v3`. Los nombres/colores finales están solo en configuración. Un registro temporal `ninja-ceremony-pending:<perfil>` permite terminar una elección interrumpida al recargar, sin sobrescribir cambios posteriores. Este registro es local y puede contener datos privados, igual que el historial del navegador; no se exporta ni versiona.
- Los medios por perfil siguen en `public/private-media/<perfil>/`. Ambos perfiles tienen sus copias locales existentes; no se han modificado ni descargado recursos. Si faltan, el monasterio vectorial y el aviso de vídeo siguen disponibles. Vite los copia a `dist`: el build es privado.

### Verificaciones reales y pendientes

Se ha ejecutado el npm detectado en `C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js` mediante Node con las dos opciones de preservación de enlaces y `NODE_OPTIONS` equivalente:

- `run typecheck`: código 0.
- `run build`: código 0.
- `test`: **21/21 pruebas correctas**, incluidas capitanes, compatibilidad JSON, transiciones, opciones de color, nombres repetidos y agotados, vuelta atrás, persistencia, recuperación de escritura interrumpida, aislamiento y controlador real con navegador simulado. La prueba de dos controladores simula Web Locks/almacenamiento; no es una prueba de procesos reales de navegador.
- `git diff --check`: correcto. No hay script de lint. No se han añadido dependencias.
- Revisión estática de recursos: sin peticiones remotas ejecutables, fuentes externas, fetch/XHR/WebSocket, APIs o medios descargados en el código de aplicación. Las URL de documentación en comentarios y los identificadores SVG no generan tráfico. La verificación dinámica de red queda pendiente con el smoke.
- **Smoke visual y capturas: PENDIENTES POR ENTORNO.** No hay DevTools disponible en 9223; el bloqueo Edge/Mojo de la operación anterior no se ha reintentado. No se han generado ni revisado nuevas capturas de este hito. Las capturas antiguas de perfiles no acreditan la ceremonia nueva.

El smoke versionado `tests/command-center.smoke.mjs` está adaptado al recorrido nuevo. En un navegador disponible crea un contexto aislado y solo participantes sintéticos, comprueba las elecciones, la recarga y el fallback sin BroadcastChannel, detecta/bloquea peticiones externas y guarda 16 capturas en `.preview.local/ceremony-{arrival,color,name,final}-{1920,1366,768,390}.png`. El script está comprobado sintácticamente, pendiente de ejecución real.

Para ejecutarlo fuera del entorno restringido: mantén preview en 4173, abre Edge desde una terminal normal con un perfil de pruebas separado y DevTools, después ejecuta el script:

```powershell
Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -WindowStyle Hidden -ArgumentList '--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9223',('--user-data-dir="' + (Join-Path $PWD '.preview.local\ceremony-edge') + '"'),'--no-first-run','about:blank'
$npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source -Parent) 'node_modules\npm\bin\npm-cli.js'
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = '--preserve-symlinks --preserve-symlinks-main'
    node --preserve-symlinks --preserve-symlinks-main $npmCli run test:smoke
    Write-Output "SMOKE_EXIT=$LASTEXITCODE"
} finally { $env:NODE_OPTIONS = $previousNodeOptions }
```

Ensayo manual breve en el navegador normal, antes de usarlo con niños:

1. Completa el recorrido anterior con ambos monitores: nombres largos legibles, capitán primero, elección inicial neutral, dos opciones de color, SÍ/NO y nombre manual. Revisa 1920×1080, 1366×768, tablet y móvil; con grupos grandes se permite desplazamiento, sin ocultar integrantes ni reducirlos a texto diminuto.
2. Recarga en mitad de una elección, retrocede y cambia de perfil; comprueba que se recupera cada ceremonia sin mezclar nombres ni decisiones. Abre otro panel, deja un borrador y confirma una elección desde el primero; verifica el rechazo del guardado desactualizado.
3. Prueba teclado y movimiento reducido; reproduce el vídeo dentro de su marco. Comprueba los fallbacks quitando temporalmente la disponibilidad del recurso desde DevTools, sin borrar los medios.
4. En **Network**, filtra HTTP y comprueba que todas las peticiones pertenecen a `127.0.0.1:4173`. Después desconecta Wi-Fi/Ethernet con el servidor activo y repite la secuencia. Este nuevo ensayo físico, el lector de pantalla y la revisión visual quedan pendientes.

Implementación: `profile.ts`, `ProfileTeams.vue`, `ParticipantEditor.vue` (capitanes); `ceremony.ts` y `ceremonyStorage.ts` (reglas y recuperación); `usePresentation.ts`, `profileStorage.ts`, `useProfileDraft.ts` (sincronización y escrituras); `CeremonyStage.vue`/`ceremony.css` (pantalla pública) y `CeremonyControls.vue` dentro de `SceneController.vue` (operador). Referencias: https://vuejs.org/guide/essentials/forms.html , https://vuejs.org/guide/built-ins/transition.html y https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API . Los cambios de este hito siguen sin commit ni push.

## Estabilización y ensayo completo — 15/11/2026

Base de esta operación: `116decb4b7ee2239578be4ea4a10e60b3a4dc403`, rama `feat/upgrade-prologue-art`. No se hace commit ni push. No se cambian la portada aprobada, el vídeo, los medios privados, las dependencias ni los datos de participantes guardados.

**Corrección estructural:** `parseCeremony` construye un objeto y tres tuplas nuevas de escalares validados. Se eliminó `structuredClone`, que lanzaba `DataCloneError` al recibir proxies de Vue. La regresión se reprodujo antes de corregirla y se prueba ahora con `reactive()` y `computed()` reales. `ceremonyNextProblem` devuelve los bloqueos esperados sin capturar errores genéricos. La clonación de perfiles sigue pasando por validación y JSON de datos planos; los mensajes de sincronización contienen solo control, nunca proxies o participantes.

**Equipos:** dentro de cada equipo, **Añadir ninjas** abre una lista con selección múltiple. Confirma para asignarlos al borrador. Los del otro equipo aparecen identificados y requieren confirmar el traslado; un capitán trasladado deja de serlo en su equipo anterior. En la lista de integrantes, **Hacer capitán** designa uno y **Quitar** lo deja sin equipo. La asignación individual se mantiene como alternativa. Sugerencias, selector de capitán y opciones de identidad están en un desplegable para evitar un formulario largo. Guarda después de preparar los equipos; las elecciones de ceremonia se guardan automáticamente al confirmarlas.

**Pantalla pública automática:** Mostrar esta escena, Siguiente/Anterior del catálogo y las acciones de ceremonia pasan por el handshake de `publicScreen.ts`. En la interacción original se obtiene/abre la ventana `ninja-public`, sin recargarla si ya vive allí la aplicación. Después se exige una respuesta al identificador nuevo de esa solicitud; la pública responde solo tras montar Vue e inicializar su estado. Una referencia de ventana no acredita disponibilidad. Si no contesta en cinco segundos, no se ejecuta la acción y aparece un aviso con enlace manual. **Preparar pantalla pública** reintenta; tras recuperarla, repite la acción. El estado de disponibilidad se comprueba periódicamente y caduca si deja de responder; también se detecta el cierre de una ventana con referencia conocida. Si cambian el perfil o la presentación durante la espera, se cancela la acción en lugar de dirigirla al perfil nuevo. Una ventana pública abierta de forma independiente puede requerir recuperar la ventana con nombre del panel; no hay sincronización entre orígenes o perfiles de navegador.

El protocolo `ninja-public-v1` transporta únicamente solicitudes y confirmaciones efímeras. Usa BroadcastChannel y storage como respaldo, incluidos casos mixtos donde solo una ventana tiene canal. No contiene configuración ni nombres. La selección de una miniatura sigue siendo vista previa: no abre ventanas ni cambia la escena. Durante la ceremonia, el catálogo de escenas queda plegado; **Fase anterior**/**Avanzar fase** dirigen la máquina de estados, mientras el catálogo cambia de escena.

**Guía del organizador:** el panel muestra disponibilidad de la pública, cambios sin guardar, recorrido general y paso actual. En cada fase hay tres instrucciones: **Los niños**, **Tú, organizador**, **Para continuar**. Los requisitos de preparación son participantes, dos equipos con integrantes y un capitán válido por equipo. Los nombres y colores NO son requisitos previos. El indicador distingue borrador y preparación guardada.

**Wu y presentación:** se conserva la máquina de estados y cada lista de sugerencias independiente. Wu reacciona al índice de propuesta, al rechazo, al agotamiento y a la aceptación. Cualquier propuesta puede aceptarse; no se insertan nombres ni participantes automáticamente. Para un ensayo divertido puedes escribir sugerencias como «Los Pepinillos del Trueno» y «Los Churros Voladores» en tu perfil local. El retrato de Wu reutiliza mediante CSS la ilustración aprobada del perfil; si falta, se ve una silueta SVG original. Nuevos emblemas, trazos de energía y una celebración breve acompañan los nombres, sin ocultar los participantes. `prefers-reduced-motion` desactiva las nuevas animaciones y transiciones.

### Ensayo completo reproducible

1. Inicia build/preview con el procedimiento Node/npm de «Partida completa de demostración». Abre `http://127.0.0.1:4173/?screen=admin` en un navegador actual y selecciona un perfil.
2. Añade participantes reales localmente. En Equipos, usa **Añadir ninjas** con varios seleccionados, confirma y designa capitanes desde sus listas. Traslada a uno al otro equipo y comprueba que no se duplica; si era capitán, vuelve a designar otro. Rellena sugerencias por equipo en el desplegable. Deja nombres/colores definitivos sin definir y guarda: debe quedar preparado sin exigirlos.
3. Cierra la pública, abre Presentación y pulsa **Siguiente**. Debe abrirse automáticamente y, tras confirmar disponibilidad, presentar los equipos. Seleccionar solo una miniatura no debe cambiar nada en la pública. Si bloqueas ventanas emergentes, comprueba el aviso y recupera con el botón o enlace antes de repetir la acción.
4. En la ceremonia, sigue la guía: color del equipo 1, nombre con SÍ/NO, color del equipo 2, nombre. Prueba aceptar la primera propuesta; en otro ensayo, rechaza todas y confirma un nombre manual. Los colores y nombres finales no pueden repetirse. Revisa la reacción de Wu y la celebración al aceptar.
5. Retrocede y recarga a mitad de la ceremonia: las decisiones permanecen. Cierra/reabre la pública desde otra acción y comprueba su recuperación; no debe avanzar hasta responder. Cambia de perfil y retoma su ceremonia sin mezclar grupos. Continúa hasta equipos definitivos y vídeo; inicia su reproducción con los controles nativos.
6. Revisa **1920×1080, 1366×768 y 390×844**, teclado, nombres largos y movimiento reducido. En Network, todas las peticiones de recursos deben pertenecer al servidor local. Repite con Wi-Fi/Ethernet desconectados y el servidor abierto antes del evento.

### Evidencia y límites de esta ejecución

- Prueba inicial de proxies: falló con `DataCloneError` en el código base. Tras corregirlo, la regresión pasa.
- Suite final: **30/30 pruebas superadas**, incluyendo proxies, desbloqueo tras color, nombres, asignación múltiple y capitán, bloqueo de escenas, handshake síncrono, ventana bloqueada/cerrada, respuesta antigua y respaldo storage. Los tests de disponibilidad utilizan puertos/ventanas simulados: no acreditan el comportamiento de un navegador real.
- Comandos finales: `node --preserve-symlinks --preserve-symlinks-main $npmCli run typecheck`, `run build` y `test`, con `NODE_OPTIONS` equivalente y la ruta detectada de npm. Typecheck, build y test terminaron con código 0. `node --check tests/command-center.smoke.mjs` y `git diff --check` terminaron con código 0. No hay script de lint.
- Sin nuevas dependencias ni recursos externos. Revisión estática de src sin fetch/XHR/WebSocket ni fuentes/medios remotos ejecutables; las referencias documentales y SVG no son peticiones externas.
- **Capturas y smoke visual: PENDIENTES POR ENTORNO.** No había endpoint de navegador en 9223 y no se repitió el arranque bloqueado de Edge. No se presentan imágenes antiguas como evidencia nueva. El smoke actualizado incorpora selección múltiple y captura `arrival`, `color`, `name`, `accepted`, `final` a cuatro resoluciones, en `.preview.local/ceremony-<estado>-<ancho>.png` (20 capturas privadas cuando se ejecute). Falta verificar dinámicamente layout, popup/handshake, teclado y red en navegador normal.

Referencias oficiales consultadas: Vue reactive https://vuejs.org/api/reactivity-core.html#reactive y apertura ligada al gesto del usuario https://developer.mozilla.org/en-US/docs/Web/API/Window/open . Toda la comunicación añadida usa mecanismos locales del navegador; no hay servicios externos.

## Usabilidad y restablecimiento de perfiles — 15/11/2026

Los cambios previos de ceremonia se conservan sin commit. Esta ampliación no cambia la portada ni añade fases del juego.

**Orden de participantes.** Todos los listados y selectores de participantes usan `sortParticipants`, con `Intl.Collator('es', { sensitivity: 'base', numeric: true })`. Se ordena una copia, manteniendo referencias de objetos e IDs; ni abrir una vista ni ordenar cambia los arrays guardados, el reparto o el JSON exportado. En público, el capitán va primero y los demás por nombre. En «Añadir ninjas» se muestran dos grupos, cada uno alfabético: **Participantes sin equipo** y **Integrantes del equipo contrario**. Los del destino quedan excluidos. Puedes seleccionar varios de ambos grupos y confirmar; trasladar integrantes exige confirmación y retira cualquier capitanía que deje de ser válida. La vista de JSON completo conserva el orden del documento original.

**Sugerencias iniciales.** Solo al crear un perfil nuevo se incluyen estas propuestas, sin nombre definitivo ni color:

| Equipo 1 | Equipo 2 |
| --- | --- |
| Los Pepinillos del Trueno | Las Croquetas Supersónicas |
| Los Churros Voladores | Los Flanes Furiosos |
| Los Calcetines Ninja | Los Pijamas del Dragón |

En Equipos → «Sugerencias, capitán y opciones de identidad», edita el textarea: una propuesta por línea, en el orden de aparición. Puedes cambiarlas, reordenarlas, añadir o quitar líneas y vaciar la lista. Se guardan por equipo y perfil. **Las configuraciones existentes y las listas vaciadas intencionadamente no se rellenan**, ni al recargar, importar o convertir datos heredados. Con una lista vacía, Wu pasa al nombre manual. Restablecer expresamente el perfil sí recupera las tres propuestas de cada equipo.

**Restablecer perfil a su estado inicial.** En Configuración y JSON:

1. Pulsa **Restablecer perfil a su estado inicial** y revisa el nombre del perfil activo.
2. Puedes **Exportar configuración guardada antes de restablecer**. Si tienes un borrador que quieras conservar, usa además **Exportar perfil JSON**. Los archivos contienen datos privados y no deben añadirse al repositorio.
3. Lee las pérdidas y marca la casilla explícita. Solo entonces se habilita **Sí, restablecer Colegio/Urbanización**. Cancelar no escribe nada.

La operación elimina del perfil activo participantes, miembros y capitanes; deja nombres definitivos y colores en null; restaura las tres sugerencias, el modo manual y las referencias `ninjago-key-art.png` / `master-wu.mp4` de su propia carpeta. Conserva los IDs de sus dos equipos. El borrador de ese perfil se sustituye por la configuración inicial. La ceremonia vuelve a `arrival`, con índices cero y confirmaciones falsas; la navegación persistida vuelve a `intro`, con nueva revisión. Una pública abierta recibe el cambio por los mecanismos locales; si está cerrada, se recupera la portada al abrirla. El restablecimiento no depende de abrir otra ventana ni del handshake para poder limpiar una preparación.

**Diferencias:** «Repetir ceremonia» conserva participantes, equipos y sus nombres/colores guardados, pero reinicia fases/confirmaciones. «Descartar borrador» conserva la configuración y el progreso guardados y solo descarta cambios de edición. «Restablecer perfil» borra esa preparación y vuelve a los valores iniciales.

**Protección de datos.** Se usa el mismo Web Lock, `saveProfile` y registro `ninja-ceremony-pending:<perfil>` que para las elecciones. La confirmación conserva las versiones revisadas al abrir el panel: cambios posteriores en configuración, ceremonia o navegación invalidan el restablecimiento, aunque el dashboard ya haya recibido el estado nuevo. En ese caso revisa/descarta el borrador si corresponde y abre de nuevo la confirmación. La configuración previa se archiva en el historial local. No se limpia localStorage, no se eliminan historiales ni claves legacy, no se toca el otro perfil ni sus borradores. El registro de recuperación incluye la vuelta a portada para completar un restablecimiento interrumpido solo si no hubo escrituras posteriores. Si detecta otra navegación, se detiene para conservarla.

**Atención:** esto no borra físicamente medios, exportaciones ni los nombres que permanezcan en el historial del navegador. Exporta antes si necesitas una copia independiente: el historial local no protege frente a borrar datos del navegador. Una cuota de almacenamiento agotada puede impedir la operación; el aviso no se considera éxito y el registro pendiente se conserva para recuperación.

**Validación de esta ampliación:** 40 pruebas automatizadas, con casos de orden español (tildes, ñ y números), capitán primero, grupos, asignaciones/traslados, sugerencias editables y vacías, restablecimiento, aislamiento, historial/legacy, rechazo de confirmaciones antiguas, recarga y recuperación tras fallo. El controlador público recibe el retorno a portada en la prueba de comunicación simulada. Un test del harness tuvo que usar un renderer Vue montado para ejercitar watchers; SSR no los mantiene activos. No se han instalado dependencias.

Comandos de cierre mediante el npm recuperado: `run typecheck`, `run build`, `test`, todos con Node `--preserve-symlinks --preserve-symlinks-main` y `NODE_OPTIONS` equivalente; además `node --check tests/command-center.smoke.mjs` y `git diff --check`. El smoke se amplió con sugerencias iniciales, exportación previa, casilla de confirmación, restablecimiento, conservación del otro perfil y recarga. Su ejecución en navegador sigue pendiente por el entorno; no se reintenta Edge como condición de entrega. No hay script de lint.

Ensayo manual: prepara un perfil con nombres acentuados y numerados; revisa el orden en Participantes, integrantes, selector de capitán y ambos grupos de «Añadir ninjas». Muestra su ceremonia y comprueba capitán primero. En Configuración/JSON exporta, cancela una vez y después confirma el restablecimiento: la pública debe volver a portada, los equipos quedar vacíos con tres sugerencias y el otro perfil intacto. Recarga ambas ventanas. Prueba también una confirmación abierta mientras otro panel cambia la ceremonia: debe rechazarse sin borrar datos nuevos. Conserva los archivos exportados privadamente. El arranque de preview y la URL local siguen en «Partida completa de demostración».

Archivos principales: `profile.ts` (orden y valores iniciales), componentes de participantes/equipos, `ProfileTransfer.vue` (confirmación/exportación), `useProfileDraft.ts` (borradores), `usePresentation.ts` y `ceremonyStorage.ts` (operación coordinada y recuperación). Referencias: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator y https://vuejs.org/api/custom-renderer.html . Sin commit ni push.

Cierre real de usabilidad/restablecimiento: **40/40 pruebas superadas**. `run typecheck`, `run build`, `test`, comprobación de sintaxis del smoke y `git diff --check`: **código 0**. La rama sigue en `feat/upgrade-prologue-art`, HEAD `116decb4b7ee2239578be4ea4a10e60b3a4dc403`; no se prepararon archivos ni se ejecutaron commit/push. Los cambios previos continúan locales. La comprobación del navegador sigue pendiente, distinta de los tests automatizados.

## Hito 06 — El despertar de los clanes, 15/11/2026

Cada integrante tiene una placa ninja original, con nombre completo y sello propio. El capitán conserva el primer lugar y una insignia especial; su placa usa el mismo tamaño y jerarquía de nombre que las demás. Los integrantes restantes van alfabéticamente. Tras revelar los sellos, sus conexiones activan el emblema del clan y el vínculo entre ambos equipos: **cada ninja cuenta y la unión les da su poder**. No se inventan habilidades, poderes individuales, fotos ni roles nuevos.

La presentación sustituye los listados anteriores por una composición de selección de clanes. El monasterio y Wu reutilizan la ilustración local aprobada; la ausencia de medios conserva escenario vectorial y retrato SVG original. Antes de las elecciones se ocultan nombres/colores definitivos; al final se aplican al emblema, las placas y la celebración común. La portada START GAME y el reproductor de vídeo conservan su diseño.

### Revelación, grupos y recuperación

La secuencia breve presenta emblemas, capitán e integrantes (en cascada), conexiones y unión central. Termina en unos 2,2 segundos por grupo; después queda quieta para leer. No bloquea «Avanzar fase».

- En Presentación aparecen **Omitir animación** y **Repetir revelación**. Solo modifican el estado visual, no participantes, reparto, nombres/colores ni decisiones de ceremonia.
- Para evitar encoger o truncar nombres se muestran hasta cuatro placas por clan y grupo. Si hay un nombre de participante de más de 32 caracteres o un título de clan de más de 40, ese clan usa placas amplias de una persona por grupo. Los límites de cada grupo son idénticos en operador y pública, independientemente de su tamaño de ventana. Los equipos desiguales no pierden miembros; cuando un clan ya terminó sus grupos conserva el emblema y un mensaje de unión.
- Con varios grupos, avanzan automáticamente cada diez segundos y se detienen en el último. Puedes pausar, continuar o pasar al grupo anterior/siguiente desde el panel. Para leer con calma, pausa. Si vuelves de una ventana minimizada o recargada, el reloj recupera el grupo actual; repite la revelación para verla desde el principio. Nadie se elimina ni se descarta del recorrido.
- La hora de inicio, grupo y opciones visuales viajan como campo opcional `reveal` en `ninja-control-v3`. El catálogo, ProfileConfig y CeremonyProgress no cambian de esquema. Se aceptan estados antiguos sin ese campo. La sincronización usa el mismo bloqueo, revisión, canal y respaldo storage. Un control visual de una ventana desactualizada se rechaza.
- El diseño de escritorio utiliza el alto de la ventana, con dos clanes lado a lado y nombres completos. En móvil los clanes se apilan y se permite desplazamiento para conservar legibilidad. La ausencia real de scroll/cortes a 1920×1080 y 1366×768 queda pendiente del ensayo visual, no se da por validada solo por el CSS.
- Movimiento reducido elimina las animaciones y transiciones. Los cambios de grupo siguen siendo discretos; el organizador puede pausarlos. No hay parpadeos ni animaciones continuas de partículas.

### Pergaminos y humor

Wu propone nombres dentro de un pergamino del monasterio, con la propuesta como elemento central. Los rechazos cambian el diálogo: sorpresa inicial, dudas crecientes y una última propuesta desesperada. La progresión utiliza posición y longitud real de la lista, no tres pasos fijos. Con cero propuestas se entra directamente en un pergamino vacío; al agotar una lista Wu reconoce que los niños tienen mejores ideas y les invita a crear. El panel conserva SÍ/NO, formulario manual, preguntas/instrucciones y confirmación. Al aceptar se revela el título definitivo con un pulso y rayos breves.

Se pueden aceptar todas las propuestas, salvo un nombre ya confirmado por el otro equipo en esta ceremonia. Nombres históricos del otro equipo aún sin confirmar no obligan a rechazar propuestas; al terminar, ambos nombres definitivos deben ser distintos. Se conservan las tres sugerencias iniciales de perfiles nuevos, todas las listas editadas (incluidas vacías), importación/exportación, restablecimiento y recuperación tras recarga.

### Fundamentos de diseño

- **Material Choreography:** foco compartido y aparición escalonada. Aplicación: los emblemas anclan la composición y los sellos se conectan después de revelarse. https://m1.material.io/motion/choreography.html
- **NN/g, Animation for Attention and Comprehension (21/09/2014):** el movimiento debe explicar una relación o cambio. Aplicación: energía solo en aparición/aceptación, después reposo para leer. https://www.nngroup.com/articles/animation-usability/
- **Nintendo, Jamboree:** tono de fiesta y participación colectiva de su presentación oficial. Aplicación propia: todos tienen placa, la celebración pertenece a ambos clanes. No se han copiado recursos, personajes ni composición. https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch/Super-Mario-Party-Jamboree-2591147.html
- El enlace de Overwatch facilitado devolvió **403**; no se considera una referencia inspeccionada ni se intenta eludirlo. No se descargan recursos externos. Las referencias solo se consultaron durante desarrollo.

### Verificación y ensayo

Suite actual: **46 pruebas**, incluyendo conservación de todos los integrantes, orden/capitán, grupos desiguales y nombres largos, reloj/repetición/omisión sin tocar decisiones, recarga y aislamiento, listas de nombres de 0/1/2/3/7/20/100 propuestas, aceptación de cualquiera, rechazo sucesivo, agotamiento/manual y duplicados. Se mantienen pruebas anteriores de perfiles, reset, ventanas y continuación al vídeo. El test del controlador comprueba sincronización simulada; no equivale a un navegador real.

Se ejecutan con `C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js` mediante Node, ambas opciones `--preserve-symlinks`/`--preserve-symlinks-main` y NODE_OPTIONS equivalente: typecheck, build, test. Además se comprueban sintaxis del smoke y diff. No hay lint configurado ni dependencias nuevas.

**Capturas y smoke visual: PENDIENTES POR ENTORNO.** No hay endpoint disponible en 9223; no se repite el arranque bloqueado de Edge. No hay capturas nuevas de este hito y no se presentan las antiguas como evidencia. El smoke actualizado prepara en `.preview.local/` capturas de `arrival`, `color`, `name`, `exhausted`, `accepted`, `final` en cuatro tamaños (24 imágenes privadas cuando se ejecute). Incluye comprobaciones de scroll vertical en escritorio, límites de los nombres y peticiones externas. La imposibilidad de este smoke no bloquea por sí sola el commit de desarrollo autorizado por el director, pero la validación visual permanece pendiente.

Ensayo en navegador normal:

1. Arranca con el procedimiento npm recuperado y abre el panel en `http://127.0.0.1:4173/?screen=admin`. Prepara dos equipos, capitanes y listas de sugerencias; usa nombres largos y números para comprobar distribución y orden.
2. Muestra la ceremonia desde Presentación: la pública debe abrirse y confirmar su disponibilidad. Observa la cascada capitán/integrantes, las conexiones y el vínculo central. Prueba omitir/repetir y pausar/pasar grupos; comprueba que todos los nombres aparecen y que las decisiones no cambian.
3. Recorre colores y nombres. Acepta una primera propuesta en un ensayo; en otro, rechaza una lista completa y escribe un nombre manual. Comprueba el pergamino vacío, el humor creciente, la celebración y el bloqueo de nombres/colores repetidos.
4. Recarga ambas ventanas, cambia de perfil y retoma; vuelve desde el vídeo a la ceremonia y continúa otra vez. Los datos deben seguir separados y las decisiones confirmadas deben permanecer.
5. Revisa 1920×1080, 1366×768, 390×844 y movimiento reducido; comprueba contraste, nombres completos y ausencia de scroll vertical/cortes en escritorio. Pausa grupos si hace falta tiempo de lectura. En Network comprueba solo recursos del servidor local y ensaya sin Wi-Fi/Ethernet, manteniendo el servidor abierto.

Fuente añadida: `ClanReveal.vue`, `reveal.ts`, `useRevealClock.ts`, `tests/reveal.test.mjs`. Se adaptan CeremonyStage/Controls, CSS, control de presentación y el paso de eventos por App/Organizer/SceneController. La publicación autorizada incluye también los cambios locales anteriores auditados; excluye medios privados, JSON personales, capturas, dist, node_modules y credenciales. Se publica solo a origin/feat/upgrade-prologue-art; main no se modifica.

Cierre de código Hito 06: **46/46 pruebas superadas**, `run typecheck`, `run build`, `test`, sintaxis del smoke y `git diff --check` con **código 0** mediante el npm detectado y las opciones de preservación de enlaces. Smoke/capturas de navegador y comprobación real de scroll, nombres largos y red: pendientes por entorno, no superadas. No hay lint configurado. Se audita y prepara únicamente fuente/pruebas/documentación acumuladas; medios privados, capturas, JSON personales y build siguen excluidos.
