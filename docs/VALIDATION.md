# Hito 10.2 — acabado del Oráculo · 17/11/2026

Intervención local sobre el Hito 10.1 existente, sin rediseño: halo estático dorado/turquesa y trazos del sello más definidos en victoria, letras ligeramente realzadas y luz cálida localizada. Reiniciar primero y principal; repetir secundario en fila adaptable. Único cambio de derrota: mensaje aprobado y ajuste de anchura/saltos de línea. Sin cambios en estado, audio, validación, URL, imágenes, dependencias ni juego principal.

## Evidencia de esta intervención

- npm test: 88/88, salida 0. npm run typecheck, npm run build y git diff --check: salida 0. Npm-cli detectado en C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js, con preserve-symlinks y NODE_OPTIONS restaurado. Suite de datos/componentes/audio simulado distinta del ensayo real.
- Chrome normal, perfil y contextos sintéticos aislados, CDP loopback 9224: copia del smoke existente en .preview.local/enigma-10-2.smoke.mjs, cambiando solo carpeta/título de evidencia. Salida 0. Tres ciclos fallo → reintento → acierto → repetir → reiniciar durante repetición, más repetición completa; URL conservada, campo vacío/foco, solución oculta y partículas retiradas. Sin excepciones JavaScript, escrituras/canales del juego ni HTTP externo. Audio activado/silenciado con éxito, sin certificar audición/altavoces.
- 1920×1080, 1366×768 y 390×844 sin desbordamientos en los casos ensayados; 48 letras, varias palabras, Ñ, respaldo SVG con PNG bloqueado y movimiento reducido correctos. Comparación inspeccionada de inicio/victoria/derrota y victoria anterior 10.1: círculo final perceptiblemente encendido, palabra dominante, reinicio más visible; derrota conserva composición y nuevo mensaje legible.
- Capturas y secuencias muestreadas privadas: .preview.local/enigma-10-2; animation-review.html y motion.json. Inspección de capturas estáticas no certifica fluidez en monitor físico. Los efectos y temporizadores existentes no se modificaron; su retirada se verifica en el smoke y los tests.
- Ensayo adicional .preview.local/enigma-10-2-extra.mjs: salida 0 para texto exacto de recuperación, orden DOM (REINICIAR ENIGMA primero) y victoria/derrota a 320×844 sin desbordamientos. Capturas inspeccionadas: botones apilados y mensaje legible. El ensayo CDP adicional de Tab/Enter no confirmó activación/foco de manera fiable; no se declara teclado completo validado. Enter para enviar formulario sí pasa en el smoke principal, y foco al reiniciar pasa en componente y recorrido principal. Pendiente Tab/Enter manual de ambos controles.
- SHA256 PNG 831EEF6DDD0DCA8BB2A59F264BD4C2A478A3643FEBCF16B641046C10F93FD334 y SVG 2AA7FE016D63C9753281146FB8D10E70DACA39B5BEAFAE239D192BCAC69F2CFE: coinciden con 10.1. No se generaron ni sobrescribieron medios.

Vite disponible en http://localhost:5173/?screen=enigma#palabra=AMISTAD, HTTP 200; terminal de ejecución persistente, sin afirmar integración con VS Code. Pendientes: revisión del propietario, monitor físico, lector de pantalla, Tab/Enter de controles finales, altavoces, fullscreen y desconexión física de internet. No se declara ensayo prolongado ni medición GPU/memoria. Implementación 10.2 terminada, sin abrir otra ronda estética. Sin commit ni push; cambios previos conservados.

---
# Hito 10.1 — santuario despierto o derrumbado · 17/11/2026

Se conserva íntegro el trabajo local del Hito 10. Sin commit, push, preparación del índice ni cambios de main. Vite existente responde HTTP 200 en http://localhost:5173/ y continúa disponible; no se afirma que su terminal pertenezca a VS Code.

## Defectos y corrección

La derrota anterior conservaba el círculo entero, iluminación turquesa, propuesta visible y botón dorado. No había reinicio después de ganar. Ahora victoria ilumina y expande; derrota contrae/fractura, apaga el santuario y disuelve la propuesta, con recuperación sin tratamiento triunfal. El mismo PNG y el SVG de respaldo permanecen intactos. SHA256 PNG: 831EEF6DDD0DCA8BB2A59F264BD4C2A478A3643FEBCF16B641046C10F93FD334; SVG: 2AA7FE016D63C9753281146FB8D10E70DACA39B5BEAFAE239D192BCAC69F2CFE.

REINICIAR ENIGMA conserva secreto/URL y preferencia de sonido, cancela sonidos y temporizadores, retira partículas, oculta solución, limpia campo y devuelve foco. Funciona después de repetir y durante una repetición en curso; no recarga ni accede al estado del juego. VOLVER A INTENTARLO recupera la misma escena inicial tras fallar. REPETIR REVELACIÓN conserva la solución mientras vuelve a animar la victoria.

