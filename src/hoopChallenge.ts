import { newChallenge, type Challenge } from './challenges.ts'

// Example data retained for regression fixtures; the editor creates ordinary blank challenges.
export function createHoopChallenge(): Challenge {
  return {
    ...newChallenge(),
    title: 'El Aro del Dragón',
    publicInstruction: 'Pasad el aro del primer ninja al último.',
    keyRule: 'NO PODÉIS SOLTAROS DE LAS MANOS.',
    description: 'Ninjas, formad una fila y unid vuestras manos. Pasad el aro por vuestro cuerpo, uno a uno, hasta el último compañero, sin soltaros. ¡El equipo que tarde menos demostrará el poder del dragón unido!',
    imageFilename: 'aro-del-dragon-unido.png',
    visible: true,
  }
}
