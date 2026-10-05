import type { GuildRaidResponse } from './types'

const PROXY_BASE = 'https://ura16uwmk5.execute-api.eu-north-1.amazonaws.com/default'
const PROXY_KEY = '7e6b4c2f9a1d8e3b0c5f7a2d4e6b8c1f3a5d7e9b0c2f4a6d8e1b3c5f7a9d0e3d'

export async function fetchGuildRaid(apiKey: string): Promise<GuildRaidResponse> {
  const url = `${PROXY_BASE}/api/external/raid-data?apiKey=${encodeURIComponent(apiKey)}`
  const response = await fetch(url, {
    headers: {
      'X-External-Api-Key': PROXY_KEY,
    },
  })

  if (response.status === 401) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? 'API key non valida')
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? `Errore ${response.status}`)
  }

  return response.json()
}

export function getBossImageUrl(unitId: string): string {
  return `https://cdn.ezekiel.snowprintstudios.com/${unitId}_BattlePreviewPopUp.png`
}
