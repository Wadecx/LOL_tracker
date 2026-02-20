'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Loader2 } from 'lucide-react'
import { REGIONS } from '@/lib/regions'

export function PlayerSearch() {
  const router = useRouter()
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('euw')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!riotId.includes('#')) {
      setError('Format invalide. Utilisez: GameName#TagLine')
      return
    }

    const [gameName, tagLine] = riotId.split('#')

    if (!gameName || !tagLine) {
      setError('Format invalide. Utilisez: GameName#TagLine')
      return
    }

    setIsLoading(true)

    try {
      // Verify the player exists
      const response = await fetch(
        `/api/riot/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Joueur non trouvé')
      }

      // Navigate to player page
      router.push(`/player/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl space-y-4">
      <div className="flex gap-2">
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Région" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REGIONS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="GameName#TagLine"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            className="pr-10"
          />
        </div>

        <Button type="submit" variant="gold" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2">Rechercher</span>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  )
}
