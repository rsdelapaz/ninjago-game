# Pergaminos imprimibles del Maestro Wu

Generación local independiente del juego. **Colección de cuatro pistas rediseñadas a partir de los originales** localizados por indicación del propietario en `public/private-media/colegio/pistas/`. Los cuatro PDF individuales coinciden, página a página, con el documento conjunto; permanecen intactos. La página maestra de demostración previa se conserva separada como muestra.

Los originales son imágenes dentro de PDF y no contienen texto extraíble. Se renderizaron, abrieron y transcribieron visualmente; las salidas nuevas permiten seleccionar y extraer el texto. Se conservan identificación literal, orden, contenido y pie romano. No se asignan rutas a equipos/perfiles reales. El marco reservado original mide aproximadamente 148 × 28 mm según el raster; la nueva área útil, sin contar marco, es de 150 × 48 mm, por lo que se amplía.

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

## Regenerar desde la terminal de VS Code

Requisitos: Node 24, Chrome instalado, fuentes locales **Georgia** y **Trebuchet MS** (Windows). El equipo actual dispone de ambas; no se descargan ni redistribuyen sus archivos. Chrome incrusta subconjuntos para lectura/impresión. Para otra plataforma deben revisarse disponibilidad, licencia y métricas antes de aprobar el resultado.

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

Desde esta terminal de ejecución se verificó el comando; no se afirma haber controlado una terminal integrada de VS Code.

## Datos y fidelidad

El JSON local contiene `id` (nombre de salida), `demonstration` (booleano), `title`, `identification` (literal o cadena vacía), `paragraphs` (párrafos literales), `footer` (pie literal) y `reservedHeightMm` (altura física útil, sin contar marco). Los cambios de línea dentro de cada párrafo se conservan. No se añade equipo, ruta, número ni narración a partir de valores ausentes. No admite HTML dentro de textos: se escapa para conservarlo como contenido.

Para una pieza auténtica son obligatorios `source`, referencia a un original en medios privados, y `sourceSha256`, huella fijada después del cotejo visual. La generación se detiene si el original cambia. El texto de los cuatro originales actuales se cotejó visualmente: extraer texto devuelve vacío y no permite una comparación textual automática con el origen. La comprobación automatizada compara todo el texto del PDF nuevo con el JSON transcrito; no sustituye aquel cotejo. Ejecución con un JSON situado en `content/`:

```powershell
node --preserve-symlinks --preserve-symlinks-main printables/src/generate.mjs printables/content/archivo-revisado.json
```

El generador comprueba texto exacto del HTML, texto extraído del PDF, una página A4, fuentes incrustadas, desbordamientos y separación de bloques. Si no cabe, falla: no trunca, resume ni reduce automáticamente las letras. Un original que requiera más páginas o una composición no textual necesita revisión, no adaptación silenciosa a esta muestra.

## Impresión y calidad comprobada

Formato CSS A4 vertical; medida PDF observada en Chrome: **209,889 × 297,011 mm**, redondeo del motor dentro de 0,3 mm. Márgenes blancos de 12 mm, tinta azul noche/marrón, oro envejecido y papel marfil; sin grandes masas oscuras, marcas de corte ni doble marco rectangular continuo. Texto de lectura 15 pt, título Georgia Bold 32 pt, identificación Trebuchet MS. El cartucho deja libre un rectángulo útil de aproximadamente 150 × 48 mm.

Se inspeccionaron las cuatro páginas PNG procedentes de los PDF reales: colección coherente, título protagonista, lectura limpia, cartucho utilizable y ornamentos geométricos relacionados con la arquitectura del templo. No se han generado ilustraciones ni modificado recursos existentes. La textura de fibras y la ornamentación son SVG; texto seleccionable, no páginas aplanadas.

Dos regeneraciones consecutivas en el mismo Chrome y con las mismas fuentes produjeron **PDF y PNG idénticos por SHA-256**. Los campos de fecha del PDF se neutralizan a 2000-01-01 sin cambiar longitudes ni offsets; no indican fecha real de producción. La identidad binaria no se garantiza entre distintas versiones de Chrome, sistemas o fuentes.

La inspección no sustituye una impresión física: imprimir al **100 % / tamaño real**, sin «ajustar a página», revisar color/legibilidad y probar escritura o adhesión en el cartucho. Pendientes la prueba física y la aprobación del propietario; el cotejo visual con los originales sí se ha realizado.

Fuentes técnicas: [exportación PDF de Chrome](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF), [A4 mediante CSS @page](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@page/size) y [lectura/renderizado con PDF.js](https://mozilla.github.io/pdf.js/examples/). Las APIs exactas se contrastaron también con los tipos locales de PDF.js 6.5.438; el recurso de carga se libera mediante `PDFDocumentLoadingTask.destroy()`.