## Validaciones reales

- npm test: **88/88**, salida 0. Incluye fases de derrota, cinco ciclos con reinicio durante repetición, secreto conservado, cero temporizadores residuales, foco y solución oculta al reiniciar; se conservan regresiones de Ñ/tildes/longitudes, audio, entrada aislada y juego existente.
- npm run typecheck y npm run build: salida 0; git diff --check: salida 0. Npm mediante C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js, Node --preserve-symlinks --preserve-symlinks-main y NODE_OPTIONS temporal restaurado al terminar. Sin nuevas dependencias ni lint configurado.
- node --preserve-symlinks --preserve-symlinks-main tests/enigma.smoke.mjs: salida 0, Chrome normal con perfil/contexto aislado. Tres ciclos completos fallo → reintento → acierto → repetir → reiniciar durante la repetición, más revelación/repetición completas. Confirma URL conservada, input vacío/foco, ninguna solución residual, retirada de partículas al terminar, sin escrituras ni canales del juego ni HTTP externo. Audio opcional activado y silenciado durante el recorrido.
- 1920×1080, 1366×768 y 390×844, expresión de 48 letras, varias palabras, Ñ distinta de N, movimiento reducido, URL inválida y PNG bloqueado con respaldo SVG: correctos en los casos ensayados, sin desbordamientos. Derrota móvil y con movimiento reducido conserva apariencia rota/oscura y no monta ceniza animada.
- Comprobación adicional Chrome en otro contexto sintético limpio: /?screen=admin permite elegir Colegio y monta dashboard; / monta portada aprobada con START GAME y ninguna raíz enigma. No se tocan configuraciones reales. Esto no certifica otra vez todo el flujo de ceremonia/sincronización.

## Revisión artística y evidencia temporal

Primera pasada: estados, contrato de cancelación, geometría opuesta del sello, lectura infantil y recuperación. Segunda: comparación real lado a lado en .preview.local/enigma-10-1/comparison.png e inspección de evolución temporal en storyboard.png. La victoria conserva palabra dominante, faroles encendidos, núcleo completo y efectos ascendentes; la derrota deja propuesta disuelta, faroles atenuados, círculo interrumpido, grietas y botón de recuperación. Sin monstruos, violencia ni lenguaje humillante.

Se capturó el movimiento real con Page.startScreencast: derrota 35 fotogramas durante 2,82 s y victoria 58 durante 5,40 s; capturas finales adicionales. animation-review.html reproduce ambos registros con sus tiempos, motion.json conserva marcas temporales y los JPEG quedan privados. Es una captura muestreada del navegador, no un vídeo de alta frecuencia ni prueba de fluidez en el monitor del evento. Se revisó la progresión mediante esos fotogramas, no solamente las imágenes finales. El coste de las partículas termina con cada fase; no se midió memoria/GPU durante una sesión prolongada.

Pendientes: aprobación artística del propietario reproduciendo las secuencias, monitor físico a distancia, volumen/altavoces, lector de pantalla, desconexión física de internet y entrada/salida de fullscreen (limitación CDP documentada en Hito 10). El ensayo de tres ciclos y tests de cinco ciclos no sustituyen una prueba prolongada. Recursos, capturas, perfil Chrome y dist permanecen ignorados. Sin datos reales, nuevos medios ni cambios del juego principal en 10.1.

---

# Hito 10 — evidencia del 17/11/2026

Esta sección actualiza la evidencia del enigma; el informe de Prueba 02 que sigue conserva su contexto histórico. Checkpoint previo 23bf6da7bcd97cdf82dbb08c3e295a10aa36cfb3, chore: checkpoint before standalone enigma experience, confirmado y enviado a origin/feat/upgrade-prologue-art; SHA remoto comprobado. El desarrollo posterior no se confirma ni envía.

## Comprobaciones ejecutadas

