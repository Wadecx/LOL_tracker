import Groq from 'groq-sdk'
import type { PlayerStats, ChampionStats, LeagueEntry, Match, MatchParticipant } from '@/types/riot'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Prompt pour l'analyse détaillée d'une game individuelle
const MATCH_REVIEW_PROMPT = `Tu es un coach LoL expert. Analyse cette partie et donne une review en TEXTE BRUT (pas de markdown, pas de **, pas de #).

MÉTRIQUES DE RÉFÉRENCE PAR RÔLE:
TOP: CS 7-8/min, Vision 0.8-1/min, KP 50-60%
JUNGLE: CS 5-6/min, Vision 1-1.2/min, KP 70%+
MID: CS 8+/min, Vision 0.8-1/min, KP 60-70%
ADC: CS 8-9/min, Vision 0.6-0.8/min, dégâts top 1-2
SUPPORT: Vision 1.5-2/min, KP 70%+

FORMAT DE RÉPONSE (texte simple, utilise les emojis comme séparateurs):

[EMOJI VERDICT] VERDICT
Une phrase résumé de la game.

📊 PERFORMANCE [Note /10]
Analyse du KDA, farm, vision et impact en 2-3 lignes.

✅ POINTS FORTS
• Premier point fort
• Deuxième point fort

⚠️ À AMÉLIORER
• Premier axe avec conseil
• Deuxième axe avec conseil

💡 CONSEIL CLÉ
Un conseil actionnable pour la prochaine game.

🎮 CHAMPIONS RECOMMANDÉS
• Champion 1 - justification courte
• Champion 2 - justification courte

RÈGLES STRICTES:
- PAS de markdown (**, ##, etc.) - UNIQUEMENT du texte brut
- Utilise • pour les listes, pas de tirets
- En français, direct et constructif
- Compare aux autres joueurs de la game
- Adapte au rang du joueur
- Emoji verdict: ✅ (bien), ⚠️ (moyen), ❌ (problème), 🔥 (excellent)
- Maximum 250 mots`

const SYSTEM_PROMPT = `Tu es "LoL Coach AI", un coach d'élite League of Legends avec l'expertise combinée d'analystes pro comme LS, Caedrel et Agurin. Tu as coaché des joueurs du Iron au Challenger et tu connais parfaitement la meta actuelle (Season 14/2024-2025).

## EXPERTISE TECHNIQUE

### FONDAMENTAUX PAR RANG
- **Iron-Bronze**: Focus CS (objectif: 6 CS/min), positionnement basique, ne pas mourir gratuitement
- **Silver-Gold**: Wave management (freeze, slow push, crash), trading patterns, vision des river bushes
- **Platinum**: Jungle tracking, tempo de lane, roaming timing, objectifs (drake timing à 5min)
- **Diamond**: Lane state manipulation, dive setups, win conditions identification
- **Master+**: Limite testing, spacing pixel-perfect, macro optimale, draft analysis

### MÉTRIQUES CLÉS PAR RÔLE
**TOP**:
- CS/min attendu: 7-8+ | Vision: 1 ward/min minimum
- Téléport usage, split push timing, TP flanks
- Champions meta: Ambessa, K'Sante, Yone, Camille, Jax, Gwen

**JUNGLE**:
- CS/min attendu: 5-6 | Objectif: 65%+ des drakes
- Clear speed, pathing efficace, gank timing (niveau 3 spike)
- Champions meta: Viego, Lee Sin, Rek'Sai, Elise, Nidalee, Graves

**MID**:
- CS/min attendu: 8+ | Roam timing après push
- Wave manipulation pour roam, vision pixel bushes, 2v2 avec jungle
- Champions meta: Aurora, Ahri, Syndra, Orianna, Corki, Azir, Akali

**ADC**:
- CS/min attendu: 8-9+ | Positionnement teamfight crucial
- Spacing, kiting, target selection, wave bounce management
- Champions meta: Jhin, Kai'Sa, Jinx, Caitlyn, Ezreal, Vayne

**SUPPORT**:
- Vision score attendu: 2x durée de game | Roam timing
- Engage timing, peel priority, ward coverage (3 points minimum)
- Champions meta: Nautilus, Leona, Thresh, Lulu, Janna, Rell

### ANALYSE DE PERFORMANCES
**KDA Analysis**:
- <2.0 = Problème de positionnement/decision making
- 2.0-3.0 = Correct, focus sur la constance
- 3.0-4.0 = Bon, optimiser l'impact
- 4.0+ = Excellent, attention au KDA playing

**CS Analysis**:
- <5 CS/min = Fondamentaux à revoir (last hit en practice tool)
- 5-6 = Focus wave management
- 6-7 = Correct pour ranked
- 7-8+ = Bon niveau
- 9+ = Niveau compétitif

**Vision Score**:
- <0.8/min = Achète plus de pink wards, ward sur cooldown
- 0.8-1.2 = Correct
- 1.2+ = Très bien

### CONSEILS STRATÉGIQUES
- **Early game (0-14min)**: Laning fundamentals, first drake, grubs
- **Mid game (14-25min)**: Rotations, baron setup, tower trading
- **Late game (25min+)**: Death timers critiques, baron/elder calls, wave setup

## FORMAT DE RÉPONSE

Structure TOUJOURS ta réponse ainsi:

**🎯 DIAGNOSTIC RAPIDE**
[1-2 phrases sur le niveau général et le style de jeu détecté]

**💪 POINTS FORTS**
[2-3 forces basées sur les stats]

**⚠️ AXES D'AMÉLIORATION**
[2-3 faiblesses prioritaires avec solutions concrètes]

**📈 PLAN D'ACTION**
[3 actions concrètes et mesurables à travailler]

**🏆 CHAMPIONS RECOMMANDÉS**
[2-3 champions adaptés au style avec justification]

## RÈGLES
- Réponds UNIQUEMENT en français
- Sois direct, pas de flatterie inutile
- Base-toi UNIQUEMENT sur les données fournies
- Adapte le niveau de détail au rang du joueur
- Maximum 500 mots
- Utilise le vocabulaire LoL technique (wave management, spacing, tempo, etc.)`

