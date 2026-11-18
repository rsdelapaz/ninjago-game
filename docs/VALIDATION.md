# El corazón del sello · 18/11/2026

La orden posterior «El gran desenlace del Maestro Wu» autoriza rediseñar exclusivamente la revelación. Diagnóstico: la banda marfil ocultaba el núcleo, la columna del pergamino restaba espacio a Wu y el resultado carecía de unidad con el sello. Se sustituye su presentación por una reliquia octogonal de piedra (textura del santuario original), inscripción dorada monumental, encabezado separado, anillo iluminado y zona lateral segura para Wu y sus dos rótulos. Se conserva el texto dinámico exacto; la densidad tipográfica depende solo de longitud (hasta 28, hasta 110 y resto). No hay conversión de números, solución insertada, recursos nuevos, cambios de validación, perfiles ni almacenamiento.

Archivos de esta intervención: `src/FinaleStage.vue`, `src/finale.css`, `src/useFinaleCinema.ts`, `tests/finale-cinema.test.mjs`, `tests/sanctuary-quality.smoke.mjs`, `docs/PROJECT.md`, `docs/FINALE.md` y esta evidencia. Se preserva el resto del trabajo local. El material reutiliza la URL con BASE_URL del recurso existente, sin modificarlo. Repetir es la acción dorada; restaurar y portada conservan sus eventos y confirmaciones. La secuencia existente usa timeScale 15/4 solo en victoria: cuatro segundos programados, mismo orden de fases y cancelación, sin cambiar las derrotas. Entrada finita de la reliquia y después encabezado/epílogo; movimiento reducido muestra el resultado directamente.

## Verificación realizada

- `npm test`: **121/121**, salida 0; `npm run typecheck`, `npm run build` y `git diff --check`: salida 0. Prueba del timeline real ampliada para comprobar duración efectiva de cuatro segundos. Se corrigió un cambio innecesario de etiqueta accesible detectado por el test; se conserva el contrato anterior. El intento de ejecutar Node test con aislamiento de procesos recibió EPERM; se usó el procedimiento vigente `--test-isolation=none`.
- Chrome normal y Vite HTTP **http://localhost:5173/**. Contextos temporales sintéticos, eliminados al terminar, sin escribir almacenamiento del propietario. `tests/finale-ceremony.smoke.mjs` pasa: ceremonia completa, fases animadas reales, intentos, perfiles, restauración, recuperación tras recarga, medios ausentes y movimiento reducido. Registro `.preview.local/heart-seal-ceremony.log`.
- `tests/sanctuary-quality.smoke.mjs` pasa con clics físicos y Enter sobre los controles y diálogos públicos. Se añade repetición pública completa desde victoria, comprobando intentos, secreto exacto y configuración conservados. También pasan restaurar, portada, aislamiento de turnos y recuperación. Registro `.preview.local/heart-seal-controls.log`.
- Arnés privado `.preview.local/heart-seal-check.mjs`: **nueve composiciones** con textos sintéticos corto romano, medio y largo (2749 caracteres), a **1920×1080, 1366×768 y 1280×720**. Sin desbordamiento horizontal; controles dentro del viewport; inscripción alineada con el eje del sello; rótulos de Wu dentro de su zona lateral sin invadir la reliquia; secreto completo exacto y último párrafo alcanzable. A 1080p la inscripción corta mide **109,44 px**, el título **25,6 px**. El texto medio de ensayo cabe completo en 720p; el largo mantiene scroll interior. Sin errores de runtime ni peticiones externas en este ensayo.
- Capturas e inspección visual reales en `.preview.local/heart-seal/`: `after-short-1920.png`, `after-short-1366.png`, `after-short-1280.png`, textos medios/largos, último párrafo y `title-hidden-1920.png`. Al ocultar el encabezado, la inscripción mantiene el protagonismo. No son datos ni solución del propietario.
- La captura de la secuencia produjo 30 fotogramas y muestras reales de fases en `.preview.local/finale-11-3/motion.json` y su visor privado. Bajo grabación y capturas simultáneas transcurrieron aproximadamente **5,6 segundos de pared** entre anticipación y éxito, frente a los cuatro segundos nominales del timeline. No se certifican FPS ni reproducción física en monitor externo. No se añade presupuesto de partículas (156/DPR 1,5).

Logs de comandos `.preview.local/heart-seal-{test,typecheck,build}.log`. No hay nuevas dependencias, medios remotos, commit ni push. Quedan la valoración artística del propietario y la lectura a distancia/altavoces en el monitor real; el contenido largo requiere desplazamiento interior deliberado.

---
# Refinamiento de la revelación · 18/11/2026

Intervención limitada a los estilos `.finale-revealed` en `src/finale.css`. El secreto procede sin cambios de `config.finale.secret`, mostrado por Vue como texto. Antes, a 1920×1080, su tamaño era 38,4 px frente a 33,6 px del título; la proximidad de tamaños debilitaba la jerarquía. Ahora utiliza tinta oscura, peso 700, relieve mínimo y 52,8 px frente a 28,8 px del título. Se ajustan separación e interlineado sobre el pergamino existente. El foco de teclado conserva una marca lateral de bronce, sin el anterior rectángulo. No se modifican plantilla, lógica, textos, Wu, medios, controles, dependencias ni animaciones.

Chrome normal, contexto sintético temporal eliminado al terminar, Vite en http://localhost:5173/. Capturas reales antes/después en `.preview.local/revelation-refinement/`. Se comprobaron tres textos dinámicos (corto, medio y largo de 2749 caracteres) en 1920×1080, 1366×768 y 1280×720: contenido exacto, sin desbordamiento horizontal, último párrafo alcanzable y controles dentro de la pantalla. En las resoluciones menores el secreto mide 47,824/44,8 px y el título 22,5456/21,12 px. El límite interior de altura evita desplazar los controles; el texto largo conserva desplazamiento vertical accesible.

