# El secreto del maestro Wu

Aventura privada de cumpleaños ambientada en NINJAGO para niños de unos ocho años. Dos clanes se presentan, eligen su identidad con el Maestro Wu, ven su mensaje y compiten en pruebas dirigidas por un adulto. El desenlace integrado permite reunir sus pistas y revelar un secreto configurado para cada perfil; la entrega de pistas sigue siendo física y dirigida por el organizador.

La aplicación Vue funciona desde un servidor local, sin internet durante el evento. El organizador dirige una ventana de administración y los niños ven otra en el monitor extendido. Los resultados se deciden y anuncian manualmente.

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

- Administración: http://127.0.0.1:5173/?screen=admin
- Pantalla pública: http://127.0.0.1:5173/

Usa el mismo navegador, perfil de navegador, host y puerto en ambas ventanas. No alternes localhost y 127.0.0.1: tienen almacenamiento distinto. El panel no tiene autenticación y no debe exponerse como administración remota.

Para ensayar el build local:

```powershell
npm run build
npm run preview
```

Preview parte del puerto 4173. Abre http://127.0.0.1:4173/?screen=admin y prepara la pública desde ese panel. Ese origen tiene sus propios datos: exporta/importa la configuración si necesitas trasladarla; los resultados y medios no viajan en el JSON. No abras dist/index.html con file://. **Un build con medios privados también es privado: no lo publiques.**

## Preparar y presentar

1. En administración, elige **Colegio** o **Urbanización**. Son dos configuraciones independientes para dos jornadas. Cada perfil nuevo tiene dos equipos vacíos y tres sugerencias editables por equipo; no se crean participantes ficticios.
2. En **Participantes**, introduce nombres y, opcionalmente, edad/género. En **Equipos**, asigna integrantes y un capitán de cada equipo. **Añadir ninjas** permite selección múltiple y traslados confirmados; también hay reparto aleatorio explícito. Guarda los cambios antes de presentar.
3. Edita las sugerencias de nombres si quieres. Los nombres definitivos y colores pueden quedar sin definir: se eligen durante la ceremonia. Las listas vaciadas intencionadamente no se rellenan automáticamente.
4. Pulsa **Preparar pantalla pública**, mueve esa ventana al monitor extendido y maximízala. En **Presentación**, selecciona una escena y pulsa **Mostrar esta escena**. Elegir una miniatura solo cambia la previa. El panel espera confirmación de una pública montada; una referencia de ventana no basta.
5. Desde **START GAME** o Presentación, recorre llegada de clanes → color/nombre del primero → color/nombre del segundo → equipos definitivos → mensaje de Wu. Dirige SÍ/NO y nombre manual desde el panel. Inicia el vídeo con sus controles: no hay autoplay sonoro ni fullscreen automático.
6. Después presenta las pruebas visibles del recorrido. **Guardar un ganador no lo anuncia**: utiliza **Anunciar ganador al público** expresamente. **Mostrar de nuevo la prueba** recupera su contenido.
7. Configura el secreto, prepara las pistas físicas y dirige el recorrido con la [guía del desenlace](docs/FINALE.md).

