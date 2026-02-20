import { NextRequest, NextResponse } from 'next/server'
import { getAccountByRiotId } from '@/lib/riot-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gameName = searchParams.get('gameName')
  const tagLine = searchParams.get('tagLine')
  const region = searchParams.get('region') || 'euw'

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'gameName and tagLine are required' },
      { status: 400 }
    )
  }

  try {
    const account = await getAccountByRiotId(gameName, tagLine, region)
    return NextResponse.json(account)
  } catch (error: any) {
    const status = error.status || 500
    const message = error.message || 'Failed to fetch account'
    return NextResponse.json({ error: message }, { status })
  }
}