Inspección visual de las capturas antes/después, incluida la inscripción corta a 1920×1080, media a 1280×720 y larga a 1366×768. Se revisó también el fallo con y sin el bloque nuevo: sus selectores no corresponden a ese estado y su composición se mantiene; las capturas no son idénticas byte a byte por los efectos temporales existentes. No se certifica identidad de píxeles de escenas animadas.

`npm test`: 121/121. `npm run typecheck`, `npm run build` y `git diff --check`: salida 0. Logs privados `.preview.local/revelation-{test,typecheck,build,diff}.log` y `revelation-{before,after}.log`. Arnés de medidas privado `revelation-check.mjs`, sin añadir pruebas permanentes para esta intervención CSS. Sin commit ni push. Pendiente únicamente la valoración del propietario en el monitor externo y a distancia real; las capturas no acreditan esas condiciones físicas.

---
# Calidad cinematográfica del santuario — corrección P0/P1 · 18/11/2026

Trabajo local sobre `feat/upgrade-prologue-art`, conservando los cambios anteriores. Se reprodujeron los estados reales con datos sintéticos, sin tocar perfiles del propietario. Sin staging, commit, push, dependencias o recursos multimedia nuevos.

## Causas demostradas y correcciones

- **Confirmación pública invisible:** un clic físico sobre portada después del fallo sí alcanzaba el botón, pero `confirmations.request` quedaba pendiente y no existía ningún `dialog` en el documento. `App.vue` montaba `ConfirmationDialog` solo con `isAdmin`. Ahora el diálogo existente se monta también durante el santuario público y se cancela al salir. Esto repara portada y las restauraciones/repeticiones que necesitan confirmar, sin duplicar el sistema de confirmación ni alterar CAS/Web Lock.
- **Restauración estable sin señal:** el controlador ya generaba una ejecución estable conservando intentos, pero la pantalla podía parecer idéntica. Ahora el borrador temporal se limpia y aparece el aviso accesible «Escena restablecida. Podéis continuar.». Una restauración durante el clímax cancela sus efectos y mantiene la victoria ganada. El cambio de ejecución cancela también las animaciones CSS finitas del escenario; se verificó que el polvo dejaba de correr al restablecer un fallo con movimiento normal.
- **Respuesta rechazada perdida:** solo se conservaba en el formulario y se limpiaba al cambiar `runId`. La nueva orden autoriza conservar únicamente la última respuesta rechazada en `finales[perfil].rejectedAnswer = { text, turn }`, dentro del control existente. La validación no cambia. El valor exacto se muestra solo en su fallo, se mantiene al restablecer/recargar y se retira del progreso activo al pasar de turno, reintentar o acertar. Un valor de otro turno o una frase normalizada igual a la solución no se presenta. Vue escapa su contenido; no hay `v-html`. Los canales no llevan el texto y el JSON de configuración no incluye progreso.
- **Contenido desplazado:** la antigua columna derecha centraba el título fuera del sello. El contenido previo al pergamino comparte ahora el eje del portal (50% del recurso), anchura relacionada con su diámetro, Wu lateral y tamaño tipográfico limitado. El título inicial utiliza dos líneas equilibradas. Los integrantes se muestran exclusivamente en `call1`/`call2`; después queda una identidad de clan común con su color original. El error aprovecha ese espacio para la cita rechazada.
- **Fracaso monocromo y controles genéricos:** la piedra vuelve al azul petróleo, con fisuras carmesí, inscripciones violeta y reflejos fríos contenidos. La identidad del clan no se desatura ni se recolorea. Acciones de aventura, clan, fracaso y secundarias comparten relieve, ornamentos originales y estados hover/pressed/focus, con jerarquía distinta. El pergamino conserva su presentación y contenido; solo se actualizan los controles secundarios del santuario.

La reproducción anterior está en `.preview.local/sanctuary-quality/diagnosis.json`, `before-error-1920.png` y `.preview.local/sanctuary-before.log`. Identifica `hit:true`, `pending:true`, `dialogMounted:false`, `scene:finale`; no se atribuyó el fallo a una capa que interceptase el ratón.

## Verificaciones ejecutadas

