import { NextResponse } from 'next/server'
import { fetchMLBLineups } from '@/lib/mlb'

const SPORTSRADAR_API_KEY = process.env.SPORTSRADAR_API_KEY
const BASE_URL = 'https://api.sportradar.us/mlb/trial/v7/en'

interface PlayerStats {
  name: string;
  team: string;
  seasonHR: number;
  abhr: number;
  probability: number;
}

export async function GET(request: Request) {
  try {
    if (!SPORTSRADAR_API_KEY) {
      return NextResponse.json(
        { error: 'SportsRadar API key not configured' },
        { status: 500 }
      )
    }

    // Get team ID from query parameters
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    // Get current games and lineups
    const games = await fetchMLBLineups()
    if (!games || !Array.isArray(games)) {
      return NextResponse.json(
        { error: 'Failed to fetch current lineups' },
        { status: 500 }
      )
    }

    // Get 2025 season statistics
    const statsUrl = `${BASE_URL}/seasons/2025/REG/teams/${teamId}/statistics.json?api_key=${SPORTSRADAR_API_KEY}`
    const statsResponse = await fetch(statsUrl)
    
    if (!statsResponse.ok) {
      const errorText = await statsResponse.text()
      console.error('SportsRadar API Error:', {
        status: statsResponse.status,
        statusText: statsResponse.statusText,
        error: errorText
      })
      return NextResponse.json(
        { error: 'Failed to fetch team statistics' },
        { status: statsResponse.status }
      )
    }

    const statsData = await statsResponse.json()
    
    // Combine data from both sources
    const combinedData: PlayerStats[] = []
    
    // Process each game to find players
    for (const game of games) {
      const team = game.homeTeam.id === teamId ? game.homeTeam : game.awayTeam
      
      for (const player of team.lineup) {
        // Find player in 2025 stats
        const seasonStats = statsData.players?.find((p: any) => 
          p.name.toLowerCase() === player.name.toLowerCase()
        )
        
        if (seasonStats) {
          combinedData.push({
            name: player.name,
            team: team.name,
            seasonHR: seasonStats.hr || 0,
            abhr: seasonStats.ab ? Math.round(seasonStats.ab / (seasonStats.hr || 1)) : 0,
            probability: player.stats.hr // Using current HR probability from projections
          })
        }
      }
    }

    return NextResponse.json({
      team: statsData.team,
      players: combinedData
    })

  } catch (error) {
    console.error('Error fetching team statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 