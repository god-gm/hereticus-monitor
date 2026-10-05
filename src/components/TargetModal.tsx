import type { BossTarget } from '../types'
import { formatNumber, getPlayerStatsForTarget, shortUserId } from '../utils'
import { Modal } from './Modal'

interface TargetModalProps {
  target: BossTarget
  onClose: () => void
}

export function TargetModal({ target, onClose }: TargetModalProps) {
  const stats = getPlayerStatsForTarget(target)
  const label = target.encounterType === 'Boss' ? 'Boss' : 'Side Boss'

  return (
    <Modal title={`${label}: ${target.unitId}`} onClose={onClose}>
      <div className="space-y-2">
        <div className="text-gray-400 text-sm mb-4">
          {stats.length} giocatori • Media gilda: {formatNumber(target.avgDamage)}
        </div>
        <div className="space-y-1">
          {stats.map((s, i) => (
            <div
              key={s.userId}
              className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                <span className="font-mono text-amber-300 text-sm">{shortUserId(s.userId)}</span>
                <span className="text-gray-500 text-xs hidden sm:block">{s.userId}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <div className="text-white font-semibold">{formatNumber(s.avgDamage)}</div>
                  <div className="text-gray-500 text-xs">media ({s.entries.length} att.)</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">{formatNumber(s.maxDamage)}</div>
                  <div className="text-gray-500 text-xs">max</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
