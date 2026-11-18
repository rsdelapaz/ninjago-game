# La ceremonia del último secreto — Hito 11.3

El desenlace integrado utiliza los equipos reales del perfil activo y la validación existente. El Oráculo independiente conserva su contrato. No hay respuesta predeterminada, reconocimiento de voz ni cambios en otras escenas.

## Preparación

1. Ejecutar `npm run dev` en la raíz del proyecto. URL comprobada: **http://localhost:5173/?screen=admin**. El procedimiento de Windows está en [DEVELOPMENT](DEVELOPMENT.md); la terminal de Codex no se presenta como terminal integrada de VS Code.
2. Elegir el perfil y preparar ambos equipos con nombre definitivo, color, integrantes y capitán perteneciente al equipo. No se inventa un capitán ni se añade una propiedad de cumpleaños. El primer capitán protagoniza el último acto. Los problemas se muestran al organizador y bloquean la escena.
3. En **Desenlace final**, introducir frase correcta y texto secreto. Guardar no muestra la escena. **Mostrar el final** exige preparación completa y handshake público fresco.
4. Vídeo/audio final opcionales por nombre local dentro de `public/private-media/<perfil>/`; nunca URL o binarios en JSON. Configuración v5 conservada, límites sin recortes: frase 256 caracteres normalizados (entrada bruta 1024), secreto 3000, mensaje adicional 280. Ñ y N siguen siendo diferentes.
5. El campo de error existente se conserva íntegro, pero su nueva semántica es **mensaje adicional tras el giro de Wu**: se publica en la revelación de cooperación y en fallos conjuntos después del segundo turno fallido. No se muestra durante los turnos individuales ni se intenta interpretar automáticamente su texto. Leer/importar no lo reescribe.

## Recorrido público

| Momento | Comportamiento |
| --- | --- |
| Presentación de Wu | El sello espera; comenzar la ceremonia es una acción explícita. |
| Primer clan | Nombre, emblema original del color configurado y todos sus integrantes; capitán primero y destacado, resto en orden español sin modificar los datos. Acercarse al sello abre la pregunta sobre las pistas. |
| Confirmación SÍ/NO | NO permanece en ese clan y permite buscar; SÍ abre la respuesta. Las preguntas no caducan. |
| Primer fallo | Reacción del sector del primer color durante 3,5 s; Wu reconoce su esfuerzo y ofrece llamar al segundo clan. No se menciona cooperación. |
| Segundo clan | Su nombre, capitán, integrantes, color y confirmación independiente. |
| Segundo fallo | Reacción de 5,5 s, ambos sectores apagados y silencio. Escuchar a Wu revela el giro; **UNIR LAS PISTAS** permite construir físicamente la frase, sin mostrar la solución. |
| Capitán | Se llama al capitán del primer equipo; después de su convocatoria se habilita la proclamación y entrega final. |
| Fallo conjunto | Se mantiene este acto y permite nuevos intentos, sin volver a los turnos individuales. |
| Acierto individual inesperado | Se reconoce el acierto y se pasa directamente a la convocatoria del capitán; nunca se fabrica una derrota. El capitán puede proclamar y entregar esa frase final. |
| Acierto final | Secuencia GSAP de 4 s: anticipación, inscripciones, convergencia, estallido, apertura de sectores, cámara y materialización de la reliquia. Frase a unos 2,99 s y secreto a unos 3,55 s. Las etiquetas internas mantienen su orden, con timeScale 15/4 solo para victoria. |

El campo público y el privado usan el mismo controlador, Web Lock y CAS. Enter entrega una frase, Shift+Enter permite una nueva línea que la validación puede rechazar como control; no hay escucha del micrófono. Solo la última respuesta rechazada se conserva ahora, con su texto exacto y turno, en el progreso existente del perfil; se muestra únicamente en su resultado. Desaparece del progreso activo al avanzar, reintentar, acertar o volver a empezar. Restablecer y recargar conservan ese resultado. La frase correcta introducida no se persiste como propuesta, y los canales siguen sin transportar textos. Los fallos históricos sin respuesta registrada no inventan una frase. La entrada privada permite al organizador transcribir lo que dice el capitán.

