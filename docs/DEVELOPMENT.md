# Desarrollo y validación local

## Ensayo del enigma independiente

Mantener Vite y abrir /?screen=enigma#palabra=AMISTAD. El script tests/enigma.smoke.mjs usa Chrome normal ya abierto con DevTools loopback en 9224, perfil de ensayo separado y sin desactivar su sandbox. Crea y elimina únicamente su propio contexto limpio; no altera perfiles del propietario. Ejecutar `node --preserve-symlinks --preserve-symlinks-main tests/enigma.smoke.mjs`. Variables opcionales: SMOKE_URL (por defecto http://localhost:5173) y ENIGMA_CDP_PORT (9224).

Para habilitar esa conexión, iniciar Chrome con --remote-debugging-address=127.0.0.1 --remote-debugging-port=9224 y --user-data-dir apuntando a una carpeta de ensayo dentro de .preview.local; no al perfil personal. No usar --no-sandbox ni administrador. El ensayo bloquea HTTP externo, prueba teclado, reintento/revelación, reinicio durante repetición, ciclos repetidos, movimiento reducido, audio y respaldo de imagen; guarda capturas privadas y secuencias reales en .preview.local/enigma-10-1. animation-review.html reproduce los fotogramas de derrota y victoria con sus tiempos originales; motion.json conserva esos tiempos. No equivale a desconectar físicamente internet ni certificar altavoces o monitor extendido.

La suite npm test incluye pruebas puras, composable con reloj controlado, Web Audio simulado, componente compilado y selección real de raíz. El smoke real es un comando separado y requiere conexión CDP disponible. Pantalla completa nativa solo se ensaya automáticamente con ENIGMA_TEST_FULLSCREEN=1: el entorno CDP ha impedido confirmar su salida, por lo que queda pendiente ensayo manual. Las restricciones históricas de Edge no implican que Chrome esté indisponible.

Volver a [README](../README.md) · [Arquitectura](PROJECT.md) · [Evidencia actual](VALIDATION.md).

## Contenido

