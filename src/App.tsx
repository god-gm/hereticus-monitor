import { useState } from 'react'
import { fetchGuildRaid } from './api'
import { Dashboard } from './components/Dashboard'
import type { BossGroup, GuildRaidEntry } from './types'
import { buildBossGroups } from './utils'

type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; bossGroups: BossGroup[]; allEntries: GuildRaidEntry[]; season: number }

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [state, setState] = useState<AppState>({ status: 'idle' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) return

    setState({ status: 'loading' })
    try {
      const data = await fetchGuildRaid(apiKey.trim())
      const bossGroups = buildBossGroups(data.entries)
      setState({
        status: 'loaded',
        bossGroups,
        allEntries: data.entries,
        season: data.season,
      })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Errore sconosciuto',
      })
    }
  }

  if (state.status === 'loaded') {
    return (
      <Dashboard
        bossGroups={state.bossGroups}
        allEntries={state.allEntries}
        season={state.season}
        onReset={() => {
          setState({ status: 'idle' })
          setApiKey('')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-indigo-400 tracking-tight mb-2">Hereticus</h1>
          <p className="text-gray-400">Guild Raid Monitor</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Inserisci la tua API key..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white
                placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1
                focus:ring-indigo-500 transition-colors font-mono text-sm"
              disabled={state.status === 'loading'}
            />
          </div>

          {state.status === 'error' && (
            <div className="bg-red-900/40 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={state.status === 'loading' || !apiKey.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500
              text-white font-bold py-3 rounded-lg transition-colors"
          >
            {state.status === 'loading' ? 'Caricamento...' : 'Carica Dati'}
          </button>
        </form>
      </div>
    </div>
  )
}
