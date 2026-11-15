import { ceremonyProblems, cloneProfile, type ProfileConfig, type ProfileId } from './profile.ts'

// Local content, shared by the reducer and both displays. Always offer exactly two.
export const ceremonyColors = [
  { id: 'fire', name: 'Rojo fuego', hex: '#e34b42', symbol: '炎', element: 'La fuerza de la llama' },
  { id: 'water', name: 'Azul tormenta', hex: '#359bdb', symbol: '水', element: 'El poder de la tormenta' },
  { id: 'forest', name: 'Verde dragón', hex: '#40b889', symbol: '龍', element: 'El espíritu del dragón' },
  { id: 'sun', name: 'Dorado solar', hex: '#edbd4e', symbol: '光', element: 'La luz del amanecer' },
] as const
export const ceremonyPhases = ['arrival', 'color-1', 'name-1', 'color-2', 'name-2', 'ready', 'complete'] as const
export type CeremonyPhase = typeof ceremonyPhases[number]
export const phaseLabels: Record<CeremonyPhase, string> = {
  arrival: 'Presentación de los equipos', 'color-1': 'Color del equipo 1', 'name-1': 'Nombre del equipo 1',
  'color-2': 'Color del equipo 2', 'name-2': 'Nombre del equipo 2', ready: 'Los equipos definitivos', complete: 'El mensaje del maestro Wu',
}
export type CeremonyProgress = {
  version: 1; profileId: ProfileId; phase: CeremonyPhase; proposalIndexes: [number, number]
  confirmedColors: [boolean, boolean]; confirmedNames: [boolean, boolean]
  revision: number
}
export type CeremonyAction = { type: 'next' | 'back' | 'accept-name' | 'reject-name' | 'restart' }
  | { type: 'color'; color: string } | { type: 'manual-name'; name: string }