interface AnalysisData {
  gameName: string
  tagLine: string
  region: string
  rankedSolo?: LeagueEntry
  rankedFlex?: LeagueEntry
  stats: PlayerStats
  championStats: ChampionStats[]
  recentMatches: Match[]
  puuid: string
}

function formatDataForAnalysis(data: AnalysisData): string {
  const { gameName, tagLine, rankedSolo, rankedFlex, stats, championStats, recentMatches, puuid } = data

  // Format rank info
  const soloRank = rankedSolo
    ? `${rankedSolo.tier} ${rankedSolo.rank} (${rankedSolo.leaguePoints} LP) - ${rankedSolo.wins}W/${rankedSolo.losses}L (${((rankedSolo.wins / (rankedSolo.wins + rankedSolo.losses)) * 100).toFixed(1)}% WR)`
    : 'Non classé'

  const flexRank = rankedFlex
    ? `${rankedFlex.tier} ${rankedFlex.rank} (${rankedFlex.leaguePoints} LP)`
    : 'Non classé'

  // Format top champions with more detail
  const topChamps = championStats.slice(0, 5).map(c =>
    `- ${c.championName}: ${c.gamesPlayed} parties, ${c.winRate}% WR, KDA ${c.averageKDA} (${c.averageKills}/${c.averageDeaths}/${c.averageAssists})`
  ).join('\n')

  // Analyze recent matches for role/position and detailed stats
  const roleStats = new Map<string, {
    games: number,
    wins: number,
    kills: number,
    deaths: number,
    assists: number,
    cs: number,
    vision: number,
    damage: number,
    gameDuration: number
  }>()

  // Track performance trends (first 10 vs last 10 games)
  let recentWins = 0
  let olderWins = 0
  const halfPoint = Math.floor(recentMatches.length / 2)

  for (let i = 0; i < recentMatches.length; i++) {
    const match = recentMatches[i]
    const participant = match.info.participants.find(p => p.puuid === puuid)
    if (participant) {
      const role = participant.teamPosition || 'FILL'
      const existing = roleStats.get(role) || {
        games: 0, wins: 0, kills: 0, deaths: 0, assists: 0,
        cs: 0, vision: 0, damage: 0, gameDuration: 0
      }

      existing.games++
      if (participant.win) existing.wins++
      existing.kills += participant.kills
      existing.deaths += participant.deaths
      existing.assists += participant.assists
      existing.cs += participant.totalMinionsKilled + participant.neutralMinionsKilled
      existing.vision += participant.visionScore
      existing.damage += participant.totalDamageDealtToChampions
      existing.gameDuration += match.info.gameDuration

      roleStats.set(role, existing)

      // Track trend
      if (i < halfPoint && participant.win) recentWins++
      if (i >= halfPoint && participant.win) olderWins++
    }
  }

  // Format role stats with averages
  const rolesPlayed = Array.from(roleStats.entries())
    .sort((a, b) => b[1].games - a[1].games)
    .map(([role, data]) => {
      const avgGameMin = (data.gameDuration / data.games) / 60
      const csPerMin = (data.cs / data.games) / avgGameMin
      const visionPerMin = (data.vision / data.games) / avgGameMin
      return `${role}: ${data.games} parties (${((data.wins / data.games) * 100).toFixed(0)}% WR) - CS/min: ${csPerMin.toFixed(1)}, Vision/min: ${visionPerMin.toFixed(2)}`
    })
    .join('\n')

  // Determine main role
  const mainRole = Array.from(roleStats.entries())
    .sort((a, b) => b[1].games - a[1].games)[0]

  // Performance trend
  const trend = recentWins > olderWins ? '📈 EN PROGRESSION' :
                recentWins < olderWins ? '📉 EN BAISSE' : '➡️ STABLE'

  // Calculate average game duration
  const avgGameDuration = recentMatches.length > 0
    ? recentMatches.reduce((acc, m) => acc + m.info.gameDuration, 0) / recentMatches.length / 60
    : 0

  return `
═══════════════════════════════════════
PROFIL JOUEUR: ${gameName}#${tagLine}
═══════════════════════════════════════

📊 CLASSEMENT:
• Solo/Duo: ${soloRank}
• Flex: ${flexRank}

📈 TENDANCE RÉCENTE: ${trend}
(${recentWins}W sur les ${halfPoint} dernières vs ${olderWins}W sur les ${halfPoint} précédentes)

🎮 STATISTIQUES GLOBALES (${stats.gamesPlayed} parties, durée moy: ${avgGameDuration.toFixed(0)}min):
• Winrate: ${stats.winRate}%
• KDA Moyen: ${stats.averageKDA} (${stats.averageKills}/${stats.averageDeaths}/${stats.averageAssists})
• CS/min: ${stats.averageCSPerMin}
• Vision Score/game: ${stats.averageVisionScore}
• Dégâts/game: ${stats.averageDamage.toLocaleString()}
• Gold/game: ${stats.averageGold.toLocaleString()}

🎯 RÔLE PRINCIPAL: ${mainRole ? mainRole[0] : 'Non défini'}

📍 DÉTAIL PAR RÔLE:
${rolesPlayed || 'Aucune donnée'}

🏆 CHAMPIONS PRINCIPAUX:
${topChamps || 'Aucune donnée'}

💀 ANALYSE DEATHS:
• Morts moyennes: ${stats.averageDeaths}/game
• ${stats.averageDeaths <= 3 ? '✅ Très bien - peu de morts' : stats.averageDeaths <= 5 ? '⚠️ Correct - peut être amélioré' : '❌ Trop de morts - problème de positionnement/décisions'}

🎯 ANALYSE CS:
• ${stats.averageCSPerMin >= 8 ? '✅ Excellent CS' : stats.averageCSPerMin >= 6 ? '⚠️ CS correct' : '❌ CS insuffisant - travaille le last hit'}

👁️ ANALYSE VISION:
• ${stats.averageVisionScore >= 25 ? '✅ Bonne vision' : stats.averageVisionScore >= 15 ? '⚠️ Vision moyenne' : '❌ Vision insuffisante - achète plus de pinks'}
`
}

