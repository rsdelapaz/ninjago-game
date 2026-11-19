# Desarrollo y mantenimiento

## Entorno

Usa Node.js 24, npm y Git. Instala con npm ci desde la raíz. El lock fija las versiones. Para servir en loopback usa npm run dev. npm run preview sirve el build creado por npm run build y puede usar otro puerto. Conserva el mismo origen en las dos ventanas. Consulta la [guía de uso](../README.md#instalar-y-arrancar).

## Comprobaciones locales

```powershell
npm test
npm run typecheck
npm run build
git diff --check
```

npm test ejecuta tests/*.test.mjs. Usa el ejecutor de Node para pruebas y el soporte nativo para omitir anotaciones de tipos de TypeScript. El build comprueba tipos antes de empaquetar. No hay script de lint. Para aislar una regresión ejecuta node --experimental-strip-types --test tests/ARCHIVO.test.mjs con el nombre correspondiente.

## npm en Windows con EPERM

Si el iniciador npm falla con EPERM al resolver AppData, identifica la instalación activa e invoca su CLI mediante Node. Conserva las opciones solo durante la operación para que las hereden los procesos hijos.

```powershell
$npmRoot = Split-Path (Get-Command npm.cmd).Source -Parent
$npmCli = Join-Path $npmRoot 'node_modules\npm\bin\npm-cli.js'
if (!(Test-Path -LiteralPath $npmCli)) { throw 'Revisa la ubicación de npm-cli.js en la instalación activa.' }
$previousNodeOptions = $env:NODE_OPTIONS
try {
    $env:NODE_OPTIONS = '--preserve-symlinks --preserve-symlinks-main'
    foreach ($task in @('test', 'typecheck', 'build')) {
        node $npmCli run $task
        if ($LASTEXITCODE -ne 0) { throw "Falló $task ($LASTEXITCODE)" }
    }
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
}
```

Con el mismo bloque de opciones, usa node $npmCli ci para instalar o node $npmCli run dev para arrancar el servidor. Ctrl+C termina Vite y permite restaurar la variable.

## Validación en navegador

Arranca Vite y abre Chrome normal con un perfil de ensayo exclusivo en .preview.local y CDP en loopback. Usa datos sintéticos. Los arneses crean y eliminan contextos desechables. Conserva el sandbox de Chrome y deja el perfil personal fuera del ensayo.

```powershell
$trialProfile = Join-Path (Get-Location) ('.preview.local/chrome-' + [guid]::NewGuid())
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--remote-debugging-port=9224', ('--user-data-dir="' + $trialProfile + '"'), 'about:blank'
$env:SMOKE_URL = 'http://127.0.0.1:5173'
node --experimental-strip-types tests/intro.smoke.mjs
node --experimental-strip-types tests/public-window.smoke.mjs
node --experimental-strip-types tests/finale-ceremony.smoke.mjs
node --experimental-strip-types tests/finale-words.smoke.mjs
node --experimental-strip-types tests/sanctuary-quality.smoke.mjs
node --experimental-strip-types tests/enigma.smoke.mjs
```

Ajusta el ejecutable y SMOKE_URL al equipo y puerto reales. FINALE_CDP_PORT modifica el puerto de los tres primeros scripts y ENIGMA_CDP_PORT el del Oráculo. finale.smoke.mjs es un alias de finale-ceremony.smoke.mjs. Los ensayos verifican DOM, acciones, persistencia y medidas de ventanas mediante CDP. Las salidas privadas quedan en .preview.local. public-window guarda su recorrido de ventanas, finale-ceremony guarda el recorrido completo y sanctuary-quality mide composición e interacción. El Oráculo conserva capturas y secuencias en su propia carpeta. El ensayo opcional de pantalla completa del Oráculo usa ENIGMA_TEST_FULLSCREEN=1.

El ensayo de portada también acepta FINALE_CDP_PORT y usa 9224 por defecto. Simula la reproducción y el rechazo de autoplay, comprueba con audio nativo el caso de archivo ausente y verifica el flujo entre administración y pantalla pública. Para comprobar la pista instalada y el sonido, sigue el ensayo físico.

El ensayo de Las palabras del destino usa FINALE_CDP_PORT y guarda capturas de Chrome con datos sintéticos en `.preview.local/palabras-del-destino/`.

npm run test:smoke ejecuta tests/command-center.smoke.mjs. Este usa el puerto fijo 9223 y, sin SMOKE_URL, espera preview en 4173. Consulta sus incidencias y las de los demás arneses en [VALIDATION](VALIDATION.md). Un fallo del arnés requiere revisar el selector y el flujo antes de atribuirlo al juego.

Si Chrome no abre, revisa stderr y comprueba /json/version en el puerto elegido. Windows puede denegar Mojo o Crashpad dentro del sandbox de ejecución. Usa una terminal normal autorizada con perfil aislado. Comprueba que administra el origen previsto antes de cargar datos sintéticos.

## Datos y recuperación

Conserva el puerto y perfil habituales para recuperar una partida. Revisa avisos de almacenamiento y cierra las ventanas de ensayo antes de repetir. Exporta configuración desde administración antes de una sustitución deliberada y mantén los archivos en privado. Las reglas de historial, journal, restablecimiento y legado están en [PROJECT](PROJECT.md#persistencia-y-recuperación). Ante un conflicto conserva los cambios guardados y revisa el borrador antes de reintentar.

Una comprobación HTTP sirve para confirmar el arranque y la disponibilidad de archivos. Para acreditar monitor extendido, decodificación, sonido y desconexión de internet ejecuta el [ensayo físico](VALIDATION.md#ensayo-antes-del-evento). El proceso local debe seguir activo al desconectar internet.

Los [imprimibles](../printables/README.md) se generan con su propio paquete. Los builds y capturas que incluyen medios o datos privados se quedan en el equipo.
