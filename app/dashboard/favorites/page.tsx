import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ExternalLink, ArrowLeft } from 'lucide-react'
import { DeleteFavoriteButton } from './delete-button'

export default async function FavoritesPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gold flex items-center gap-2">
            <Heart className="h-8 w-8" />
            Mes favoris
          </h1>
          <p className="text-muted-foreground mt-1">
            {favorites.length} joueur{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card className="bg-lol-gray border-gold/20">
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Vous n&apos;avez pas encore de favoris.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Recherchez un joueur et cliquez sur le coeur pour l&apos;ajouter.
            </p>
            <Link href="/dashboard">
              <Button variant="gold" className="mt-6">
                Rechercher un joueur
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="bg-lol-gray border-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/player/${favorite.region}/${encodeURIComponent(favorite.gameName)}/${encodeURIComponent(favorite.tagLine)}`}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="flex-1">
                        <p className="font-medium text-gold-light">
                          {favorite.gameName}
                          <span className="text-gold">#{favorite.tagLine}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {favorite.region.toUpperCase()}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                  <DeleteFavoriteButton puuid={favorite.puuid} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
