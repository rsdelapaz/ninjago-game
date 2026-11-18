# El secreto del maestro Wu

Aventura privada de cumpleaños ambientada en NINJAGO para niños de unos ocho años. Dos clanes se presentan, eligen su identidad con el Maestro Wu, ven su mensaje y compiten en pruebas dirigidas por un adulto. El desenlace integrado permite reunir sus pistas y revelar un secreto configurado para cada perfil; la entrega de pistas sigue siendo física y dirigida por el organizador.

La aplicación Vue funciona desde un servidor local, sin internet durante el evento. El organizador dirige una ventana de administración y los niños ven otra en el monitor extendido. Los resultados se deciden y anuncian manualmente.

## Contenido

## El despertar del enigma

El **ceremonia final del Hito 11.3** se configura en **Desenlace final** y aparece al terminar el catálogo de pruebas. Consulta [preparación, funcionamiento y ensayo](docs/FINALE.md). No requiere una URL con la respuesta y permanece bloqueado si faltan la frase correcta o el texto secreto. El Oráculo que se explica a continuación sigue siendo una experiencia independiente.

Acceso independiente: http://localhost:5173/?screen=enigma#palabra=AMISTAD o http://localhost:5173/?screen=enigma#palabra=PODER%20NINJA. No requiere perfiles ni administración ni altera el juego. Sustituye el valor por una expresión codificada para URL: letras españolas y espacios, hasta 48 caracteres normalizados. Ignora caso, espacios sobrantes y tildes vocálicas; Ñ y N son distintas. Una URL inválida muestra un aviso sin iniciar el reto.

Escribe y pulsa Enter o DESVELAR EL ENIGMA. El acierto ilumina el templo, revela la expresión y celebra en varias oleadas; el fallo contrae y fractura el sello, apaga la escena y disuelve la propuesta antes de ofrecer VOLVER A INTENTARLO. No revela la respuesta correcta.

Tras acertar, el santuario conserva un resplandor dorado y turquesa estable. REINICIAR ENIGMA es la acción principal; Repetir revelación queda como acción secundaria y conserva el resultado mientras reproduce la victoria. REINICIAR ENIGMA vuelve al principio, oculta la solución, limpia el campo y devuelve el foco sin recargar ni cambiar la palabra de la URL. También permite cancelar una repetición en curso. Se puede repetir el ciclo sin límite. Sonido inicialmente desactivado y pantalla completa voluntaria; movimiento reducido muestra estados finales estáticos diferenciados. El fragmento no se envía al servidor, pero es visible en dirección, historial e inspección: no es un secreto cifrado.

El fondo nuevo opcional public/private-media/enigma-sanctuary.png permanece privado; si falta, se usa un santuario SVG local. No cambia imágenes anteriores. Este enigma aislado no implementa las pistas ni el desenlace integrado del juego.

## Índice

Las [cuatro pistas imprimibles](printables/README.md) están rediseñadas a partir de los originales privados, con generación independiente, texto seleccionable y vistas de impresión. Las nuevas salidas quedan bajo `printables/`, ignoradas por Git y fuera del build; no se incorporan al juego automáticamente.

