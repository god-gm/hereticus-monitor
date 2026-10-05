import type { BossGroup } from '../types'
import { formatNumber, getPerformances, shortUserId } from '../utils'
import { Modal } from './Modal'

interface PerformancesModalProps {
  bossGroups: BossGroup[]
  onClose: () => void
}

export function PerformancesModal({ bossGroups, onClose }: PerformancesModalProps) {
  const performances = getPerformances(bossGroups)

  return (
    <Modal title="Performances" onClose={onClose}>
      <div className="space-y-1">
        <div className="text-gray-400 text-sm mb-4">
          Classifica per somma delta rispetto alla media di gilda
        </div>
        {performances.map((p, i) => {
          const isPositive = p.totalDelta >= 0
          return (
            <div
              key={p.userId}
              className="rounded-lg bg-gray-800 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                  <div>
                    <div className="font-mono text-amber-300 text-sm">{shortUserId(p.userId)}</div>
                    <div className="text-gray-500 text-xs hidden sm:block">{p.userId}</div>
                  </div>
                </div>
                <div className={`text-right font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{formatNumber(p.totalDelta)}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1 pl-9">
                {p.details.map((d) => {
                  const key = d.targetKey.split('::')[1]
                  const dPos = d.delta >= 0
                  return (
                    <div key={d.targetKey} className="flex justify-between text-xs text-gray-500">
                      <span className="font-mono truncate max-w-[200px]">{key}</span>
                      <span className={dPos ? 'text-green-500' : 'text-red-500'}>
                        {dPos ? '+' : ''}{formatNumber(d.delta)}
                        <span className="text-gray-600 ml-1">
                          ({formatNumber(d.playerAvg)} vs {formatNumber(d.guildAvg)})
                        </span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
