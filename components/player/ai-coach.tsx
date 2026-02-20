'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain, Sparkles, AlertCircle } from 'lucide-react'

interface AICoachProps {
  gameName: string
  tagLine: string
  region: string
}

export function AICoach({ gameName, tagLine, region }: AICoachProps) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, tagLine, region }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse')
      }

      setAnalysis(data.analysis)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-lol-gray border-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gold">
          <Brain className="h-5 w-5" />
          Coach IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis && !loading && !error && (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-gold/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Obtiens une analyse personnalisée de ton profil avec des conseils pour progresser.
            </p>
            <Button onClick={analyzeProfile} variant="gold" className="gap-2">
              <Brain className="h-4 w-4" />
              Analyser mon profil
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <div className="animate-spin">
                <Brain className="h-5 w-5" />
              </div>
              <span>Analyse en cours...</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={analyzeProfile} variant="outline" className="gap-2">
              Réessayer
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="space-y-3">
              {analysis.split('\n').map((line, index) => {
                // Skip empty lines
                if (!line.trim()) return null

                // Clean markdown from text
                const cleanText = (text: string) => {
                  return text
                    .replace(/\*\*/g, '') // Remove **bold**
                    .replace(/\*/g, '')   // Remove *italic*
                    .replace(/`/g, '')    // Remove `code`
                    .replace(/#{1,6}\s?/g, '') // Remove ### headers
                    .replace(/^\s*[-•]\s*/, '• ') // Normalize bullet points
                    .trim()
                }

                const cleaned = cleanText(line)
                if (!cleaned) return null

                // Section headers (with emojis like 🎯, 💪, ⚠️, 📈, 🏆)
                if (cleaned.match(/^[🎯💪⚠️📈🏆]/)) {
                  return (
                    <h3 key={index} className="text-gold font-bold text-base mt-4 mb-2 flex items-center gap-2">
                      {cleaned}
                    </h3>
                  )
                }

                // Bullet points
                if (cleaned.startsWith('•') || cleaned.startsWith('-')) {
                  return (
                    <p key={index} className="text-sm text-gray-300 ml-4 my-1 flex">
                      <span className="text-gold mr-2">•</span>
                      <span>{cleaned.replace(/^[•-]\s*/, '')}</span>
                    </p>
                  )
                }

                // Numbered items
                if (cleaned.match(/^[0-9]+\./)) {
                  return (
                    <p key={index} className="text-sm text-gray-300 ml-4 my-1">
                      {cleaned}
                    </p>
                  )
                }

                // Regular text
                return (
                  <p key={index} className="text-sm text-gray-300 my-1">
                    {cleaned}
                  </p>
                )
              })}
            </div>
            <div className="pt-4 border-t border-gold/10">
              <Button onClick={analyzeProfile} variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Nouvelle analyse
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
