import Image from 'next/image'
import type { Match, MatchParticipant } from '@/types/riot'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatDuration,
  formatKDA,
  calculateKDA,
  getRelativeTime,
  getQueueName,
} from '@/lib/utils'
import { getChampionIconUrl, getItemIconUrl, getSummonerSpellIconUrl } from '@/lib/riot-api'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  match: Match
  puuid: string
}

export function MatchCard({ match, puuid }: MatchCardProps) {
  const participant = match.info.participants.find((p) => p.puuid === puuid)
  if (!participant) return null

  const isWin = participant.win
  const kda = calculateKDA(participant.kills, participant.deaths, participant.assists)
  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled
  const csPerMin = (cs / (match.info.gameDuration / 60)).toFixed(1)
  const items = [
    participant.item0,
    participant.item1,
    participant.item2,
    participant.item3,
    participant.item4,
    participant.item5,
    participant.item6,
  ]

  return (
    <Card
      className={cn(
        'border-l-4 bg-lol-gray',
        isWin ? 'border-l-green-500' : 'border-l-red-500'
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Result & Queue */}
        <div className="w-20 text-center">
          <p
            className={cn(
              'text-sm font-bold',
              isWin ? 'text-green-500' : 'text-red-500'
            )}
          >
            {isWin ? 'Victoire' : 'Défaite'}
          </p>
          <p className="text-xs text-muted-foreground">
            {getQueueName(match.info.queueId)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDuration(match.info.gameDuration)}
          </p>
        </div>

        {/* Champion */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold/30">
            <Image
              src={getChampionIconUrl(participant.championName)}
              alt={participant.championName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex gap-0.5">
            <div className="relative h-5 w-5 overflow-hidden rounded">
              <Image
                src={getSummonerSpellIconUrl(participant.summoner1Id)}
                alt="Spell 1"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-5 w-5 overflow-hidden rounded">
              <Image
                src={getSummonerSpellIconUrl(participant.summoner2Id)}
                alt="Spell 2"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* KDA */}
        <div className="w-24 text-center">
          <p className="font-bold text-gold-light">
            {formatKDA(participant.kills, participant.deaths, participant.assists)}
          </p>
          <p
            className={cn(
              'text-sm',
              kda >= 4 ? 'text-gold' : kda >= 3 ? 'text-green-500' : kda >= 2 ? 'text-yellow-500' : 'text-muted-foreground'
            )}
          >
            {kda.toFixed(2)} KDA
          </p>
        </div>

        {/* CS & Vision */}
        <div className="hidden w-20 text-center sm:block">
          <p className="text-sm">
            <span className="text-gold-light">{cs}</span>{' '}
            <span className="text-muted-foreground">CS</span>
          </p>
          <p className="text-xs text-muted-foreground">{csPerMin}/min</p>
          <p className="text-xs">
            <span className="text-lol-blue">{participant.visionScore}</span>{' '}
            <span className="text-muted-foreground">Vision</span>
          </p>
        </div>

        {/* Items */}
        <div className="hidden flex-1 lg:block">
          <div className="flex gap-1">
            {items.map((itemId, index) => (
              <div
                key={index}
                className="relative h-8 w-8 overflow-hidden rounded bg-lol-dark"
              >
                {itemId > 0 && (
                  <Image
                    src={getItemIconUrl(itemId)}
                    alt={`Item ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-right text-xs text-muted-foreground">
          {getRelativeTime(match.info.gameCreation)}
        </div>
      </CardContent>
    </Card>
  )
}
