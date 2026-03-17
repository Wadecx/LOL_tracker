import { NextRequest, NextResponse } from 'next/server'
import { analyzeMatch } from '@/lib/ai-coach'
import type { Match, MatchParticipant } from '@/types/riot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { match, participant, rank } = body as {
      match: Match
      participant: MatchParticipant
      rank?: string
    }

    if (!match || !participant) {
      return NextResponse.json(
        { error: 'Match et participant requis' },
        { status: 400 }
      )
    }

    const analysis = await analyzeMatch({ match, participant, rank })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error in analyze-match API:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse' },
      { status: 500 }
    )
  }
}