- `npm test`: **121/121**, salida 0. Nuevo test de respuesta exacta/turno, restauración/lectura, retirada al avanzar/reintentar/acertar, valor malformado y solución nunca persistida como propuesta. Adaptados los contratos anteriores de rosters y propuesta rechazada, manteniendo pruebas de modelo, Vue, CAS, recuperación y perfiles.
- `npm run typecheck`, `npm run build`, `git diff --check`: salida 0. Logs privados `.preview.local/sanctuary-{test,typecheck,build,diff}.log`; procedimiento Windows con NODE_OPTIONS restaurado.
- **P0 antes del acabado:** 32 tests del desenlace y `sanctuary-phaseA-smoke.log` pasan antes de los cambios de composición. Una primera ejecución del arnés necesitó esperar al evento de cambio de movimiento reducido antes de buscar una fase animada; fue una espera de ensayo corregida, no un fallo del juego.
- **Interacción física:** `tests/sanctuary-quality.smoke.mjs`, Chrome normal **157.0.8103.52**, contexto temporal aislado eliminado al terminar. Eventos reales `Input.dispatchMouseEvent` y Enter; se comprueba `elementFromPoint` sobre el botón antes de pulsar. Portada/confirmación/retorno comprobados desde introducción, formulario, primer fallo, segundo fallo y victoria. Restaurar limpia un borrador sin gastar intentos, conserva la respuesta de un fallo y funciona durante el clímax con confirmación. Configuración y progreso de otros perfiles se conservan.
- **Respuesta real y aislamiento:** frase con espacios, tildes y puntuación conservada exactamente. Segunda propuesta `<b>Hierro & sombras</b>` mostrada literalmente y sin elemento HTML `b`. Recargar mantiene su valor; cambiar a Urbanización no expone la respuesta del Colegio y volver la recupera. Pasar al clan 2 retira la primera cita y mantiene el turno correcto; no hay un reintento individual que salte la historia.
- **Geometría e identidad:** 15 comprobaciones de cinco estados en **1920×1080, 1366×768 y 1280×720**. Título a menos de 3 px del eje horizontal del sello, Wu separado de la caja del contenido, acción posterior a la cita y ningún desbordamiento horizontal. Color del nombre del primer clan idéntico al configurado en llamada, formulario y fallo; la segunda llamada comprueba sus datos reales. Capitán sintético de nombre largo y todos los miembros en sus llamadas, cero filas de integrantes fuera de ellas. Capturas inspeccionadas de inicio, llamada, respuesta, giro y fracaso.
- **Regresión del recorrido completo:** `tests/finale-ceremony.smoke.mjs` también **PASS, salida 0**, después de las correcciones: NO/SÍ, dos turnos/giro, capitán, acierto temprano, concurrencia, reintento conjunto, restauración/reinicio/repetición, perfiles, pergaminos cortos/largos, medios ausentes y movimiento reducido. Log `.preview.local/sanctuary-ceremony-smoke.log`.

Sin excepciones de runtime ni solicitudes HTTP externas en los ensayos. Se utiliza CDP con página activa para evitar suspensión de renderizado por oclusión de Windows; no se modifica el reloj del juego. Vite comprobado en **http://localhost:5173/**. No se desconectó físicamente internet ni se certificó lectura desde el monitor externo.

## Archivos, evidencia y límites

Fuente modificada en esta misión: `src/App.vue`, `FinaleStage.vue`, `FinaleControls.vue` (ayuda privada ajustada al nuevo contrato de respuesta), `finale.ts` y `finale.css`. Tests: `finale-cinema.test.mjs`, `finale-presentation.test.mjs`, nuevo `finale-rejected.test.mjs` y nuevo `sanctuary-quality.smoke.mjs`. Documentación: PROJECT, DEVELOPMENT, FINALE y esta evidencia. No se modifica `usePresentation.ts`, la arquitectura de almacenamiento/sincronización, la normalización de respuestas o los medios privados.

Evidencia actual: `.preview.local/sanctuary-quality/quality-qa.json`, `initial-*`, `clan-*`, `response-*`, `failure-*`, `truth-*`, `victory-preserved.png` y `.preview.local/sanctuary-quality-smoke.log`. Los artefactos anteriores se conservan. Los fallos históricos sin respuesta guardada no pueden recuperar palabras ya descartadas: no se inventa un valor.

Pendientes humanos: aceptación artística definitiva y lectura a distancia en el monitor/altavoces reales. La comprobación visual aquí es de navegador normal a las resoluciones indicadas, no un ensayo físico de proyección.

---

## Evidencia histórica conservada

Las revisiones anteriores describen el estado de su momento. Sus reglas sobre no conservar respuestas o sobre fracaso monocromo quedan sustituidas por la misión actual; la guía vigente es [FINALE](FINALE.md).

# Atmósfera de error — revisión visual · 18/11/2026

Intervención autorizada sobre los fallos de la ceremonia final, conservando íntegro el estado local anterior. Fuente visual modificada únicamente en `src/FinaleStage.vue` y `src/finale.css`; documentación en esta evidencia y [FINALE](FINALE.md). No cambian modelos, fases, validación, textos, navegación, perfiles, sincronización, efectos GSAP/Canvas o medios originales. No hay dependencias nuevas, staging, commit ni push.

## Auditoría y resultado

La escena anterior mantenía arquitectura limpia, linternas cálidas, anillos de energía, título dorado, color de clan intenso y halo luminoso de Wu, incluso después de fallar. Se capturó antes de editar a **1920×1080** con datos sintéticos. La mejora combina desaturación del material, luz residual localizada con borde suave, oscurecimiento lateral y del suelo, grietas y abrasión de piedra, telas envejecidas/rasgadas, raíces discretas y polvo bajo. Los detalles decorativos siguen la perspectiva del santuario existente y no reciben eventos ni son accesibles al lector de pantalla. Wu conserva su ilustración y diálogo con tratamiento de luz solemne; marfil envejecido en el mensaje y controles de alto contraste. No hay terror explícito ni nuevos personajes.

Se inspeccionaron las capturas antes/después en **1920×1080**, y el resultado a **1366×768** y **390×844**. También se capturó e inspeccionó el escenario con mensaje/personaje/controles ocultos solo en el navegador sintético (`scene-only-after-1920.png`), para valorar la atmósfera independientemente de la interfaz. La pérdida de luz/color y las huellas de desgaste se aprecian sin leer el mensaje. Los movimientos de niebla/polvo duran una ejecución de 10/12 s y no continúan indefinidamente; movimiento reducido los elimina.

## Verificación real

