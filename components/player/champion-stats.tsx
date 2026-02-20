import Image from 'next/image'
import type { ChampionStats as ChampionStatsType } from '@/types/riot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getChampionIconUrl } from '@/lib/riot-api'
import { cn } from '@/lib/utils'

interface ChampionStatsProps {
  stats: ChampionStatsType[]
}

export function ChampionStats({ stats }: ChampionStatsProps) {
  if (stats.length === 0) {
    return null
  }

  const topChampions = stats.slice(0, 5)

  return (
    <Card className="bg-lol-gray border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold-light">Champions les plus joués</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topChampions.map((champ) => (
            <div
              key={champ.championId}
              className="flex items-center gap-4 rounded-lg bg-lol-dark/50 p-3"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-gold/30">
                <Image
                  src={getChampionIconUrl(champ.championName)}
                  alt={champ.championName}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="font-medium text-gold-light">{champ.championName}</p>
                <p className="text-xs text-muted-foreground">
                  {champ.gamesPlayed} parties
                </p>
              </div>

              <div className="text-center">
                <p
                  className={cn(
                    'font-bold',
                    champ.winRate >= 60
                      ? 'text-green-500'
                      : champ.winRate >= 50
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  )}
                >
                  {champ.winRate}%
                </p>
                <p className="text-xs text-muted-foreground">WR</p>
              </div>

              <div className="text-center">
                <p
                  className={cn(
                    'font-bold',
                    champ.averageKDA >= 4
                      ? 'text-gold'
                      : champ.averageKDA >= 3
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  )}
                >
                  {champ.averageKDA.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">KDA</p>
              </div>

              <div className="hidden text-center sm:block">
                <p className="text-sm text-gold-light">
                  {champ.averageKills}/{champ.averageDeaths}/{champ.averageAssists}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
