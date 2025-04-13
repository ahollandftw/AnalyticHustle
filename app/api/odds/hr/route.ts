import { NextResponse } from 'next/server'
import { fetchMLBLineups } from '@/lib/mlb'
import statcastBatters from "C:/AnalyticHustle1.0/StatcastBatters.json"
import hittersVsR from "C:/AnalyticHustle1.0/HittersvR.json"
import hittersVsL from "C:/AnalyticHustle1.0/HittersvL.json"

interface PlayerOdds {
  name: string;
  team: string;
  seasonHR: number;
  abhr: number;
  probability: number;
}

export async function GET() {
  try {
    // Get current games and lineups
    const games = await fetchMLBLineups()
    if (!games || !Array.isArray(games)) {
      return NextResponse.json(
        { error: 'Failed to fetch current lineups' },
        { status: 500 }
      )
    }

    const allPlayers: PlayerOdds[] = []
    
    // Process each game to find players
    for (const game of games) {
      const processTeam = (team: any) => {
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
            const totalPA = (vsRData?.PA || 0) + (vsLData?.PA || 0)
            
            allPlayers.push({
              name: player.name,
              team: team.name,
              seasonHR: seasonHR,
              abhr: totalPA > 0 ? Math.round(totalPA / (seasonHR || 1)) : 0,
              probability: player.stats.hr // Using current HR probability from projections
            })
          }
        }
      }

      processTeam(game.homeTeam)
      processTeam(game.awayTeam)
    }

    return NextResponse.json(allPlayers)

  } catch (error) {
    console.error('Error fetching HR odds:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 