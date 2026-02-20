import type { PlayerStats } from '@/types/riot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { Target, Swords, Eye, Coins, Flame } from 'lucide-react'

interface StatsOverviewProps {
  stats: PlayerStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      label: 'Win Rate',
      value: `${stats.winRate}%`,
      subtext: `${stats.wins}W ${stats.losses}L`,
      icon: Target,
      color: stats.winRate >= 50 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'KDA',
      value: stats.averageKDA.toFixed(2),
      subtext: `${stats.averageKills}/${stats.averageDeaths}/${stats.averageAssists}`,
      icon: Swords,
      color: stats.averageKDA >= 3 ? 'text-green-500' : stats.averageKDA >= 2 ? 'text-yellow-500' : 'text-red-500',
    },
    {
      label: 'CS/min',
      value: stats.averageCSPerMin.toFixed(1),
      subtext: `${stats.averageCS} total`,
      icon: Coins,
      color: stats.averageCSPerMin >= 7 ? 'text-green-500' : stats.averageCSPerMin >= 5 ? 'text-yellow-500' : 'text-muted-foreground',
    },
    {
      label: 'Vision Score',
      value: stats.averageVisionScore.toString(),
      subtext: 'par partie',
      icon: Eye,
      color: 'text-lol-blue',
    },
    {
      label: 'Damage',
      value: formatNumber(stats.averageDamage),
      subtext: 'par partie',
      icon: Flame,
      color: 'text-orange-500',
    },
  ]

  return (
    <Card className="bg-lol-gray border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold-light">
          Statistiques ({stats.gamesPlayed} parties)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-lg bg-lol-dark/50 p-4"
            >
              <item.icon className={`mb-2 h-5 w-5 ${item.color}`} />
              <span className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground/70">
                {item.subtext}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