- [Instalar y arrancar](#instalar-y-arrancar)
- [Preparar y presentar](#preparar-y-presentar)
- [Desenlace final](docs/FINALE.md)
- [Crear pruebas](#crear-pruebas)
- [Medios privados](#medios-privados)
- [Pruebas de desarrollo](#pruebas-de-desarrollo)
- [Documentación](#documentación)

## Instalar y arrancar

Necesitas Git, Node.js 24 LTS y npm; las versiones usadas por este repositorio están en package.json y package-lock.json. Instala las dependencias con internet antes del evento:

```powershell
git clone --branch feat/upgrade-prologue-art https://github.com/rsdelapaz/ninjago-game.git
cd ninjago-game
npm ci
npm run dev
```

Si ya tienes el proyecto, entra en su raíz; no vuelvas a clonarlo ni descartes cambios. Mantén abierta la terminal del servidor. Vite parte del puerto 5173 y anuncia la URL real; si está ocupado, comprueba el puerto elegido. Si falla npm con EPERM/AppData en Windows, utiliza el [procedimiento de recuperación](docs/DEVELOPMENT.md#npm-en-windows-con-eperm).

Con el puerto predeterminado:

- Administración: http://localhost:5173/?screen=admin
- Pantalla pública: http://localhost:5173/

Usa el mismo navegador, perfil de navegador, host y puerto en ambas ventanas. No alternes localhost y 127.0.0.1: tienen almacenamiento distinto. El panel no tiene autenticación y no debe exponerse como administración remota.

Para ensayar el build local:

```powershell
npm run build
npm run preview
```

Preview parte del puerto 4173. Abre http://localhost:4173/?screen=admin y prepara la pública desde ese panel. Ese origen tiene sus propios datos: exporta/importa la configuración si necesitas trasladarla; los resultados y medios no viajan en el JSON. No abras dist/index.html con file://. **Un build con medios privados también es privado: no lo publiques.**

## Preparar y presentar

1. En administración, elige **Colegio** o **Urbanización**. Son dos configuraciones independientes para dos jornadas. Cada perfil nuevo tiene dos equipos vacíos y tres sugerencias editables por equipo; no se crean participantes ficticios.
2. En **Participantes**, introduce nombres y, opcionalmente, edad/género. En **Equipos**, asigna integrantes y un capitán de cada equipo. **Añadir ninjas** permite selección múltiple y traslados confirmados; también hay reparto aleatorio explícito. Guarda los cambios antes de presentar.
3. Edita las sugerencias de nombres si quieres. Los nombres definitivos y colores pueden quedar sin definir: se eligen durante la ceremonia. Las listas vaciadas intencionadamente no se rellenan automáticamente.
4. Pulsa **Preparar pantalla pública**, mueve esa ventana al monitor extendido y maximízala. En **Presentación**, selecciona una escena y pulsa **Mostrar esta escena**. Elegir una miniatura solo cambia la previa. El panel espera confirmación de una pública montada; una referencia de ventana no basta.
5. Desde START GAME o Presentación, recorre llegada de clanes → color/nombre del primero → color/nombre del segundo → equipos definitivos → mensaje de Wu. Dirige SÍ/NO y nombre manual desde el panel. Inicia el vídeo con sus controles: no hay autoplay sonoro ni fullscreen automático.
6. Después presenta las pruebas visibles del recorrido. **Guardar un ganador no lo anuncia**: utiliza **Anunciar ganador al público** expresamente. **Mostrar de nuevo la prueba** recupera su contenido.
7. En **Desenlace final**, configura frase y secreto, guarda y pulsa **Mostrar el final**. Wu convoca cada clan con sus integrantes y capitán: NO permite seguir buscando; SÍ abre su respuesta. Tras el segundo fallo se revela el giro y se llama al capitán del primer equipo para proclamar la frase final. Un acierto individual inesperado se reconoce y pasa directamente al capitán. Responde en pública con Enter o desde el control privado. La victoria despliega un pergamino con el secreto exacto. Restablecer conserva la historia; volver a empezar limpia solo el final con confirmación; repetir revelación conserva la victoria; portada conserva el progreso. Recargar no repite efectos. Preparación y medios opcionales en [FINALE](docs/FINALE.md).

La preparación exige integrantes y capitanes; no exige nombres/colores definitivos. Los borradores se conservan al cambiar de módulo o perfil mientras el panel está abierto, pero no son autoguardado. Exporta un JSON privado en **Configuración y JSON** antes del evento. Consulta [recuperación y restablecimiento](docs/PROJECT.md#persistencia-y-recuperación) antes de borrar o reemplazar datos.

## Crear pruebas

En **Pruebas**, revisa primero la lista para evitar duplicados; usa **Nueva prueba** solo si no existe. Completa título, instrucción breve para niños, regla opcional, instrucciones completas del organizador e imagen local opcional. La explicación larga se conserva en administración y no se proyecta.

Revisa la previa, marca **Incluir en el recorrido**, ordena con ↑/↓ y pulsa **Guardar cambios** en la cabecera. Después usa **Ir al control de presentación** y **Mostrar esta escena**. La casilla de inclusión, la selección del editor y la presentación pública son acciones distintas. Duplicar crea otro ID sin resultado; ocultar conserva los datos y resultados. Retirar una prueba activa vuelve a portada al guardar.

La numeración pública se calcula entre las pruebas incluidas. Para que Los Vasos Sagrados sea Prueba 02, debe ser la segunda incluida; el número no es un campo editable.

- [Prueba 02: Los Vasos Sagrados](docs/challenges/LOS-VASOS-SAGRADOS.md): todos los campos listos para copiar, montaje, reglas y alta sin sobrescribir perfiles.
- El Aro del Dragón ya preparado se conserva; no hay botón especial para añadirlo. Su imagen local se mantiene como aro-del-dragon-unido.png o el nombre que el organizador haya elegido.

## Medios privados

Un clon público **no incluye** ilustraciones, vídeos ni datos de participantes. Copia los recursos autorizados por separado antes de compilar:

```text
public/private-media/
  la-llamada-del-cielo.png             # Fondo compartido aprobado
  colegio/
    ninjago-key-art.png
    master-wu.mp4
    aro-del-dragon-unido.png
    vasos-sagrados.png
  urbanizacion/
    ninjago-key-art.png
    master-wu.mp4
    aro-del-dragon-unido.png
    vasos-sagrados.png
```

El editor guarda solo nombres de archivo, no sube imágenes. Cada perfil resuelve sus medios en su propia carpeta. El fondo de misión es compartido; no lo dupliques ni modifiques. Sin imagen de misión aparece un emblema; sin arte, escenario de respaldo; sin vídeo, aviso legible. El JSON no incluye binarios ni resultados.

El desenlace usa el nuevo fondo privado compartido `public/private-media/finale-sanctuary.png`; sin él conserva un escenario vectorial de respaldo. Sus archivos opcionales de vídeo/audio se guardan en la carpeta del perfil y se indican por nombre en Desenlace final. Los JSON **v5 contienen la frase y el secreto configurados**: conservarlos privadamente. Importar v2/v3/v4 deja el desenlace vacío en memoria, sin reescribir originales al leer.

public/private-media, dist, node_modules, .preview.local y secretos .env permanecen ignorados; solo los .gitkeep de medios se rastrean. No añadas exportaciones personales al repositorio. La ilustración fan es para uso privado, personal y no comercial; no acredita licencia ni permiso de publicación. El código no solicita recursos externos durante el juego.

## Pruebas de desarrollo

```powershell
npm test
npm run typecheck
npm run build
git diff --check
```

No hay script de lint. La suite usa Node, Vue y TypeScript ya instalados. Comprueba modelos, controladores y componentes reales con almacenamiento/transportes simulados; no equivale a probar dos ventanas físicas ni a inspeccionar píxeles. El script test:smoke existe, pero necesita Chromium/Edge con DevTools y tiene pendientes de ejecución/actualización indicados en la [guía de validación](docs/DEVELOPMENT.md#validación-en-navegador).

El propietario ha aprobado el diseño público vertical del Hito 09.3. La aceptación del propietario se distingue de la evidencia automatizada: el ensayo final del monitor, accesibilidad y funcionamiento offline real debe completarse antes del evento. Los resultados reales de esta operación están en [docs/VALIDATION.md](docs/VALIDATION.md).

## Documentación

| Documento | Fuente de verdad |
| --- | --- |
| [docs/PROJECT.md](docs/PROJECT.md) | Producto, estado implementado, arquitectura, datos y límites |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Entorno, npm Windows, scripts y ensayo reproducible |
| [docs/challenges/LOS-VASOS-SAGRADOS.md](docs/challenges/LOS-VASOS-SAGRADOS.md) | Contenido definitivo y operación de la Prueba 02 |
| [docs/VALIDATION.md](docs/VALIDATION.md) | Evidencia actual y comprobaciones pendientes |
| [AGENTS.md](AGENTS.md) | Reglas permanentes de trabajo para Codex |
| [Histórico](docs/history/INDEX.md) | Decisiones, prompts y resultados anteriores; no instrucciones vigentes |

El checkpoint previo de Hito 10 ya fue confirmado y enviado con autorización. El desarrollo del enigma queda local para revisión: sin segundo commit ni push, merge, reset, clean o cambios de main.
