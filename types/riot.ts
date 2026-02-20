// Account API Types
export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

// Summoner API Types
export interface Summoner {
  id: string
  accountId: string
  puuid: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

// League API Types
export type RankTier =
  | 'IRON'
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'EMERALD'
  | 'DIAMOND'
  | 'MASTER'
  | 'GRANDMASTER'
  | 'CHALLENGER'

export type RankDivision = 'I' | 'II' | 'III' | 'IV'

export type QueueType = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR'

export interface LeagueEntry {
  leagueId: string
  summonerId: string
  queueType: QueueType
  tier: RankTier
  rank: RankDivision
  leaguePoints: number
  wins: number
  losses: number
  hotStreak: boolean
  veteran: boolean
  freshBlood: boolean
  inactive: boolean
}

// Match API Types
export interface MatchMetadata {
  dataVersion: string
  matchId: string
  participants: string[]
}

export interface MatchParticipant {
  puuid: string
  summonerId: string
  summonerName: string
  riotIdGameName: string
  riotIdTagline: string
  championId: number
  championName: string
  teamId: number
  teamPosition: string
  role: string
  lane: string
  kills: number
  deaths: number
  assists: number
  totalMinionsKilled: number
  neutralMinionsKilled: number
  visionScore: number
  goldEarned: number
  totalDamageDealtToChampions: number
  totalDamageTaken: number
  wardsPlaced: number
  wardsKilled: number
  win: boolean
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  summoner1Id: number
  summoner2Id: number
  perks: {
    styles: Array<{
      style: number
      selections: Array<{
        perk: number
      }>
    }>
  }
}

export interface MatchTeam {
  teamId: number
  win: boolean
  objectives: {
    baron: { first: boolean; kills: number }
    dragon: { first: boolean; kills: number }
    tower: { first: boolean; kills: number }
    inhibitor: { first: boolean; kills: number }
    riftHerald: { first: boolean; kills: number }
  }
}

export interface MatchInfo {
  gameId: number
  gameCreation: number
  gameDuration: number
  gameMode: string
  gameType: string
  gameVersion: string
  mapId: number
  queueId: number
  platformId: string
  participants: MatchParticipant[]
  teams: MatchTeam[]
}

export interface Match {
  metadata: MatchMetadata
  info: MatchInfo
}

// Region Types
export type PlatformRegion =
  | 'br1'
  | 'eun1'
  | 'euw1'
  | 'jp1'
  | 'kr'
  | 'la1'
  | 'la2'
  | 'na1'
  | 'oc1'
  | 'tr1'
  | 'ru'
  | 'ph2'
  | 'sg2'
  | 'th2'
  | 'tw2'
  | 'vn2'

export type RegionalRoute = 'americas' | 'europe' | 'asia' | 'sea'

export interface RegionConfig {
  platform: PlatformRegion
  regional: RegionalRoute
  name: string
}

// Aggregated Stats Types (calculated from matches)
export interface PlayerStats {
  gamesPlayed: number
  wins: number
  losses: number
  winRate: number
  averageKDA: number
  averageKills: number
  averageDeaths: number
  averageAssists: number
  averageCS: number
  averageCSPerMin: number
  averageVisionScore: number
  averageGold: number
  averageDamage: number
}

export interface ChampionStats {
  championId: number
  championName: string
  gamesPlayed: number
  wins: number
  losses: number
  winRate: number
  averageKDA: number
  averageKills: number
  averageDeaths: number
  averageAssists: number
}

// Player Profile (aggregated data)
export interface PlayerProfile {
  account: RiotAccount
  summoner: Summoner
  rankedSolo?: LeagueEntry
  rankedFlex?: LeagueEntry
  recentMatches: Match[]
  stats: PlayerStats
  championStats: ChampionStats[]
}
