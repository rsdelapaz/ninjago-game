# Proyecto — El secreto del maestro Wu

Aventura local de cumpleaños para dos clanes, dirigida por un adulto desde un centro de mando y proyectada en una pantalla pública. El adulto arbitra las pruebas y anuncia sus resultados. La entrega de pistas es física. El juego incluye un desenlace configurable por perfil y un Oráculo independiente.

Consulta [uso](../README.md), [mantenimiento](DEVELOPMENT.md), [desenlace](FINALE.md) y [validación](VALIDATION.md).
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
| src/FinaleStage.vue, src/FinaleControls.vue, src/FinaleEditor.vue, src/finale.ts, src/finaleNarrative.ts, src/useFinaleCinema.ts | Escena final, operaciones privadas, modelo, guion y efectos |
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

**Descartar borrador** recupera el último guardado. **Repetir ceremonia** conserva la preparación y reinicia sus confirmaciones. **Restablecer perfil** ofrece exportación previa, exige aceptación y afecta solo al activo: vacía participantes/pruebas/resultados, deja dos equipos con sus IDs pero sin integrantes/capitanes/nombre/color, restaura tres propuestas y referencias de medios predeterminadas, reinicia la ceremonia y el desenlace y vuelve a portada también en pública. Conserva el otro perfil, sus borradores, medios físicos, historiales y legacy. Por tanto no equivale a borrar todos los datos personales históricos.

No eliminar claves ninja-config-v1:*, ninja-progress-v1:* ni ninja-presentation-v1/v2. La recuperación legacy permite descargar el original y convertir explícitamente uno al perfil elegido. Importar JSON requiere revisar y confirmar reemplazo: puede reasignar el ID de origen al perfil destino, mantiene referencias internas, conserva historial previo y reinicia presentación. No importa resultados ni medios.

## Presentación y sincronización

Catálogo: intro → ceremony → wu → challenge:ID de cada prueba visible → finale. Los números del catálogo completo y los números públicos de prueba tienen recorridos distintos; ambos se calculan. Se preservan decisiones de ceremonia al navegar hacia atrás. Los dos equipos deben tener miembros/capitán para entrar a ceremonia; las elecciones se confirman por el adulto, sin exigir nombre/color al preparar.

La pública usa la misma aplicación sin screen=admin. Ambos clientes comparten origen, perfil de navegador y almacenamiento. BroadcastChannel comunica control sin nombres de participantes; storage es respaldo. El panel obtiene/abre ninja-public síncronamente desde el clic original y espera una respuesta fresca tras montar/inicializar la aplicación. Si no llega, no se cambia la escena; informa y ofrece recuperación. Ventanas cerradas y respuestas antiguas no acreditan disponibilidad.

Previa es estado transitorio independiente; no publica, no abre ventanas ni cambia resultados. Se reconcilia tras navegación confirmada, perfil o retirada de escena. La previa de activa refleja imagen ampliada y el ganador anunciado; el editor muestra el borrador normal.

Guardar resultado no cambia escena ni emite anuncio. Anunciar publica una instantánea; corregir lo guardado no cambia un anuncio previo hasta una nueva acción explícita. Ampliar imagen conserva escena/configuración/resultados y recarga; volver a normal, navegar, cambiar perfil, mostrar otra vez o anunciar ganador restablece la vista según el control existente. El tiempo/reproducción de vídeo no se sincroniza y debe dirigirse desde la pública.

## Oráculo independiente

main.ts elige la raíz mediante screen=enigma antes de importar App. EnigmaStage.vue, useEnigma.ts, enigma.ts y enigmaAudio.ts mantienen estado en memoria, sin importar perfiles, almacenamiento ni sincronización. El fragmento de la URL admite letras españolas y espacios hasta 48 caracteres normalizados. La comparación ignora caso, espacios sobrantes y tildes vocálicas, y distingue Ñ de N. Cambiar el fragmento o desmontar cancela los temporizadores. Reiniciar vuelve a la entrada y mantiene la palabra y el ajuste de sonido. Movimiento reducido lleva al resultado estable. El fondo privado opcional enigma-sanctuary.png tiene respaldo SVG local.

## Arte y multimedia

La misión usa una sola columna. Imagen completa con contain, acción y regla dentro del portal. El fondo compartido la-llamada-del-cielo.png tiene respaldo SkyMonastery. Las referencias se resuelven mediante BASE_URL y nombres locales en la carpeta del perfil. Un medio ausente conserva un respaldo legible. El vídeo de Wu se controla desde la pantalla pública dentro de su marco, con controles nativos. Las rutas de preparación están en [Medios privados](../README.md#medios-privados).

## Límites

La aplicación funciona por HTTP loopback y carece de autenticación, backend, CSV, puntuación automática y entrega integrada de pistas. Las pistas en papel usan un [generador independiente](../printables/README.md). El almacenamiento local depende del origen y del perfil del navegador. Vite copia public a dist, incluidos los recursos privados presentes.