- npm-cli real C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js, invocado mediante Node con --preserve-symlinks --preserve-symlinks-main y NODE_OPTIONS temporal, restaurado al terminar.
- npm test: 87/87, cero fallos (11 pruebas nuevas); npm run typecheck: salida 0; npm run build: salida 0; git diff --check: salida 0. Sin script lint. El build separa App y EnigmaStage mediante importaciones dinámicas.
- node --preserve-symlinks --preserve-symlinks-main tests/enigma.smoke.mjs: salida 0 en Chrome real normal con CDP loopback 9224 y contexto limpio. Vite responde HTTP 200 en http://localhost:5173/ y permanece activo.
- Navegador: acceso directo sin perfiles, cero escrituras de almacenamiento/canales del juego y sin cargar App; fallo/reintento, Enter, carga/despertar/revelación/celebración/victoria/repetición; 48 letras, expresión con espacios, Ñ distinta de N, URL ausente y movimiento reducido. Sin excepciones JavaScript ni HTTP externo solicitado; HTTP externo bloqueado durante el ensayo. No equivale a desconexión física de internet.
- 1920×1080, 1366×768 y 390×844: sin desbordamiento horizontal/vertical en los estados ensayados. Capturas reales en .preview.local/enigma (inicio, fallo, carga, revelación, celebración, victoria, larga, móvil, movimiento reducido, URL inválida y respaldo).
- Audio: activación explícita y mute durante secuencia comprobados. Se reprodujo y corrigió mediante regresión el fallo de dispositivo que lanza al crear un oscilador después de desbloquear AudioContext; la secuencia visual continúa. No se certifica volumen/calidad de altavoces.
- PNG bloqueado mediante Fetch de DevTools: se retira la imagen, aparece SVG de respaldo y se puede resolver. Imagen privada nueva ignorada; recursos anteriores sin modificaciones.

## Dos revisiones críticas y límites

Primera pasada: jerarquía, foco/teclado, ausencia de pistas previas, independencia y cancelación de efectos; pruebas de componente/estado no se presentan como inspección visual. La primera captura real reveló que el santuario SVG era demasiado plano: se creó únicamente un fondo 3D nuevo, sin cambiar imágenes anteriores, manteniendo aquel como respaldo.

Segunda pasada: inspección de capturas reales de inicio/victoria/celebración, móvil y expresión larga. Palabra protagonista, contraste alto, controles legibles y efectos finitos de ondas, rayos y fragmentos; sin confeti convencional persistente. Aprobación artística definitiva corresponde al propietario.

Pantalla completa: la automatización llegó a entrar, pero no confirmó de forma fiable la salida nativa en el contexto CDP. Se sincroniza el estado tras la promesa además del evento nativo; no se declara superada la prueba completa. El caso optativo ENIGMA_TEST_FULLSCREEN=1 queda separado del smoke aprobado. Ensayar manualmente entrada/salida/Escape, monitor extendido a distancia, altavoces, lector de pantalla y desconexión física de internet con servidor local activo.

Privacidad: nuevos archivos de código/pruebas solo datos sintéticos, documentación sin credenciales ni datos de menores. Git solo rastrea .gitkeep bajo private-media; fondo nuevo, capturas, perfil Chrome y dist siguen ignorados. El hash de respuesta es visible en la URL/historial/inspección, no un secreto protegido. Build local contiene medios privados y no debe publicarse. No se alteran main, perfiles reales, ceremonia, resultados ni sincronización.

---

# Validación vigente — Prueba 02 y revisión documental

Fecha: 17/11/2026. [Uso](../README.md) · [Arquitectura](PROJECT.md) · [Procedimiento de pruebas](DEVELOPMENT.md) · [Ficha de Los Vasos Sagrados](challenges/LOS-VASOS-SAGRADOS.md).

## Alcance y resultado

Solo se añade contenido documental y la ilustración privada de vasos. Los cambios locales previos de 09.3 se conservan; no se modifica código, tests existentes, dependencias, perfiles del navegador ni el diseño aprobado. La prueba no está registrada automáticamente: debe revisarse la lista y darse de alta con Nueva prueba por el organizador.

La documentación anterior mezclaba requisitos previstos con funciones implementadas, perfiles/sesiones y esquemas v2/v3 con v4; repetía comandos y autorizaciones Git históricas. README pasa a ser entrada de uso, PROJECT describe arquitectura/estado, DEVELOPMENT concentra procedimientos, la ficha concentra copys/montaje y AGENTS reglas permanentes. Las tres versiones anteriores se guardan íntegramente bajo un aviso en history; [índice](history/INDEX.md). Su información no desaparece ni concede permisos vigentes.

## Comprobaciones ejecutadas

| Comprobación | Resultado observado |
| --- | --- |
| npm test | 76/76, código 0; modelos, controladores y componentes existentes |
| npm run typecheck | Código 0 |
| npm run build | Código 0; también ejecuta typecheck; build privado |
| git diff --check | Código 0 |
| Campos copiables de la ficha | Cinco bloques extraídos y validados con parseProfile/exportProfile reales v4, ida/vuelta y prueba anterior sintética preservada |
| Imagen original | Generación imagegen integrada, una versión; PNG inspeccionado visualmente |
| Dos copias privadas | PNG 1672×941, idénticas SHA-256 E6DA565BA1795F016F2F56075042F7858C962EF86359DBA768CDECB850AD2C40 |
| Servidor de los PNG | HTTP 200, MIME image/png y respuesta idéntica al archivo en ambos perfiles |
| Build de los PNG | Copias de dist idénticas al original de cada perfil |

