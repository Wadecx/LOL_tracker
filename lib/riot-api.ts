import type {
  RiotAccount,
  Summoner,
  LeagueEntry,
  Match,
  PlayerStats,
  ChampionStats,
  MatchParticipant,
} from '@/types/riot'
import { getRegionConfig, getPlatformUrl, getRegionalUrl } from './regions'
import { calculateKDA, getWinRate } from './utils'

const RIOT_API_KEY = process.env.RIOT_API_KEY

if (!RIOT_API_KEY) {
  console.warn('RIOT_API_KEY is not set in environment variables')
}

class RiotApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'RiotApiError'
  }
}

async function fetchRiotApi<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': RIOT_API_KEY || '',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  })

  if (!response.ok) {
    const errorMessages: Record<number, string> = {
      400: 'Bad request',
      401: 'Invalid API key',
      403: 'Forbidden - check API key permissions',
      404: 'Player not found',
      429: 'Rate limit exceeded - please try again later',
      500: 'Riot API server error',
      503: 'Riot API service unavailable',
    }
    throw new RiotApiError(
      response.status,
      errorMessages[response.status] || `API error: ${response.status}`
    )
  }

  return response.json()
}

// Account API - Get account by Riot ID
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: string = 'euw'
): Promise<RiotAccount> {
  const config = getRegionConfig(region)
  const url = `${getRegionalUrl(config.regional)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  return fetchRiotApi<RiotAccount>(url)
}

// Summoner API - Get summoner by PUUID
export async function getSummonerByPuuid(puuid: string, region: string = 'euw'): Promise<Summoner> {
  const config = getRegionConfig(region)
  const url = `${getPlatformUrl(config.platform)}/lol/summoner/v4/summoners/by-puuid/${puuid}`
  return fetchRiotApi<Summoner>(url)
}

// League API - Get ranked entries by PUUID
export async function getLeagueEntries(
  puuid: string,
  region: string = 'euw'
): Promise<LeagueEntry[]> {
  const config = getRegionConfig(region)
  const url = `${getPlatformUrl(config.platform)}/lol/league/v4/entries/by-puuid/${puuid}`
  return fetchRiotApi<LeagueEntry[]>(url)
}

// Match API - Get match IDs
export async function getMatchIds(
  puuid: string,
  region: string = 'euw',
  count: number = 20,
  queueId?: number
): Promise<string[]> {
  const config = getRegionConfig(region)
  let url = `${getRegionalUrl(config.regional)}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
  if (queueId) {
    url += `&queue=${queueId}`
  }
  return fetchRiotApi<string[]>(url)
}

// Match API - Get match details
export async function getMatch(matchId: string, region: string = 'euw'): Promise<Match> {
  const config = getRegionConfig(region)
  const url = `${getRegionalUrl(config.regional)}/lol/match/v5/matches/${matchId}`
  return fetchRiotApi<Match>(url)
}

// Get multiple matches
export async function getMatches(
  matchIds: string[],
  region: string = 'euw'
): Promise<Match[]> {
  const matches = await Promise.all(
    matchIds.map((id) => getMatch(id, region).catch(() => null))
  )
  return matches.filter((m): m is Match => m !== null)
}

// Calculate player stats from matches
export function calculatePlayerStats(matches: Match[], puuid: string): PlayerStats {
  if (matches.length === 0) {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageKDA: 0,
      averageKills: 0,
      averageDeaths: 0,
      averageAssists: 0,
      averageCS: 0,
      averageCSPerMin: 0,
      averageVisionScore: 0,
      averageGold: 0,
      averageDamage: 0,
    }
  }

  let totalKills = 0
  let totalDeaths = 0
  let totalAssists = 0
  let totalCS = 0
  let totalCSPerMin = 0
  let totalVision = 0
  let totalGold = 0
  let totalDamage = 0
  let wins = 0

  for (const match of matches) {
    const participant = match.info.participants.find((p) => p.puuid === puuid)
    if (!participant) continue

    totalKills += participant.kills
    totalDeaths += participant.deaths
    totalAssists += participant.assists
    totalCS += participant.totalMinionsKilled + participant.neutralMinionsKilled
    totalCSPerMin +=
      (participant.totalMinionsKilled + participant.neutralMinionsKilled) /
      (match.info.gameDuration / 60)
    totalVision += participant.visionScore
    totalGold += participant.goldEarned
    totalDamage += participant.totalDamageDealtToChampions

    if (participant.win) wins++
  }

  const gamesPlayed = matches.length

  return {
    gamesPlayed,
    wins,
    losses: gamesPlayed - wins,
    winRate: getWinRate(wins, gamesPlayed - wins),
    averageKDA: calculateKDA(
      totalKills / gamesPlayed,
      totalDeaths / gamesPlayed,
      totalAssists / gamesPlayed
    ),
    averageKills: Number((totalKills / gamesPlayed).toFixed(1)),
    averageDeaths: Number((totalDeaths / gamesPlayed).toFixed(1)),
    averageAssists: Number((totalAssists / gamesPlayed).toFixed(1)),
    averageCS: Math.round(totalCS / gamesPlayed),
    averageCSPerMin: Number((totalCSPerMin / gamesPlayed).toFixed(1)),
    averageVisionScore: Math.round(totalVision / gamesPlayed),
    averageGold: Math.round(totalGold / gamesPlayed),
    averageDamage: Math.round(totalDamage / gamesPlayed),
  }
}

