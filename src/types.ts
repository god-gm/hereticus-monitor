export interface HeroDetail {
  unitId: string
  power: number
}

export interface MachineOfWarDetail {
  unitId: string
  power: number
}

export interface GuildRaidEntry {
  userId: string
  tier: number
  set: number
  encounterIndex: number
  remainingHp: number
  maxHp: number
  encounterType: 'Boss' | 'SideBoss'
  unitId: string
  type: string
  rarity: string
  damageDealt: number
  damageType: string
  startedOn: number
  completedOn: number
  heroDetails: HeroDetail[]
  machineOfWarDetails: MachineOfWarDetail | null
  globalConfigHash: string
}

export interface GuildRaidResponse {
  season: number
  seasonConfigId: string
  entries: GuildRaidEntry[]
}

export interface BossGroup {
  rarity: string
  type: string
  boss: BossTarget
  sideBosses: BossTarget[]
}

export interface BossTarget {
  unitId: string
  type: string
  rarity: string
  encounterType: 'Boss' | 'SideBoss'
  entries: GuildRaidEntry[]
  avgDamage: number
  maxDamage: number
}

export interface PlayerStats {
  userId: string
  entries: GuildRaidEntry[]
  avgDamage: number
  maxDamage: number
}

export interface PlayerTokenUsage {
  userId: string
  count: number
}

export interface PlayerPerformance {
  userId: string
  totalDelta: number
  deltaPercent: number
  details: { targetKey: string; playerAvg: number; guildAvg: number; delta: number }[]
}