- `npm test`: **120/120**, salida 0. `npm run typecheck`, `npm run build` y `git diff --check`: salida 0. Logs `.preview.local/error-{test,typecheck,build,diff}.log`.
- Comparación directa de `textContent` antes/después: **idéntico**, incluidas instrucciones, integrantes y acciones. No se inventan mensajes nuevos.
- Captura estable de victoria a 1920×1080 **idéntica byte por byte** antes/después: SHA-256 `4A77223B635526EF040F5FC13DF7DDA6D26F6A1E82387C80B41CDF136978D63A`. Decoración de ruina ausente en victoria y secreto exacto conservado.
- Ensayo visual dirigido en Chrome normal CDP, contexto aislado eliminado al terminar: error sin scroll horizontal en 1366/390, victoria estable, cero excepciones de runtime y cero solicitudes HTTP externas. `.preview.local/error-after.log`: salida 0.
- `tests/finale-ceremony.smoke.mjs` ejecutado de nuevo tras el cambio: **PASS, salida 0**, Chrome normal **157.0.8103.52**, Vite **http://localhost:5173/**. Conserva ambos turnos, NO/SÍ, giro, capitán, envíos públicos/privados simultáneos, reintento conjunto, acierto temprano, recuperación, controles, aislamiento de perfiles, secretos cortos/largos, medios ausentes y movimiento reducido. No se altera almacenamiento del propietario. Log `.preview.local/error-ceremony-smoke.log` y resultado actualizado del recorrido bajo `.preview.local/finale-11-3/qa.json`.

Comparativa privada: `.preview.local/error-atmosphere/failure-before-1920.png`, `failure-after-1920.png`, `failure-after-1366.png`, `failure-after-390.png`, `scene-only-after-1920.png`, `victory-before-1920.png`, `victory-after-1920.png` y `visual-before/after.json`. El reproductor y las capturas del recorrido de ceremonia siguen bajo `.preview.local/finale-11-3/`.

## Límites y mejora opcional

El recurso base conserva la silueta arquitectónica original: se envejecen superficies y se extingue su iluminación; no se simulan columnas completas derrumbadas o estatuas nuevas con geometría CSS. Para un deterioro estructural más profundo haría falta una ilustración específica autorizada, pendiente y no incluida. No se generan ni sustituyen imágenes en esta intervención.

Las pruebas confirman ausencia de peticiones externas y uso exclusivo de recursos locales; no se desconectó físicamente internet ni se certificaron monitor externo, lectura a distancia o altavoces. La aceptación artística definitiva corresponde al propietario.

---

# Hito 11.3 — la ceremonia del último secreto · 18/11/2026

Implementación local en `feat/upgrade-prologue-art`. La orden autoriza esta ampliación del desenlace; se conservan el trabajo previo, perfiles reales y recursos aprobados. No hay staging, commit, push ni publicación. Esta evidencia técnica/artística de implementación no sustituye la aprobación del propietario.

## Diagnóstico e intervención

El modelo anterior admitía una sola pregunta, revelaba cooperación tras el primer fallo y presentaba el secreto como una franja oscura. Se revisaron las capturas locales sintéticas anteriores (`.preview.local/finale-11-1/failure-1920.png` y `success-1920.png`). Ahora el progreso existente contiene turnos/fases explícitos, confirmaciones de pistas sin caducidad, intentos separados y proclamación del capitán 1. La configuración v5 y el campo personalizado no pierden datos; este último se muestra solo después del giro. No hay fallos fabricados si un clan acierta temprano.

Wu se reutiliza de la ilustración local aprobada con máscara y recorte de presentación, sin alterar el archivo. Un intento de extracción mediante la generación integrada fue rechazado por moderación; no se reintentó mediante evasión ni se usaron servicios de pago. El pergamino es un documento de lectura adaptable con aspecto material, tinta oscura, rodillos, bordes, ornamentación y sello original. No se genera ni sobrescribe ningún medio privado.

## Primera revisión — narrativa, datos y funcionamiento

- `npm test`: **120/120**, salida 0. Tests de modelo, guion, componentes compilados, controladores, almacenamiento y transportes simulados. No se presentan como navegador físico.
- Se comprueban preparación de capitanes, todos los miembros/capitán primero sin mutación, normalización de progreso anterior en memoria, combinaciones de fase/estado y transiciones válidas, turnos NO/SÍ, dos derrotas, aciertos individuales honestos, reintentos conjuntos, restore/restart/replay, confirmaciones obsoletas y separación por perfil.
- Un único controlador usa Web Lock/CAS e historial/journal existentes. Los tests conservan el caso de acuse inmediato con movimiento reducido esperando a que se libere su propia escritura. Propuestas no persistidas ni enviadas por canales; nombres/secretos reales no se usaron en el ensayo.
- `npm run typecheck`, `npm run build` y `git diff --check`: salida 0. Sin nueva biblioteca, sin lint configurado. Logs privados `.preview.local/finale113-{test,typecheck,build}.log` y `finale113-diff.log`. NODE_OPTIONS se restaura tras seguir el procedimiento Windows documentado.

## Segunda revisión — composición y movimiento reales

`tests/finale-ceremony.smoke.mjs` **PASS, salida 0**, Chrome **157.0.8103.52 normal**, CDP loopback 9224 y Vite **http://localhost:5173/**. Contexto sintético temporal eliminado al terminar; ambos perfiles tienen 16 participantes, 8 por clan, incluyendo capitán sintético de nombre muy largo. Sin excepciones de runtime ni solicitudes HTTP externas. CDP mantiene la página activa ante oclusión de Windows, sin cambiar los relojes del juego.

El recorrido real verifica:

