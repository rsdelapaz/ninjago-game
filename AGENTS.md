# Codex — El secreto del maestro Wu

Lee [docs/PROJECT.md](docs/PROJECT.md) antes de cambiar código y [README.md](README.md) para el uso.

## Producto y alcance

- Aventura infantil privada NINJAGO, cumpleaños de unos ocho años, con el Maestro Wu y dos clanes. Prioriza un MVP fiable, local/offline, accesible y comprensible; mejor hecho que perfecto.
- Interfaz en español, salvo copys expresamente aprobados como START GAME. No mostrar la palabra LEGO en la interfaz.
- El juego combina pruebas dirigidas por una persona y un desenlace cooperativo configurable. El mensaje de referencia es «UN NINJA EN SOLITARIO ES MUY FUERTE, PERO JUNTOS SON INVENCIBLES», sin insertarlo como solución por defecto. La entrega integrada de pistas y CSV siguen pendientes; los imprimibles son independientes.
- Resultados físicos adjudicados por una persona y anunciados explícitamente. Sin sensores, cronómetros ni puntuaciones automáticas.
- Las nuevas pruebas son contenido del editor genérico: no crear botones específicos, tipos, registros automáticos ni motores de plantillas. No insertar datos en perfiles reales sin el flujo de administración.

## Arquitectura y protección de datos

- Vue 3 Composition API, script setup TypeScript y Vite; versiones reales en package.json/lock. Componentes pequeños, estado explícito y dependencias mínimas. No añadir backend ni dependencias por conveniencia.
- Dos perfiles independientes (colegio/urbanizacion), exactamente dos equipos por perfil. Configuración v5 y progreso/resultados separados; JSON solo configuración, sin binarios/progreso/resultados. El progreso del final por perfil está dentro del control existente, sin un segundo almacén.
- Mantener importación v2/v3/v4 normalizada en memoria, final vacío, descripción heredada completa, IDs estables y conversión legacy explícita. Leer no reescribe originales. No rellenar listas intencionadamente vacías ni autoasignar integrantes.
- Reutilizar Web Lock, CAS, historial y journal existentes. No crear un segundo almacenamiento, limpiar localStorage ni borrar claves heredadas/historiales. Rechazar escritores/confirmaciones obsoletos; preservar el otro perfil y sus borradores.
- Orden español de visualización con Intl.Collator es/base/numeric, sin mutar arrays persistidos. Capitán primero en público; restante alfabético. Traslados exclusivos e invalidación del capitán cuando deja su equipo.
- Las ventanas comparten origen/navegador/perfil. Mantener BroadcastChannel y fallback storage; adquisición síncrona de pública desde el clic y handshake fresco tras montaje antes de publicar. Seleccionar previa nunca publica. No afirmar En pantalla sin disponibilidad confirmada.
- Guardar configuración, mostrar escena y anunciar ganador son acciones distintas. Mantener confirmaciones destructivas, foco, Escape y protección de borradores. Inclusión del recorrido visible junto al título; aplicar efectos al guardar.

## Arte, medios y accesibilidad

- El diseño público está aprobado. Conservar portada, ceremonia, vídeo, la-llamada-del-cielo.png, SkyMonastery, personajes y ambientación salvo nueva orden explícita.
- Una única plantilla de misión: número, título, imagen centrada, instrucción breve y regla dorada dentro del portal. Sin columnas laterales ni banda externa. Imagen completa con contain, sin filtros/recortes; ampliación en la misma escena, previa real y ganador explícito. Narrativa global no pertenece a cada prueba.
- publicInstruction es breve; keyRule opcional; description es guion completo privado al organizador. No inferir copys desde legado ni truncar datos. Rótulos permanentes legibles y subordinados, soporte de movimiento reducido y foco accesible.
- Vídeo local dentro de su marco, controles nativos, sin fullscreen automático ni autoplay sonoro obligatorio. Fallos de medios con respaldo legible.
- Sin internet en runtime: no CDNs, fuentes remotas, analítica, APIs alojadas o medios externos. Dependencias pueden instalarse antes del evento. Servir por HTTP loopback, no file://.
- Fan art personal/no comercial aprobado no equivale a licencia de publicación. No descargar logos oficiales ni recursos de terceros. Generar/editar imágenes solo cuando la orden lo autorice, mediante la habilidad pertinente; no sustituir raster solicitado por SVG/HTML.
- Medios privados en public/private-media (solo .gitkeep versionables). No sobrescribir/borrar recursos locales sin orden. Vite copia medios a dist: esos builds siguen privados. Excluir capturas, datos reales de menores, JSON personales, credenciales, node_modules y temporales de Git.

## Procedimiento

1. Revisa rama, status, cambios nuevos/rastreados y documentación; conserva todo trabajo previo. Resume diagnóstico y plan breve antes de editar; trabaja por incrementos verificables y sin infraestructura especulativa o subagentes innecesarios.
2. Modifica solo lo autorizado. Los contratos del desenlace y del Oráculo están en [FINALE](docs/FINALE.md) y [PROJECT](docs/PROJECT.md). Conserva la previa estática del final sin formularios ni secretos, y la separación de ventanas incluso con nombres heredados. Para el enlace manual usa target="_blank".
3. En tareas de interfaz/medios, reutiliza o arranca npm run dev en una terminal persistente, preferentemente VS Code si es controlable. Comprueba HTTP y comunica URL/puerto reales; no afirmar integración con VS Code si solo se dispone de terminal de ejecución.
4. Intenta navegador normal cuando esté disponible. No repetir Edge headless bloqueado por Mojo ni desactivar seguridad. HTTP 200 o abrir una URL NO acreditan inspección visual, sincronización física u offline real. Perfiles/capturas de ensayo en .preview.local, excluido del watcher.
5. Ejecuta scripts pertinentes: npm test, npm run typecheck, npm run build y git diff --check. No hay lint configurado. En Windows usa npm-cli.js detectado con Node y preserve-symlinks si falla EPERM; restaura NODE_OPTIONS. Procedimiento en docs/DEVELOPMENT.md.
6. Diferencia tests de datos/componentes/transportes simulados de navegador real. No sobrescribir almacenamiento real para ensayar; datos sintéticos aislados. Registra comandos, resultados, medios ausentes y pendientes manuales; no fingir capturas ni pruebas.
7. Actualiza la fuente documental correspondiente: README uso, PROJECT arquitectura/estado, DEVELOPMENT procedimientos, ficha de prueba contenido, VALIDATION evidencia. La documentación describe el producto vigente. Cuando se integre en main, mantener CHANGELOG.md para cambios relevantes entre versiones, compatibilidad y migraciones.
8. Entrega archivos, funcionamiento, verificaciones reales y límites. No empezar otra funcionalidad hasta terminar el alcance.

## Git y permisos

Trabaja en feat/upgrade-prologue-art. Commits, pushes, merges, operaciones destructivas, escrituras remotas y publicación requieren autorización expresa vigente. Conserva trabajo local ajeno y datos privados.
