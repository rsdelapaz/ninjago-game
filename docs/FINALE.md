# La ceremonia del último secreto

El desenlace reúne las pistas físicas de ambos clanes y usa los equipos guardados del perfil activo.

## Preparación

1. Abre el centro de mando según la [guía de arranque](../README.md#instalar-y-arrancar).
2. Elegir el perfil y preparar ambos equipos con nombre definitivo, color, integrantes y capitán perteneciente al equipo. No se inventa un capitán ni se añade una propiedad de cumpleaños. El primer capitán protagoniza el último acto. Los problemas se muestran al organizador y bloquean la escena.
3. En **Desenlace final**, introducir frase correcta y texto secreto. Guardar no muestra la escena. **Mostrar el final** exige preparación completa y handshake público fresco.
4. Vídeo/audio final opcionales por nombre local dentro de `public/private-media/<perfil>/`; nunca URL o binarios en JSON. Configuración v5 conservada, límites sin recortes: frase 256 caracteres normalizados (entrada bruta 1024), secreto 3000, mensaje adicional 280. La respuesta admite letras, números y espacios. Ignora mayúsculas, espacios redundantes y tildes vocálicas y distingue Ñ de N.
5. El campo de error existente se conserva íntegro, pero corresponde al **mensaje adicional tras el giro de Wu**: se publica en la revelación de cooperación y en fallos conjuntos después del segundo turno fallido. No se muestra durante los turnos individuales ni se intenta interpretar automáticamente su texto. Leer/importar no lo reescribe.

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
| Acierto final | El sello reúne los sectores y revela primero la frase y luego la inscripción exacta del secreto. La animación dura aproximadamente cuatro segundos. |

El campo público y el privado usan el mismo controlador, Web Lock y CAS. Enter entrega una frase, Shift+Enter permite una nueva línea que la validación puede rechazar como control; no hay escucha del micrófono. Solo la última respuesta rechazada se conserva, con su texto exacto y turno, en el progreso existente del perfil; se muestra únicamente en su resultado. Desaparece del progreso activo al avanzar, reintentar, acertar o volver a empezar. Restablecer y recargar conservan ese resultado. La frase correcta introducida no se persiste como propuesta, y los canales siguen sin transportar textos. Los fallos históricos sin respuesta registrada no inventan una frase. La entrada privada permite al organizador transcribir lo que dice el capitán.

## Revelación y medios

El santuario usa finale-sanctuary.png en medios privados compartidos y un respaldo local. La victoria muestra la inscripción exacta en una reliquia central con desplazamiento interno para secretos largos. Vídeo y audio opcionales quedan disponibles después de la revelación. Movimiento reducido presenta los estados estables. La previa privada 16:9 es estática y oculta nombres, formularios, frase, secreto y medios finales.
## Controles y recuperación

- **RESTABLECER ESCENA** cancela movimiento, partículas y audio, limpia el borrador temporal y asienta el punto actual sin borrar intentos, la respuesta rechazada vigente, una victoria o configuración. En público confirma visualmente la acción con «Escena restablecida. Podéis continuar.».
- **VOLVER A EMPEZAR** vuelve a Wu y limpia exclusivamente los intentos del desenlace. Pide confirmación si existe progreso; las confirmaciones obsoletas no actúan tras cambio de perfil/revisión o desmontaje.
- **REPETIR REVELACIÓN** solo tras acertar; crea una ejecución visual nueva conservando el resultado y no pide otra respuesta.
- **VOLVER A LA PORTADA** navega por el controlador existente y conserva el progreso. No restablece el perfil.

El diálogo público se monta durante el desenlace y cancela las peticiones pendientes al salir. Se conservan las comprobaciones de revisión, configuración y desmontaje antes de ejecutar acciones. Los cuatro controles están disponibles en privado. En público se ofrecen restablecer y portada, más repetición tras victoria; portada/repetición y cancelación de una animación requieren confirmación. Reiniciar íntegramente queda en privado. Los controles permanecen al final de errores y victoria, con foco visible.

Recargar recupera la pregunta o fase estable correspondiente. Recargar o salir durante una animación asienta su resultado sin repetirla al montar. Para reproducir otra vez se requiere la acción explícita. El acuse inmediato de movimiento reducido espera a que termine la escritura pública activa y vuelve a comprobar ejecución, configuración y CAS; no utiliza temporizadores de sincronización.

## Modelo y compatibilidad

Configuración v5 sin campos nuevos. Progreso en el control existente `ninja-control-v3.finales[perfil]`, con `runId`, `status`, `signature`, `sound` y campos opcionales: `ceremonyPhase`, `attempts` (turnos 1, 2 y final), `earlyCorrect`, `cluesMissing` y `rejectedAnswer` opcional (`text`, `turn`). La respuesta rechazada tiene el mismo límite de entrada validada (1024 caracteres brutos / 256 significativos), se escapa con Vue y nunca forma parte del JSON de configuración. Las fases estables son `intro`, `call1`, `clues1`, `answer1`, `fail1`, `call2`, `clues2`, `answer2`, `fail2`, `truth`, `captain`, `joint`, `jointFail`, `explosion`, `victory`. Validación/estallido/pergamino tienen fases transitorias de renderizador, sin un reloj persistente paralelo.

El modelo rechaza combinaciones inválidas de estado/fase y transiciones fuera de turno. Las lecturas de progreso anterior se normalizan solo en memoria: una victoria antigua conserva su resultado, una revelación pendiente se recupera estable y un fallo anterior se representa como fallo conjunto; una pantalla preparada comienza la introducción. La siguiente escritura autorizada usa el modelo actual.

Se conservan Web Lock, CAS, historial, journal y aislamiento de perfiles. Guardar una configuración final distinta invalida su progreso con el mecanismo existente. Un cambio de equipo o capitán usa los datos vigentes y vuelve a validar preparación; no existe una segunda configuración de equipos. Los mensajes BroadcastChannel solo notifican cambios, sin nombres, secretos o propuestas. JSON exportado incluye los textos privados configurados, sin progreso ni medios; no hay cifrado ni autenticación.

Archivos principales: `finale.ts` (modelo/validación), `finaleNarrative.ts` (guion derivado), `FinaleStage.vue`, `FinaleControls.vue`, `FinaleEditor.vue`, `useFinaleCinema.ts`, `finaleParticles.ts`, `finale.css`; integración en `usePresentation.ts`, `App.vue`, `OrganizerPanel.vue` y `SceneController.vue`. Sin dependencia nueva ni modificación de escenas o medios previos.

## Ensayo

Consulta los [comandos de navegador](DEVELOPMENT.md#validación-en-navegador) y el [estado de calidad](VALIDATION.md).
