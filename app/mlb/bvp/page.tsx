"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface BvpStats {
  atBats: number
  hits: number
  doubles: number
  triples: number
  homeRuns: number
  rbis: number
  walks: number
  strikeouts: number
  avg: string
  ops: string
}

interface BvpMatchup {
  id: number
  batter: {
    name: string
    team: string
    hand: string
  }
  pitcher: {
    name: string
    team: string
    hand: string
  }
  stats: BvpStats
  game: {
    time: string
    status: string
  }
}

export default function BvpPage() {
  const [matchups, setMatchups] = useState<BvpMatchup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/data?type=bvp&sport=mlb')
        const data = await response.json()
        setMatchups(data.data || [])

        setLoading(false)
      } catch (err) {
        setError('Failed to fetch data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredMatchups = matchups.filter(
    (matchup) =>
      matchup.batter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matchup.pitcher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matchup.batter.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matchup.pitcher.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Batter vs Pitcher Matchups</CardTitle>
          <CardDescription>Historical matchup statistics for today's games</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search batters, pitchers, or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batter</TableHead>
                <TableHead>B</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Pitcher</TableHead>
                <TableHead>T</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>AB</TableHead>
                <TableHead>H</TableHead>
                <TableHead>2B</TableHead>
                <TableHead>3B</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>RBI</TableHead>
                <TableHead>BB</TableHead>
                <TableHead>SO</TableHead>
                <TableHead>AVG</TableHead>
                <TableHead>OPS</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatchups.map((matchup) => (
                <TableRow key={matchup.id}>
                  <TableCell>{matchup.batter.name}</TableCell>
                  <TableCell>{matchup.batter.hand}</TableCell>
                  <TableCell>{matchup.batter.team}</TableCell>
                  <TableCell>{matchup.pitcher.name}</TableCell>
                  <TableCell>{matchup.pitcher.hand}</TableCell>
                  <TableCell>{matchup.pitcher.team}</TableCell>
                  <TableCell>{matchup.stats.atBats}</TableCell>
                  <TableCell>{matchup.stats.hits}</TableCell>
                  <TableCell>{matchup.stats.doubles}</TableCell>
                  <TableCell>{matchup.stats.triples}</TableCell>
                  <TableCell>{matchup.stats.homeRuns}</TableCell>
                  <TableCell>{matchup.stats.rbis}</TableCell>
                  <TableCell>{matchup.stats.walks}</TableCell>
                  <TableCell>{matchup.stats.strikeouts}</TableCell>
                  <TableCell>{matchup.stats.avg}</TableCell>
                  <TableCell>{matchup.stats.ops}</TableCell>
                  <TableCell>{matchup.game.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMatchups.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No matchups found for the given search term.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