1. Introducción, todos los nombres del primer clan y capitán destacado; NO permanece, recarga y SÍ posterior. Envíos reales simultáneos desde administración/pública producen un intento. Primer fallo sin cooperación ni mensaje personalizado revelador.
2. Segundo clan completo, segundo fallo, giro de Wu y convocatoria del capitán del primer equipo. Fallo conjunto, reintento y foco recuperado. La solución no aparece automáticamente antes del acierto.
3. Secuencia real GSAP, convergencia, explosión, apertura y pergamino. **110 fotogramas / 17,35 s** muestreados; no equivalen a FPS de un monitor. Inspección de varios momentos de la secuencia y documento final abierto.
4. Restablecer durante repetición conserva victoria/intentos y detiene efectos. Recargar recupera un estado estable sin repetir la explosión; portada conserva progreso; volver a empezar con confirmación limpia solo el desenlace.
5. Acierto individual temprano reconocido sin derrota falsa, proclamación y entrega final; entrada privada y pública. Colegio y Urbanización conservan progreso independiente.
6. Secreto corto **CAMPEONES DEL MUNDO**, y texto sintético de **2749 caracteres**, con párrafos exactos en el DOM. A 390×844 el cuerpo interno mide 363 px, contiene 4549 px de lectura y alcanza su final (`bottom: true`). No se elimina ni trunca ningún párrafo.
7. Imagen ausente, medios locales opcionales fallidos y movimiento reducido conservan contenido y pergamino. El desplegable de medios queda después del documento.

Se inspeccionan 1920×1080, 1366×768 y 390×844: **16 comprobaciones geométricas sin desbordamiento horizontal**. Los nombres largos y el capitán se envuelven; en formato estrecho hay desplazamiento vertical natural, sin superposición del pie y los controles. Los miembros numerosos usan una zona de inscripciones desplazable y conservan todos los nombres. La revisión corrigió la máscara lateral de Wu y una regla de foco demasiado amplia que dibujaba un marco en el título; los controles y el cuerpo del pergamino conservan foco visible.

Evidencia privada en `.preview.local/finale-11-3/`: `qa.json`, `motion.json`, `animation-review.html`, `introduction-1920.png`, `clan-one-1920.png`, `first-failure-{1920,1366,390}.png`, `second-failure-*`, `cooperation-revelation-1366.png`, `captain-*`, `explosion-1920.png`, `parchment-open-1920.png`, `parchment-short-*`, `parchment-long-*`, `parchment-long-bottom-390.png` y respaldos de medios. El registro `qa.json` es el resultado vigente; `failure.json` y las copias `first/second/third-run-*` conservan fallos preliminares del arnés: fase inicial solo normalizada en memoria, etiqueta no destructiva de confirmación y espera del documento nuevo al recargar. Esas comprobaciones se corrigieron en el arnés y el recorrido final completo pasó.

La regresión separada `tests/public-window.smoke.mjs` también pasa en Chrome: nombre heredado, ventanas separadas, reutilización, URL antigua, cierre/reapertura, bloqueo inyectado y enlace manual nativo. El retorno `null` de apertura es simulado; no certifica políticas reales de bloqueo del navegador.

La última revisión detectó que las reglas de sectores apagados aún ocultaban las corrientes durante el giro. Se corrigió su prioridad solo en `truth`. Ensayo dirigido real con los dos turnos previos: ambas corrientes recuperan opacidad 0,4, sus extremos se conectan, cada grieta conserva el color de su propio clan y Wu recibe luz cálida; sin excepciones ni HTTP externo. Captura actualizada `cooperation-revelation-1366.png`, evidencia `truth-light-qa.json` y log `.preview.local/finale113-truth.log`. Esta relación visual queda también en el arnés mantenido; no altera transiciones o tiempos.

## Archivos y límites

Cambios del Hito 11.3: `src/finale.ts`, nuevo `finaleNarrative.ts`, `FinaleStage.vue`, `FinaleControls.vue`, `FinaleEditor.vue`, `useFinaleCinema.ts`, `finaleParticles.ts`, `finale.css`, `usePresentation.ts`, `App.vue`, `OrganizerPanel.vue`, `SceneController.vue`; tests `finale.test.mjs`, `finale-presentation.test.mjs`, `finale-cinema.test.mjs`, `finale-controls.test.mjs`, nuevo `finale-narrative.test.mjs`, nuevo `finale-ceremony.smoke.mjs` y alias `finale.smoke.mjs`. Se actualizan AGENTS, README, PROJECT, DEVELOPMENT, FINALE y esta evidencia. El resto del estado local anterior se conserva.

SHA-256 del santuario conservado: `5FA1DC290AFAA14F7DF526F7F7A3A40AA656677852677BBE327BAF4498144ED3`. Arte local de Wu reutilizado: `E74F394EEC6EB7B569B6B2F7A6AFAAF3DBEDFFA15FB760D82B243FDF569C3E0D`.

Pendientes: aprobación artística del propietario y ensayo físico de monitor externo, lectura a distancia, altavoces/volumen y desconexión real de internet con HTTP loopback activo. No se afirma voz grabada, labios animados, reconocimiento de voz, sincronización de vídeo ni 60 FPS. No se alteran otras escenas, pruebas, ganadores ni configuración real.

---

## Evidencia histórica conservada — Hitos anteriores

Los textos de las secciones siguientes describen revisiones anteriores, no el contrato vigente de cooperación o de controles. La guía actual está en [FINALE](FINALE.md).

# Hito 11.1 — corrección crítica del desenlace · 18/11/2026

El Hito 11 anterior **no ha sido aprobado por el propietario**. Esta corrección está implementada localmente; la aceptación artística y el ensayo físico del evento siguen pendientes. Se conserva la evidencia histórica debajo y el trabajo previo, sin staging, commit ni push.

## Causas y correcciones