## Pergamino y composición

Wu reutiliza visualmente `public/private-media/ninjago-key-art.png` con recorte y máscaras de presentación; el archivo no cambia. El santuario sigue siendo `public/private-media/finale-sanctuary.png`, con respaldo local si falta. No se produjo un recurso nuevo: el intento integrado de recorte fue rechazado por moderación y se escogió la reutilización autorizada, sin API externa de pago.

La revelación «El corazón del sello» reúne santuario, sello iluminado y una reliquia central de piedra con silueta octogonal. Reutiliza la textura raster del santuario original como material, sin modificar medios. La inscripción en oro usa relieve y luz contenidos: hasta 28 caracteres alcanza unos 109 px a 1080p; textos medios y largos tienen escalas menores y conservan exactamente su contenido. El encabezado queda separado por encima, Wu dispone de zona lateral propia con nombre y subtítulo completos, y la frase emocional permanece íntegra debajo. El cuerpo mantiene desplazamiento interior accesible para secretos largos. Repetir revelación es la acción dorada destacada; restaurar y portada mantienen metal oscuro y sus eventos existentes. El vídeo/audio opcional permanece en el desplegable posterior.

La previa privada sigue siendo estática 16:9: no monta personajes reales, formulario, Canvas, frase, secreto ni medios finales. La edición privada sí contiene sus campos. El estallido conserva 156 partículas como máximo y DPR 1,5; aporta planos de fragmentos y estelas, onda secundaria, sectores y cámara en lugar de incrementar el presupuesto. Movimiento reducido ofrece directamente estados estables legibles.

## Atmósfera de los fallos

El fallo conserva piedra azul petróleo y sombras, con fisuras carmesí, inscripciones violeta contenidas y reflejos fríos. No se aplica un gris global; el emblema y nombre del clan mantienen exactamente su color asignado. Las marcas de desgaste, telas, polvo y niebla siguen siendo SVG/CSS no interactivo, sin sustituir recursos. Los movimientos ambientales son finitos y se anulan con movimiento reducido. La primera derrota afecta al primer sector, y el turno del segundo clan sigue siendo una acción explícita.

La composición previa al pergamino se centra sobre el eje real del sello (50% de la ilustración), con una anchura relacionada con su diámetro y Wu lateral. El título inicial se distribuye en dos líneas; los nombres del equipo usan un único emblema, color y escala en todas las fases. La lista completa solo aparece en las llamadas `call1` y `call2`; las pantallas posteriores identifican el clan sin fichas de integrantes. El acto del capitán mantiene su nombre narrativo, sin repetir el resto del equipo. La victoria utiliza la composición «El corazón del sello», autorizada por la orden posterior de dirección.

Las acciones públicas usan metal ceremonial con ornamentos originales y relieve: oro para aventura, borde elemental para el clan, carmesí para fracaso y piedra para navegación secundaria. Hover, pulsación y foco tienen estados distintos, conservando botones nativos y sus áreas interactivas. La frase rechazada aparece como **VUESTRA RESPUESTA**, cita íntegra y **EL SELLO NO LA RECONOCE**, sin revelar la solución configurada ni otra respuesta de equipo.

## Controles y recuperación

- **RESTABLECER ESCENA** cancela movimiento, partículas y audio, limpia el borrador temporal y asienta el punto actual sin borrar intentos, la respuesta rechazada vigente, una victoria o configuración. En público confirma visualmente la acción con «Escena restablecida. Podéis continuar.».
- **VOLVER A EMPEZAR** vuelve a Wu y limpia exclusivamente los intentos del desenlace. Pide confirmación si existe progreso; las confirmaciones obsoletas no actúan tras cambio de perfil/revisión o desmontaje.
- **REPETIR REVELACIÓN** solo tras acertar; crea una ejecución visual nueva conservando el resultado y no pide otra respuesta.
- **VOLVER A LA PORTADA** navega por el controlador existente y conserva el progreso. No restablece el perfil.