Se ejecutó npm-cli.js detectado en C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js mediante Node --preserve-symlinks --preserve-symlinks-main, con NODE_OPTIONS temporal equivalente restaurado. Los comandos efectivos fueron esa invocación con run test, run typecheck y run build. No hay lint configurado. El aviso de tiempos de callbacks de Vite fue informativo; build terminó correctamente.

La compatibilidad de contenido se comprobó sin localStorage real: se creó una configuración sintética en memoria con otra prueba y los campos exactos de la ficha, validada/serializada/importada con el parser existente. No equivale a clicar la interfaz del organizador.

## Inspección de la ilustración

Se distinguen base/línea de salida, cuatro ninjas quietos esperando, un único ninja verde volviendo con un vaso, dos vasos encajados en base y dos separados en el recorrido. Ejemplo de cinco ninjas/cinco vasos, no cantidad fija de juego. Sin aros, manos enlazadas, texto, cristal, lanzamientos, corredores simultáneos o torre invertida. Sin errores importantes que justifiquen otra generación. Copias y prompt bajo public/private-media, ignorados. No se alteran las referencias de estilo ni otros medios.

Esta inspección es del PNG generado en el visor, no de la aplicación con ese contenido ya publicado. El propietario aprueba el diseño 09.3; esa aprobación es evidencia del propietario y no se presenta como ensayo nuevo ejecutado por Codex.

## Pendientes del organizador

- Revisar si ya existe la prueba en cada perfil y realizar alta/guardado por el editor, sin duplicados y conservando el aro.
- Comprobar previa/pública/imagen ampliada/ganador en las dos ventanas reales, a 1920×1080 y 1366×768; verificar comprensión de la ilustración reducida, no solo del original.
- Ensayar con monitor a tres–cinco metros, niño/facilitador, teclado/movimiento reducido y tamaños estrechos; conservar capturas privadas.
- Ensayo físico de relevos con vasos reales; equilibrar equipos o fijar previamente criterio justo si difieren, suelo adecuado y un turno/vaso por participante.
- Reproducción de vídeo y operación offline real con servidor local activo e internet desconectado manualmente.

No hay conexión de navegador inspeccionable; no se generaron capturas de la aplicación ni se reintentó Edge headless bloqueado. test:smoke no se ejecutó; conserva supuestos que deben revisarse antes de certificar un E2E actual (ver DEVELOPMENT). Los ensayos históricos de otra versión permanecen en history, no sustituyen estos pendientes.

## Revisión documental final y privacidad

La segunda lectura debe poder seguir: clonar → npm ci → dev → admin → perfiles/equipos → medios privados → Nueva prueba → guardar → mostrar → resultado/anuncio. Se revisan los enlaces internos y sus encabezados, las rutas de código, campos/límites del parser y comandos de package.json. El archivo histórico es consultable pero no se usa para dirigir la operación actual.

Comprobado: 58 enlaces internos activos y 67 contando los avisos de los archivos históricos, incluidos sus fragmentos/encabezados, válidos; tres instantáneas completas después de su aviso. Rutas de código documentadas verificadas contra el disco; se corrigió una abreviación ambigua de session.ts/sessionStorage.ts por sus dos rutas explícitas. Campos copiables verificados con parser real. Los 60 archivos de src/tests mantienen el hash tomado durante la auditoría: no hay cambios de aplicación en esta operación. Los diez medios anteriores que siguen presentes mantienen sus hashes, incluidos el aro y la-llamada-del-cielo.png.

Cambios simultáneos detectados y conservados: durante el trabajo HEAD pasó de 5fefb5b791d818519bd1eb6865ac9f489da6f76c a 16fbbdb03a334af752f9d333c47b89f1f46c0cf3 (style: finalize cinematic challenge presentation), y colegio/prueba1.png y colegio/prueba2.png dejaron de existir. Esta operación no ejecutó commit ni eliminaciones; no se conoce la causa de esas dos ausencias y no se restauran/sobrescriben decisiones de otro proceso. Si algún perfil guardado aún usa esos nombres, el organizador debe revisar la referencia: no se han inspeccionado sus datos reales. Por ello no se afirma que todos los medios previos permanezcan presentes, aunque las referencias de estilo y del aro sí están intactas.

No se prepara índice ni se ejecutan commit, push, merge, reset, clean o cambios de main. Los medios, prompts, capturas y dist son privados y continúan ignorados; el índice permanece vacío. Las modificaciones de esta tarea son README, AGENTS, PROJECT, DEVELOPMENT, esta evidencia, la ficha, el índice histórico y tres instantáneas, más dos PNG y su prompt privados. El ensayo de navegador/alta física queda pendiente según los apartados anteriores.
