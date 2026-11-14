# El secreto del maestro Wu

Introducción local para una aventura personal de cumpleaños ambientada en LEGO NINJAGO. Vue 3 + TypeScript + Vite; escenografía SVG original, sin imágenes, fuentes ni servicios remotos.

## Visualizar en local

Requiere Node.js 22.12+ o Node.js 24 LTS y npm. Desde la raíz:

```powershell
npm ci
npm run dev
```

Abre http://127.0.0.1:5173 en el navegador. Para la pantalla del evento, mueve esa ventana al monitor extendido y maximízala; la composición principal está pensada para 1920 × 1080. No hay activación automática de pantalla completa ni audio.

Para utilizar la compilación de producción:

```powershell
npm run build
npm run preview
```

Abre http://127.0.0.1:4173. No abras `dist/index.html` con `file://`. Después de instalar dependencias, la aplicación se sirve y funciona sin internet.

## Qué incluye

- `src/App.vue`: título y subtítulo solicitados, botón COMENZAR AVENTURA, segunda escena provisional y retorno al inicio. El foco se mueve al título al cambiar de escena.
- `src/MonasteryBackdrop.vue`: dibujo vectorial original del monasterio entre montañas, luna y faroles.
- `src/style.css`: composición cinematográfica, dorados, niebla animada, diseño adaptable y movimiento reducido.
- Configuración mínima de Vite/TypeScript y dependencias bloqueadas en `package-lock.json`.
- `docs/PROJECT.md`: corrección creativa del propietario y alcance actual documentados.

No se han cambiado reglas, equipos o pistas. El control del operador y la sincronización entre ventanas siguen pendientes: abrir dos ventanas permite revisar la escena en ambas, pero cada una conserva su propio estado. Esto todavía no completa M1.

## Medios privados

No hay vídeo, música ni retrato de Wu aportados. La segunda escena muestra un aviso legible; todavía no reproduce vídeo. No se ha descargado material protegido. `public/private-media/` queda excluido de Git salvo su marcador vacío: los medios que aporte el organizador podrán guardarse ahí para una integración posterior. Vite los copiará al compilar; mantén esos builds privados. No se ha publicado nada.

## Verificación

Realizada el 14 de noviembre de 2026, Node 24.19.0:

- `npm run build`: correcto; ejecuta `vue-tsc --noEmit` y `vite build` (Vite 8.3.8).
- `git diff --check`: correcto.
- `npm run dev`: servidor iniciado; peticiones HTTP a `/` y `/src/App.vue` responden 200.
- No hay scripts de lint ni suite automatizada de pruebas; no se han ejecutado esas comprobaciones.
- Pendiente revisión visual en navegador, teclado real y monitor externo. Revisar también anchos de 320, 768, 1024, 1440 y 1920 píxeles.

Prueba manual: pulsa Tab hasta COMENZAR AVENTURA, activa con Enter o Espacio, comprueba el aviso de Wu y vuelve al inicio. Activa la preferencia del sistema de movimiento reducido: la niebla y la entrada deben quedar estáticas. Desconecta internet después de arrancar el servidor y repite.

En el entorno de ejecución de Codex, el enlace de instalación de npm dio `EPERM` al resolver un directorio AppData. Se verificó el build con el mismo script mediante:

```powershell
$env:NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main'
node --preserve-symlinks --preserve-symlinks-main C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js run build
```

Este ajuste solo afecta a esa terminal; no es necesario en una instalación habitual de npm.

Referencias oficiales: [Vue y TypeScript en script setup](https://vuejs.org/api/sfc-script-setup.html), [actualización del DOM con nextTick](https://vuejs.org/api/general.html#nexttick), [recursos locales de Vite](https://vite.dev/guide/assets.html#the-public-directory).
