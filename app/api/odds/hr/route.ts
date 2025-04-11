import { NextResponse } from 'next/server'
import { fetchMLBLineups } from '@/lib/mlb'

interface Player {
  name: string;
  stats: {
    hr: number;
    pa: number;
  };
}

interface Team {
  name: string;
  lineup: Player[];
}

interface Game {
  startTime: string;
  homeTeam: Team;
  awayTeam: Team;
}

const SPORTSRADAR_API_KEY = process.env.SPORTSRADAR_API_KEY

// For testing purposes, if no API key is available
const MOCK_ODDS_DATA = {
  competition_sport_events_players_props: [
    {
      players_props: [
        {
          markets: [
            {
              name: "Home Runs",
              books: [
                {
                  name: "DraftKings",
                  outcomes: [
                    {
                      player_name: "Aaron Judge",
                      odds_american: "+320"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export async function GET() {
  try {
    // Debug: Log API key status
    console.log('API Key status:', SPORTSRADAR_API_KEY ? 'Present' : 'Missing')
    
    // First get today's games and lineups
    console.log('Fetching MLB lineups...')
    const games = await fetchMLBLineups()
    
    if (!games || !Array.isArray(games) || games.length === 0) {
      console.log('No games available today')
      return NextResponse.json([])
    }
    console.log(`Found ${games.length} games`)

    // If no API key, use mock data for testing
    if (!SPORTSRADAR_API_KEY) {
      console.log('Using mock odds data (no API key provided)')
      const oddsData = MOCK_ODDS_DATA
      return processOddsData(games, oddsData)
    }

    // Fetch odds from SportsRadar
    console.log('Fetching odds from SportsRadar...')
    const apiUrl = 'https://api.sportradar.com/oddscomparison-player-props/trial/v2/en/competitions/sr:competition:17/players_props?offset=0&limit=100'
    console.log('API URL:', apiUrl)
    
    const headers = {
      'api-key': SPORTSRADAR_API_KEY
    }
    console.log('Request headers:', headers)

    const oddsResponse = await fetch(apiUrl, { headers })

    // Debug: Log response details
    console.log('Response status:', oddsResponse.status)
    console.log('Response status text:', oddsResponse.statusText)
    
    if (!oddsResponse.ok) {
      console.error(`SportsRadar API error: ${oddsResponse.status} ${oddsResponse.statusText}`)
      // Try to get more error details
      const errorText = await oddsResponse.text()
      console.error('Error response body:', errorText)
      return NextResponse.json([])
    }

    const oddsData = await oddsResponse.json()
    console.log('Received odds data structure:', JSON.stringify(oddsData, null, 2).substring(0, 500) + '...')
    
    return processOddsData(games, oddsData)
    
  } catch (error) {
    console.error('Error in HR odds API route:', error)
    return NextResponse.json([], { status: 200 })
  }
}

function processOddsData(games: Game[], oddsData: any) {
  try {
    // Process each game and combine lineup data with odds
    const playersWithOdds = games.flatMap(game => {
      if (!game.homeTeam?.name || !game.awayTeam?.name) {
        console.warn('Game missing team information:', game)
        return []
      }

      // Process home team players
      const homePlayers = (game.homeTeam.lineup || []).map((player: Player) => {
        if (!player?.name) return null
        
        // Find player's odds across all events
        let bestOdds: any = null
        let bestBookmaker = 'Unknown'

        // Search through all events for this player's odds
        oddsData.competition_sport_events_players_props?.forEach((event: any) => {
          event.players_props?.forEach((prop: any) => {
            prop.markets?.forEach((market: any) => {
              if (market.name?.toLowerCase().includes('home run')) {
                market.books?.forEach((book: any) => {
                  book.outcomes?.forEach((outcome: any) => {
                    if (outcome.player_name?.toLowerCase() === player.name.toLowerCase()) {
                      const americanOdds = parseInt(outcome.odds_american || '0')
                      if (!bestOdds || americanOdds > parseInt(bestOdds)) {
                        bestOdds = outcome.odds_american
                        bestBookmaker = book.name
                      }
                    }
                  })
                })
              }
            })
          })
        })

        if (!bestOdds) {
          console.warn(`No odds found for player: ${player.name}`)
          return null
        }

        return {
          name: player.name,
          team: game.homeTeam.name,
          game: `${game.awayTeam.name} @ ${game.homeTeam.name}`,
          time: new Date(game.startTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York'
          }) + ' ET',
          odds: bestOdds,
          bookmaker: bestBookmaker,
          season: {
            hr: player.stats?.hr ?? 0,
            pa: player.stats?.pa ?? 0,
            hrRate: ((player.stats?.hr ?? 0) / (player.stats?.pa ?? 1) * 100).toFixed(1) + '%'
          }
        }
      }).filter(Boolean)

      // Process away team players
      const awayPlayers = (game.awayTeam.lineup || []).map((player: Player) => {
        if (!player?.name) return null
        
        // Find player's odds across all events
        let bestOdds: any = null
        let bestBookmaker = 'Unknown'

        // Search through all events for this player's odds
        oddsData.competition_sport_events_players_props?.forEach((event: any) => {
          event.players_props?.forEach((prop: any) => {
            prop.markets?.forEach((market: any) => {
              if (market.name?.toLowerCase().includes('home run')) {
                market.books?.forEach((book: any) => {
                  book.outcomes?.forEach((outcome: any) => {
                    if (outcome.player_name?.toLowerCase() === player.name.toLowerCase()) {
                      const americanOdds = parseInt(outcome.odds_american || '0')
                      if (!bestOdds || americanOdds > parseInt(bestOdds)) {
                        bestOdds = outcome.odds_american
                        bestBookmaker = book.name
                      }
                    }
                  })
                })
              }
            })
          })
        })

        if (!bestOdds) {
          console.warn(`No odds found for player: ${player.name}`)
          return null
        }

        return {
          name: player.name,
          team: game.awayTeam.name,
          game: `${game.awayTeam.name} @ ${game.homeTeam.name}`,
          time: new Date(game.startTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York'
          }) + ' ET',
          odds: bestOdds,
          bookmaker: bestBookmaker,
          season: {
            hr: player.stats?.hr ?? 0,
            pa: player.stats?.pa ?? 0,
            hrRate: ((player.stats?.hr ?? 0) / (player.stats?.pa ?? 1) * 100).toFixed(1) + '%'
          }
        }
      }).filter(Boolean)

      return [...homePlayers, ...awayPlayers]
    })

    console.log(`Successfully processed odds for ${playersWithOdds.length} players`)
    return NextResponse.json(playersWithOdds)
  } catch (error) {
    console.error('Error processing odds data:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array instead of error
  }
} 