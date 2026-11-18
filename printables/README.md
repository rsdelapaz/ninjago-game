# Pergaminos imprimibles del Maestro Wu

Generador local de pistas A4 para preparar y repartir en papel. Los originales rasterizados están en public/private-media/colegio/pistas/. El JSON transcribe su contenido y fija la huella del original. Las salidas permiten seleccionar el texto.

## Archivos

| Ruta relativa a `printables/` | Uso |
| --- | --- |
| `src/template.mjs` | Composición HTML y ornamentos SVG originales |
| `src/print.css` | A4 vertical, márgenes de 12 mm, tipografía y cartucho |
| `src/generate.mjs` | Exportación con Chrome y comprobación/renderizado del PDF real |
| `content/pista-01.json` … `pista-04.json` | Cuatro transcripciones locales, referencia y SHA-256 del original |
| `output/pista-01-premium.pdf` … `pista-04-premium.pdf` | Cuatro piezas finales; una página por pista |
| `output/pista-01-premium.html` … `pista-04-premium.html` | Instantáneas autónomas |
| `previews/pista-01-premium.png` … `pista-04-premium.png` | Cuatro vistas del PDF real a 300 ppp |
| `previews/pista-01-premium.txt` … `pista-04-premium.txt` | Texto extraído para cotejo |
| `previews/pista-01-premium.qa.json` … `pista-04-premium.qa.json` | Evidencia de tamaño, fuentes, contenido y huellas |
| `previews/originals/` | Renderizados privados de los originales para cotejo visual |
| `content/demostracion.json` | Texto explícitamente demostrativo; archivo local ignorado |
| `output/demo-pagina-maestra-demostracion.pdf` | Muestra previa, distinta de las cuatro pistas finales |
| `output/demo-pagina-maestra-demostracion.html` | Instantánea autónoma para revisar la composición |
| `previews/demo-pagina-maestra-demostracion.png` | Renderizado del PDF a 300 ppp |
| `previews/demo-pagina-maestra-demostracion.txt` | Texto extraído del PDF |
| `previews/demo-pagina-maestra-demostracion.qa.json` | Medidas, fuentes, fidelidad del texto y SHA-256 |

`content/`, `output/` y `previews/` están ignorados por Git. No están bajo `public/` y Vite no los copia a `dist/`. No publicar esas carpetas ni añadirlas con `git add -f`. El generador solo escribe sus propias salidas en `output/` y `previews/`; regenerar reemplaza esas salidas, nunca originales. No registrar pruebas automáticamente ni trasladar estos textos a la aplicación.

Los originales aportados por el propietario sí están bajo `public/private-media/`; Vite los copia a los builds privados como el resto de medios. Se conserva esa ubicación sin moverlos ni sobrescribirlos. Los nuevos diseños permanecen exclusivamente bajo `printables/`.

## Regenerar

Requisitos: Node 24, Chrome instalado, fuentes locales **Georgia** y **Trebuchet MS** (Windows). Usa fuentes locales con licencia para el equipo de impresión. Chrome incrusta subconjuntos para lectura/impresión. Para otra plataforma deben revisarse disponibilidad, licencia y métricas antes de aprobar el resultado.

Desde la raíz del proyecto, instalar una vez las herramientas de impresión (requiere internet; sin cambios en el package.json ni el lock del juego):

```powershell
npm ci --prefix printables --ignore-scripts --omit=optional
```

Solo se instala PDF.js 6.5.438, Apache-2.0, para inspección y renderizado en navegador. El lock también registra sus dependencias opcionales de canvas, omitidas por el comando anterior. No hay Playwright, motor PDF propio ni dependencia de impresión en el runtime del juego.

Reutilizar Chrome de ensayo con CDP en loopback 9224, si ya está disponible. Si no, abrir uno con perfil separado (nunca el personal):

```powershell
$printProfile = Join-Path (Get-Location) '.preview.local\printables-chrome'
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' `
  -ArgumentList '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=9224', `
    ('--user-data-dir="' + $printProfile + '"'), 'about:blank' -WindowStyle Hidden
npm --prefix printables run generate
```

El comando anterior sin argumentos conserva la muestra. Para regenerar las **cuatro piezas finales**, desde la raíz:

```powershell
foreach ($clue in @('01', '02', '03', '04')) {
  node --preserve-symlinks --preserve-symlinks-main printables/src/generate.mjs "printables/content/pista-$clue.json"
  if ($LASTEXITCODE -ne 0) { throw "Falló la pista $clue" }
}
```

El generador crea un contexto aislado, un servidor HTTP temporal en loopback con puerto libre y una política CSP que limita cargas a recursos locales. Cierra su contexto y servidor al terminar. No accede a localStorage, perfiles o canales del juego. No necesita Vite ni conexión externa para generar una vez instalada la herramienta. `PRINTABLES_CDP_PORT` permite cambiar únicamente el puerto de Chrome.

Si npm encuentra el EPERM de esta instalación de Windows, aplicar [el procedimiento del proyecto](../docs/DEVELOPMENT.md#npm-en-windows-con-eperm). Comando directo verificado:

```powershell
node --preserve-symlinks --preserve-symlinks-main printables/src/generate.mjs
```


## Datos y fidelidad

El JSON local contiene `id` (nombre de salida), `demonstration` (booleano), `title`, `identification` (literal o cadena vacía), `paragraphs` (párrafos literales), `footer` (pie literal) y `reservedHeightMm` (altura física útil, sin contar marco). Los cambios de línea dentro de cada párrafo se conservan. No se añade equipo, ruta, número ni narración a partir de valores ausentes. No admite HTML dentro de textos: se escapa para conservarlo como contenido.

Para una pieza auténtica son obligatorios `source`, referencia a un original en medios privados, y `sourceSha256`, huella fijada después del cotejo visual. La generación se detiene si el original cambia. El texto de los cuatro originales actuales se cotejó visualmente: extraer texto devuelve vacío y no permite una comparación textual automática con el origen. La comprobación automatizada compara todo el texto del PDF nuevo con el JSON transcrito; no sustituye aquel cotejo. Ejecución con un JSON situado en `content/`:

```powershell
node --preserve-symlinks --preserve-symlinks-main printables/src/generate.mjs printables/content/archivo-revisado.json
```

El generador comprueba texto exacto del HTML, texto extraído del PDF, una página A4, fuentes incrustadas, desbordamientos y separación de bloques. Si no cabe, falla: no trunca, resume ni reduce automáticamente las letras. Un original que requiera más páginas o una composición no textual necesita revisión, no adaptación silenciosa a esta muestra.

## Impresión y revisión

Usa A4 vertical al 100 % o tamaño real, con márgenes de diseño de 12 mm. Comprueba color y legibilidad y prueba el uso del cartucho de 150 × 48 mm. Antes de repartir las piezas, coteja cada texto con su original rasterizado. El archivo qa.json registra formato, fuentes y huellas. La reproducción binaria depende de Chrome, del sistema y de las fuentes. Las fechas internas se neutralizan para facilitar la comparación de salidas.
