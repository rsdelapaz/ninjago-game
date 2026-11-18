# Validación preestreno

Auditoría del 18 de noviembre de 2026 sobre feat/upgrade-prologue-art en b65ae33f11157e934f467a646d4562e0bdacc074. Node 24.19.0 y Chrome 157.0.8103.52 en Windows. Se usaron perfiles ficticios y contextos desechables de CDP. Vite sirvió en http://127.0.0.1:5189/.

## Resultados

| Comprobación | Resultado |
| --- | --- |
| npm test | 121 aprobadas, 0 fallidas y 0 omitidas |
| npm run typecheck | Correcto |
| npm run build | Correcto. Vite empaquetó 100 módulos |
| Administración por HTTP | 200 |
| git diff --check y enlaces Markdown internos | Correcto. 38 enlaces verificados. |
| Disponibilidad de medios | 12 respuestas 206 a lecturas parciales con MIME correcto. Fondos compartidos, retratos, los dos vídeos de Wu y las imágenes del Aro y Vasos en ambos perfiles. |
| sanctuary-quality.smoke.mjs | Correcto. Clic y teclado, respuesta rechazada exacta, aislamiento de turnos, confirmaciones, restauración, portada y victoria preservada. Revisión por CDP a 1920×1080, 1366×768 y 1280×720. |
| command-center.smoke.mjs | El original se detuvo al confirmar tres integrantes. Una copia con clics separados y confirmaciones completó participantes, traspaso, sorteo, ceremonia, entrada al vídeo y navegación hasta el primer cambio de perfil. |
| public-window.smoke.mjs | El original falló al contar todos los destinos. Una copia temporal filtrada por URL completó cierre, reapertura, bloqueo simulado, enlace manual y reutilización. |
| finale-ceremony.smoke.mjs y alias finale.smoke.mjs | El original se detuvo al esperar el montaje. Una copia temporal que selecciona la pública por URL completó el recorrido. |
| enigma.smoke.mjs | El original agotó la espera de la revelación transitoria. Una copia temporal que esperó la victoria estable completó los demás casos. |

npm inició con EPERM en AppData. La CLI detectada vía Node con opciones de preservación de enlaces permitió ejecutar los tres scripts. Chrome normal dentro del aislamiento de la terminal falló por permisos de Mojo y Crashpad. El lanzamiento autorizado fuera de ese aislamiento, con sandbox propio de Chrome y perfil desechable, permitió usar CDP. Las capturas y la evidencia de ensayo quedan en .preview.local.

El recorrido completo del final en la copia temporal comprobó NO, recarga, SÍ, entrega simultánea en ambas ventanas, dos fallos y giro, capitán, reintentos, victoria, repetición, restauración, reinicio y portada. También comprobó el acierto individual, ambos perfiles, secreto largo, ausencia de medios y movimiento reducido. La variante temporal ajustó la selección CDP y la ubicación de su salida privada. El Oráculo completó reintentos, teclado, reinicio, movimiento reducido, respaldo de imagen y aislamiento sin peticiones externas durante el ensayo. Los fotogramas transitorios y la pantalla completa nativa quedan fuera del resultado del Oráculo.

## Cobertura comprobada

La suite de Node reúne 27 archivos de pruebas y ejecuta modelos, componentes compilados y controladores reales con almacenamiento, reloj o transporte simulado según el caso. El resultado se refiere a los casos definidos en esas suites.

| Recorrido | Evidencia |
| --- | --- |
| Inicio, escenas y recuperación | presentation.test.mjs cubre START → ceremonia → Wu, recarga y coordinación. scene-catalogue.test.mjs valida catálogo/previa. confirmation.test.mjs y dialog-component.test.mjs cubren foco, Escape y cancelación. |
| Perfiles y reemplazo de datos | profile.test.mjs, captains.test.mjs, participant-order.test.mjs y profile-reset.test.mjs cubren validación, migración, orden, traslados, aislamiento y reset. ceremony.test.mjs y presentation.test.mjs ejercitan journal y operaciones obsoletas. |
| Pruebas y resultados | challenges.test.mjs, challenge-editor.test.mjs, challenge-stage.test.mjs, hoop-challenge.test.mjs y presentation.test.mjs cubren guardar, duplicar, ocultar, ordenar, ampliar, recargar y anunciar explícitamente. |
| Pantalla pública | public-screen.test.mjs cubre confirmación fresca, cierre y respaldo con transporte simulado. El ensayo de santuario acreditó interacción desde una pública real en Chrome. |
| Desenlace | finale.test.mjs y finale-narrative.test.mjs cubren preparación, turnos, NO/SÍ, fallos, cooperación, proclamación, acierto individual y victoria. finale-presentation.test.mjs cubre duplicados, CAS, transiciones rápidas, recarga, persistencia por perfil y fallo simulado del journal. finale-controls.test.mjs, finale-cinema.test.mjs y finale-rejected.test.mjs comprueban controles, movimiento y propuesta rechazada. |
| Oráculo | enigma*.test.mjs cubren montaje aislado, validación, temporizadores, reinicio, audio simulado y estados del componente. |

## Incidencias

