import { useState } from 'react'
import { getBossImageUrl } from '../api'
import { decodeBossName } from '../bossNames'
import type { BossTarget } from '../types'
import { formatNumber } from '../utils'
import { TargetModal } from './TargetModal'

interface BossCardProps {
  target: BossTarget
  variant?: 'main' | 'side'
}

export function BossCard({ target, variant = 'main' }: BossCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [imgError, setImgError] = useState(false)
  const isSide = variant === 'side'

  const displayName = decodeBossName(target.unitId, target.type, target.encounterType)
  const label = isSide ? 'Side Boss' : target.rarity
  const labelColor = isSide
    ? 'text-purple-400 bg-purple-900/40'
    : target.rarity === 'Mythic'
      ? 'text-red-400 bg-red-900/40'
      : 'text-yellow-400 bg-yellow-900/40'

  return (
    <>
      <div
        className={`flex flex-col rounded-xl border bg-gray-800/60 overflow-hidden transition-all
          ${isSide ? 'border-gray-600' : 'border-gray-500'}`}
      >
        <div className="relative flex items-center justify-center bg-gray-900 h-40">
          {!imgError ? (
            <img
              src={getBossImageUrl(target.unitId)}
              alt={displayName}
              className="h-full w-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              No image
            </div>
          )}
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${labelColor}`}>
            {label}
          </span>
        </div>

        <div className="flex flex-col gap-3 p-4 flex-1">
          <div>
            <div className="text-white font-bold truncate">{displayName}</div>
            <div className="text-xs text-gray-500 mt-0.5">{target.entries.length} attacchi validi</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-700/50 rounded-lg p-2 text-center">
              <div className="text-white font-bold text-base">{formatNumber(target.avgDamage)}</div>
              <div className="text-gray-400 text-xs">Media danni</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2 text-center">
              <div className="text-green-400 font-bold text-base">{formatNumber(target.maxDamage)}</div>
              <div className="text-gray-400 text-xs">Danno max</div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-auto w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
              text-white text-sm font-semibold py-2 transition-colors"
          >
            Giocatori
          </button>
        </div>
      </div>

      {showModal && <TargetModal target={target} onClose={() => setShowModal(false)} />}
    </>
  )
}
