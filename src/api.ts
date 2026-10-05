import type { GuildRaidResponse } from './types'

const API_BASE =
  import.meta.env.DEV
    ? '/api-proxy/api/v1'
    : 'https://api.tacticusgame.com/api/v1'

export async function fetchGuildRaid(apiKey: string): Promise<GuildRaidResponse> {
  const response = await fetch(`${API_BASE}/guildRaid`, {
    headers: {
      accept: 'application/json',
      'X-API-KEY': apiKey,
    },
  })
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export function getBossImageUrl(unitId: string): string {
  return `https://cdn.ezekiel.snowprintstudios.com/${unitId}_BattlePreviewPopUp.png`
}
