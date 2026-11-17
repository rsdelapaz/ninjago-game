// A self-contained URL contract. No game imports or browser storage.
export const MAX_ENIGMA_LENGTH = 48
export const MAX_ENIGMA_INPUT = 256
export type EnigmaSecret = { ok: true; answer: string; canonical: string } | { ok: false; error: string }
export type EnigmaPhase = 'invalid' | 'ready' | 'charging' | 'awakening' | 'revealing' | 'celebrating' | 'success' | 'collapsing' | 'extinguishing' | 'falling' | 'failure'

export function prepareEnigmaText(value: string): string | null {
  if (value.length > MAX_ENIGMA_INPUT || /[\u0000-\u001f\u007f]/u.test(value)) return null
  const text = value.normalize('NFC').trim().replace(/\s+/gu, ' ')
  return text.length > 0 && text.length <= MAX_ENIGMA_LENGTH && /^[a-záéíóúüñ]+(?: [a-záéíóúüñ]+)*$/iu.test(text)
    ? text.toLocaleUpperCase('es') : null
}

// Only vocal accents are folded. NFC preserves Ñ, including decomposed N + tilde.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
export function normalizeEnigma(value: string): string | null {
  const text = prepareEnigmaText(value)
  return text === null ? null : text.replace(/[ÁÉÍÓÚÜ]/g, vowel => ({ Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' })[vowel]!)
}

export function readEnigmaSecret(hash: string): EnigmaSecret {
  const invalid = { ok: false as const, error: 'El enlace no contiene una palabra válida. Pide al organizador que revise el parámetro palabra del fragmento de la URL.' }
  if (!hash.startsWith('#') || hash.length > 1024) return invalid
  try {
    // URLSearchParams tolerates malformed percent/UTF-8; reject those explicitly first.
    decodeURIComponent(hash.slice(1).replace(/\+/g, ' '))
    const params = new URLSearchParams(hash.slice(1)), values = params.getAll('palabra')
    if (values.length !== 1) return invalid
    const answer = prepareEnigmaText(values[0]!)
    return answer === null ? invalid : { ok: true, answer, canonical: normalizeEnigma(answer)! }
  } catch { return invalid }
}

export function isEnigmaCorrect(proposal: string, secret: EnigmaSecret): boolean {
  return secret.ok && normalizeEnigma(proposal) === secret.canonical
}

export const isEnigmaBusy = (phase: EnigmaPhase) => ['charging', 'awakening', 'revealing', 'celebrating', 'collapsing', 'extinguishing', 'falling'].includes(phase)
// Maximum duration stays bounded even for long expressions. No per-letter timers.
export const enigmaRevealMs = (length: number) => 550 + Math.min(MAX_ENIGMA_LENGTH, length) * 45
