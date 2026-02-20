import { NextRequest, NextResponse } from 'next/server'
import { analyzePlayer } from '@/lib/ai-coach'
import { getPlayerProfile } from '@/lib/riot-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameName, tagLine, region } = body

    if (!gameName || !tagLine || !region) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get player profile
    const profile = await getPlayerProfile(gameName, tagLine, region)

    // Analyze with AI
    const analysis = await analyzePlayer({
      gameName,
      tagLine,
      region,
      rankedSolo: profile.rankedSolo,
      rankedFlex: profile.rankedFlex,
      stats: profile.stats,
      championStats: profile.championStats,
      recentMatches: profile.recentMatches,
      puuid: profile.account.puuid,
    })

    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error('AI Analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze player' },
      { status: 500 }
    )
  }
}
