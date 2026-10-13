import type {
  BossGroup,
  BossTarget,
  GuildRaidEntry,
  PlayerPerformance,
  PlayerStats,
  PlayerTokenUsage,
} from './types'

function getGroupPrefix(unitId: string): string {
  const match = unitId.match(/^(GuildBoss\d+)/)
  return match ? match[1] : unitId
}

function getBossNumber(prefix: string): number {
  const match = prefix.match(/GuildBoss(\d+)/)
  return match ? parseInt(match[1]) : 0
}

function isBattleEntry(entry: GuildRaidEntry): boolean {
  if (entry.damageType !== 'Battle') return false
  if (entry.encounterType === 'Boss') return entry.remainingHp > 0
  if (entry.encounterType === 'SideBoss')
    return entry.remainingHp > 0 || entry.maxHp === entry.damageDealt
  return false
}

export function buildBossGroups(entries: GuildRaidEntry[]): BossGroup[] {
  const battleEntries = entries.filter(isBattleEntry)

  // All mythic boss group prefixes (e.g. "GuildBoss11", "GuildBoss8")
  const mythicPrefixes = new Set(
    battleEntries
      .filter((e) => e.rarity === 'Mythic' && e.encounterType === 'Boss')
      .map((e) => getGroupPrefix(e.unitId)),
  )

  // Legendary boss group prefixes sorted by boss number, excluding those in Mythic
  const legendaryBossPrefixes = [
    ...new Set(
      battleEntries
        .filter((e) => e.rarity === 'Legendary' && e.encounterType === 'Boss')
        .map((e) => getGroupPrefix(e.unitId)),
    ),
  ]
    .sort((a, b) => getBossNumber(a) - getBossNumber(b))
    .filter((p) => !mythicPrefixes.has(p))

  const lastTwoLegendaryPrefixes = new Set(legendaryBossPrefixes.slice(-2))

  // Keep only relevant entries
  const relevantEntries = battleEntries.filter((e) => {
    const prefix = getGroupPrefix(e.unitId)
    if (e.rarity === 'Mythic' && mythicPrefixes.has(prefix)) return true
    if (e.rarity === 'Legendary' && lastTwoLegendaryPrefixes.has(prefix)) return true
    return false
  })

  // Group by (rarity, GuildBossN prefix)
  const groupMap = new Map<string, { rarity: string; prefix: string; entries: GuildRaidEntry[] }>()
  for (const entry of relevantEntries) {
    const prefix = getGroupPrefix(entry.unitId)
    const key = `${entry.rarity}::${prefix}`
    if (!groupMap.has(key)) groupMap.set(key, { rarity: entry.rarity, prefix, entries: [] })
    groupMap.get(key)!.entries.push(entry)
  }

  const bossGroups: BossGroup[] = []

  for (const [, group] of groupMap) {
    const bossEntries = group.entries.filter((e) => e.encounterType === 'Boss')
    const sideEntries = group.entries.filter((e) => e.encounterType === 'SideBoss')

    if (bossEntries.length === 0) continue

    const bossUnitId = bossEntries[0].unitId
    const bossType = bossEntries[0].type
    const boss: BossTarget = {
      unitId: bossUnitId,
      type: bossType,
      rarity: group.rarity,
      encounterType: 'Boss',
      entries: bossEntries,
      avgDamage: avg(bossEntries.map((e) => e.damageDealt)),
      maxDamage: Math.max(...bossEntries.map((e) => e.damageDealt)),
    }

    const sideUnitIds = [...new Set(sideEntries.map((e) => e.unitId))]
    const sideBosses: BossTarget[] = sideUnitIds.map((unitId) => {
      const sg = sideEntries.filter((e) => e.unitId === unitId)
      return {
        unitId,
        type: bossType,
        rarity: group.rarity,
        encounterType: 'SideBoss',
        entries: sg,
        avgDamage: avg(sg.map((e) => e.damageDealt)),
        maxDamage: Math.max(...sg.map((e) => e.damageDealt)),
      }
    })

    bossGroups.push({ rarity: group.rarity, type: bossType, boss, sideBosses })
  }

  // Sort: Legendary first (ascending boss number), then Mythic (ascending first encounter timestamp)
  return bossGroups.sort((a, b) => {
    if (a.rarity !== b.rarity) return a.rarity === 'Legendary' ? -1 : 1
    if (a.rarity === 'Legendary') {
      return getBossNumber(getGroupPrefix(a.boss.unitId)) - getBossNumber(getGroupPrefix(b.boss.unitId))
    }
    // Mythic: order by earliest attack timestamp
    const tsA = Math.min(...a.boss.entries.map((e) => e.startedOn))
    const tsB = Math.min(...b.boss.entries.map((e) => e.startedOn))
    return tsA - tsB
  })
}

export function getPlayerStatsForTarget(target: BossTarget): PlayerStats[] {
  const byPlayer = new Map<string, GuildRaidEntry[]>()
  for (const entry of target.entries) {
    if (!byPlayer.has(entry.userId)) byPlayer.set(entry.userId, [])
    byPlayer.get(entry.userId)!.push(entry)
  }

  return [...byPlayer.entries()]
    .map(([userId, entries]) => ({
      userId,
      entries,
      avgDamage: avg(entries.map((e) => e.damageDealt)),
      maxDamage: Math.max(...entries.map((e) => e.damageDealt)),
    }))
    .sort((a, b) => b.avgDamage - a.avgDamage)
}

export function getTokenUsage(entries: GuildRaidEntry[]): PlayerTokenUsage[] {
  const byPlayer = new Map<string, number>()
  for (const entry of entries) {
    if (entry.damageType !== 'Battle') continue
    byPlayer.set(entry.userId, (byPlayer.get(entry.userId) ?? 0) + 1)
  }
  return [...byPlayer.entries()]
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
}

export function getPerformances(bossGroups: BossGroup[]): PlayerPerformance[] {
  const targets: { key: string; target: BossTarget; guildAvg: number }[] = []
  for (const group of bossGroups) {
    for (const t of [group.boss, ...group.sideBosses]) {
      targets.push({ key: `${t.rarity}::${t.unitId}`, target: t, guildAvg: t.avgDamage })
    }
  }

  const allPlayerIds = new Set<string>()
  for (const { target } of targets) {
    for (const e of target.entries) allPlayerIds.add(e.userId)
  }

  const allGuildAvgSum = targets.reduce((s, t) => s + t.guildAvg, 0)

  const performances: PlayerPerformance[] = []

  for (const userId of allPlayerIds) {
    const details: PlayerPerformance['details'] = []

    for (const { key, target, guildAvg } of targets) {
      const playerEntries = target.entries.filter((e) => e.userId === userId)
      if (playerEntries.length === 0) continue
      const playerAvg = avg(playerEntries.map((e) => e.damageDealt))
      details.push({ targetKey: key, playerAvg, guildAvg, delta: playerAvg - guildAvg })
    }

    if (details.length === 0) continue
    const totalDelta = details.reduce((s, d) => s + d.delta, 0)
    const deltaPercent = allGuildAvgSum > 0 ? (totalDelta / allGuildAvgSum) * 100 : 0
    performances.push({ userId, totalDelta, deltaPercent, details })
  }

  return performances.sort((a, b) => b.totalDelta - a.totalDelta)
}

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('it-IT')
}

export function shortUserId(userId: string): string {
  return userId.split('-')[0].toUpperCase()
}
