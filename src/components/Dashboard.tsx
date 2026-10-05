import { useState } from 'react'
import type { BossGroup, GuildRaidEntry } from '../types'
import { MacroCard } from './MacroCard'
import { PerformancesModal } from './PerformancesModal'
import { TokenUsageModal } from './TokenUsageModal'

interface DashboardProps {
  bossGroups: BossGroup[]
  allEntries: GuildRaidEntry[]
  season: number
  onReset: () => void
}

export function Dashboard({ bossGroups, allEntries, season, onReset }: DashboardProps) {
  const [showTokenUsage, setShowTokenUsage] = useState(false)
  const [showPerformances, setShowPerformances] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-indigo-400">Hereticus</span>
            <span className="text-gray-500 text-sm">Season {season}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowTokenUsage(true)}
              className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-semibold transition-colors"
            >
              Token Usage
            </button>
            <button
              onClick={() => setShowPerformances(true)}
              className="rounded-lg bg-indigo-700 hover:bg-indigo-600 px-4 py-2 text-sm font-semibold transition-colors"
            >
              Performances
            </button>
            <button
              onClick={onReset}
              className="rounded-lg bg-gray-800 hover:bg-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Cambia API Key
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="text-sm text-gray-500">
          {bossGroups.length} gruppi boss trovati (ultimi 2 leggendari + 3 mitici)
        </div>
        {bossGroups.map((group) => (
          <MacroCard key={`${group.rarity}::${group.type}`} group={group} />
        ))}
      </main>

      {showTokenUsage && (
        <TokenUsageModal entries={allEntries} onClose={() => setShowTokenUsage(false)} />
      )}
      {showPerformances && (
        <PerformancesModal bossGroups={bossGroups} onClose={() => setShowPerformances(false)} />
      )}
    </div>
  )
}
