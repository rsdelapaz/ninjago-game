# Archivo documental: README.md

> Instantanea conservada el 17/11/2026 antes de la revision Prueba 02. No es una guia vigente. Las autorizaciones Git, comandos de hitos, esquemas y resultados que siguen son registros historicos; no se aplican automaticamente al estado actual. Consulta [README vigente](../../README.md), [arquitectura vigente](../PROJECT.md) y [mapa historico](INDEX.md).

---

# El secreto del maestro Wu

> **Guía vigente: Hito 09B — Fondo 3D aprobado integrado, pendiente de revisión visual del propietario. Sin commit ni push en esta iteración.** Consulta el apartado final y «Partida completa de demostración» para el arranque con npm recuperado. Las secciones previas son históricas. El Hito 09B debe permanecer local: no hacer commit ni push hasta la revisión visual del propietario. Los medios y capturas siguen privados.

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

## Hito 07 — Formación ninja compacta

Las placas ahora son filas compactas de igual tamaño: sello discreto, nombre completo y, solo para el capitán, estrella dorada con texto CAPITÁN. Capitán primero y resto en orden español. Desaparecen los conectores individuales; permanece únicamente el vínculo entre los dos clanes. Portada, elecciones de nombre/color, vídeo, perfiles, almacenamiento y sincronización no cambian.

La causa de la paginación anterior era un límite de cuatro integrantes y un límite de uno si el nombre de un integrante o del equipo era largo. Ahora los nombres se ajustan por líneas y no intervienen en los grupos: dos columnas hasta ocho integrantes, tres hasta doce (cuatro filas); a partir de trece, grupos de hasta doce con indicador y controles existentes. El último grupo contiene solo sus miembros, sin casillas ficticias. Un equipo que ya terminó muestra un aviso compacto. Los límites son idénticos en ambas ventanas. En móvil los equipos se apilan, con dos columnas y desplazamiento vertical normal; contenido excepcionalmente largo conserva acceso mediante scroll en escritorio, sin elipsis ni recortes de nombres.

Revelación: emblemas, aparición rápida de miembros, destello breve de estrella y activación colectiva. Una sola página nunca alterna automáticamente. Se conservan omitir/repetir y movimiento reducido.

Ensayo visual pendiente por entorno, sin capturas nuevas ni afirmación de aprobación visual:

1. Arrancar con el procedimiento PowerShell de «Partida completa de demostración», abrir dashboard y pública en el mismo origen.
2. En un perfil de prueba, preparar dos equipos de siete participantes ficticios, con capitanes. Mostrar llegada a 1920×1080 y 1366×768: comprobar catorce nombres simultáneos, dos columnas por clan, ninguna barra de scroll para nombres normales y placas iguales. Esperar más de diez segundos: no cambia de grupo.
3. Completar nombres/colores y revisar la misma formación final. Repetir con nombres largos, equipo 1/14 y equipo 13/25; comprobar tres columnas, grupos, último grupo compacto, omitir/repetir y ausencia de pérdidas. Verificar que las decisiones se conservan al recargar ambas ventanas.
4. Revisar 390×844, desplazamiento vertical, nombres completos, teclado del operador y movimiento reducido. Guardar e inspeccionar capturas locales de llegada con 14 integrantes y final; no versionar capturas con datos reales.

No hay navegador conectado en 9223; no se repite Edge headless bloqueado. La inspección real a esas tres resoluciones, las dos capturas solicitadas y el ensayo en monitor externo quedan pendientes. Las pruebas automatizadas comprueban grupos y control; no sustituyen la medición visual de legibilidad y encaje. No hay lint configurado. Se publica exclusivamente fuente auditada a feat/upgrade-prologue-art, conservando medios locales privados.

Cierre técnico Hito 07: 48/48 pruebas superadas; typecheck, build, sintaxis del smoke y git diff --check con código 0. npm utilizado: C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js, invocado mediante Node con --preserve-symlinks --preserve-symlinks-main y NODE_OPTIONS restaurado al terminar. La ejecución del smoke de navegador y las capturas siguen pendientes por entorno.

## Hito 08 — Pruebas configurables y administración

«Pruebas» prepara el contenido; «Presentación» controla lo que ve el público y adjudica resultados. La cabecera indica perfil activo y cambios sin guardar. En escritorio hay lista ordenada y editor; en móvil se abre una edición dedicada con «Volver a la lista». Nueva prueba, duplicar, subir/bajar, ocultar/mostrar y eliminar no requieren código. Usa «Guardar cambios» para publicar la preparación en este navegador. Editar solo pruebas no reinicia la ceremonia; modificar equipos/participantes/recursos conserva el comportamiento de invalidación anterior.

Cada prueba tiene título (160 caracteres), descripción (4000), imagen opcional local y visibilidad. Nombres de archivo PNG/JPG/WebP, sin rutas/URL, de hasta 120 caracteres. Guarda los archivos físicamente en public/private-media/colegio/ o urbanizacion/. Se reutiliza la misma plantilla en la vista previa y en la pública. Una imagen ausente muestra aviso solo al organizador y un emblema ninja al público. No se cargan ni exportan binarios. Por seguridad se validan como máximo 500 definiciones y 1 MiB de JSON exportado completo, con presupuesto adicional de 750 000 caracteres para pruebas; no existe un límite de diez.