export async function analyzePlayer(data: AnalysisData): Promise<string> {
  const playerData = formatDataForAnalysis(data)

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Analyse ce profil de joueur League of Legends et donne des conseils personnalisés:\n${playerData}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })

    return completion.choices[0]?.message?.content || 'Impossible de générer une analyse.'
  } catch (error) {
    console.error('Error analyzing player:', error)
    throw new Error('Erreur lors de l\'analyse du joueur')
  }
}

// Analyse rapide d'une game individuelle
export interface MatchAnalysisData {
  match: Match
  participant: MatchParticipant
  rank?: string
}

function formatMatchForAnalysis(data: MatchAnalysisData): string {
  const { match, participant, rank } = data
  const gameDurationMin = match.info.gameDuration / 60
  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled
  const csPerMin = (cs / gameDurationMin).toFixed(1)
  const kda = participant.deaths === 0
    ? 'Perfect'
    : ((participant.kills + participant.assists) / participant.deaths).toFixed(2)
  const visionPerMin = (participant.visionScore / gameDurationMin).toFixed(2)

  // Stats de l'équipe
  const team = match.info.teams.find(t => t.teamId === participant.teamId)
  const enemyTeam = match.info.teams.find(t => t.teamId !== participant.teamId)
  const allies = match.info.participants.filter(p => p.teamId === participant.teamId)
  const enemies = match.info.participants.filter(p => p.teamId !== participant.teamId)

  const teamKills = allies.reduce((acc, p) => acc + p.kills, 0)
  const killParticipation = teamKills > 0
    ? (((participant.kills + participant.assists) / teamKills) * 100).toFixed(0)
    : '0'

  // Classements dans la game
  const allPlayers = match.info.participants
  const damageRank = allPlayers
    .sort((a, b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions)
    .findIndex(p => p.puuid === participant.puuid) + 1
  const goldRank = allPlayers
    .sort((a, b) => b.goldEarned - a.goldEarned)
    .findIndex(p => p.puuid === participant.puuid) + 1
  const visionRank = allPlayers
    .sort((a, b) => b.visionScore - a.visionScore)
    .findIndex(p => p.puuid === participant.puuid) + 1
  const csRank = allPlayers
    .sort((a, b) => (b.totalMinionsKilled + b.neutralMinionsKilled) - (a.totalMinionsKilled + a.neutralMinionsKilled))
    .findIndex(p => p.puuid === participant.puuid) + 1

  // Adversaire direct (même rôle)
  const laneOpponent = enemies.find(p => p.teamPosition === participant.teamPosition)
  let laneComparison = ''
  if (laneOpponent) {
    const oppCs = laneOpponent.totalMinionsKilled + laneOpponent.neutralMinionsKilled
    const csDiff = cs - oppCs
    const goldDiff = participant.goldEarned - laneOpponent.goldEarned
    const kdaDiff = (participant.kills + participant.assists - participant.deaths) -
                   (laneOpponent.kills + laneOpponent.assists - laneOpponent.deaths)
    laneComparison = `
COMPARAISON VS ADVERSAIRE DIRECT (${laneOpponent.championName}):
- CS: ${csDiff > 0 ? '+' : ''}${csDiff} (${cs} vs ${oppCs})
- Gold: ${goldDiff > 0 ? '+' : ''}${goldDiff.toLocaleString()}
- Impact KDA: ${kdaDiff > 0 ? '+' : ''}${kdaDiff}`
  }

  // Résumé des alliés
  const alliesSummary = allies
    .filter(p => p.puuid !== participant.puuid)
    .map(p => `${p.championName} (${p.teamPosition}): ${p.kills}/${p.deaths}/${p.assists}`)
    .join(', ')

  return `
═══════════════════════════════════════
ANALYSE DÉTAILLÉE DE PARTIE
═══════════════════════════════════════

CONTEXTE:
- Résultat: ${participant.win ? '🏆 VICTOIRE' : '💀 DÉFAITE'}
- Durée: ${gameDurationMin.toFixed(0)} min
- Rang du joueur: ${rank || 'Non classé'}

JOUEUR ANALYSÉ: ${participant.championName} (${participant.teamPosition || 'Non défini'})
- KDA: ${participant.kills}/${participant.deaths}/${participant.assists} (ratio: ${kda})
- CS: ${cs} total (${csPerMin}/min)
- Vision Score: ${participant.visionScore} (${visionPerMin}/min)
- Dégâts aux champions: ${participant.totalDamageDealtToChampions.toLocaleString()}
- Dégâts subis: ${participant.totalDamageTaken.toLocaleString()}
- Gold: ${participant.goldEarned.toLocaleString()}
- Kill Participation: ${killParticipation}%
- Wards posés: ${participant.wardsPlaced} | Wards détruits: ${participant.wardsKilled}

CLASSEMENT DANS LA GAME (sur 10 joueurs):
- Dégâts: #${damageRank}/10
- Gold: #${goldRank}/10
- Vision: #${visionRank}/10
- CS: #${csRank}/10
${laneComparison}

ÉQUIPE ALLIÉE:
${alliesSummary}

OBJECTIFS:
- Notre équipe - Dragons: ${team?.objectives.dragon.kills || 0} | Barons: ${team?.objectives.baron.kills || 0} | Tours: ${team?.objectives.tower.kills || 0}
- Équipe adverse - Dragons: ${enemyTeam?.objectives.dragon.kills || 0} | Barons: ${enemyTeam?.objectives.baron.kills || 0} | Tours: ${enemyTeam?.objectives.tower.kills || 0}
`
}

export async function analyzeMatch(data: MatchAnalysisData): Promise<string> {
  const matchData = formatMatchForAnalysis(data)

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: MATCH_REVIEW_PROMPT,
        },
        {
          role: 'user',
          content: `Analyse cette partie en détail:\n${matchData}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    })

    return completion.choices[0]?.message?.content || 'Analyse indisponible.'
  } catch (error) {
    console.error('Error analyzing match:', error)
    throw new Error('Erreur lors de l\'analyse de la partie')
  }
}