El diálogo de confirmación existente se monta también en la pública mientras está en el santuario; se desmonta y cancela peticiones pendientes al salir. Así portada, repetición y restauración durante animaciones no quedan esperando un diálogo invisible. Se conservan las comprobaciones de revisión, configuración y desmontaje antes de ejecutar acciones. Los cuatro controles están disponibles en privado. En público se ofrecen restablecer y portada, más repetición tras victoria; portada/repetición y cancelación de una animación requieren confirmación. Reiniciar íntegramente queda en privado. Los controles permanecen al final de errores y victoria, con foco visible.

Recargar recupera la pregunta o fase estable correspondiente. Recargar o salir durante una animación asienta su resultado sin repetirla al montar. Para reproducir otra vez se requiere la acción explícita. El acuse inmediato de movimiento reducido espera a que termine la escritura pública activa y vuelve a comprobar ejecución, configuración y CAS; no utiliza temporizadores de sincronización.

## Modelo y compatibilidad

Configuración v5 sin campos nuevos. Progreso en el control existente `ninja-control-v3.finales[perfil]`, con `runId`, `status`, `signature`, `sound` y campos opcionales nuevos: `ceremonyPhase`, `attempts` (turnos 1, 2 y final), `earlyCorrect`, `cluesMissing` y `rejectedAnswer` opcional (`text`, `turn`). La respuesta rechazada tiene el mismo límite de entrada validada (1024 caracteres brutos / 256 significativos), se escapa con Vue y nunca forma parte del JSON de configuración. Las fases estables son `intro`, `call1`, `clues1`, `answer1`, `fail1`, `call2`, `clues2`, `answer2`, `fail2`, `truth`, `captain`, `joint`, `jointFail`, `explosion`, `victory`. Validación/estallido/pergamino tienen fases transitorias de renderizador, sin un reloj persistente paralelo.

El modelo rechaza combinaciones inválidas de estado/fase y transiciones fuera de turno. Las lecturas de progreso anterior se normalizan solo en memoria: una victoria antigua conserva su resultado, una revelación pendiente se recupera estable y un fallo anterior se representa como fallo conjunto; una pantalla preparada comienza la nueva introducción. La siguiente escritura autorizada usa el modelo ampliado. No se duplica almacenamiento ni se limpian claves.

Se conservan Web Lock, CAS, historial, journal y aislamiento de perfiles. Guardar una configuración final distinta invalida su progreso con el mecanismo existente. Un cambio de equipo o capitán usa los datos vigentes y vuelve a validar preparación; no existe una segunda configuración de equipos. Los mensajes BroadcastChannel solo notifican cambios, sin nombres, secretos o propuestas. JSON exportado incluye los textos privados configurados, sin progreso ni medios; no hay cifrado ni autenticación.

Archivos principales: `finale.ts` (modelo/validación), `finaleNarrative.ts` (guion derivado), `FinaleStage.vue`, `FinaleControls.vue`, `FinaleEditor.vue`, `useFinaleCinema.ts`, `finaleParticles.ts`, `finale.css`; integración en `usePresentation.ts`, `App.vue`, `OrganizerPanel.vue` y `SceneController.vue`. Sin dependencia nueva ni modificación de escenas o medios previos.

## Investigación aplicada

Se consultaron las referencias pedidas; no se instalaron sus stacks ni pipelines de pago:

