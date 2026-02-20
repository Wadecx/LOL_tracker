import Image from 'next/image'
import type { LeagueEntry } from '@/types/riot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRankColor, getWinRate } from '@/lib/utils'
import { getRankEmblemUrl } from '@/lib/riot-api'

interface RankCardProps {
  entry?: LeagueEntry
  queueType: 'Solo/Duo' | 'Flex'
}

export function RankCard({ entry, queueType }: RankCardProps) {
  if (!entry) {
    return (
      <Card className="bg-lol-gray border-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gold-light">{queueType}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unranked</p>
        </CardContent>
      </Card>
    )
  }

  const winRate = getWinRate(entry.wins, entry.losses)
  const totalGames = entry.wins + entry.losses

  return (
    <Card className="bg-lol-gray border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gold-light">{queueType}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="relative h-16 w-16">
          <Image
            src={getRankEmblemUrl(entry.tier)}
            alt={entry.tier}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <p
            className="text-xl font-bold"
            style={{ color: getRankColor(entry.tier) }}
          >
            {entry.tier} {entry.rank}
          </p>
          <p className="text-sm text-gold">{entry.leaguePoints} LP</p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="text-green-500">{entry.wins}W</span>
            <span className="text-red-500">{entry.losses}L</span>
            <span className="text-muted-foreground">
              ({winRate}% WR - {totalGames} games)
            </span>
          </div>
        </div>
        {entry.hotStreak && (
          <span className="rounded bg-orange-500/20 px-2 py-1 text-xs text-orange-500">
            Hot Streak
          </span>
        )}
      </CardContent>
    </Card>
  )
}
