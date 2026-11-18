# Proyecto — El secreto del maestro Wu

Estado vigente: 18/11/2026. Este documento describe el producto y el código actual; [README](../README.md) explica el uso, [DEVELOPMENT](DEVELOPMENT.md) el entorno y ensayo, y [VALIDATION](VALIDATION.md) la evidencia. Las decisiones anteriores están completas en [history/INDEX.md](history/INDEX.md).

## Contenido

- [Visión y alcance](#visión-y-alcance)
- [Estado implementado](#estado-implementado)
- [Arquitectura](#arquitectura)
- [Modelo de configuración](#modelo-de-configuración)
- [Persistencia y recuperación](#persistencia-y-recuperación)
- [Presentación y sincronización](#presentación-y-sincronización)
- [Arte y multimedia](#arte-y-multimedia)
- [Limitaciones y siguientes hitos](#limitaciones-y-siguientes-hitos)

## Visión y alcance

### Desenlace integrado — Hito 11.3

Escena estable `finale` al terminar las pruebas visibles. Configuración v5 conservada (frase, secreto y medios/mensaje opcionales), sin valores por defecto. Ahora es una ceremonia persistente: Wu llama a cada clan con nombre, color, emblema original, capitán y todos los integrantes. La preparación exige capitán perteneciente a cada equipo, nombre y color; bloqueos legibles al organizador, sin inventar ni reescribir equipos.

Confirmación SÍ/NO sin caducidad, turno individual de cada clan y dos derrotas diferenciadas. La cooperación solo se revela tras el segundo fallo; un acierto individual inesperado se reconoce y lleva a la proclamación del primer capitán sin fabricar derrotas. El acto conjunto permite reintentos sin regresar a los clanes. Frases públicas/privadas usan el mismo controlador y normalización (Ñ distinta de N), conservando solo la última propuesta rechazada de su propio turno para mostrarla en el resultado. El mensaje adicional existente se conserva, pero solo aparece después del giro; no se infieren ni reescriben sus palabras.

`finale.ts` contiene el modelo explícito y preparación; `finaleNarrative.ts` deriva el guion público del punto actual. El control existente `ninja-control-v3.finales[perfil]` añade `ceremonyPhase`, tres contadores `attempts`, `earlyCorrect`, `cluesMissing` y `rejectedAnswer` opcional (texto exacto y turno), junto a ejecución, firma y sonido anteriores. Lectura de progreso anterior normalizada en memoria, sin borrar claves ni éxitos. Se conservan Web Lock, CAS, historial/journal, aislamiento de perfiles y acuses obsoletos rechazados. Preguntas estables sin reloj; las animaciones pertenecen al renderizador. Recargar/salir asienta una ejecución y no la repite al montar. Cambios de configuración final invalidan solo su resultado mediante el journal.

GSAP/Canvas locales: fallo inicial 3,5 s, segundo 5,5 s, victoria de 4 s conservando el orden de inscripciones, dos corrientes, fragmentos y estelas, apertura visual de sectores/cámara y secreto desde aproximadamente 3,55 s. Se conservan 156 partículas máximas y DPR 1,5. La revelación «El corazón del sello» centra una reliquia de piedra con inscripción en oro, dejando visible el anillo y una zona lateral segura para Wu. Reutiliza la textura del santuario original; su cuerpo desplazable conserva secretos exactos de hasta 3000 caracteres y adapta la escala según longitud sin cambiar su valor. Wu reutiliza arte local aprobado con máscaras de presentación; sin nuevos recursos ni dependencias. El vídeo opcional posterior nunca tapa el pergamino. Movimiento reducido y medios ausentes dejan estados legibles.

Controles diferenciados: restablecer escena (cancelar efectos conservando historia), volver a empezar (confirmar si hay progreso, limpiar solo final), repetir revelación (conservar victoria) y volver a portada (conservar progreso). Las confirmaciones públicas de portada/restauración/repetición se montan en el santuario y se cancelan al salir; usan el diálogo existente. El contenido se centra en el sello, la identidad mantiene su color y los integrantes se listan solo al llamar a cada clan. Previa estática 16:9 sin nombres, secretos ni formulario. Se preservan adquisición síncrona, separación de ventanas y handshake fresco. Uso, licencias y ensayo en [FINALE](FINALE.md), evidencia en [VALIDATION](VALIDATION.md).

### Enigma independiente — Hitos 10, 10.1 y 10.2

Implementado /?screen=enigma#palabra=AMISTAD. main.ts elige la raíz antes de importar App mediante carga dinámica. EnigmaStage.vue, useEnigma.ts, enigma.ts, enigmaAudio.ts y enigma.css contienen presentación, estado local, validación y audio opcional; no importan perfiles, almacenamiento ni sincronización. Las rutas habituales conservan su aplicación y no cambia ningún esquema.

Expresión española hasta 48 caracteres normalizados, sin distinguir caso/tildes vocálicas, preservando Ñ. Solución visible solo tras acertar. Secuencia finita: carga, despertar, letras escalonadas, celebración de rayos/fragmentos y victoria estable; fallo con reintentos y victoria repetible. Hash y desmontaje cancelan temporizadores. Movimiento reducido muestra el resultado estable; errores de audio no bloquean la secuencia.

10.1 diferencia estructuralmente los resultados: victoria expansiva y luminosa con cinco fuegos escalonados, tres oleadas de fragmentos/estrellas y estelas; derrota con fases explícitas collapsing → extinguishing → falling → failure, anillos fracturados y contraídos, grietas, sombra, propuesta disuelta y ceniza descendente. Efectos ópticos CSS sobre el mismo recurso inalterado; sin animación costosa permanente ni parpadeos repetidos. La derrota termina en silencio y permite recuperar la escena inicial. Reiniciar tras ganar cancela sonidos/temporizadores, elimina efectos, limpia la propuesta, oculta solución y devuelve el foco; mantiene URL, secreto y preferencia de sonido. Se puede cancelar una repetición; las llamadas repetidas no superponen secuencias. No usa almacenamiento del juego.

10.2 refina únicamente la presentación: reposo de victoria con halo localizado dorado/turquesa, trazos del sello y letras realzados sin animación residual; REINICIAR ENIGMA principal y primero, Repetir revelación secundario, en fila adaptable. Derrota conserva su composición con el mensaje «¡Un ninja nunca se rinde! Reunid vuestras ideas y volved a intentarlo.». Sin cambios de validación, URL, estado, audio ni recursos.

Santuario nuevo privado en public/private-media/enigma-sanctuary.png, con respaldo original src/assets/enigma-sanctuary.svg. Sin modificar imágenes anteriores, dependencias ni red externa. El hash es visible al inspeccionar la URL; no aporta seguridad. Esta experiencia no incorpora pistas ni desenlace a los perfiles.

Aventura cinematográfica privada, personal y no comercial, para un cumpleaños de niños de aproximadamente ocho años. El Maestro Wu guía a dos clanes en el monasterio. El ordenador acompaña actividades dirigidas por un adulto y un monitor extendido muestra la aventura; no mide el mundo físico ni decide ganadores.

El juego completo aprobado prevé exactamente dos equipos que compiten en pruebas físicas, intelectuales, digitales y manuales, reciben fragmentos complementarios y resuelven juntos un acertijo final. Ningún equipo debe poder resolverlo solo. Mensaje final: **«UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES»**.

Dos jornadas consecutivas tienen participantes diferentes: Colegio y Urbanización. La visión incluye importación CSV de nombre/género/edad, propuestas de nombres basadas en CSV, pistas y desenlace; CSV y entrega integrada de pistas siguen previstos; el desenlace configurable ya está implementado. Las versiones anteriores de organización por sesiones son legado de recuperación, no otra modalidad activa.

La dirección privada NINJAGO y su fan art están aprobados. No se presenta como arte oficial ni licencia de terceros. La interfaz no muestra LEGO; tampoco descarga logotipos oficiales. Español en los copys, con START GAME y el sello LET'S GO ya aprobados.

## Estado implementado

Imprimibles: [generador local independiente](../printables/README.md), HTML/CSS y SVG originales, exportación Chrome y QA con PDF.js como herramienta separada. Cuatro piezas completadas desde los originales rasterizados de `public/private-media/colegio/pistas/`, transcritos y cotejados visualmente; fuente fijada por SHA-256. Nuevo contenido, PDF y previas ignorados fuera de `public/`/`dist/`. Se conserva la muestra previa. No implementa entrega de pistas, recorridos ni desenlace en la aplicación.

| Área | Funcionamiento actual |
| --- | --- |
| Portada y Wu | START GAME, arte privado con respaldo original y vídeo local manual dentro de un marco |
| Organización | Dos perfiles, participantes editables, dos equipos, asignación exclusiva múltiple/manual o sorteo explícito equilibrado por número |
| Identidad | Capitán perteneciente al equipo, tres sugerencias iniciales editables por equipo nuevo, listas vacías respetadas, nombres/colores definitivos |
| Ceremonia | Llegada, color/nombre del equipo 1, color/nombre del equipo 2, equipos definitivos y continuación a Wu; confirmación privada del adulto |
| Formación | Capitán primero, resto alfabético español; hasta ocho en dos columnas, hasta doce en tres, grupos deterministas mayores; omitir/repetir/pausar |
| Pruebas | Definiciones editables, orden, inclusión, duplicación con ID nuevo, borrado confirmado y previa real |
| Misión pública | Plantilla única vertical del Hito 09.3: número, título, imagen completa, acción y regla; ampliación dentro de la misma escena |
| Resultados | Ganador manual por prueba/perfil, pendiente, anuncio explícito y regreso al contenido; sin puntuación |
| Datos | Importación/exportación JSON de configuración, conversión legacy explícita, historial local, rechazo de escrituras obsoletas y reset por perfil |
| Ventanas | Misma aplicación/origen, control de escena, handshake fresco y sincronización con respaldo storage |

La Prueba 02 **Los Vasos Sagrados** tiene [ficha definitiva](challenges/LOS-VASOS-SAGRADOS.md) e ilustración privada preparada; no se registra automáticamente. Su ejemplo de cinco participantes no fija el número de integrantes del juego. El aro y los perfiles existentes no se modifican.

El propietario aprueba la pantalla pública 09.3 y exige conservarla: no rediseñar cielo, portal, personajes, monasterio, portada, ceremonia ni vídeo. La revisión documental y Prueba 02 no cambian la aplicación.

## Arquitectura

Vue 3.5.45, TypeScript 5.9.3, Vite 8.3.8 y vue-tsc 3.3.14 según package.json; instalación reproducible con package-lock.json. Composition API y script setup, una SPA estática con Vue y GSAP 3.15.1 local para el desenlace. Sin backend, autenticación, analítica o red externa requerida.

| Archivos | Responsabilidad |
| --- | --- |
| src/main.ts, src/App.vue | Montaje; selección de administración por screen=admin; conexión entre control y pantallas |
| src/OrganizerPanel.vue, src/command-center.css | Dashboard modular, perfil activo, guardado/borradores y navegación |
| src/ParticipantEditor.vue, src/ProfileTeams.vue | Participantes, orden español, integrantes, traslados y capitanes |
| src/profile.ts, src/profileStorage.ts, src/useProfileDraft.ts | Validación/configuración, persistencia y borradores por perfil |
| src/ceremony.ts, src/ceremonyStorage.ts | Máquina de estados, elecciones y journal recuperable |
| src/CeremonyStage.vue, src/CeremonyControls.vue, src/ceremony.css | Ceremonia pública y acciones privadas |
| src/ClanReveal.vue, src/reveal.ts, src/useRevealClock.ts | Formación compacta y progreso exclusivamente visual |
| src/challenges.ts, src/challengeResults.ts | Definiciones y resultados separados |
| src/ChallengeEditor.vue, src/ChallengeControls.vue | Preparación y guion privado, inclusión visible, adjudicación y anuncio |
| src/ChallengeStage.vue, src/challenge-sky.css, src/SkyMonastery.vue | Misión/ganador/previa con fondo compartido; escenario original solo de respaldo |
| src/scenes.ts, src/useSceneCatalogue.ts, src/SceneController.vue | Catálogo estable, navegación y previa separada de la activa |
| src/usePresentation.ts, src/publicScreen.ts | Control persistido, coordinación, handshake y disponibilidad de pública |
| src/ProfileResources.vue, src/ProfileTransfer.vue | Referencias locales, JSON, conversión y reset |
| src/WuMessage.vue, src/MonasteryBackdrop.vue, src/style.css, src/assets/lets-go.svg | Vídeo, apertura aprobada, fallback y sello original |

src/session.ts y src/sessionStorage.ts, SessionManager.vue y TeamEditor.vue conservan contratos/componentes legacy y regresiones; los dos componentes no están montados en la administración actual. src/hoopChallenge.ts conserva datos de ejemplo usados por tests: no es un registro de pruebas ni un botón activo. No hay componente ni motor especial de vasos.

## Modelo de configuración

**ProfileConfig schemaVersion 5** (src/profile.ts) contiene id colegio/urbanizacion, participantes, assignmentMode manual/automatic, dos equipos, media, challenges ordenados y finale (frase, secreto, vídeo/audio y mensaje de fallo). Cada participante tiene ID y nombre, con edad/género opcionales. Cada equipo tiene ID, memberIds exclusivos, captainId miembro o null, sugerencias, nombre definitivo y color hex o null.

Los perfiles iniciales están vacíos de participantes y pruebas, con equipos sin nombre/color/capitán y tres propuestas humorísticas editables por equipo. No se rellenan propuestas de perfiles ya existentes. La ordenación española es de visualización, no una mutación del orden persistido. Mover un capitán invalida la capitanía solo si deja su equipo. El sorteo se solicita expresamente y no se repite al recargar.

| Campo Challenge | Uso y límite |
| --- | --- |
| id | Identidad estable interna; el organizador no la mantiene manualmente |
| title | Título público, obligatorio, hasta 160 caracteres |
| publicInstruction | Acción pública breve, hasta 120; vacío permitido mientras se prepara |
| keyRule | Regla pública opcional, hasta 100 |
| description | Narración/guion e instrucciones completas del organizador, hasta 4000; nunca se proyecta completo |
| imageFilename | Nombre local opcional PNG/JPG/WebP, hasta 120, sin rutas/URL ni .. |
| visible | Inclusión en recorrido; el array determina el orden |

El número se deriva de la lista visible, no se guarda. Hasta 500 pruebas, presupuesto de definiciones de 750 000 caracteres y JSON exportado de hasta 1 MiB. Duplicar genera ID nuevo sin resultado. La identidad global del juego pertenece a la plantilla/escenario, no a los campos de cada prueba. No hay templateId ni selector de tipos.

Compatibilidad: v2 normaliza a v5 sin pruebas; v3 conserva cada description íntegra y añade publicInstruction/keyRule vacíos en memoria. No se infiere una frase breve del texto anterior. Administración avisa de preparación y pública pide escuchar al organizador mientras falta. Una lectura no escribe originales; exportar/guardar produce v5; las configuraciones v2/v3/v4 reciben finale vacío únicamente en memoria. Las versiones antiguas de la aplicación no admiten v5: actualizar ambas ventanas y conservar exportaciones privadas. La configuración legacy v1 solo se convierte al elegir y confirmar destino. JSON desconocido, progreso, binarios y referencias inválidas se rechazan.

## Persistencia y recuperación

Todo reside en localStorage del origen del navegador. No hay base de datos ni copia en la nube. El historial local puede agotarse o perderse si se borran los datos del navegador; exportar configuración no es un backup completo de la partida.

| Clave | Contenido |
| --- | --- |
| ninja-profile-v2:colegio / urbanizacion | Configuración actual v5; el nombre histórico de clave se mantiene deliberadamente |
| ninja-ceremony-v1:perfil | Fase, propuestas y decisiones confirmadas de ceremonia |
| ninja-challenge-results-v1:perfil | Mapa ID de prueba → ID de equipo ganador o pendiente |
| ninja-control-v3 | Perfil/escena/revisión/token, revelación, anuncio, imagen ampliada y progreso del final por perfil |
| ninja-profile-history:perfil:... | Copia anterior a reemplazar configuración |
| ninja-ceremony-pending:perfil | Journal de configuración/progreso/navegación para recuperación |

Las escrituras activas comparten el Web Lock ninja-local-write y comparación de la versión revisada (CAS). Si otra ventana cambia los datos, la operación se rechaza. Los registros del journal se recuperan sin sobrescribir cambios posteriores; se admite su representación normalizada al recuperar repetidamente un registro antiguo. No hay una segunda implementación de almacenamiento.

Los borradores son por perfil dentro del panel abierto. No se guardan por teclear ni sobreviven como backup a cerrar; beforeunload protege de manera orientativa. Guardar cambios solo de pruebas conserva exactamente la ceremonia. Cambiar preparación (integrantes, equipos o medios) reinicia sus confirmaciones. Ocultar conserva resultados; eliminar los retira. Retirar una prueba activa vuelve a portada mediante el mismo journal. Borrado/reset rechazan resultados cambiados desde la revisión.

**Descartar borrador** recupera el último guardado. **Repetir ceremonia** conserva la preparación y reinicia sus confirmaciones. **Restablecer perfil** ofrece exportación previa, exige aceptación y afecta solo al activo: vacía participantes/pruebas/resultados, deja dos equipos con sus IDs pero sin integrantes/capitanes/nombre/color, restaura tres propuestas y referencias de medios predeterminadas, reinicia ceremonia y vuelve a portada también en pública. Conserva el otro perfil, sus borradores, medios físicos, historiales y legacy. Por tanto no equivale a borrar todos los datos personales históricos.

No eliminar claves ninja-config-v1:*, ninja-progress-v1:* ni ninja-presentation-v1/v2. La recuperación legacy permite descargar el original y convertir explícitamente uno al perfil elegido. Importar JSON requiere revisar y confirmar reemplazo: puede reasignar el ID de origen al perfil destino, mantiene referencias internas, conserva historial previo y reinicia presentación. No importa resultados ni medios.

## Presentación y sincronización

Catálogo: intro → ceremony → wu → challenge:ID de cada prueba visible → finale. Los números del catálogo completo y los números públicos de prueba tienen recorridos distintos; ambos se calculan. Se preservan decisiones de ceremonia al navegar hacia atrás. Los dos equipos deben tener miembros/capitán para entrar a ceremonia; las elecciones se confirman por el adulto, sin exigir nombre/color al preparar.

La pública usa la misma aplicación sin screen=admin. Ambos clientes comparten origen, perfil de navegador y almacenamiento. BroadcastChannel comunica control sin nombres de participantes; storage es respaldo. El panel obtiene/abre ninja-public síncronamente desde el clic original y espera una respuesta fresca tras montar/inicializar la aplicación. Si no llega, no se cambia la escena; informa y ofrece recuperación. Ventanas cerradas y respuestas antiguas no acreditan disponibilidad.

Previa es estado transitorio independiente; no publica, no abre ventanas ni cambia resultados. Se reconcilia tras navegación confirmada, perfil o retirada de escena. La previa de activa refleja imagen ampliada y el ganador anunciado; el editor muestra el borrador normal.

Guardar resultado no cambia escena ni emite anuncio. Anunciar publica una instantánea; corregir lo guardado no cambia un anuncio previo hasta una nueva acción explícita. Ampliar imagen conserva escena/configuración/resultados y recarga; volver a normal, navegar, cambiar perfil, mostrar otra vez o anunciar ganador restablece la vista según el control existente. El tiempo/reproducción de vídeo no se sincroniza y debe dirigirse desde la pública.

## Arte y multimedia

El estado aprobado 09.3 usa una sola columna de misión, imagen completa contain, acción y regla dentro de la proyección, rótulos permanentes legibles y movimiento reducido. No modificar su diseño para la Prueba 02. El fondo privado compartido public/private-media/la-llamada-del-cielo.png se conserva sin filtros, recortes ni reinterpretación; SkyMonastery se usa solo si falla. Recursos por perfil y preparación en [README](../README.md#medios-privados).

Las rutas usan BASE_URL y nombres locales. No hay fallback de un perfil al otro. Sin archivo, se mantienen emblemas/escenario/avisos legibles; los mensajes técnicos son privados al organizador. Vídeo MP4/WebM local en marco con controles, sin fullscreen automático. Un build Vite copia public (incluidos medios privados) a dist; no debe publicarse.

La imagen vasos-sagrados.png fue generada con imagegen integrado y las dos ilustraciones locales como referencias de estilo, sin modificar ninguna. Las copias de ambos perfiles son idénticas. El prompt exacto permanece privado en public/private-media/vasos-sagrados.prompt.txt. Mecánica, textos y preparación en su ficha; inspección/validación en [VALIDATION](VALIDATION.md).

## Limitaciones y siguientes hitos

- Implementado: experiencia local jugable descrita arriba, sin adjudicación automática. No hay importación CSV, puntuación, sensores, entrega integrada de pistas, autenticación o backend. El final cooperativo configurable sí está implementado.
- La visión futura mantiene CSV de participantes/nombres, pruebas de distintas disciplinas, entrega integrada de fragmentos complementarios. Requiere orden posterior; no es autorización de desarrollo actual.
- No hay backup completo de resultados/progreso ni sincronización entre servidores/orígenes. Cambiar de navegador/host/puerto requiere preparación consciente y JSON de configuración más medios separados.
- Diseño 09.3 aprobado por el propietario; no afirmar por ello pruebas nuevas de Codex en monitor, sincronización física, lector de pantalla o internet desconectado. Estado comprobado y pendientes en VALIDATION.
- La Prueba 02 requiere alta manual y ensayo físico. No se consultaron perfiles reales ni se determinó si ya existe una prueba equivalente.
- Sin publicación en esta operación: no commit, push, merge, reset, clean o cambios de main. Las autorizaciones históricas no se trasladan a esta revisión.
