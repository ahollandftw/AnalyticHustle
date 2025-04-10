"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Player {
  order: number
  name: string
  position: string
}

interface Team {
  name: string
  lineup: Player[]
  starter: string
}

interface Game {
  id: number
  homeTeam: Team
  awayTeam: Team
  time: string
  status: string
}

export default function LineupsPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredGames = games.filter(
    (game) =>
      game.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.homeTeam.lineup.some((player) => player.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      game.awayTeam.lineup.some((player) => player.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>MLB Lineups</CardTitle>
          <CardDescription>View today's MLB lineups and starting pitchers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search teams or players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredGames.map((game) => (
            <div key={game.id} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {game.awayTeam.name} @ {game.homeTeam.name}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{game.time}</span>
                  <Badge variant={game.status === "Confirmed" ? "default" : "secondary"}>
                    {game.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Away Team */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{game.awayTeam.name}</h4>
                    <span className="text-sm text-muted-foreground">SP: {game.awayTeam.starter}</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Pos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.awayTeam.lineup.map((player) => (
                        <TableRow key={player.name}>
                          <TableCell>{player.order}</TableCell>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.position}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Home Team */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{game.homeTeam.name}</h4>
                    <span className="text-sm text-muted-foreground">SP: {game.homeTeam.starter}</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Pos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.homeTeam.lineup.map((player) => (
                        <TableRow key={player.name}>
                          <TableCell>{player.order}</TableCell>
                          <TableCell>{player.name}</TableCell>
                          <TableCell>{player.position}</TableCell>
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
