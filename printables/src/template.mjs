const escape = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])

// Original geometric ornament, not a logo or a symbol used to solve a clue.
const seal = `<svg class="seal" viewBox="0 0 180 180" aria-hidden="true">
  <g fill="none" stroke="currentColor"><path stroke-width="1.5" d="M90 8 148 32 172 90 148 148 90 172 32 148 8 90 32 32Z"/>
  <circle cx="90" cy="90" r="68" stroke-width=".6"/><path stroke-width=".8" d="m90 29 18 43 43 18-43 18-18 43-18-43-43-18 43-18Z"/>
  <path stroke-width="1.4" d="m52 99 38-34 38 34M60 101h60M69 105v18m42-18v18M64 126h52M78 86h24M90 8v9m0 146v9M8 90h9m146 0h9"/>
  <path stroke-width=".5" d="m47 47 8 8m70 70 8 8M47 133l8-8m70-70 8-8"/></g>
  <path fill="currentColor" d="m90 41 3 7-3 7-3-7Z"/>
</svg>`

export function renderClue(data, css) {
  const demonstration = data.demonstration
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(data.title)}${demonstration ? ' · DEMOSTRACIÓN' : ''}</title><style>${css}</style></head>
  <body><article class="sheet" style="--reserved-height:${data.reservedHeightMm}mm">
    <svg class="paper-art" viewBox="0 0 744 1092" preserveAspectRatio="none" aria-hidden="true">
      <defs><pattern id="fibres" width="51" height="39" patternUnits="userSpaceOnUse">
        <path d="m3 8 7-1m17 19 5 1m10-19 3 1m-26 23 2-1" stroke="#88714d" stroke-width=".45" opacity=".18"/>
        <circle cx="18" cy="16" r=".5" fill="#88714d" opacity=".16"/>
      </pattern></defs>
      <path d="M0 16 16 0H719L744 23V1069L721 1092H21L0 1072Z" fill="#f2e5ca"/>
      <path d="M0 16 16 0H719L744 23V1069L721 1092H21L0 1072Z" fill="url(#fibres)"/>
      <g fill="none" stroke="#c9a66b" stroke-width="1.2">
        <path d="M22 136V38l17-16h99M606 22h99l17 16v98M22 962v91l17 17h99m468 0h99l17-17v-91"/>
        <path d="M22 76h13V39h41m592 0h41v37h13M22 1016h13v37h41m592 0h41v-37h13"/>
      </g>
      <g fill="#101827" opacity=".05"><path d="m0 202 41 28v320L0 583Zm744 0-41 28v320l41 33Z"/></g>
    </svg>
    <header class="identity">
      <div class="brand">EL SECRETO<span>DEL MAESTRO WU</span></div>
      ${demonstration ? '<div class="sample-tag">DEMOSTRACIÓN<span>SIN CONTENIDO DE JUEGO</span></div>' : ''}
    </header>
    <div class="ceremonial-heading">
      ${seal}
      ${data.identification ? `<p class="identification">${escape(data.identification)}</p>` : ''}
      <h1 data-source>${escape(data.title)}</h1>
      <div class="divider" aria-hidden="true"><span></span><i></i><span></span></div>
    </div>
    <section class="narrative" aria-label="${demonstration ? 'Texto de demostración' : 'Pista'}">
      ${data.paragraphs.map(paragraph => `<p data-source>${escape(paragraph)}</p>`).join('')}
    </section>
    <section class="reserved" aria-label="Espacio libre reservado">
      ${demonstration ? '<p class="reserved-caption">ESPACIO RESERVADO · MUESTRA</p>' : ''}
      <div class="cartouche"><div class="usable-space"></div></div>
    </section>
    <footer>${demonstration ? 'DEMOSTRACIÓN DE DISEÑO · NO ES UNA PISTA' : escape(data.footer || '')}</footer>
  </article></body></html>`
}
