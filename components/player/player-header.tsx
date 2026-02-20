'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import type { RiotAccount, Summoner } from '@/types/riot'
import { Button } from '@/components/ui/button'
import { getProfileIconUrl } from '@/lib/riot-api'
import { Heart, HeartOff, Loader2 } from 'lucide-react'

interface PlayerHeaderProps {
  account: RiotAccount
  summoner: Summoner
  region: string
  isFavorite?: boolean
  onFavoriteToggle?: () => void
}

export function PlayerHeader({
  account,
  summoner,
  region,
  isFavorite: initialIsFavorite = false,
  onFavoriteToggle,
}: PlayerHeaderProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const handleFavoriteToggle = async () => {
    if (!session) return

    setIsLoading(true)
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?puuid=${account.puuid}`, {
          method: 'DELETE',
        })
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puuid: account.puuid,
            gameName: account.gameName,
            tagLine: account.tagLine,
            region,
          }),
        })
      }
      setIsFavorite(!isFavorite)
      onFavoriteToggle?.()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-6 rounded-lg bg-lol-gray p-6 border border-gold/20">
      <div className="relative">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gold">
          <Image
            src={getProfileIconUrl(summoner.profileIconId)}
            alt={account.gameName}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-sm font-bold text-lol-dark">
          {summoner.summonerLevel}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gold-light">
            {account.gameName}
            <span className="text-gold">#{account.tagLine}</span>
          </h1>
          {session && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isFavorite ? (
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              ) : (
                <HeartOff className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          {region.toUpperCase()} Server
        </p>
      </div>
    </div>
  )
}