### Datos y recuperación

ProfileConfig v3 añade challenges en orden de presentación, con id estable, title, description, imageFilename y visible. No se usa el número visual como identidad. Importar v2 añade una lista vacía en memoria; el registro anterior no se reescribe hasta guardar explícitamente. La conversión v1 sigue conservando el original, participantes, equipos, propuestas y medios. Las claves ninja-profile-v2 se conservan deliberadamente para no crear copias activas divergentes; su contenido nuevo se exporta como v3. El JSON avanzado incluye las definiciones, sin resultados ni imágenes. Clonar un borrador no cambia identidades; duplicar una prueba crea un ID nuevo y no copia el resultado. Restablecer perfil retira sus pruebas y resultados, sin tocar el otro perfil, archivos físicos, historiales o datos heredados.

Los resultados están en ninja-challenge-results-v1 por perfil, asociados al ID de prueba y al ID del equipo, o null/ausencia para pendiente. En Presentación se muestra el nombre definitivo si existe. Elegir otro ganador o volver a pendiente tras un ganador exige confirmación contextual. Guardar no cambia la escena ni anuncia automáticamente. «Anunciar ganador al público» publica una instantánea explícita del ganador; «Mostrar de nuevo la prueba» vuelve al contenido. Si corriges un resultado ya anunciado, el anuncio anterior sigue hasta que elijas presentar o anunciar otra vez; guardar no sustituye silenciosamente lo anunciado. No se suman puntos ni se generan pistas.

El catálogo se calcula desde el perfil guardado: Portada → Ceremonia → Wu → pruebas visibles. Ocultas conservan datos/resultados y no cuentan en la numeración pública. Anterior/siguiente/número, vista previa y Mostrar usan el mismo catálogo. Las escenas de pruebas usan challenge:ID y sus números visibles se recalculan. Se mantiene apertura síncrona de la ventana pública y handshake antes de dirigirla.

Los escritores usan el mismo Web Lock y comprobación de versiones. Los cambios solo de pruebas utilizan el journal existente de ceremonia y preservan su registro exacto; al eliminar, se retiran los resultados relacionados. Si una prueba activa se oculta/elimina, el mismo journal guarda el retorno a portada y el panel lo explica. Una escritura interrumpida se recupera al cargar. Un borrado se rechaza si otro panel cambió resultados desde la revisión del borrador; exporta/descarta el borrador y vuelve a revisar. No se borra todo localStorage. El historial local conserva configuraciones anteriores, no constituye una copia exportable de resultados. Conserva el navegador y sus datos para el evento.

### Confirmaciones y guía del organizador

Se sustituyen confirmaciones nativas de los flujos activos por ConfirmationDialog y un único servicio: título, explicación, cancelar, acción normal/destructiva, foco inicial en cancelar, Escape, restauración del foco, exclusión de solicitudes duplicadas y bloqueo durante trabajo asíncrono. Un fallo conserva el diálogo para reintentar/cancelar. Repetir ceremonia ejecuta la apertura pública desde el clic de aceptar, sin aplazar window.open tras una espera. Los avisos de guardado siguen siendo mensajes no bloqueantes y los errores de campos aparecen junto al editor. Restablecer conserva su revisión contextual con exportación y aceptación explícita. beforeunload mantiene la protección nativa de cierre/recarga del navegador; no es una confirmación de aplicación sustituible. SessionManager es histórico, no está montado por App; sus confirmaciones legacy no forman parte del Centro de Mando activo.

