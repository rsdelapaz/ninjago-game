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