P0 impide continuar el recorrido principal. P1 compromete un flujo esencial o su verificación de extremo a extremo. El ámbito indica si la incidencia afecta al producto o al arnés. P2 degrada presentación o mantenimiento. Esta ejecución no confirmó un bloqueo P0 del producto.

| Severidad y ámbito | Reproducción | Esperado | Observado | Corrección mínima propuesta |
| --- | --- | --- | --- | --- |
| P2 · Producto · Inscripción de victoria | Completar el final con el secreto ficticio CAMPEONES DEL MUNDO a 1920×1080 y observar la victoria estable. | Preservar el texto y envolver por palabras cuando sea posible. | La captura victory-preserved.png muestra CAMPEONE en la primera línea y S DEL en la segunda. El contenido textual se conserva. | Ajustar la escala o el espaciado de la inscripción corta para que las palabras habituales quepan. Mantener el corte de emergencia para cadenas sin espacios y añadir una comprobación de líneas. |
| P1 · Arnés · Centro de mando | Ejecutar npm run test:smoke con CDP en 9223 y SMOKE_URL al servidor. | Seleccionar tres participantes, confirmar y continuar con traslado y ceremonia. | El clic por texto exacto falla en la línea 115 antes de confirmar. Separar los clics de selección permitió confirmar. La copia avanzó tras aceptar traslado y sorteo. El siguiente plazo venció al cambiar a Urbanización en la línea 205. El helper de cambio de perfil no atiende su diálogo. | Realizar los clics de selección en tareas separadas, esperar el botón habilitado y aceptar el diálogo de traslado antes de comprobar la baja del capitán y confirmar el sorteo antes de verificar el guardado y resolver el diálogo de cambio de perfil antes de comprobar el destino. |
| P1 · Arnés · Reutilización de pantalla pública | Ejecutar public-window.smoke.mjs en Chrome 157 y preparar de nuevo la pantalla. | Identificar una administración y una pública propia, reutilizando la segunda. | La línea 128 obtiene cuatro destinos CDP de tipo page frente a los dos esperados. Al contar solo las páginas de la aplicación, el ensayo completo pasó. | Identificar destinos por URL e ID, y comprobar por separado si existe más de una pública del origen. |
| P1 · Arnés · Entrada al desenlace | Ejecutar finale-ceremony.smoke.mjs con ambos perfiles sintéticos. | Montar finale-stage en la pública y recorrer sus estados. | La línea 166 agota la espera. La selección del primer destino page distinto de administración puede captar otro destino. Al filtrar por URL, el recorrido íntegro pasó. | Esperar un destino del origen en la URL pública y registrar URL, estado de control y mensajes del panel si falla. |
| P2 · Arnés · Revelación del Oráculo | Ejecutar enigma.smoke.mjs en Chrome 157. | Observar la transición de acierto y la victoria. | La línea 73 agota la espera de enigma-revealing después de una captura durante la carga. Al retirar las esperas de fotogramas intermedios pasó la regresión funcional. | Registrar el estado al fallar y esperar un resultado estable. Para verificar fotogramas, empezar a observar antes del envío y fijar el ajuste de movimiento reducido del contexto. |

Las cuatro skills locales se revisaron como instrucciones de trabajo. Depuración e implementación incremental aluden a una skill de desarrollo dirigido por pruebas que no está disponible en el catálogo local. Algunas opciones de ejemplo corresponden a otros runners. Para este proyecto prevalecen AGENTS.md y los comandos de DEVELOPMENT. El directorio .agents tiene acceso de lectura en esta sesión.

## Ensayo antes del evento

- En el equipo del evento y con un perfil de ensayo, recorre START GAME, ceremonia, vídeo, una prueba por tipo de dinámica, desenlace y vuelta a portada. Comprueba que la previa permanece privada y que guardar y anunciar el ganador funcionan por separado.
- Verifica la importación y exportación JSON en el navegador con ambos perfiles de ensayo. Los casos de persistencia y migración pasaron en Node. La copia de centro de mando quedó antes de las operaciones de transferencia JSON y restablecimiento.
- Mueve la pública al monitor extendido. Ciérrala y reábrela desde el panel. Confirma la escena proyectada tras una recarga y verifica el aviso de ventana no disponible antes de proseguir.
- Verifica cada vídeo y audio previsto con los altavoces del evento. Desconecta internet manteniendo HTTP loopback activo y repite apertura, recarga y reproducción. Las lecturas parciales HTTP acreditan disponibilidad de archivos.
- A la distancia de la audiencia, revisa nombres largos, instrucción, regla, propuesta rechazada y secreto. Comprueba foco, Escape, lectura asistida y movimiento reducido. Ensaya los recorridos físicos del [Aro](../README.md#el-aro-del-dragón) y [Vasos](challenges/LOS-VASOS-SAGRADOS.md). Imprime una pista a tamaño real y prueba su cartucho.
- Con dos perfiles sintéticos, comprueba el recorrido de dos fallos y cooperación, la ruta de acierto individual, el reintento conjunto y el regreso a una victoria guardada. Verifica que el secreto no aparezca antes del acierto y que un cambio de perfil durante una confirmación la invalide.
- Antes de usar perfiles reales, exporta ambas configuraciones y conserva por separado los medios. El contrato de recuperación está en [PROJECT](PROJECT.md#persistencia-y-recuperación).