- Reproducido en Chrome: una administración con `window.name = ninja-public` podía recibir su propia referencia al abrir ese destino. Se reserva `ninja-admin` al montar y antes de abrir; se rechaza una referencia a sí misma y se corrige una URL antigua en la ventana nombrada. El enlace manual usa `_blank` y `noopener noreferrer`. La referencia por sí sola nunca confirma disponibilidad; se conserva el handshake fresco.
- La previa reutilizaba medidas de pantalla completa: a 1366 px medía aproximadamente 526 × 727 (proporción 0,724). Ahora es una miniatura estática 16:9 con ilustración completa, sin formulario ni secretos, y los controles quedan después de ella en el flujo normal.
- No había entrada pública de respuesta. Ahora hay etiqueta accesible, textarea, botón, Enter y reintento con foco/campo vacío. Ambas entradas comparten el controlador, Web Lock y CAS; una prueba concurrente acredita una única ejecución persistida.
- Una repetición detectó que el foco del reintento podía intentarse mientras la entrega aún deshabilitaba el campo. Se espera al renderizado y al fin de la acción pendiente; los callbacks de fases anteriores no recuperan el foco. Regresión de componente con un campo que rechaza foco deshabilitado y comprobación real de `document.activeElement` tras reintentar.
- El ensayo largo con movimiento reducido detectó un acuse inmediato mientras el mismo controlador público aún liberaba su envío: el renderizador había terminado, pero el progreso quedaba pendiente. `finishFinale` espera al cierre de la escritura activa y vuelve a leer perfil, ejecución y CAS antes de asentar. La prueba reproduce esa intercalación y rechaza también un acuse obsoleto; sin nuevos temporizadores ni almacenes.
- La narrativa inicial revelaba la cooperación. Ahora usa los textos aprobados de espera; la pista obligatoria aparece después de un fallo validado, junto al mensaje personalizado sin sobrescribirlo. Victoria y revelación usan los nuevos textos y conservan el secreto configurado íntegro. El recorrido del dashboard incluye el paso 6.

## Evidencia del Hito 11.1

`npm test`: **111/111**; `npm run typecheck` y `npm run build`: salida 0. `tests/finale.smoke.mjs` ejecutado en **Chrome 157.0.8103.52 normal**, CDP loopback 9224, Vite **http://localhost:5173/**, datos sintéticos en contexto aislado eliminado al acabar. Verifica envío público por Enter, fallo/pista/reintento con foco, acierto, convergencia/estallido/apertura/victoria/revelación, envío privado, repetición, reinicio confirmado, recarga, tres ciclos de movimiento reducido, ambos perfiles, Ñ/N y respaldo sin Canvas/medios. Miniaturas medidas 16:9 en 1920×1080, 1366×768 y 390×844; escenas habituales sin desbordamiento horizontal ni vertical.

`tests/public-window.smoke.mjs` verifica dos destinos reales distintos desde **Preparar pantalla pública**, administración conservada, nombre heredado y cambiado después del montaje, repetición sin duplicados, reparación de ventana nombrada en Oráculo, cierre/reapertura y enlace manual nativo a pestaña separada. El rechazo de apertura se simula devolviendo `null` desde `window.open` en ese contexto; no acredita una política real de bloqueo de Chrome.

El recorrido final completo termina con salida 0, sin excepciones de runtime ni solicitudes HTTP externas. Incluye respuesta pública larga por Enter, fallo personalizado íntegro junto a la pista y secreto de **2879 caracteres** íntegro a 390×844: desplazamiento vertical natural, sin scroll horizontal, pie situado después del contenido y dentro de la escena. Medidas de miniatura: **793,03×446,08**, **525,98×295,85** y **309,60×174,15**; en los tres casos controles debajo y sin desbordamiento horizontal. Captura temporal: **54 fotogramas / 8,99 s**, sin afirmar FPS del monitor. `git diff --check`: salida 0. SHA-256 del santuario conservado: `5FA1DC290AFAA14F7DF526F7F7A3A40AA656677852677BBE327BAF4498144ED3`.

Capturas privadas comparativas y registros en `.preview.local/finale-11-1/`: `before-preview-1366.png`, `preview-1920.png`, `preview-1366.png`, `preview-390.png`, `ready-*`, `failure-*`, `phrase-1920.png`, `success-*`, `window-qa.json`, `qa.json` y `animation-review.html`. Las capturas revisadas muestran la miniatura completa y sus controles separados, entrada pública, fallo con pista y estados de victoria/revelación. No se dispuso de las capturas originales mencionadas en la orden: la comparación anterior procede de una reproducción local del defecto.

No se certifican 60 FPS, monitor externo físico, altavoces, lectura desde el público ni desconexión real de internet. No se modifican dependencias ni recursos visuales en esta corrección. La aprobación del propietario sigue pendiente.

En repeticiones del ensayo, Windows dejó la ventana de prueba oculta aunque Chrome aceptaba `Page.bringToFront`; la secuencia permaneció en escucha por suspensión del renderizado. El arnés comprueba visibilidad y utiliza la [emulación oficial de página activa de CDP](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setFocusEmulationEnabled) solo en los destinos aislados. No altera relojes, timelines, almacenamiento ni código del juego. El primer recorrido completo también pasó sin esa emulación; no se confunde esta comprobación con foco físico del monitor.

---

# Hito 11 — desenlace cooperativo integrado · 18/11/2026

Implementación local sobre `feat/upgrade-prologue-art`, conservando los cambios previos de imprimibles y documentación. Autorización explícita del Hito 11, sin ampliar CSV, entrega de pistas, puntuación o adjudicación. Configuración v5 vacía por defecto, escena `finale`, editor/controles privados, progreso por perfil en el control existente y secuencia GSAP/Canvas. No se modifica el Oráculo, portada, ceremonia, pruebas ni medios anteriores. Guía reproducible y referencias revisadas en [FINALE](FINALE.md).

## Verificación técnica real

