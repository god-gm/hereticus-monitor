import { resolvePlayerName } from '../playerData'
import type { GuildRaidEntry } from '../types'
import { getTokenUsage } from '../utils'
import { Modal } from './Modal'

interface TokenUsageModalProps {
  entries: GuildRaidEntry[]
  onClose: () => void
}

export function TokenUsageModal({ entries, onClose }: TokenUsageModalProps) {
  const usage = getTokenUsage(entries)

  return (
    <Modal title="Token Usage" onClose={onClose}>
      <div className="space-y-1">
        <div className="text-gray-400 text-sm mb-4">{usage.length} giocatori</div>
        {usage.map((u, i) => (
          <div
            key={u.userId}
            className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
              <span className="text-white font-semibold">{resolvePlayerName(u.userId)}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">{u.count}</div>
              <div className="text-gray-500 text-xs">attacchi</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
