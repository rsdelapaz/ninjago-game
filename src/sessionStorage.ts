// Legacy schema v1 retained for explicit recovery; active configuration uses ProfileConfig.
import { parseConfig, exportConfig, type LegacySessionConfig } from './session'
const prefix = 'ninja-config-v1:'
export function loadConfigs(storage: Storage): LegacySessionConfig[] {
  const configs: LegacySessionConfig[] = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (!key?.startsWith(prefix)) continue
    const config = parseConfig(JSON.parse(storage.getItem(key)!))
    if (key !== prefix + config.id) throw new Error('Identificador de sesión incoherente en el almacenamiento.')
    configs.push(config)
  }
  return configs
}
export function saveConfig(storage: Storage, config: LegacySessionConfig, previous: string | null = null): string {
  const key = prefix + config.id
  if (storage.getItem(key) !== previous) throw new Error('La sesión ya existe o ha cambiado en otra ventana. Recarga antes de guardar; no se ha sobrescrito.')
  const json = exportConfig(config)
  storage.setItem(key, json)
  return json
}
export function storedConfig(storage: Storage, id: string): string | null { return storage.getItem(prefix + id) }
