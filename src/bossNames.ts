// Maps UNIT_ID key → display name (case-insensitive substring match)
const UNIT_NAME_MAP: [string, string][] = [
  ['EldarFarseer', 'Eldryon'],
  ['NecroMenhir', 'Menhir'],
  ['AvatarOfKhaine', 'Avatar Of Khaine'],
  ['TervigonLeviathan', 'Tervigon'],
  ['DarkaLion', 'The Lion'],
  ['AdmecMarshall', "Tan Gi'Da"],
  ['BelisariusRW', 'Belisarius Cawl'],
  ['Avatar', 'Avatar Of Khaine'],
  ['DarkaTerminator', 'Baraqiel'],
  ['TyranNeurothrope', 'Neurothrope'],
  ['DeathRotbone', 'Nauseous'],
  ['OrksBigMek', 'Gibbascrapsz'],
  ['Riptide', 'Riptide'],
  ['WingedPrime', 'Winged Prime'],
  ['AstraOrdnance', 'Thaddeus'],
  ['AdmecManipulus', 'Actus'],
  ['Magnus', 'Magnus'],
  ['DeathBlightbringer', 'Corrodius'],
  ['ThousInfernalMaster', 'Abraxas'],
  ['TauMarksman', "Sho'Syl"],
  ['Belisarius', 'Belisarius Cawl'],
  ['Ghazghkull', 'Ghazghkull'],
  ['EldarAutarch', 'Aethana'],
  ['RogalDorn', 'Rogal Dorn'],
  ['Tervigon', 'Tervigon'],
  ['SilentKing', 'Szarekh'],
  ['DarkaCompanion', 'Forcas'],
  ['TauCrisis', "Re'Vas"],
  ['HiveTyrant', 'Hive Tyrant'],
  ['OrksNob', 'Tanksmasha'],
  ['TyranWarrior', 'Tyran Warrior'],
  ['Mortarion', 'Mortarion'],
  ['ScreamerKiller', 'Screamer Killer'],
  ['ThousSorcerer', 'Thaumachus'],
  ['AstraPrimarisPsy', 'Sibyll'],
]

// Sorted longest-key-first to prefer more specific matches
const SORTED_MAP = [...UNIT_NAME_MAP].sort((a, b) => b[0].length - a[0].length)

function extractSideBossSuffix(unitId: string): string {
  const match = unitId.match(/MiniBoss\d+(.+)$/)
  return match ? match[1] : unitId
}

export function decodeBossName(unitId: string, type: string, encounterType: string): string {
  const key = encounterType === 'SideBoss' ? extractSideBossSuffix(unitId) : type
  const lower = key.toLowerCase()
  for (const [mapKey, name] of SORTED_MAP) {
    if (lower.includes(mapKey.toLowerCase())) return name
  }
  return key
}