Fundamento: API nativa showModal y capa modal/inert de MDN (https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal), reactividad/composición de Vue (https://vuejs.org/api/reactivity-core.html). No se añade librería ni dependencia.

### Ensayo reproducible con una persona nueva — pendiente de realizar

Usa un navegador normal y el mismo origen en ambas ventanas. Arranca con el procedimiento npm recuperado de «Partida completa de demostración». Usa exclusivamente participantes ficticios y un perfil de ensayo; exporta antes cualquier configuración real.

1. Seleccionar Colegio y comprobar el nombre en la cabecera.
2. Abrir Equipos y localizar integrantes/capitanes; guardar si se modifican.
3. Abrir Pruebas, crear tres títulos ficticios y pulsar Guardar cambios.
4. Subir la tercera con las flechas; guardar y verificar el orden de la lista.
5. Ocultar una, revisar el aviso y guardar; verificar que sus datos siguen editables.
6. Seleccionar otra prueba y comprobar vista previa; ensayar una imagen ausente y otra local válida.
7. Preparar pantalla pública desde la cabecera y moverla al monitor extendido.
8. Desde la prueba guardada ir a su control, pulsar Mostrar esta escena; comprobar que seleccionar miniaturas no la cambia.
9. Registrar un equipo ganador: el público debe seguir viendo la prueba. Pulsar Anunciar ganador para mostrarlo. Corregir el resultado con diálogo, cancelar una vez y confirmar después. Mostrar de nuevo la prueba.
10. Avanzar con Siguiente; leer el aviso «Después». Volver con Anterior, probar Ir a escena por número y recargar ambas ventanas.

El propietario debe observar si la persona completa los pasos sin ayuda, anotar bloqueos y comprobar foco/Escape, nombres largos, descripciones extensas, móvil 390×844 y escritorio 1366×768/1920×1080. Hacer capturas del editor, prueba pública, anuncio y modal, guardándolas fuera del control de versiones. Este guion no equivale a un ensayo con usuario real: no se ha realizado.

### Verificación del Hito 08

Se ejecutan typecheck, build y test con el npm real C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js a través de Node con --preserve-symlinks --preserve-symlinks-main y NODE_OPTIONS temporal; se restaura su valor al terminar. No existe script de lint. git diff --check y controles del índice preceden a la publicación exclusivamente en feat/upgrade-prologue-art.

Las pruebas cubren creación/edición/duplicación/orden/visibilidad/borrado, 0/1/10/73 pruebas, validación de tamaños/medios, v2/v1 y JSON, resultados y aislamiento, navegación dinámica y retirada activa, journal interrumpido, ceremonia exacta, recarga y sincronización simulada con controladores reales. El diálogo real se compila con Vue/TypeScript existentes y se monta en un renderer de prueba para aceptar/cancelar/Escape/foco/doble acción; no comprueba la trampa de foco nativa del navegador. No se instalan dependencias.

No hay navegador conectado en 9223. No se vuelve a lanzar Edge headless bloqueado: smoke real, consola/red, foco nativo, apariencia/legibilidad, cuatro capturas y prueba con organizador novato quedan PENDIENTES POR ENTORNO / ENSAYO MANUAL. Las pruebas de código no se presentan como validación visual aprobada. Medios privados, JSON reales, capturas, builds, dependencias, secretos y temporales permanecen fuera de Git.

Cierre técnico: **64/64 pruebas superadas**, typecheck, build, sintaxis del smoke y git diff --check con **código 0**. La suite incluye la plantilla pública real compilada (texto completo, fallo de imagen, aviso solo en previa, anuncio y regreso al contenido), además del diálogo real. El smoke visual y la sesión con una persona nueva siguen pendientes, no superados.

Archivos nuevos: src/challenges.ts, src/challengeResults.ts, src/ChallengeEditor.vue, src/ChallengeStage.vue, src/ChallengeControls.vue, src/confirmation.ts, src/ConfirmationDialog.vue; tests/challenges.test.mjs, tests/challenge-stage.test.mjs, tests/confirmation.test.mjs, tests/dialog-component.test.mjs.

Archivos adaptados: src/profile.ts, src/profileStorage.ts, src/ceremonyStorage.ts, src/useProfileDraft.ts, src/scenes.ts, src/usePresentation.ts, src/App.vue, src/OrganizerPanel.vue, src/SceneController.vue, src/CeremonyControls.vue, src/ParticipantEditor.vue, src/ProfileTeams.vue, src/ProfileTransfer.vue, tests/presentation.test.mjs; AGENTS.md, docs/PROJECT.md y este README. Sin cambios en dependencias ni recursos privados.

Comandos de validación reales, desde la raíz en PowerShell:

```powershell
$npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source -Parent) 'node_modules\npm\bin\npm-cli.js'
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = '--preserve-symlinks --preserve-symlinks-main'
    foreach ($script in @('typecheck', 'build', 'test')) {
        node --preserve-symlinks --preserve-symlinks-main $npmCli run $script
        $validationExit = $LASTEXITCODE
        Write-Output "${script}_EXIT=$validationExit"
        if ($validationExit -ne 0) { throw "Falló $script ($validationExit)" }
    }
    node --preserve-symlinks --preserve-symlinks-main --check tests/command-center.smoke.mjs
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
}
git diff --check
```

## Hito 09 — La llamada del cielo

La misión deja de ser una pantalla de texto e imagen en columnas: aparece dentro de una proyección de energía en el cielo, sobre un monasterio original con montañas, torres, árboles, niebla, terraza y escaleras. Dos grupos de siluetas ninja de espaldas, con alturas y posturas distintas, contemplan la proyección desde el primer plano. Son representación de los clanes, no un recuento ni nuevos participantes. Las telas y contornos usan los colores definitivos cuando existen. No se modifican portada, ceremonia ni medios privados.

La misión conserva la imagen completa mediante object-fit: contain, sin filtros ni perspectiva sobre su contenido. El halo elíptico, nubes iluminadas y partículas rodean la información; no hay monitor rectangular ni dos columnas independientes. Número pequeño, título, imagen dominante e instrucciones forman un único foco. Entrada de aproximadamente 1,6 segundos, después reposo, sin audio; movimiento reducido muestra todo inmediatamente. Las descripciones largas siguen completas en una región de instrucciones desplazable con teclado/táctil y aviso para textos extensos. En escritorio el escenario ocupa el viewport sin scroll de página habitual; el encaje/legibilidad real siguen pendientes de comprobar. En móvil se adapta la proyección y se conserva el panorama completo del primer plano, sin recortar un equipo fuera de la pantalla.

El anuncio explícito ilumina el mismo cielo con el color ganador, muestra el emblema original correspondiente y su nombre, conservando a ambos equipos en escena. Guardar resultados no anuncia nada automáticamente. La vista previa usa el mismo ChallengeStage, con geometría 16:9 y tipografía relativa al contenedor; avisos de archivo ausente aparecen fuera de la composición solo en administración. La identidad de degradados SVG es única para que varias previas no se interfieran. No hay nuevos modelos, dependencias ni escrituras de almacenamiento en este hito.

### Catálogo: activa frente a vista previa

La causa del error era aria-pressed ligado a previewId y el estilo de selección correspondiente, junto a initialPreview persistente. Ahora la escena guardada activa tiene el borde principal y aria-current="step". Una miniatura diferente usa borde discontinuo y «Vista previa»; no publica. «En pantalla» aparece solo con disponibilidad pública confirmada; si no, indica «Activa · pantalla sin confirmar». Esa disponibilidad no certifica que el monitor físico esté encendido ni sustituye observarlo.

Al confirmar Mostrar, Anterior, Siguiente o número, la previa sigue el estado activo. Cambiar perfil o retirar una prueba vuelve a una entrada válida. Las solicitudes del editor se consumen al entrar al control y se limpian al navegar, sin quedar atadas a un initialPreview antiguo. El número de navegación también se recalcula al reordenar. Se conservan handshake y apertura síncrona de ventana pública.

### Revisión crítica y segunda pasada

Primera composición: misión unificada en halo y tres planos originales. Segunda pasada: proyección elevada para revelar la arquitectura, escaleras por delante del suelo, tamaños relativos al contenedor para que el dashboard no convierta la previa en otra composición, y panorama inferior completo en móvil para conservar ambos clanes. Se han eliminado distorsiones/filtros sobre la imagen y efectos continuos para mantener lectura estable.

Dirección artística: el planteamiento abandona las columnas y coloca figuras, arquitectura y fenómeno en un mismo mundo; aprobación premium pendiente de capturas reales. Interfaz de videojuego: información integrada en la proyección y anuncio ligado a su energía. Experiencia infantil: dos grupos atentos cooperan y ambos permanecen en la celebración, sin ridiculizar al contrario. Accesibilidad: texto íntegro, foco, imagen contenida, instrucciones desplazables y reduced motion; legibilidad a distancia y encaje no se declaran aprobados sin navegador.

Fuentes técnicas oficiales: Vue watch (https://vuejs.org/api/reactivity-core.html#watch) para reconciliar vista previa y estado activo; contenedores CSS (https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries) para conservar proporciones en la previa. Gráficos originales SVG/CSS; no se descargan materiales protegidos.

### Ensayo visual obligatorio pendiente

El servidor del propietario responde en http://localhost:5173/, pero no hay navegador automatizable conectado en 9223/9222. No se vuelve a arrancar Edge headless bloqueado. Se publica como implementación **pendiente de aprobación artística**, no como diseño visual aprobado. No se generan capturas ficticias ni se sustituyen por imágenes de una versión anterior.

1. Abrir http://localhost:5173/?screen=admin y preparar la pública con el botón del panel. Usar localhost:5173 en ambas ventanas, sin mezclar con 127.0.0.1. Usar un perfil de ensayo, exportando primero cualquier configuración real.
2. Con dos equipos preparados, crear una prueba con imagen horizontal que contenga texto y mostrarla a 1920×1080 y 1366×768. Comprobar imagen completa/legible, título/instrucciones, monasterio y dos grupos, ausencia de scroll habitual y de superposiciones sobre la información.
3. Repetir con imagen vertical, cuadrada, sin imagen, archivo ausente, título de 160 caracteres y descripción extensa. Recorrer las instrucciones con Tab/flechas y comprobar que todo el texto se puede leer.
4. Seleccionar otra miniatura: activa con borde principal/aria-current y previa diferenciada. Mostrar, usar Anterior/Siguiente/número y cambiar perfil. Ocultar/eliminar la activa y guardar: portada válida. Cerrar pública y esperar expiración: el panel debe dejar de afirmar «En pantalla».
5. Guardar un ganador: la misión sigue visible. Anunciarlo: emblema/color/nombre ganador con ambos grupos presentes. Corregir resultado y volver a mostrar la prueba; no hay anuncios automáticos.
6. Revisar 390×844 y movimiento reducido (herramientas del navegador o preferencia del sistema). La previa debe representar la misma composición, y el cambio no debe alterar configuración ni ceremonia.
7. Guardar e inspeccionar capturas en .preview.local/h09-mision-1920.png, h09-mision-1366.png, h09-vertical.png, h09-movil.png, h09-ganador.png y h09-catalogo.png. Usar solo datos ficticios y mantener la carpeta ignorada. La aceptación artística y de lectura en el monitor externo corresponde a este ensayo pendiente.

Archivos de implementación: ChallengeStage.vue, SkyMonastery.vue (nuevo), challenge-sky.css (nuevo), SceneController.vue, OrganizerPanel.vue y useSceneCatalogue.ts (nuevo). Pruebas: challenge-stage.test.mjs y scene-catalogue.test.mjs (nuevo). Documentación: AGENTS.md, docs/PROJECT.md y README.md. Los modelos, las claves de datos, los medios y las pantallas aprobadas no cambian.

Cierre técnico Hito 09: **67/67 pruebas superadas**; typecheck, build y git diff --check con **código 0**, mediante el mismo procedimiento PowerShell con npm detectado y preservación de enlaces documentado arriba. La plantilla y el catálogo reales se compilan con los compiladores existentes; pruebas de renderer/SSR verifican contenido, estados accesibles, dos clanes, colores y unicidad de pinturas, sin medir píxeles. Los controladores existentes mantienen cobertura de decisiones, retirada activa, recarga y resultados explícitos. Vite sirve la nueva ChallengeStage con HTTP 200. No hay lint configurado. Capturas, navegador real y aprobación artística: **pendientes**, no superados.

## Hito 09B — Integración del fondo cinematográfico aprobado

El recurso definitivo es public/private-media/la-llamada-del-cielo.png (1672×941). Se conserva intacto, privado e ignorado por Git. Es compartido por Colegio y Urbanización: no hay copias por perfil ni campos nuevos en ProfileConfig. La ruta se construye desde import.meta.env.BASE_URL para respetar la base de Vite. El propietario ya lo tiene localmente; un clon público no lo incluye y muestra SkyMonastery como respaldo solo si falla la imagen. Tras restaurar un archivo ausente, recarga la página.

La ilustración se muestra completa, sin filtro, recorte ni capa oscura general. El contenido normal ocupa una región interior del portal que evita a Wu y los ninjas; no hay grandes paneles rectangulares. La entrada revela título, imagen e instrucciones y queda estable en unos 1,4 segundos. Las imágenes de pruebas usan contain, sin perspectiva ni distorsión, para formatos horizontal/vertical/cuadrado. Textos largos conservan su contenido y las instrucciones tienen desplazamiento interno accesible. Movimiento reducido elimina la espera.

En Presentación, con una prueba en pantalla que tenga imagen configurada, «Ampliar imagen en pantalla pública» dedica el portal a la imagen y oculta temporalmente título/instrucciones y adornos añadidos. «Volver a la vista normal» los recupera. No cambia el número/ID de escena, perfiles, resultados ni configuración exportable. Usa el bloqueo y la sincronización existentes, con rechazo de comandos obsoletos, el mismo handshake/apertura síncrona y un campo opcional imageView en el control de presentación. Se conserva al recargar la prueba activa y se reinicia al cambiar escena/perfil o anunciar ganador. Estados antiguos sin ese campo siguen en vista normal. Guardar un resultado no desactiva la ampliación ni lo anuncia.

El ganador se presenta sobre el mismo fondo, con su emblema y nombre en el portal y un brillo breve del color elegido, manteniendo personajes visibles y mensaje de respeto. No cambia el guardado ni selección de ganadores. Para volver al contenido, usa Mostrar de nuevo la prueba. Mientras se anuncia un ganador no se permite ampliar. Si falta la imagen de prueba, el emblema de misión sigue disponible; si falta el fondo, funciona el escenario de respaldo. Los avisos de archivo ausente se muestran solo al organizador.

La previa reutiliza ChallengeStage, el fondo compartido y la misma composición. La previa de la escena activa refleja la ampliación actual y el ganador anunciado; seleccionar otra miniatura no publica ni amplía nada. El editor conserva su previa normal del contenido. En escritorio, el marco respeta la proporción del recurso mediante contain y se centra sin cortar personajes. En móvil vertical se conserva la ilustración completa en la parte inferior y se extiende el espacio de lectura hacia el cielo superior, con texto legible e imagen ampliable; ese encuadre adaptado requiere revisión visual del propietario.

**Privacidad de los builds:** Vite copia los medios de public a dist, incluida esta ilustración y los vídeos/arte de perfiles. Los builds locales son privados y NO se deben publicar. dist, public/private-media y .preview.local siguen ignorados. No se elimina ni reemplaza la portada o ningún archivo multimedia existente. No hay commit, push ni preparación del índice en esta iteración.

### Verificar desde VS Code

El servidor del propietario ya está en http://localhost:5173/. Si sigue ejecutándose, guarda los archivos y recarga ambas ventanas para cargar la nueva versión. Si necesitas arrancarlo, usa la terminal integrada PowerShell desde la raíz:

```powershell
$npmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source -Parent) 'node_modules\npm\bin\npm-cli.js'
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = '--preserve-symlinks --preserve-symlinks-main'
    node --preserve-symlinks --preserve-symlinks-main $npmCli run dev
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
}
```

1. Abre http://localhost:5173/?screen=admin; usa localhost:5173 también en la pública. No alternes con 127.0.0.1. Conserva una exportación privada antes de modificar perfiles reales y utiliza participantes/títulos ficticios en el ensayo.
2. En Pruebas crea una con imagen horizontal que contenga letras pequeñas. El archivo debe estar en public/private-media/colegio/ o urbanizacion/ según el perfil. Guarda los cambios y pasa al control de esa prueba. Prepara la ventana pública y pulsa Mostrar esta escena.
3. Revisa a 1920×1080 y 1366×768: fondo completo, Wu/sombrero/ninjas/monasterio, ausencia de velo oscuro o panel opaco, contenido dentro del área oscura, imagen íntegra y sin scroll de página habitual. Comprueba el texto real del acertijo desde la distancia del evento.
4. Pulsa Ampliar imagen: debe cambiar la misma prueba en ambas ventanas; el título/instrucciones ceden espacio y la imagen mantiene proporción. Recarga la pública y verifica que conserva la ampliación. Vuelve a vista normal.
5. Repite con imagen vertical y cuadrada, título largo y descripción extensa. Recorre todas las instrucciones con teclado. Prueba 390×844, encuadre y ampliación; activa movimiento reducido en el navegador/sistema.
6. Guarda ganador y comprueba que no se anuncia; anúncialo con su acción explícita. Debe usar el mismo fondo y el color del equipo. Mostrar de nuevo la prueba vuelve a vista normal. Cambiar escena/perfil no arrastra ampliación anterior.
7. Para ensayar recursos ausentes SIN borrar medios, detén Vite, renombra temporalmente el PNG compartido desde el Explorador de VS Code y vuelve a arrancar; recarga ambas ventanas y comprueba el respaldo. Restaura exactamente la ruta antes de terminar y recarga otra vez. Para la imagen de prueba, usa un nombre ficticio inexistente en el perfil de ensayo.
8. En Red de las herramientas del navegador comprueba que las solicitudes son locales. Guarda capturas reales en .preview.local/h09b-prueba-1920.png, h09b-prueba-1366.png, h09b-ampliada.png, h09b-ganador.png, h09b-previa.png y h09b-movil.png; inspecciónalas y no las añadas a Git.

Servidor y PNG responden HTTP 200 (PNG como image/png), dimensiones verificadas localmente. No hay navegador conectado en 9223/9222; no se repite Edge headless bloqueado. **Capturas, encaje real, lectura a distancia, orientación de imágenes, móvil, reduced motion y ausencia de red externa en navegador quedan pendientes**, no superados. Las pruebas con renderer/controladores simulados no equivalen a esa inspección. No se generan imágenes nuevas ni capturas simuladas.

Cierre técnico Hito 09B: **68/68 pruebas superadas**, typecheck, build y git diff --check con **código 0**. Se usó el npm detectado C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js mediante Node con --preserve-symlinks --preserve-symlinks-main y NODE_OPTIONS temporal restaurado al terminar, como en los comandos de validación anteriores. Build incluye un typecheck adicional. Sin lint configurado. El hash de la copia privada del PNG en dist coincide con el original: Vite lo copia sin alterar y ese build no se publica.

Archivos modificados: src/ChallengeStage.vue, src/challenge-sky.css, src/ChallengeControls.vue, src/SceneController.vue, src/OrganizerPanel.vue, src/App.vue y src/usePresentation.ts; tests/challenge-stage.test.mjs, tests/presentation.test.mjs y tests/scene-catalogue.test.mjs; AGENTS.md, docs/PROJECT.md y README.md. SkyMonastery y el PNG aprobado se conservan sin modificaciones. No hay archivos preparados en el índice, commit ni push de este hito.

## Prueba 01 — El Aro del Dragón Unido

**Maestro Wu:** «Ninjas, formad una fila y unid vuestras manos. Pasad el aro por vuestro cuerpo, uno a uno, hasta el último compañero, sin soltaros. ¡El equipo que tarde menos demostrará el poder del dragón unido!»

El organizador entrega un aro al primer integrante de cada fila. Se pasa por el cuerpo de cada compañero hasta el último, sin soltarse. Cronometra cada equipo con un reloj externo: gana el menor tiempo. Registra el ganador manualmente en Presentación y anúncialo solo cuando proceda. La aplicación no calcula tiempos ni adjudica automáticamente.

Recurso: imagen estática PNG, sin texto, con cinco ninjas en fila enlazados y el central atravesando el aro; fondo sencillo para destacar la acción. Generada con la herramienta integrada, tomando el tratamiento 3D de la portada como referencia. Archivos privados: public/private-media/colegio/aro-del-dragon-unido.png y public/private-media/urbanizacion/aro-del-dragon-unido.png. Ambas copias permiten usar el mismo imageFilename dentro de las rutas por perfil ya existentes. El prompt exacto queda en public/private-media/aro-del-dragon-unido.prompt.txt. No se reemplazan portada ni fondo cinematográfico. Un clon público sin medios mostrará el emblema de respaldo.

Para prepararla sin sobrescribir datos:

1. Con Vite levantado, abre http://localhost:5173/?screen=admin y elige el perfil.
2. Ve a Pruebas y pulsa **Nueva prueba** (Hito 09.1 sustituye el botón específico del aro). Si la prueba ya existe, selecciónala y verifica su imagen antes de editarla; no crees un duplicado. No se identifica automáticamente «Aro fatal» por su nombre.
3. Introduce título **El Aro del Dragón**, instrucción **Pasad el aro del primer ninja al último.** y regla **NO PODÉIS SOLTAROS DE LAS MANOS.** Conserva la explicación completa en Instrucciones para el organizador. Imagen: el nombre de su archivo existente, por ejemplo aro-del-dragon-unido.png o prueba1.png, sin renombrarlo. Revisa la previa y pulsa **Guardar cambios**. Si es necesario, cambia su orden con ↑/↓. El número se calcula entre las pruebas visibles. Editar solo pruebas conserva la ceremonia.
4. Usa **Ir al control de esta prueba →**, prepara la pantalla pública y pulsa **Mostrar esta escena**. La selección de miniatura no publica automáticamente. Puedes usar Ampliar imagen y volver a normal.
5. Antes del evento, enseña la imagen a un niño o facilitador: debe identificar fila, manos enlazadas y cuerpo atravesando el aro, sin interpretar que se pasa por fuera ni soltarse. Ensaya físicamente el recorrido y usa el cronómetro externo. Ese ensayo con personas queda pendiente.

Si necesitas arrancar Vite en VS Code, usa el procedimiento PowerShell/npm recuperado de Hito 09B. Para ver solo el PNG abre http://localhost:5173/private-media/colegio/aro-del-dragon-unido.png o su equivalente urbanizacion. Conserva el mismo origen en ambas ventanas.

Archivos de esta ampliación: src/hoopChallenge.ts y tests/hoop-challenge.test.mjs (nuevos), src/ChallengeEditor.vue, AGENTS.md, docs/PROJECT.md y README.md. Se conservan íntegros los cambios anteriores sin commit. No hay datos reales de participantes, cambios de esquema ni dependencias. PNG/prompt y dist permanecen privados e ignorados; el build contiene los medios y no se publica.

Validación de esta ampliación: typecheck, build, 69/69 pruebas y git diff --check correctos (código 0), con el procedimiento npm/Node de preservación de enlaces ya documentado. Imagen inspeccionada, 1672×941, copias de perfiles idénticas por hash y PNG/prompt ignorados por Git. El servidor no respondió en localhost:5173 durante esta sesión: revisión de la prueba dentro del navegador y ensayo físico con participantes quedan pendientes. No se declara realizado ese ensayo ni se modifican datos guardados del organizador. Sin commit ni push.

## Validación operativa — 16/11/2026

Servidor arrancado mediante el script npm run dev con el npm detectado invocado por Node y las opciones de preservación de enlaces. Vite anuncia http://127.0.0.1:5173/ y se comprobó http://localhost:5173/ con HTTP 200. Para conservar el origen de los datos del propietario se utilizan http://localhost:5173/ y http://localhost:5173/?screen=admin en ambas ventanas. El proceso queda en la terminal persistente de la sesión; las herramientas de Codex no permiten insertarla en el panel integrado de VS Code. El procedimiento de arranque en una terminal normal de VS Code sigue en Hito 09B; no arrancar otra instancia sobre el mismo puerto sin revisar la existente.

Se solicitó abrir el navegador predeterminado. La ventana normal adicional de ensayo con perfil aislado falló por permisos de Windows en Mojo/Crashpad (Access is denied), sin flags de desactivación de seguridad ni privilegios adicionales. No se repitió Edge headless. No hubo conexión de automatización en 9223/9222 ni capturas nuevas. La inspección visual, sincronización observada entre ventanas físicas, reproducción/decodificación real y ensayo con internet desconectado siguen pendientes del propietario. No se borraron ni sobrescribieron sus datos de navegador.

Se añadió una prueba integrada específica del aro con useProfileDraft y usePresentation reales, almacenamiento y canales simulados y datos ficticios: crear borrador → guardar → localizar Prueba 01 → presentar en el segundo controlador → ampliar/normal → recargar → guardar ganador sin anunciar → anunciar explícitamente → regresar al contenido. Se conserva configuración, ceremonia y el otro perfil. Esa evidencia automatizada no se presenta como clics ni inspección en un navegador real.

Comprobación multimedia local: siete recursos respondieron HTTP 206 a lecturas parciales, con MIME y firmas PNG/MP4 correctas; ambos PNG del aro, ambas ilustraciones de perfil, ambos vídeos de Wu y el fondo compartido. Sus copias de dist coinciden por hash con los originales, y las referencias de entrada del build son locales. El verificador temporal está en .preview.local/verify-local-media.mjs, ignorado. Se revisaron referencias de ejecución: no hay CDNs/fuentes/servicios remotos requeridos; los enlaces a documentación en comentarios no son peticiones. No se desactivó la red del sistema, de modo que la ejecución offline en navegador no se declara superada.

Durante la comprobación se detectó que el aro de Colegio había pasado a llamarse prueba1.png, dejando ausente el nombre usado por la plantilla. Se verificó que era la misma imagen por hash, se conservó prueba1.png intacta y se añadió una copia aro-del-dragon-unido.png sin sobrescribir archivos. Se recompiló después para incluir esa copia privada. No se tocaron prueba2.png, los perfiles guardados ni sus referencias actuales.

Resultados: npm run typecheck, npm run build y npm run test mediante Node/npm recuperado con códigos 0; **70/70 pruebas**; recompilación tras reponer el recurso y verificación multimedia local, código 0. No hay lint configurado. AGENTS incorpora arranque/reutilización del servidor, HTTP, inspección visual habitual y separación explícita de evidencias. No se añaden funcionalidades de juego en esta revisión.

Git local: main 2364d9248a0686cea24630828e8ffd4a18aca738 es ancestro de feat/upgrade-prologue-art 893607992d0b8ce5a5db34cbdeab4629fbcc0702; 0 commits exclusivos de main y 9 de la rama de trabajo, con 74 archivos confirmados de diferencia. main conserva el establecimiento inicial de documentación; los commits de desarrollo añaden aplicación, administración, ceremonia y pruebas. Además están los cambios locales pendientes de Hito 09B y del aro, que NO están incluidos en esa comparación de commits. Todo se conserva sin preparar índice, commit, merge, push, reset o clean. Las referencias remotas no se han actualizado en esta revisión.

Para cerrar el ensayo pendiente: con Vite activo abre el admin, selecciona el perfil, añade/guarda el aro, muéstralo en pública, comprueba Ampliar/Normal y recarga de ambas ventanas; guarda ganador (sin anuncio), anúncialo y vuelve al contenido. Repite a 1920×1080, 1366×768 y 390×844. Desconecta internet manualmente manteniendo el servidor local y repite imágenes y reproducción de vídeo con sus controles. Conserva capturas privadas y registra cualquier fallo observado. No confundir datos de localhost con los de 127.0.0.1.

Ajuste de estabilidad de esta revisión: la caché del navegador aislado fallido produjo avisos EBUSY del observador de Vite. vite.config.ts excluye **/.preview.local/** mediante server.watch (documentación oficial: https://vite.dev/config/server-options.html#server-watch), sin cambiar la lógica del juego ni las opciones de seguridad. El servidor se reinició automáticamente y volvió a responder HTTP 200. Tras el ajuste se repitieron build/typecheck, 70/70 pruebas y las siete lecturas multimedia, todos con código 0. Vite queda ejecutándose para revisión.

## Uso actual de pruebas — Hito 09.1

En Pruebas, selecciona una existente o pulsa **Nueva prueba**. Introduce título, **Instrucción para los niños** (120 caracteres) y **Regla importante** opcional (100). La explicación completa pertenece a **Instrucciones para el organizador** (4000), visible también mientras diriges esa prueba desde Presentación. La imagen es opcional y referencia el archivo privado existente del perfil. Revisa la **Vista previa del borrador**, guarda en la cabecera y usa **Ir al control de presentación**. Solo Mostrar cambia la pública; registrar ganador y anunciarlo son acciones distintas. Duplicar, ocultar y eliminar están en Organizar esta prueba; ↑/↓ cambia el recorrido. El número público omite las ocultas.

Los perfiles antiguos v2/v3 siguen importándose sin truncar textos ni cambiar identificadores/resultados. Leer no reescribe los originales. Las pruebas v3 aparecerán pendientes de instrucción pública: prepara expresamente su frase breve y regla. Hasta entonces la pantalla pide escuchar al organizador, sin proyectar su descripción larga. Guardar/exportar genera v4, que las versiones anteriores de la aplicación no leen: actualiza ambas ventanas antes del ensayo y conserva tus exportaciones privadas. No se modifica automáticamente «Aro fatal» ni ninguna otra prueba real.

Ensayo pendiente: crea dos pruebas ficticias diferentes, con/sin imagen, cambia una sin afectar a la otra, duplica y comprueba ID/resultado independiente; reordena/oculta y verifica numeración y resultado conservado. Comprueba en ambas ventanas a 1920×1080 y 1366×768, móvil, título160/instrucción120/regla100 simultáneos, imagen horizontal/vertical/cuadrada, ampliación, ganador explícito, foco y movimiento reducido. El texto completo del organizador no debe aparecer en pública. Revisa lectura real desde tres a cinco metros. Comprueba imágenes/vídeo con internet desconectado manualmente y servidor local activo. Las secciones históricas anteriores describen versiones previas; este procedimiento sustituye el atajo específico del aro y el scroll público de instrucciones largas.

Validación Hito 09.1: **75/75 pruebas**, `npm test`, `npm run typecheck` y `npm run build` con código 0. En Windows se ejecutaron como `node --preserve-symlinks --preserve-symlinks-main C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js run test` (análogamente `run typecheck` y `run build`), con NODE_OPTIONS temporal con las dos opciones y restaurado al terminar. Sin lint configurado. Se cubren migraciones v2/v3/v4, descripción íntegra, límites, IDs y resultados independientes, guardado/recarga, perfiles, journal con interrupciones repetidas, editor/plantilla compilados, fallback y ganador; transporte de ventanas simulado. Vite responde HTTP 200 en localhost:5173 y se ha solicitado abrir administración. No hay navegador inspeccionable; aceptación artística, capturas, dos ventanas físicas, offline real y distancia pendientes. Trabajo local, sin commit ni push; medios/build/capturas siguen ignorados.
