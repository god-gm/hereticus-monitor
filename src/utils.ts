import type {
  BossGroup,
  BossTarget,
  GuildRaidEntry,
  PlayerPerformance,
  PlayerStats,
  PlayerTokenUsage,
} from './types'

function getBossNumber(unitId: string): number {
  const match = unitId.match(/GuildBoss(\d+)/)
  return match ? parseInt(match[1]) : 0
}

function isBattleEntry(entry: GuildRaidEntry): boolean {
  if (entry.damageType !== 'Battle') return false
  if (entry.encounterType === 'Boss') return entry.remainingHp > 0
  if (entry.encounterType === 'SideBoss')
    return entry.remainingHp > 0 || entry.maxHp === entry.damageDealt
  return false
}

function getLastNLegendaryBossTypes(entries: GuildRaidEntry[], n: number): Set<string> {
  const legendaryBossUnitIds = [
    ...new Set(
      entries
        .filter((e) => e.rarity === 'Legendary' && e.encounterType === 'Boss')
        .map((e) => e.unitId),
    ),
  ].sort((a, b) => getBossNumber(a) - getBossNumber(b))

  const lastN = legendaryBossUnitIds.slice(-n)
  const types = new Set(
    entries.filter((e) => lastN.includes(e.unitId)).map((e) => e.type),
  )
  return types
}

export function buildBossGroups(entries: GuildRaidEntry[]): BossGroup[] {
  const lastTwoLegendaryTypes = getLastNLegendaryBossTypes(entries, 2)

  const relevantEntries = entries.filter((e) => {
    if (!isBattleEntry(e)) return false
    if (e.rarity === 'Mythic') return true
    if (e.rarity === 'Legendary' && lastTwoLegendaryTypes.has(e.type)) return true
    return false
  })

  // Group by (rarity, type) to form boss groups
  const groupMap = new Map<string, { rarity: string; type: string; entries: GuildRaidEntry[] }>()
  for (const entry of relevantEntries) {
    const key = `${entry.rarity}::${entry.type}`
    if (!groupMap.has(key)) groupMap.set(key, { rarity: entry.rarity, type: entry.type, entries: [] })
    groupMap.get(key)!.entries.push(entry)
  }

  const bossGroups: BossGroup[] = []

  for (const [, group] of groupMap) {
    const bossEntries = group.entries.filter((e) => e.encounterType === 'Boss')
    const sideEntries = group.entries.filter((e) => e.encounterType === 'SideBoss')

    if (bossEntries.length === 0) continue

    const bossUnitId = bossEntries[0].unitId
    const boss: BossTarget = {
      unitId: bossUnitId,
      type: group.type,
      rarity: group.rarity,
      encounterType: 'Boss',
      entries: bossEntries,
      avgDamage: avg(bossEntries.map((e) => e.damageDealt)),
      maxDamage: Math.max(...bossEntries.map((e) => e.damageDealt)),
    }

    // Group side bosses by unitId
    const sideUnitIds = [...new Set(sideEntries.map((e) => e.unitId))]
    const sideBosses: BossTarget[] = sideUnitIds.map((unitId) => {
      const sideGroup = sideEntries.filter((e) => e.unitId === unitId)
      return {
        unitId,
        type: group.type,
        rarity: group.rarity,
        encounterType: 'SideBoss',
        entries: sideGroup,
        avgDamage: avg(sideGroup.map((e) => e.damageDealt)),
        maxDamage: Math.max(...sideGroup.map((e) => e.damageDealt)),
      }
    })

    bossGroups.push({ rarity: group.rarity, type: group.type, boss, sideBosses })
  }

  // Sort: Legendary first (last 2, by boss number desc), then Mythic (by boss number asc)
  return bossGroups.sort((a, b) => {
    if (a.rarity === b.rarity) {
      return getBossNumber(a.boss.unitId) - getBossNumber(b.boss.unitId)
    }
    return a.rarity === 'Legendary' ? -1 : 1
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
  // Collect all targets (boss + side bosses) with their guild avg
  const targets: { key: string; target: BossTarget; guildAvg: number }[] = []
  for (const group of bossGroups) {
    const allTargets = [group.boss, ...group.sideBosses]
    for (const t of allTargets) {
      targets.push({ key: `${t.rarity}::${t.unitId}`, target: t, guildAvg: t.avgDamage })
    }
  }

  // Collect all players
  const allPlayerIds = new Set<string>()
  for (const { target } of targets) {
    for (const e of target.entries) allPlayerIds.add(e.userId)
  }

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
    performances.push({
      userId,
      totalDelta: details.reduce((s, d) => s + d.delta, 0),
      details,
    })
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