- `npm test`: **108/108**, salida 0. Incluye 20 nuevas pruebas de contrato, migraciones v2/v3/v4, aislamiento/CAS, configuración ausente, normalización, Ñ/N, límites, fallos repetidos, victoria, navegación, repetición/reinicio, journal interrumpido, acuses duplicados, recuperación y confirmaciones obsoletas. Las expectativas de catálogo/v5 y fixtures de versiones anteriores se adaptaron a los contratos nuevos sin retirar sus regresiones.
- `npm run typecheck`, `npm run build` y `git diff --check`: salida 0. Npm-cli detectado desde npm.cmd, preserve-symlinks y NODE_OPTIONS temporal restaurado. No hay lint. GSAP **3.15.1** es la única dependencia de runtime nueva, gratuita bajo licencia Standard No Charge; no se añadieron Three.js, plugins de pago ni servicios externos.
- Tests de componente usan Vue compilado y GSAP real con renderer sintético: tiempos de frase/secreto, limpieza/cancelación, preview sin secretos, recarga sin timeline duplicada, movimiento reducido, fallos de medios y Canvas acotado. Los tests de controller usan almacenamiento/Web Lock/transportes simulados; no se confunden con el ensayo siguiente.
- Defectos corregidos durante integración: campo de prototipo aceptado por `key in` (regresión ahora exige Object.hasOwn), tipo nullable en control de reset, `import.meta` dentro de template incompatible con compilación Vite (movido a script), confirmación pendiente tras desmontaje/cambio de revisión, y silenciamiento de vídeo/audio ligado a control y consentimiento. Ninguno permanece como fallo conocido.

## Chrome real y dos ventanas

`node --preserve-symlinks --preserve-symlinks-main --experimental-strip-types tests/finale.smoke.mjs`: **salida 0** en Chrome normal **157.0.8103.52**, CDP loopback 9224 y Vite **http://localhost:5173/**. Contexto sintético aislado creado/eliminado por el script, con administración y pública compartiendo solo ese almacenamiento; sin leer/escribir perfiles reales.

Comprobado: final bloqueado antes de configurar; guardado explícito desde editor; pantalla pública confirmada por handshake; colores configurados; secreto/frase ausentes del DOM inicial; envío mediante **Enter real**; fallo/reintento; convergencia, explosión, apertura, frase y secreto; activación explícita de sonido; mensajes duplicados sin nueva ejecución; previa dormida aun tras victoria; repetición; recarga durante repetición con resultado estático; reinicio confirmado con propuesta limpia; tres ciclos con movimiento reducido; perfiles independientes; Ñ/N; error de vídeo/audio local con respaldo legible; Canvas sin contexto 2D en una pública nueva y resultado reducido legible.

`qa.json`: cero excepciones JavaScript y cero solicitudes HTTP externas observadas. Un 404 de favicon es ajeno al desenlace. Los medios de ensayo ausentes pueden recibir HTML 200 del fallback SPA de Vite: se verificaron los eventos de error del elemento y el respaldo, no se tomó HTTP 200 como prueba de reproducción. No equivale a desconectar físicamente internet ni escuchar altavoces.

## Revisión artística y evidencia

Capturas privadas en `.preview.local/finale/`: `ready-1920.png`, `failure-1920.png`, `convergence-1920.png`, `burst-1920.png`, `burst-peak-1920.png`, `opening-1920.png`, `phrase-1920.png`, `success-1920.png`; variantes 1366×768 y 390×844, medios ausentes, Canvas ausente y previa privada. Se abrieron e inspeccionaron inicio, fallo, clímax, apertura, victoria y móvil. Se aprecia centro de interés continuo, dos corrientes cromáticas, rayos expansivos finitos, apertura óptica, secreto dominante y reposo estable. El fallo deja el secreto oculto y comunica recuperación sin humillación.

Registro real `Page.startScreencast`: **96 fotogramas durante 7,15 s** desde convergencia hasta apertura. `motion.json` conserva tiempos y `animation-review.html` permite reproducirlos; se inspeccionaron también fotogramas de progresión. Es un muestreo del navegador, no un vídeo de alta frecuencia ni una medición de 60 FPS. Diagnósticos `failure*.png/json` de intentos iniciales permanecen privados; la evidencia vigente es `qa.json` de la ejecución final correcta.

Geometría comprobada en 1920×1080 y 1366×768 para textos de ensayo; 390×844 sin desbordamiento horizontal. Secretos largos permitidos sin truncar pueden necesitar scroll. No se afirma ensayo físico a distancia, lector de pantalla completo, GPU/memoria prolongados o funcionamiento de todo el monitor extendido por estas capturas.

Fondo exclusivo generado mediante image_gen integrado: `public/private-media/finale-sanctuary.png`, **1672×941**, inspeccionado, SHA-256 **5FA1DC290AFAA14F7DF526F7F7A3A40AA656677852677BBE327BAF4498144ED3**. El prompt exacto está en el `.prompt.txt` privado adyacente. Nueva imagen original, sin logos ni modificación de imágenes anteriores; no se ejecutaron pipelines externos de pago ni API propia. Ambos archivos siguen ignorados por Git. La solicitud de tamaño superior del prompt no se presenta como dimensión realmente obtenida.

## Entrega y pendientes físicos

Vite permanece disponible en http://localhost:5173/ (HTTP 200), terminal de ejecución persistente; no se afirma integración controlada con VS Code. Probar desde administración → Desenlace final → configurar/guardar → Mostrar el final → entregar propuesta, según FINALE. Configuración y exportación contienen secretos: conservar privadas. Builds con medios también privados.

Pendientes: aceptación artística del propietario, lectura desde el monitor externo, altavoces/volumen, ensayo de teclado/lector de pantalla completo, vídeo y música definitivos del evento, y desconexión física de internet. No quedan defectos funcionales relevantes detectados en el alcance ensayado. Sin staging, commit, push, merge, reset, clean, publicación o cambios de main.

---
# Imprimibles premium — cuatro piezas completas · 17/11/2026

