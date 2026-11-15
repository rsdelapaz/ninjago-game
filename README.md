# El secreto del maestro Wu

> **Guía vigente: Centro de Mando por perfiles (15/11/2026).** Consulta el apartado «Guía actual: perfiles» al final. Las secciones de sesiones y sus validaciones se conservan como historial y ya no describen la interfaz actual. Esta iteración tiene autorización de commit local; no hay autorización de push.

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
