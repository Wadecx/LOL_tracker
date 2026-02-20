import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const favoriteSchema = z.object({
  puuid: z.string(),
  gameName: z.string(),
  tagLine: z.string(),
  region: z.string(),
})

// GET - List all favorites for current user
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(favorites)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST - Add a new favorite
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = favoriteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { puuid, gameName, tagLine, region } = parsed.data

    const favorite = await prisma.favorite.create({
      data: {
        puuid,
        gameName,
        tagLine,
        region,
        userId: session.user.id,
      },
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Player already in favorites' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a favorite
export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const puuid = searchParams.get('puuid')

  if (!puuid) {
    return NextResponse.json({ error: 'puuid is required' }, { status: 400 })
  }

  try {
    await prisma.favorite.delete({
      where: {
        userId_puuid: {
          userId: session.user.id,
          puuid,
        },
      },
    })
    return NextResponse.json({ message: 'Favorite removed' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
