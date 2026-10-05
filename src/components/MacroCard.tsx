import type { BossGroup } from '../types'
import { BossCard } from './BossCard'

interface MacroCardProps {
  group: BossGroup
}

const rarityGradient: Record<string, string> = {
  Legendary: 'from-yellow-900/30 to-gray-800/20 border-yellow-700/40',
  Mythic: 'from-red-900/30 to-gray-800/20 border-red-700/40',
}

export function MacroCard({ group }: MacroCardProps) {
  const gradient = rarityGradient[group.rarity] ?? 'from-gray-800/30 to-gray-700/20 border-gray-600/40'
  const totalCards = 1 + group.sideBosses.length

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${gradient} p-4 shadow-lg`}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full
            ${group.rarity === 'Mythic' ? 'bg-red-800/60 text-red-300' : 'bg-yellow-800/60 text-yellow-300'}`}
        >
          {group.rarity}
        </span>
        <span className="text-gray-300 font-semibold">{group.type}</span>
      </div>

      <div
        className={`grid gap-3 ${totalCards === 1 ? 'grid-cols-1' : totalCards === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
      >
        <BossCard target={group.boss} variant="main" />
        {group.sideBosses.map((side) => (
          <BossCard key={side.unitId} target={side} variant="side" />
        ))}
      </div>
    </div>
  )
}
