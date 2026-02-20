import { PlayerSearch } from '@/components/search/player-search'
import { Swords, Target, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="container relative flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gold">Track</span> your{' '}
            <span className="text-lol-blue">League</span> Performance
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Analysez vos stats, suivez votre progression et améliorez votre gameplay
            avec des données détaillées de vos parties League of Legends.
          </p>

          <div className="mt-10 w-full flex justify-center">
            <PlayerSearch />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Entrez votre Riot ID (ex: Player#EUW) pour voir vos statistiques
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-gold/10">
        <div className="container">
          <h2 className="text-center text-2xl font-bold text-gold-light mb-12">
            Fonctionnalités
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Target}
              title="Stats détaillées"
              description="KDA, CS/min, Vision Score et plus encore pour chaque partie."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Suivi de progression"
              description="Suivez l'évolution de votre rank et de vos performances."
            />
            <FeatureCard
              icon={Users}
              title="Favoris"
              description="Sauvegardez vos joueurs favoris pour un accès rapide."
            />
            <FeatureCard
              icon={Swords}
              title="Historique complet"
              description="Consultez vos 20 dernières parties avec tous les détails."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-gold/5 to-transparent">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-gold-light mb-4">
            Prêt à améliorer votre gameplay ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Créez un compte pour sauvegarder vos joueurs favoris et accéder à votre dashboard personnalisé.
          </p>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-lol-gray border border-gold/10 hover:border-gold/30 transition-colors">
      <div className="mb-4 rounded-full bg-gold/10 p-3">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <h3 className="font-semibold text-gold-light mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
