'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Match, MatchParticipant } from '@/types/riot'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
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
  rank?: string
}

export function MatchCard({ match, puuid, rank }: MatchCardProps) {
  const [review, setReview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

  const fetchReview = async () => {
    if (review) {
      setIsExpanded(!isExpanded)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match, participant, rank }),
      })

      if (!response.ok) throw new Error('Erreur API')

      const data = await response.json()
      setReview(data.analysis)
      setIsExpanded(true)
    } catch (error) {
      console.error('Erreur review:', error)
      setReview('Impossible de générer la review.')
      setIsExpanded(true)
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Timestamp + Review Button */}
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs text-muted-foreground">
            {getRelativeTime(match.info.gameCreation)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReview}
            disabled={isLoading}
            className="h-7 px-2 text-xs text-gold hover:text-gold-light hover:bg-gold/10"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                {review ? (isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : 'Review'}
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* AI Review Section */}
      {isExpanded && review && (
        <div className="px-4 pb-4">
          <div className="rounded-lg bg-lol-dark/50 border border-gold/20 p-4">
            <div className="text-sm text-gold-light/90 leading-relaxed whitespace-pre-line">
              {review}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