- [Entorno y scripts](#entorno-y-scripts)
- [Npm en Windows con EPERM](#npm-en-windows-con-eperm)
- [Validación en navegador](#validación-en-navegador)
- [Ensayo de organizador y monitor](#ensayo-de-organizador-y-monitor)
- [Privacidad y traslado](#privacidad-y-traslado)

## Entorno y scripts

Node usado en la última revisión: 24.19.0. Se recomienda para reproducir el proyecto la rama Node 24 LTS ya documentada; no se actualizan dependencias en esta tarea. El test runner utiliza eliminación nativa de tipos TypeScript. Vite declara Node ^20.19.0 o >=22.12.0, pero cumplir su mínimo no acredita por sí solo ejecutar todos los scripts de tests.

| Comando desde la raíz | Función |
| --- | --- |
| npm ci | Instala exactamente el lock; requiere dependencias disponibles/conexión antes del evento |
| npm run dev | Vite de desarrollo en 127.0.0.1, puerto inicial 5173; dejar terminal activa |
| npm test | Node --experimental-strip-types --test --test-isolation=none tests/*.test.mjs |
| npm run typecheck | vue-tsc --noEmit |
| npm run build | Typecheck seguido de vite build; salida dist, con todos los medios locales de public |
| npm run preview | Sirve dist por loopback, puerto inicial 4173; no modifica datos de otro origen |
| npm run test:smoke | Script CDP que requiere navegador aparte con DevTools en 127.0.0.1:9223 |
| git diff --check | Comprueba errores de espacios del diff local |

No existe npm run lint. La aplicación no requiere internet en runtime, pero npm ci sí puede necesitarlo. No abrir dist con file://. Mantener origen único y no arrancar duplicados del servidor del propietario. Si cambias de puerto/host, la configuración del navegador anterior sigue en su origen, no se traslada automáticamente.

## Npm en Windows con EPERM

El error conocido al iniciar npm es EPERM/lstat AppData en algunas instalaciones/enlaces del entorno. Antes de cambiar nada, identifica Node y npm:

```powershell
node --version
Get-Command node
Get-Command npm.cmd
$npmRoot = Split-Path (Get-Command npm.cmd).Source -Parent
$npmCli = Join-Path $npmRoot 'node_modules\npm\bin\npm-cli.js'
if (!(Test-Path -LiteralPath $npmCli)) { throw 'npm-cli.js no existe en la instalación detectada. Revisa npm.cmd; no supongas otra ruta de usuario.' }
```

Si existe, utiliza el mismo npm mediante Node, preservando los enlaces también en procesos hijos. Por ejemplo, para validar:

```powershell
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = '--preserve-symlinks --preserve-symlinks-main'
    foreach ($script in @('test', 'typecheck', 'build')) {
        node --preserve-symlinks --preserve-symlinks-main $npmCli run $script
        $validationExit = $LASTEXITCODE
        Write-Output "${script}_EXIT=$validationExit"
        if ($validationExit -ne 0) { throw "Falló $script ($validationExit)" }
    }
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
}
git diff --check
```

Para arrancar Vite en una terminal de PowerShell de VS Code:

```powershell
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = '--preserve-symlinks --preserve-symlinks-main'
    node --preserve-symlinks --preserve-symlinks-main $npmCli run dev
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
}
```

Deja ese proceso abierto; Ctrl+C termina el servidor y permite restaurar la variable. Para instalar mediante esta ruta usa los mismos flags con $npmCli ci (sin run). No pedir administrador ni desactivar protecciones si continúa el bloqueo: registra el error y ejecuta los comandos desde una terminal normal autorizada. La ruta observada en esta máquina es C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js; el procedimiento la detecta, no depende de ese nombre fijo.

## Validación en navegador

Los tests permanentes cubren validación, migración, journal/CAS, perfiles, controladores de presentación, confirmaciones y componentes compilados con Vue. Los transportes y almacenamiento de esas pruebas son simulados. No acreditan disponibilidad física del monitor, recorte real, contraste, lector de pantalla o reproducción de vídeo.

El script tests/command-center.smoke.mjs está versionado y su sintaxis puede comprobarse con node --check. Crea un contexto CDP aislado con datos ficticios y capturas privadas. **Su recorrido conserva supuestos antiguos**, por ejemplo gestión de confirmaciones nativas Page.javascriptDialogOpening frente al diálogo compartido actual y secuencias de perfiles/ceremonia; necesita revisión antes de dar por cubierto el flujo actual de pruebas. No se ha ejecutado ni corregido en esta operación documental. No presentarlo como suite E2E actual aprobada.

Si un desarrollador decide revisarlo fuera del entorno restringido, necesita preview activo y un Chromium/Edge local autorizado con DevTools en loopback:9223 y perfil de prueba separado. El script usa por defecto http://127.0.0.1:4173, configurable con SMOKE_URL; esa elección pertenece a datos sintéticos, no al origen real del organizador. No iniciar DevTools sobre el perfil habitual ni exponerlo a la red. npm run test:smoke falla si ese endpoint no existe. Los procedimientos históricos no deben ejecutarse automáticamente.

En el entorno de Codex se observó bloqueo de Edge/Mojo (Access is denied). No repetir headless como condición de cierre ni usar flags que desactiven la seguridad. Si no hay navegador inspeccionable, comprobar HTTP/medios/compilación y declarar pendientes visuales; pedir la revisión humana con Vite activo.

## Ensayo de organizador y monitor

Utiliza datos ficticios en un perfil de navegador aislado. No vacíes almacenamiento real; exporta configuración privada antes de cualquier prueba sobre el equipo del evento.

1. Arranca/reutiliza Vite y abre administración/pública del mismo origen. Confirma perfil en cabecera, añade integrantes, traslada varios y designa capitanes. Guarda. Comprueba orden español, exclusividad y persistencia tras recarga.
2. Muestra la ceremonia: debe abrir/obtener pública desde la interacción y esperar respuesta fresca. Cierra pública, repite; comprueba aviso si se bloquea el popup. Seleccionar una previa no debe publicar.
3. Recorre color/nombre de ambos equipos, aceptar/rechazar/agotar propuestas y nombre manual. Verifica decisiones al retroceder/recargar, formación completa, capitán primero y grupos mayores de doce. Continúa al vídeo e inicia sus controles manualmente.
4. Crea dos pruebas distintas con el editor genérico, configura textos e imágenes diferentes y guarda. Duplica: contenido independiente y resultado pendiente. Ordena, retira una del recorrido y cancela la confirmación una vez; al guardar la retirada activa vuelve a portada sin perder su resultado.
5. Presenta misión, amplía/normal y recarga pública. Guarda ganador: no debe anunciar. Anúncialo expresamente, corrige el resultado y verifica que el anuncio previo no cambia solo; vuelve a mostrar contenido.
6. Repite a 1920×1080, 1366×768 y 390×844, con horizontal/vertical/cuadrada, sin imagen/nombre inexistente, título160/acción120/regla100 combinados. Revisa misión vertical, textos generales, imagen completa, teclado, foco, Escape y movimiento reducido. Para probar fondo ausente usa bloqueo de recursos de DevTools, sin borrar/renombrar el archivo aprobado.
7. Cambia entre Colegio y Urbanización y revisa aislamiento; prueba importación v2/v3/v4 y exportación sin resultados/binaries en datos ficticios. Abre dos editores para comprobar que un borrador desactualizado no sobrescribe cambios recientes. Ensaya reset solo sobre preparación sintética y comprueba vuelta pública a portada y otro perfil intacto.
8. Con servidor local activo, desconecta internet manualmente y repite imágenes, vídeo y cambios entre ventanas. No desactives red automáticamente desde Codex. Observa las solicitudes en Network, deben ser locales. Comprueba lectura a tres–cinco metros con un facilitador/niño. Guarda capturas en .preview.local y no las publiques.

Para vasos, añade el [ensayo físico de su ficha](challenges/LOS-VASOS-SAGRADOS.md#ensayo-y-criterios). La inspección de un PNG no demuestra que niños entiendan el relevo al verlo pequeño en el portal.

## Privacidad y traslado

Copia privadamente las dos carpetas de medios y el fondo compartido al ordenador del evento, instala dependencias y compila allí. Exporta/importa configuración en el origen elegido; resultados/progreso no están incluidos, así que no cambies de origen durante una partida. No es un backup completo.

public/private-media queda ignorado excepto .gitkeep. JSON personales, historias, capturas, prompts privados, builds y cachés no se preparan en Git. El actual trabajo no autoriza commit/push/merge/reset/clean. Revisa tanto archivos nuevos como rastreados antes de cualquier publicación autorizada posterior.
