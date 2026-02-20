'use client'

import { useState } from 'react'
import type { Match } from '@/types/riot'
import { MatchCard } from './match-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MatchHistoryProps {
  matches: Match[]
  puuid: string
}

export function MatchHistory({ matches, puuid }: MatchHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'ranked' | 'normal'>('all')

  const filteredMatches = matches.filter((match) => {
    if (filter === 'all') return true
    if (filter === 'ranked') return [420, 440].includes(match.info.queueId)
    if (filter === 'normal') return [400, 430, 450].includes(match.info.queueId)
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gold-light">Historique des parties</h2>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="ranked">Ranked</TabsTrigger>
            <TabsTrigger value="normal">Normal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        {filteredMatches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune partie trouvée
          </p>
        ) : (
          filteredMatches.map((match) => (
            <MatchCard key={match.metadata.matchId} match={match} puuid={puuid} />
          ))
        )}
      </div>
    </div>
  )
}
