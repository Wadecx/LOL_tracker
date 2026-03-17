import { notFound } from 'next/navigation'
import { getPlayerProfile } from '@/lib/riot-api'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlayerHeader } from '@/components/player/player-header'
import { RankCard } from '@/components/player/rank-card'
import { StatsOverview } from '@/components/player/stats-overview'
import { ChampionStats } from '@/components/player/champion-stats'
import { MatchHistory } from '@/components/player/match-history'
import { AICoach } from '@/components/player/ai-coach'

interface PlayerPageProps {
  params: {
    region: string
    gameName: string
    tagLine: string
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { region, gameName, tagLine } = params
  const decodedGameName = decodeURIComponent(gameName)
  const decodedTagLine = decodeURIComponent(tagLine)

  let profile
  try {
    profile = await getPlayerProfile(decodedGameName, decodedTagLine, region)
  } catch (error: any) {
    console.error('Error fetching player profile:', error)
    if (error.status === 404) {
      notFound()
    }
    // For other errors, show not found instead of crashing
    notFound()
  }

  // Check if player is in favorites
  const session = await auth()
  let isFavorite = false
  if (session?.user?.id) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_puuid: {
          userId: session.user.id,
          puuid: profile.account.puuid,
        },
      },
    })
    isFavorite = !!favorite
  }

  return (
    <div className="container py-10 space-y-6">
      {/* Player Header */}
      <PlayerHeader
        account={profile.account}
        summoner={profile.summoner}
        region={region}
        isFavorite={isFavorite}
      />

      {/* Rank Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <RankCard entry={profile.rankedSolo} queueType="Solo/Duo" />
        <RankCard entry={profile.rankedFlex} queueType="Flex" />
      </div>

      {/* AI Coach */}
      <AICoach
        gameName={decodedGameName}
        tagLine={decodedTagLine}
        region={region}
      />

      {/* Stats Overview */}
      <StatsOverview stats={profile.stats} />

      {/* Champion Stats */}
      <ChampionStats stats={profile.championStats} />

      {/* Match History */}
      <MatchHistory
        matches={profile.recentMatches}
        puuid={profile.account.puuid}
        rank={profile.rankedSolo ? `${profile.rankedSolo.tier} ${profile.rankedSolo.rank}` : undefined}
      />
    </div>
  )
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { gameName, tagLine, region } = params
  const decodedGameName = decodeURIComponent(gameName)
  const decodedTagLine = decodeURIComponent(tagLine)

  return {
    title: `${decodedGameName}#${decodedTagLine} - LoL Tracker`,
    description: `Statistiques League of Legends pour ${decodedGameName}#${decodedTagLine} sur ${region.toUpperCase()}`,
  }
}
