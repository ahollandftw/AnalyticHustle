import { NextResponse } from 'next/server'
import { fetchMLBLineups } from '@/lib/mlb'
import statcastBatters from "C:/AnalyticHustle1.0/StatcastBatters.json"
import hittersVsR from "C:/AnalyticHustle1.0/HittersvR.json"
import hittersVsL from "C:/AnalyticHustle1.0/HittersvL.json"

interface PlayerStats {
  name: string;
  team: string;
  seasonHR: number;
  abhr: number;
  probability: number;
}

export async function GET(request: Request) {
  try {
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
    
    // Combine data from both sources
    const combinedData: PlayerStats[] = []
    
    // Process each game to find players
    for (const game of games) {
      const team = game.homeTeam.id === teamId ? game.homeTeam : game.awayTeam
      
      for (const player of team.lineup) {
        // Find player in Statcast data
        const statcastData = statcastBatters.find((p: any) => 
          p.player_name.toLowerCase() === player.name.toLowerCase()
        )

        // Find player in platoon splits
        const vsRData = hittersVsR.find((p: any) => 
          p.Name_1.toLowerCase() === player.name.toLowerCase()
        )
        const vsLData = hittersVsL.find((p: any) => 
          p.Name_1.toLowerCase() === player.name.toLowerCase()
        )
        
        if (statcastData || vsRData || vsLData) {
          const seasonHR = (vsRData?.HR || 0) + (vsLData?.HR || 0)
          const totalAB = (vsRData?.AB || 0) + (vsLData?.AB || 0)
          
          combinedData.push({
            name: player.name,
            team: team.name,
            seasonHR: seasonHR,
            abhr: totalAB > 0 ? Math.round(totalAB / (seasonHR || 1)) : 0,
            probability: player.stats.hr // Using current HR probability from projections
          })
        }
      }
    }

    return NextResponse.json({
      team: { name: teamId, id: teamId },
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