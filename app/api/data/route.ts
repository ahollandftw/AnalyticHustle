import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { cache } from "react"

// Cache the file reading operation
const readJsonFile = cache(async (filename: string) => {
  const filePath = path.join(process.cwd(), "data", filename)
  const data = await fs.readFile(filePath, "utf-8")
  return JSON.parse(data)
})

// Helper to merge duplicate player entries
function mergeDuplicatePlayers(players: any[]) {
  const playerMap = new Map()
  
  players.forEach(player => {
    const key = `${player.name}-${player.team}`.toLowerCase()
    if (playerMap.has(key)) {
      // Merge stats, taking the most recent or highest value
      const existing = playerMap.get(key)
      playerMap.set(key, {
        ...existing,
        ...player,
        // Add any specific stat merging logic here
        stats: {
          ...existing.stats,
          ...player.stats
        }
      })
    } else {
      playerMap.set(key, player)
    }
  })

  return Array.from(playerMap.values())
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const sport = searchParams.get("sport")?.toLowerCase() || "mlb"

    if (!type) {
      return NextResponse.json({ error: "Type parameter is required" }, { status: 400 })
    }

    let data: any = null

    switch (type) {
      case "batters":
        if (sport === "mlb") {
          const statcastData = await readJsonFile("StatcastBatter2.json")
          const vsLData = await readJsonFile("HittersvL.json")
          const vsRData = await readJsonFile("HittersvR.json")
          const evData = await readJsonFile("EVBatters.json")
          
          // Merge all batter data
          data = mergeDuplicatePlayers([
            ...statcastData,
            ...vsLData,
            ...vsRData,
            ...evData
          ])
        }
        break

      case "pitchers":
        if (sport === "mlb") {
          const statcastData = await readJsonFile("StatcastPitcher2.json")
          const vsRData = await readJsonFile("PitchersvR.json")
          const evData = await readJsonFile("EVPitchers.json")
          
          // Merge all pitcher data
          data = mergeDuplicatePlayers([
            ...statcastData,
            ...vsRData,
            ...evData
          ])
        }
        break

      case "parkfactors":
        if (sport === "mlb") {
          try {
            data = await readJsonFile("ParkFactors.json")
            console.log("Park factors data loaded:", {
              count: Array.isArray(data) ? data.length : 0,
              sample: Array.isArray(data) ? data[0] : null
            })
          } catch (error) {
            console.error("Error loading park factors:", error)
            throw error
          }
        }
        break

      case "lineups":
        // This will be empty for now as mentioned
        data = []
        break

      case "games":
        // This will be empty for now as mentioned
        data = []
        break

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "No data found" }, { status: 404 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("Error processing data request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
