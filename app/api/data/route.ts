import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Helper function to normalize player names
function normalizeName(name: string) {
  // Check if name is in "Last, First" format
  if (name.includes(",")) {
    const [lastName, firstName] = name.split(",").map((part) => part.trim())
    return `${firstName} ${lastName}`
  }
  return name
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dataType = searchParams.get("type") || "players"
    const sport = searchParams.get("sport") || "mlb"
    const year = searchParams.get("year") || "2023"

    let data
    const dataDir = path.join(process.cwd(), 'Data')

    if (dataType === "players" && sport === "mlb") {
      // Load batter data
      const batterFile = path.join(dataDir, 'StatcastBatter2.json')
      const batterData = await fs.readFile(batterFile, 'utf8')
      data = JSON.parse(batterData)
    } else if (dataType === "pitchers" && sport === "mlb") {
      // Load pitcher data
      const pitcherFile = path.join(dataDir, 'StatcastPitcher2.json')
      const pitcherData = await fs.readFile(pitcherFile, 'utf8')
      data = JSON.parse(pitcherData)
    } else if (dataType === "parkFactors" && sport === "mlb") {
      // Load park factors data
      const parkFile = path.join(dataDir, 'ParkFactors.json')
      const parkData = await fs.readFile(parkFile, 'utf8')
      data = JSON.parse(parkData)
    } else if (dataType === "hittersvL" && sport === "mlb") {
      const vsLFile = path.join(dataDir, 'HittersvL.json')
      const vsLData = await fs.readFile(vsLFile, 'utf8')
      data = JSON.parse(vsLData)
    } else if (dataType === "hittersvR" && sport === "mlb") {
      const vsRFile = path.join(dataDir, 'HittersvR.json')
      const vsRData = await fs.readFile(vsRFile, 'utf8')
      data = JSON.parse(vsRData)
    } else if (dataType === "pitchersvR" && sport === "mlb") {
      const vsRFile = path.join(dataDir, 'PitchersvR.json')
      const vsRData = await fs.readFile(vsRFile, 'utf8')
      data = JSON.parse(vsRData)
    } else if (dataType === "evBatters" && sport === "mlb") {
      const evFile = path.join(dataDir, 'EVBatters.json')
      const evData = await fs.readFile(evFile, 'utf8')
      data = JSON.parse(evData)
    } else if (dataType === "evPitchers" && sport === "mlb") {
      const evFile = path.join(dataDir, 'EVPitchers.json')
      const evData = await fs.readFile(evFile, 'utf8')
      data = JSON.parse(evData)
    } else {
      return NextResponse.json({ error: "Data not found" }, { status: 404 })
    }

    // Normalize player names if needed
    if (["players", "pitchers", "hittersvL", "hittersvR", "pitchersvR", "evBatters", "evPitchers"].includes(dataType)) {
      data = data.map((player: any) => ({
        ...player,
        name: normalizeName(player.name),
      }))
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