export function createCeremony(profileId: ProfileId): CeremonyProgress {
  return { version: 1, profileId, phase: 'arrival', proposalIndexes: [0, 0], confirmedColors: [false, false], confirmedNames: [false, false], revision: 0 }
}
export function parseCeremony(value: unknown, profileId: ProfileId): CeremonyProgress {
  if (!value || typeof value !== 'object') throw Error('Progreso de ceremonia no válido.')
  const p = value as CeremonyProgress
  if (p.version !== 1 || p.profileId !== profileId || !ceremonyPhases.includes(p.phase) || !Number.isSafeInteger(p.revision) || p.revision < 0
    || !Array.isArray(p.proposalIndexes) || p.proposalIndexes.length !== 2 || p.proposalIndexes.some(n => !Number.isSafeInteger(n) || n < 0 || n > 100)
    || [p.confirmedColors, p.confirmedNames].some(a => !Array.isArray(a) || a.length !== 2 || a.some(b => typeof b !== 'boolean'))) throw Error('Progreso de ceremonia no válido para este perfil.')
  // Read validated scalar values into new plain data; Vue may supply nested reactive proxies.
  return {
    version: 1, profileId, phase: p.phase, revision: p.revision,
    proposalIndexes: [p.proposalIndexes[0], p.proposalIndexes[1]],
    confirmedColors: [p.confirmedColors[0], p.confirmedColors[1]],
    confirmedNames: [p.confirmedNames[0], p.confirmedNames[1]],
  }
}
export const activeTeamIndex = (p: CeremonyProgress): 0 | 1 => p.phase.endsWith('2') ? 1 : 0
export const normalizedName = (name: string) => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
export function colorOptions(c: ProfileConfig, p: CeremonyProgress) {
  const other = 1 - activeTeamIndex(p)
  return ceremonyColors.filter(color => !p.confirmedColors[other] || color.hex !== c.teams[other].color?.toLowerCase()).slice(0, 2)
}
export const currentProposal = (c: ProfileConfig, p: CeremonyProgress) => c.teams[activeTeamIndex(p)].suggestedNames[p.proposalIndexes[activeTeamIndex(p)]] ?? null
export function ceremonyGuidance(c: ProfileConfig, p: CeremonyProgress) {
  const i = activeTeamIndex(p), number = i + 1
  if (p.phase === 'arrival') return { children: 'Saludan a su capitán y descubren quién forma su equipo.', operator: 'Presenta los dos equipos y lee el mensaje de Wu.', continue: 'Pulsa «Avanzar fase» para elegir el primer color.' }
  if (p.phase.startsWith('color-')) return { children: `El equipo ${number} elige uno de los dos poderes de la pantalla.`, operator: p.confirmedColors[i] ? 'Color guardado. Comprueba que coincide con su elección.' : 'Pulsa el color elegido por los niños para confirmarlo.', continue: p.confirmedColors[i] ? 'Pulsa «Avanzar fase» para elegir su nombre.' : 'Confirma un color para habilitar «Avanzar fase».' }
  if (p.phase.startsWith('name-')) return { children: `El equipo ${number} dice SÍ o NO al nombre de Wu, o inventa uno si se agotan.`, operator: p.confirmedNames[i] ? 'Nombre guardado. Ya puedes continuar.' : currentProposal(c,p) ? 'Pulsa SÍ para aceptar o NO para presentar la siguiente propuesta.' : 'Escribe el nombre que acuerden los niños y pulsa «Confirmar nombre manual».', continue: p.confirmedNames[i] ? 'Pulsa «Avanzar fase» para continuar la ceremonia.' : 'Confirma un nombre para habilitar «Avanzar fase».' }
  return { children: 'Celebran sus equipos definitivos y se preparan para escuchar a Wu.', operator: 'Presenta los nombres y colores definitivos. Deja unos segundos para celebrarlo.', continue: 'Pulsa «Continuar al mensaje de Wu»; después reproduce el vídeo en la pantalla pública.' }
}
export function wuNarration(c: ProfileConfig, p: CeremonyProgress): string {
  const i = activeTeamIndex(p)
  if (p.phase === 'arrival') return '«Dos equipos. Dos capitanes. Una gran misión. Y esta vez… ¡nadie se ha olvidado el sombrero!»'
  if (['ready','complete'].includes(p.phase)) return '«Cada ninja aporta su fuerza. Vuestros clanes tienen nombres distintos, pero juntos sois invencibles. ¡Que el monasterio escuche vuestra unión!»'
  if (p.phase.startsWith('color-')) return p.confirmedColors[i] ? '«¡Un gran poder! Usadlo con sabiduría… y sin quemar las cortinas del monasterio.»' : '«Dos poderes os esperan. Elegid juntos: aquí no vale pedir los dos para llevar.»'
  if (p.confirmedNames[i]) return '«¡Decidido! Ese nombre merece un lugar en los pergaminos. ¡Y un aplauso que despierte al dragón!»'
  const total = c.teams[i].suggestedNames.length, position = p.proposalIndexes[i]
  if (!currentProposal(c,p)) return total ? '«¡Habéis derrotado a todos mis pergaminos! Sois más creativos que vuestro maestro. Este queda en blanco: inventad vuestro nombre, jóvenes ninjas.»' : '«Hoy mi pergamino viene en blanco. Qué oportuno: ¡vosotros sois los creativos! Inventad juntos vuestro nombre, jóvenes ninjas.»'
  if (position === 0) return '«Tras consultar los pergaminos más antiguos… ¡he encontrado el nombre perfecto! Espero no haber abierto el recetario.»'
  if (position === 1) return '«¡Un NO! Mi sabiduría necesita una actualización. ' + (position === total - 1 ? 'Este es mi último pergamino… ¡sin presión!' : 'A ver qué os parece este…') + '»'
  const remaining = total - position
  if (position === total - 1) return '«¡Último pergamino! Si este tampoco os gusta, nombraré al dragón encargado de las ideas. Él propone “Grrr”.»'
  const doubts = position / total < .5
    ? ['Mi barba dice que este sí.', 'Lo encontré junto a la receta de fideos.', 'Prometo que este no lo escribió mi sombrero.']
    : ['Empiezo a sospechar que estos pergaminos son de cocina.', '¡Mis pergaminos están sudando más que yo entrenando!', 'Creo que el dragón se ha comido las mejores ideas.']
  return `«Me quedan ${remaining} pergaminos. ${doubts[position % doubts.length]} ¡Probemos este!»`
}
function checkName(name: string, other: string | null) {
  if (!name.trim() || name.length > 120) throw Error('Escribe un nombre de entre 1 y 120 caracteres.')
  if (other && normalizedName(name) === normalizedName(other)) throw Error('Los dos equipos deben tener nombres diferentes.')
}
export function ceremonyFinalProblems(c: ProfileConfig, p: CeremonyProgress): string[] {
  const problems = ceremonyProblems(c)
  c.teams.forEach((t, i) => {
    if (!p.confirmedColors[i] || !ceremonyColors.some(color => color.hex === t.color?.toLowerCase())) problems.push(`Equipo ${i + 1}: confirma su color en la ceremonia.`)
    if (!p.confirmedNames[i] || !t.name?.trim()) problems.push(`Equipo ${i + 1}: confirma su nombre en la ceremonia.`)
  })
  if (c.teams[0].color?.toLowerCase() === c.teams[1].color?.toLowerCase()) problems.push('Los colores deben ser diferentes.')
  if (c.teams.every(t => t.name) && normalizedName(c.teams[0].name!) === normalizedName(c.teams[1].name!)) problems.push('Los nombres deben ser diferentes.')
  return problems
}
export function ceremonyNextProblem(c: ProfileConfig, p: CeremonyProgress): string {
  const preparation = ceremonyProblems(c).join(' ')
  if (preparation) return preparation
  const i = activeTeamIndex(p), team = c.teams[i], other = c.teams[1 - i]
  if (p.phase.startsWith('color-') && (!p.confirmedColors[i] || !ceremonyColors.some(color => color.hex === team.color?.toLowerCase()) || team.color?.toLowerCase() === other.color?.toLowerCase() && p.confirmedColors[1 - i])) return 'Confirma un color diferente antes de continuar.'
  if (p.phase.startsWith('name-')) {
    if (!p.confirmedNames[i] || !team.name?.trim()) return 'Confirma el nombre antes de continuar.'
    if (p.confirmedNames[1 - i] && other.name && normalizedName(team.name) === normalizedName(other.name)) return 'Los dos equipos deben tener nombres diferentes.'
  }
  return ['ready','complete'].includes(p.phase) ? ceremonyFinalProblems(c,p).join(' ') : ''
}
// Pure state machine: it never reads storage, changes a different profile or invents participants.
export function transitionCeremony(config: ProfileConfig, progress: CeremonyProgress, action: CeremonyAction) {
  const c = cloneProfile(config), p = parseCeremony(progress, config.id)
  const problems = ceremonyProblems(c)
  if (problems.length) throw Error(problems.join(' '))
  if (action.type === 'restart') { const reset = createCeremony(c.id); reset.revision = p.revision + 1; return { config: c, progress: reset } }
  const i = activeTeamIndex(p), team = c.teams[i], other = c.teams[1 - i]
  if (action.type === 'back') {
    const index = ceremonyPhases.indexOf(p.phase)
    if (!index) throw Error('Ya estás al principio de la ceremonia.')
    p.phase = ceremonyPhases[index - 1]
  } else if (action.type === 'color') {
    if (!p.phase.startsWith('color-') || !colorOptions(c, p).some(color => color.hex === action.color)) throw Error('Elige uno de los dos colores ofrecidos para esta fase.')
    team.color = action.color; p.confirmedColors[i] = true
  } else if (action.type === 'accept-name' || action.type === 'manual-name') {
    if (!p.phase.startsWith('name-')) throw Error('No estamos eligiendo un nombre.')
    const proposal = currentProposal(c, p)
    if (action.type === 'manual-name' && proposal !== null) throw Error('Primero revisa las propuestas del equipo.')
    const name = action.type === 'manual-name' ? action.name.trim() : proposal
    if (name === null) throw Error('No quedan propuestas. Escribe un nombre desde el panel.')
    checkName(name, p.confirmedNames[1 - i] ? other.name : null); team.name = name; p.confirmedNames[i] = true
  } else if (action.type === 'reject-name') {
    if (!p.phase.startsWith('name-') || currentProposal(c, p) === null) throw Error('No hay una propuesta que rechazar.')
    p.proposalIndexes[i]++; p.confirmedNames[i] = false
  } else if (action.type === 'next') {
    const problem = ceremonyNextProblem(c,p); if (problem) throw Error(problem)
    p.phase = ceremonyPhases[Math.min(ceremonyPhases.length - 1, ceremonyPhases.indexOf(p.phase) + 1)]
  } else throw Error('Acción desconocida.')
  p.revision++
  return { config: c, progress: p }
}