La indicación posterior del propietario permitió localizar `public/private-media/colegio/pistas/`: cuatro PDF individuales y un conjunto de cuatro páginas. Se conservaron todos sin mover ni sobrescribir. Los renderizados de cada individual y su página correspondiente del conjunto son idénticos por SHA-256. La muestra anterior se conserva separada; ya no representa el alcance final.

## Contenido y límites del cotejo

Los originales contienen una imagen por página y ninguna fuente/texto extraíble: PDF.js devuelve texto vacío. Se abrieron las cuatro páginas y se transcribieron/cotejaron visualmente títulos, texto, identificación literal y pie romano. No se inventaron ubicaciones, mensajes ni relaciones con equipos reales. El orden de archivo y de ruta se conserva. Los cuatro JSON privados incluyen referencia y SHA-256 del original; la generación se detiene si cambia esa fuente.

La comparación automatizada certifica que todo el texto del PDF nuevo coincide con el JSON transcrito, con normalización únicamente de espacios de maquetación y Unicode. La fidelidad al raster original procede del cotejo visual, no de una extracción textual imposible ni de OCR declarado. Se mantiene esta distinción en las instrucciones.

## Archivos e inspección visual real

- `printables/output/pista-01-premium.pdf` … `pista-04-premium.pdf`: cuatro piezas independientes de una página. HTML de cada una en la misma carpeta. Datos locales `printables/content/pista-01.json` … `pista-04.json`; fuentes comunes `printables/src/template.mjs`, `print.css` y `generate.mjs`.
- `printables/previews/pista-01-premium.png` … `pista-04-premium.png`: renderizados del PDF real a **300 ppp, 2479 × 3508 px**, no capturas HTML. Se abrieron e inspeccionaron las cuatro páginas: colección coherente, títulos dominantes, identificación y pies correctos, lectura de 15 pt, sin cortes/solapamientos visibles y cartuchos vacíos integrados. Cada página tiene `.txt` extraído y `.qa.json` de evidencia.
- Formato CSS **A4 vertical**, medida real PDF **209,889 × 297,011 mm**, redondeo de Chrome dentro de 0,3 mm. Márgenes seguros de **12 mm**. Cartucho útil **150,002 × 47,999 mm**; el marco exterior reservado del original mide aproximadamente **148 × 28 mm** en su raster, así que se amplía el espacio disponible. Medida de origen aproximada, no ensayo físico.
- Tres subconjuntos de fuentes incrustados: Georgia Bold, Trebuchet MS y Trebuchet MS Bold. Tablas OS/2 de las fuentes locales: `fsType=8`, sin restricción de subconjuntos ni solo bitmap. Sin descargas/copias de archivos de fuente, nuevas ilustraciones o modificaciones de recursos aprobados. Ornamentación/textura vectorial original; texto nuevo seleccionable.
- Chrome normal **157.0.8103.52**, CDP loopback 9224, contextos aislados y servidor HTTP temporal propio. Cero excepciones JS y cero HTTP externo observado en las páginas generadas. No se accede a almacenamiento, perfiles ni sincronización del juego.
- Renderizados de origen y metadatos bajo `printables/previews/originals/`. Herramienta de inspección privada en `.preview.local/inspect-pdf-originals.mjs`. Los reportes privados identifican las huellas del original y del PDF nuevo; no se copian los textos secretos a la documentación pública.

## Verificaciones ejecutadas

- Generación individual, inspección y regeneración de las cuatro piezas: salida 0. PDF y PNG de las cuatro piezas idénticos entre regeneraciones por SHA-256; evidencia privada en `printables/previews/reproducibility.json`. Tamaño, página única, texto completo, tres fuentes incrustadas, separación de bloques y ausencia de desbordamiento comprobados automáticamente; revisión artística realizada sobre sus PNG.
- `npm test`: **88/88**, salida 0; `npm run typecheck`: salida 0; `npm run build`: salida 0; `git diff --check`: salida 0. Npm-cli detectado desde npm.cmd, preserve-symlinks y NODE_OPTIONS temporal restaurado. Logs finales privados en `.preview.local/printables-final-*.log`. No se modificaron tests existentes. Los tests del juego son simulados; exportación/renderizado PDF sí se ejecutaron en Chrome real.
- PDF.js **6.5.438**, una herramienta instalada bajo `printables/`, con package/lock propios. No cambia ninguna dependencia o script del juego. En la preparación inicial, npm restringido falló con `ENOTCACHED`; instalación autorizada con acceso al registro, caché privada, sin scripts ni dependencias opcionales: salida 0.
- Incidencias de la preparación de la muestra resueltas: intención `print` para no depender de cuadros de animación en pestaña de fondo; liberación mediante `PDFDocumentLoadingTask.destroy()`. Durante la inspección de originales se ajustó `getDocument` al objeto `{ url }` que exige la versión instalada; ejecución posterior correcta de las ocho páginas (individuales/conjunto). No hay errores pendientes del generador.
- Contenido, PDF, HTML y PNG nuevos ignorados fuera de `public/`/`dist/`. Los originales ya situados por el propietario bajo `public/private-media/` se copian al build privado como cualquier medio de esa carpeta; no se publica ese build. Sin cambios en runtime, perfiles, almacenamiento o recursos del juego. Trabajo previo conservado, sin staging, commit, push, merge, reset, clean ni publicación.

## Impresión pendiente

Revisar físicamente al **100 % / tamaño real**, color, lectura infantil y escritura/adhesión en el cartucho. Pendiente aceptación del propietario; no se declara impresión física realizada. Instrucciones reproducibles en [printables/README.md](../printables/README.md). La herramienta no requiere Vite ni internet después de instalarse. El servidor del juego se mantiene en su origen habitual.

---
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