// Calculate champion stats from matches
export function calculateChampionStats(matches: Match[], puuid: string): ChampionStats[] {
  const championMap = new Map<
    number,
    {
      championId: number
      championName: string
      games: number
      wins: number
      kills: number
      deaths: number
      assists: number
    }
  >()

  for (const match of matches) {
    const participant = match.info.participants.find((p) => p.puuid === puuid)
    if (!participant) continue

    const existing = championMap.get(participant.championId)
    if (existing) {
      existing.games++
      existing.wins += participant.win ? 1 : 0
      existing.kills += participant.kills
      existing.deaths += participant.deaths
      existing.assists += participant.assists
    } else {
      championMap.set(participant.championId, {
        championId: participant.championId,
        championName: participant.championName,
        games: 1,
        wins: participant.win ? 1 : 0,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
      })
    }
  }

  return Array.from(championMap.values())
    .map((champ) => ({
      championId: champ.championId,
      championName: champ.championName,
      gamesPlayed: champ.games,
      wins: champ.wins,
      losses: champ.games - champ.wins,
      winRate: getWinRate(champ.wins, champ.games - champ.wins),
      averageKDA: calculateKDA(
        champ.kills / champ.games,
        champ.deaths / champ.games,
        champ.assists / champ.games
      ),
      averageKills: Number((champ.kills / champ.games).toFixed(1)),
      averageDeaths: Number((champ.deaths / champ.games).toFixed(1)),
      averageAssists: Number((champ.assists / champ.games).toFixed(1)),
    }))
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
}

// Get full player profile
export async function getPlayerProfile(
  gameName: string,
  tagLine: string,
  region: string = 'euw'
) {
  // Get account
  const account = await getAccountByRiotId(gameName, tagLine, region)

  // Get summoner data
  const summoner = await getSummonerByPuuid(account.puuid, region)

  // Get ranked entries
  const leagueEntries = await getLeagueEntries(account.puuid, region)
  const rankedSolo = leagueEntries.find((e) => e.queueType === 'RANKED_SOLO_5x5')
  const rankedFlex = leagueEntries.find((e) => e.queueType === 'RANKED_FLEX_SR')

  // Get recent matches
  const matchIds = await getMatchIds(account.puuid, region, 20)
  const recentMatches = await getMatches(matchIds, region)

  // Calculate stats
  const stats = calculatePlayerStats(recentMatches, account.puuid)
  const championStats = calculateChampionStats(recentMatches, account.puuid)

  return {
    account,
    summoner,
    rankedSolo,
    rankedFlex,
    recentMatches,
    stats,
    championStats,
  }
}

// Data Dragon URLs for assets
const DDRAGON_VERSION = '14.3.1' // Update this periodically

export function getChampionIconUrl(championName: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championName}.png`
}

export function getProfileIconUrl(iconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${iconId}.png`
}

export function getItemIconUrl(itemId: number): string {
  if (itemId === 0) return ''
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png`
}

export function getSummonerSpellIconUrl(spellId: number): string {
  const spellNames: Record<number, string> = {
    1: 'SummonerBoost', // Cleanse
    3: 'SummonerExhaust',
    4: 'SummonerFlash',
    6: 'SummonerHaste', // Ghost
    7: 'SummonerHeal',
    11: 'SummonerSmite',
    12: 'SummonerTeleport',
    14: 'SummonerDot', // Ignite
    21: 'SummonerBarrier',
    32: 'SummonerSnowball', // Mark (ARAM)
  }
  const spellName = spellNames[spellId] || 'SummonerFlash'
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/${spellName}.png`
}

export function getRankEmblemUrl(tier: string): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/${tier.toLowerCase()}.png`
}
