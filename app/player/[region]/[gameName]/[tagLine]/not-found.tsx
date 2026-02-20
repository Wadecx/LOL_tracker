import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

export default function PlayerNotFound() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-10 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold text-gold mb-2">Joueur non trouvé</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Le joueur que vous recherchez n&apos;existe pas ou n&apos;a pas été trouvé.
        Vérifiez l&apos;orthographe du Riot ID et la région sélectionnée.
      </p>
      <Link href="/">
        <Button variant="gold">
          Retour à l&apos;accueil
        </Button>
      </Link>
    </div>
  )
}