La preparación exige integrantes y capitanes; no exige nombres/colores definitivos. Los borradores se conservan al cambiar de módulo o perfil mientras el panel está abierto, pero no son autoguardado. Exporta un JSON privado en **Configuración y JSON** antes del evento. Consulta [recuperación y restablecimiento](docs/PROJECT.md#persistencia-y-recuperación) antes de borrar o reemplazar datos.

## Crear pruebas

En **Pruebas**, revisa primero la lista para evitar duplicados; usa **Nueva prueba** solo si no existe. Completa título, instrucción breve para niños, regla opcional, instrucciones completas del organizador e imagen local opcional. La explicación larga se conserva en administración y no se proyecta.

Revisa la previa, marca **Incluir en el recorrido**, ordena con ↑/↓ y pulsa **Guardar cambios** en la cabecera. Después usa **Ir al control de presentación** y **Mostrar esta escena**. La casilla de inclusión, la selección del editor y la presentación pública son acciones distintas. Duplicar crea otro ID sin resultado; ocultar conserva los datos y resultados. Retirar una prueba activa vuelve a portada al guardar.

La numeración pública se calcula entre las pruebas incluidas. Para que Los Vasos Sagrados sea Prueba 02, debe ser la segunda incluida; el número no es un campo editable.

- [Prueba 02: Los Vasos Sagrados](docs/challenges/LOS-VASOS-SAGRADOS.md): todos los campos listos para copiar, montaje, reglas y alta sin sobrescribir perfiles.

### El Aro del Dragón

Si ya está en el perfil, revisa la previa y reutiliza su ficha. Para darlo de alta, usa **El Aro del Dragón** como título, **Pasad el aro del primer ninja al último.** como instrucción y **NO PODÉIS SOLTAROS DE LAS MANOS.** como regla. Referencia la imagen local existente, habitualmente «aro-del-dragon-unido.png».

Guion de Wu: «Ninjas, formad una fila y unid vuestras manos. Pasad el aro por vuestro cuerpo, uno a uno, hasta el último compañero, sin soltaros. ¡El equipo que tarde menos demostrará el poder del dragón unido!»

Cada clan forma una fila y enlaza las manos. Entrega el aro al primer integrante y pide que lo pasen por el cuerpo hasta el último, sin soltarse. El adulto mide el tiempo con un reloj externo y adjudica la victoria al equipo que termine correctamente en menos tiempo.

## Medios privados

Un clon del repositorio **no incluye** ilustraciones, vídeos ni datos de participantes. Copia los recursos autorizados por separado antes de compilar:

```text
public/private-media/
  la-llamada-del-cielo.png
  finale-sanctuary.png
  ninjago-key-art.png                 # Retrato compartido de Wu en el desenlace
  enigma-sanctuary.png
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

El desenlace usa el fondo privado compartido `public/private-media/finale-sanctuary.png`; sin él conserva un escenario vectorial de respaldo. Sus archivos opcionales de vídeo/audio se guardan en la carpeta del perfil y se indican por nombre en Desenlace final. Los JSON **v5 contienen la frase y el secreto configurados**: conservarlos privadamente. Importar v2/v3/v4 deja el desenlace vacío en memoria, sin reescribir originales al leer.

public/private-media, dist, node_modules, .preview.local y secretos .env permanecen ignorados; solo los .gitkeep de medios se rastrean. No añadas exportaciones personales al repositorio. La ilustración fan es para uso privado, personal y no comercial; no acredita licencia ni permiso de publicación. El código no solicita recursos externos durante el juego.

## Oráculo independiente

Con el servidor activo, abre http://127.0.0.1:5173/?screen=enigma#palabra=AMISTAD y ajusta el puerto a tu servidor. Para una frase, codifica los espacios como %20. Introduce la propuesta y pulsa Enter. Puedes reintentar, reiniciar con la misma palabra o repetir la revelación tras acertar. La respuesta queda visible en la URL y su historial. Para el desenlace de la partida usa [Desenlace final](docs/FINALE.md).

## Documentación

| Documento | Fuente de verdad |
| --- | --- |
| [docs/PROJECT.md](docs/PROJECT.md) | Producto, estado implementado, arquitectura, datos y límites |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Entorno, npm Windows, scripts y ensayo reproducible |
| [docs/challenges/LOS-VASOS-SAGRADOS.md](docs/challenges/LOS-VASOS-SAGRADOS.md) | Contenido definitivo y operación de la Prueba 02 |
| [docs/VALIDATION.md](docs/VALIDATION.md) | Evidencia actual y comprobaciones pendientes |
| [AGENTS.md](AGENTS.md) | Reglas permanentes de trabajo para Codex |
| [Desenlace final](docs/FINALE.md) | Preparación, recorrido y recuperación |
| [Imprimibles](printables/README.md) | Preparación y generación de pistas en papel |
