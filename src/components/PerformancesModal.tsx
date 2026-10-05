import { resolvePlayerName } from '../playerData'
import type { BossGroup } from '../types'
import { getPerformances } from '../utils'
import { Modal } from './Modal'

interface PerformancesModalProps {
  bossGroups: BossGroup[]
  onClose: () => void
}

export function PerformancesModal({ bossGroups, onClose }: PerformancesModalProps) {
  const performances = getPerformances(bossGroups)
  const maxAbs = Math.max(...performances.map((p) => Math.abs(p.deltaPercent)), 1)

  return (
    <Modal title="Performances" onClose={onClose}>
      <div className="space-y-1">
        <p className="text-gray-400 text-sm mb-5">
          Scostamento % dalla media di gilda, sommato su tutti i bersagli affrontati
        </p>

        {performances.map((p, i) => {
          const pct = p.deltaPercent
          const isPos = pct >= 0
          // bar fills up to 50% of the chart area proportionally
          const barWidth = (Math.abs(pct) / maxAbs) * 100

          return (
            <div key={p.userId} className="flex items-center gap-3 py-1">
              {/* Rank + name */}
              <span className="text-gray-500 text-xs w-5 shrink-0 text-right">{i + 1}</span>
              <span className="text-white text-sm font-semibold w-36 shrink-0 truncate">
                {resolvePlayerName(p.userId)}
              </span>

              {/* Bar chart */}
              <div className="flex-1 flex items-center gap-0 h-6 relative">
                {/* Left half (negative) */}
                <div className="flex-1 flex justify-end items-center h-full">
                  {!isPos && (
                    <div
                      className="h-4 rounded-l bg-red-500/80"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>

                {/* Center line */}
                <div className="w-px h-full bg-gray-500 shrink-0" />

                {/* Right half (positive) */}
                <div className="flex-1 flex justify-start items-center h-full">
                  {isPos && (
                    <div
                      className="h-4 rounded-r bg-green-500/80"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>
              </div>

              {/* % label */}
              <span
                className={`text-sm font-bold w-14 shrink-0 text-right tabular-nums
                  ${isPos ? 'text-green-400' : 'text-red-400'}`}
              >
                {isPos ? '+' : ''}{pct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