| Referencia | Aplicación y licencia revisada |
| --- | --- |
| [AI Design Skills](https://github.com/elayadesign/ai-design-skills) | Jerarquía, lectura y estados; MIT. Se descartan reglas de marketing, fuentes remotas y landing pages. |
| [Redesign Skill](https://github.com/elayadesign/redesign-skill) | Auditoría focalizada dentro del stack existente; MIT. No rediseña escenas aprobadas. |
| [Scroll World](https://github.com/oso95/scroll-world) | Continuidad de centro de interés y pausa al leer; MIT. No se ejecutan Monid/Higgsfield ni se consumen créditos de esos servicios. No se usa scroll. |
| [GSAP Skills](https://github.com/greensock/gsap-skills) | Skills MIT de timelines, frameworks/Vue, rendimiento y accesibilidad, con prioridad técnica. Contexto acotado, etiquetas semánticas, cancelación/reversión, transforms/opacity y limpieza al desmontar. |
| [TextCharacterAnimations](https://github.com/codrops/TextCharacterAnimations) | Entrada de caracteres con orden y stagger acotado; MIT. No se copian fuentes, demos ni infraestructura WebGL. |
| [Autoskills](https://github.com/midudev/autoskills) | Detección de stack y trazabilidad, CC BY-NC 4.0. No se ejecuta instalador ni se incorpora su código. |

GSAP **3.15.1**, única dependencia de runtime añadida, usa [Standard No Charge](https://gsap.com/community/standard-license/), distinta de la licencia MIT de sus skills. Este juego no crea un editor que compita con Webflow. No requiere plugins, cuenta, registro privado ni contratación. Three.js no aportaba valor demostrado y no se añadió.

Fuentes oficiales: [timelines](https://gsap.com/docs/v3/GSAP/gsap.timeline()/), [contexto Vue y limpieza](https://gsap.com/docs/v3/GSAP/gsap.context()/), [ticker y pestañas ocultas](https://gsap.com/docs/v3/GSAP/gsap.ticker/), [ciclo de vida de Vue](https://vuejs.org/api/composition-api-lifecycle.html). Canvas recibe tiempo desde la timeline; no tiene un bucle RAF independiente. Solo hay movimiento ambiental CSS leve en reposo inicial, desactivado con movimiento reducido; tras el clímax terminan las partículas.

Se intentó acceder al [vídeo de referencia](https://www.youtube.com/watch?v=A4QYEDQCnaQ), pero el proveedor no permitió obtener reproducción, fotogramas ni transcripción. No se ha supuesto su contenido.


## Ensayo actual

```powershell
npm test
npm run typecheck
npm run build
git diff --check
node --preserve-symlinks --preserve-symlinks-main --experimental-strip-types tests/finale-ceremony.smoke.mjs
node --preserve-symlinks --preserve-symlinks-main --experimental-strip-types tests/public-window.smoke.mjs
```

Chrome normal con CDP loopback 9224 y Vite deben estar activos. El arnés crea y elimina su propio contexto sintético, sin usar almacenamiento real. `SMOKE_URL` y `FINALE_CDP_PORT` permiten otros endpoints de ensayo. Evidencia privada actual en `.preview.local/finale-11-3/`; se conserva la anterior. `tests/finale.smoke.mjs` es un alias del recorrido vigente; la fuente del ensayo anterior permanece en `.preview.local/finale-11-1/finale.smoke.source.mjs`.

El arnés comprueba nombres/capitán completos, NO/SÍ y recarga, dos derrotas sin adelantar el giro, proclamación, fallo/acierto conjunto, acierto individual inesperado, concurrencia, controles, ambos perfiles, pergaminos cortos/largos, medios ausentes y movimiento reducido. Revisa 1920×1080, 1366×768 y 390×844 y captura movimiento real, sin certificar FPS. Se usa emulación de página activa CDP para que la oclusión de Windows no suspenda el renderizado, sin cambiar el reloj de la aplicación.

Antes del evento: aprobación artística del propietario, monitor externo físico, lectura a distancia, altavoces/volumen y desconexión real con HTTP loopback activo. Los resultados realmente ejecutados están en [VALIDATION](VALIDATION.md).

## Jerarquía del secreto revelado

Los estilos de la reliquia se limitan a `.finale-revealed`. La densidad tipográfica se deriva de la longitud mediante `data-inscription-size`; no se modifica ni normaliza el secreto. El foco accesible conserva su marca lateral. La entrada GSAP es finita, se cancela con el contexto existente y no añade reloj persistente. Recargar restaura el resultado y movimiento reducido evita la secuencia. [GSAP timeScale](https://gsap.com/docs/v3/GSAP/Timeline/timeScale()/) documenta la escala temporal; [Vue class/style bindings](https://vuejs.org/guide/essentials/class-and-style.html) respalda la vinculación de la URL local del material. Evidencia de composición y controles en [VALIDATION](VALIDATION.md).