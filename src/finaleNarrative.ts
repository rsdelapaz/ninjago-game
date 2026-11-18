import type { ProfileConfig } from './profile'
import { finaleCeremony, finaleRoster, finaleTeamIndex, type FinaleProgress } from './finale.ts'

/** Public copy is derived only from the current story beat; future revelations never enter its DOM. */
export function finaleNarrative(config: ProfileConfig, progress: FinaleProgress) {
  const phase = finaleCeremony(progress), index = finaleTeamIndex(progress)
  const clan = finaleRoster(config, index ?? 0), first = finaleRoster(config, 0)
  const captain = first.captain?.name || 'El capitán'
  const scripts: Record<string, { title: string; lines: string[]; action?: string }> = {
    intro: { title: 'EL ÚLTIMO SECRETO', lines: ['Habéis llegado hasta el santuario. Soy el Maestro Wu. El sello ancestral espera vuestras palabras.'], action: 'COMENZAR LA CEREMONIA' },
    call1: { title: clan.name, lines: [`¡${clan.name}! Capitán ${clan.captain?.name || ''}, y todos los ninjas de vuestro clan, acercaos al sello.`], action: 'ACERCARSE AL SELLO' },
    call2: { title: clan.name, lines: [`¡${clan.name}! Es vuestro turno. Acercaos al sello.`], action: 'ACERCARSE AL SELLO' },
    clues1: { title: 'EL SELLO OS ESPERA', lines: [progress.cluesMissing ? 'Entonces regresad y buscad las que os falten. El sello seguirá esperando.' : '¿Habéis reunido todas vuestras pistas?'] },
    clues2: { title: 'ES VUESTRO TURNO', lines: [progress.cluesMissing ? 'Entonces regresad y buscad las que os falten. El sello seguirá esperando.' : '¿Habéis reunido todas vuestras pistas?'] },
    answer1: { title: 'VUESTRAS PALABRAS', lines: ['Muy bien. Ha llegado vuestra oportunidad. ¿Qué frase habéis descubierto?'] },
    answer2: { title: 'EL SELLO ESCUCHA', lines: ['Escucharé vuestra frase. Tal vez esas sean las palabras que abran el sello.'] },
    fail1: { title: 'EL SELLO NO SE ABRE', lines: ['El sello ha escuchado vuestra respuesta… pero esas no son las palabras que espera.', `Habéis llegado muy lejos, ${clan.name}. Ahora escucharemos al segundo clan.`], action: 'LLAMAR AL SEGUNDO CLAN' },
    fail2: { title: 'EL SANTUARIO GUARDA SILENCIO', lines: ['Dos clanes han presentado sus respuestas… y el sello sigue cerrado.'], action: 'ESCUCHAR AL MAESTRO WU' },
    truth: { title: 'AHORA COMPRENDO EL MISTERIO', lines: ['Cada clan guarda una parte del mensaje. Ninguno tiene la frase completa.', '¡Unid vuestras pistas! Ordenadlas y formad una sola frase. Solo así podréis descubrir mi último secreto.'], action: 'UNIR LAS PISTAS' },
    captain: { title: `CAPITÁN ${captain}`, lines: progress.earlyCorrect ? ['El sello ha reconocido vuestras palabras.', `Capitán ${captain}, acércate.`, 'Habéis descubierto la frase. Cuando estéis preparados, pronúnciala en voz alta ante todos.'] : [`Capitán ${captain}, acércate.`, 'Tus compañeros han recorrido un largo camino. Ahora los dos clanes comparten un mismo propósito.', 'Cuando estéis preparados, pronuncia en voz alta la frase que habéis descubierto juntos.'], action: 'ESTAMOS PREPARADOS' },
    joint: { title: 'LA ÚLTIMA FRASE', lines: [`Capitán ${captain}, el santuario te escucha. Pronuncia la frase ante todos y entregad vuestra respuesta al sello.`] },
    jointFail: { title: 'AÚN FALTA ALGO', lines: ['El sello ha despertado un instante, pero aún falta algo. Revisad cada fragmento y volved a intentarlo. Esta vez, todos juntos.'], action: 'VOLVER A INTENTARLO' },
    victory: { title: 'EL SECRETO HA SIDO REVELADO', lines: ['Recordad este día, ninjas. Las mayores victorias son las que conseguimos juntos.'] },
  }
  const script = scripts[phase] || { title: 'EL SELLO ESTÁ ESCUCHANDO…', lines: [] }
  const custom = ['truth', 'jointFail'].includes(phase) && (progress.attempts?.[1] || 0) > 0 ? config.finale.failureMessage : ''
  return { ...script, phase, index, clan, captain: first.captain, custom, canConfirm: phase === 'clues1' || phase === 'clues2' }
}
