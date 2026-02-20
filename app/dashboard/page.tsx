import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlayerSearch } from '@/components/search/player-search'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Heart, ExternalLink } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gold">
          Bienvenue, {session.user.name || session.user.email}
        </h1>
        <p className="text-muted-foreground mt-2">
          Recherchez un joueur ou consultez vos favoris
        </p>
      </div>

      {/* Search Section */}
      <Card className="bg-lol-gray border-gold/20 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gold-light">
            <Search className="h-5 w-5" />
            Rechercher un joueur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerSearch />
        </CardContent>
      </Card>

      {/* Favorites Section */}
      <Card className="bg-lol-gray border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gold-light">
            <Heart className="h-5 w-5" />
            Joueurs favoris
          </CardTitle>
          {favorites.length > 0 && (
            <Link href="/dashboard/favorites">
              <Button variant="ghost" size="sm">
                Voir tous
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun favori. Recherchez un joueur et ajoutez-le à vos favoris !
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <Link
                  key={favorite.id}
                  href={`/player/${favorite.region}/${encodeURIComponent(favorite.gameName)}/${encodeURIComponent(favorite.tagLine)}`}
                >
                  <div className="flex items-center justify-between rounded-lg bg-lol-dark/50 p-4 hover:bg-lol-dark transition-colors">
                    <div>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
