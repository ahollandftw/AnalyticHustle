"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlayerStats {
  season: {
    avg: number
    obp: number
    slg: number
    ops: number
    hr: number
    pa: number
  }
  vsStarter: {
    avg: number
    obp: number
    slg: number
    ops: number
    ab: number
    h: number
    hr: number
  }
  homeRunProb: number
  barrelRate: number
  hardHitRate: number
  avgExitVelo: number
  launchAngle: number
  flyBallRate: number
  pullRate: number
  hrFbRate: number
  xHR: number
  iso: number
  recentHR: {
    last7: number
    last14: number
  }
}

interface Player {
  order: number
  name: string
  position: string
  bats: string
  stats: PlayerStats
}

interface Team {
  name: string
  lineup: Player[]
}

interface Game {
  gameId: number
  homeTeam: Team
  awayTeam: Team
}

export default function DailyMatchupsPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch lineups data
        const lineupsResponse = await fetch('/api/data?type=lineups&sport=mlb')
        const lineupsData = await lineupsResponse.json()
        setGames(lineupsData.data || [])

        setLoading(false)
      } catch (err) {
        setError('Failed to fetch data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>MLB Daily Matchups</CardTitle>
          <CardDescription>View today's MLB matchups and lineups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {games.map((game) => (
            <div key={game.gameId} className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">
                {game.awayTeam.name} @ {game.homeTeam.name}
              </h3>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Away Team */}
                <div>
                  <h4 className="mb-2 font-medium">{game.awayTeam.name} Lineup</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Pos</TableHead>
                        <TableHead>B</TableHead>
                        <TableHead>AVG</TableHead>
                        <TableHead>OBP</TableHead>
                        <TableHead>SLG</TableHead>
                        <TableHead>OPS</TableHead>
                        <TableHead>HR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.awayTeam.lineup.map((player) => (
                        <TableRow key={player.name}>
                          <TableCell>{player.order}</TableCell>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.position}</TableCell>
                          <TableCell>{player.bats}</TableCell>
                          <TableCell>{player.stats.season.avg.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.obp.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.slg.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.ops.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.hr}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Home Team */}
                <div>
                  <h4 className="mb-2 font-medium">{game.homeTeam.name} Lineup</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Pos</TableHead>
                        <TableHead>B</TableHead>
                        <TableHead>AVG</TableHead>
                        <TableHead>OBP</TableHead>
                        <TableHead>SLG</TableHead>
                        <TableHead>OPS</TableHead>
                        <TableHead>HR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.homeTeam.lineup.map((player) => (
                        <TableRow key={player.name}>
                          <TableCell>{player.order}</TableCell>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.position}</TableCell>
                          <TableCell>{player.bats}</TableCell>
                          <TableCell>{player.stats.season.avg.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.obp.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.slg.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.ops.toFixed(3)}</TableCell>
                          <TableCell>{player.stats.season.hr}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
