"use client"

import { useData } from "@/lib/hooks/use-data"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  hr: number;
  rbi: number;
  so: number;
  bb: number;
  pa: number;
}

interface Player {
  id: string;
  name: string;
  position: string;
  bats: string;
  stats: Stats;
}

interface Team {
  id: string;
  name: string;
  lineup: Player[];
}

interface Game {
  id: string;
  startTime: string;
  awayTeam: Team;
  homeTeam: Team;
}

export default function HRProjectionsPage() {
  const { data: games, loading, error } = useData<Game[]>({ 
    type: "games",
    sport: "mlb"
  })

  // Get all batters from all teams
  const allBatters = games?.flatMap(game => [
    ...game.homeTeam.lineup.map(player => ({
      ...player,
      team: game.homeTeam.name
    })),
    ...game.awayTeam.lineup.map(player => ({
      ...player,
      team: game.awayTeam.name
    }))
  ]) || []

  // Sort batters by HR projection (currently using season HR as placeholder)
  const sortedBatters = [...allBatters].sort((a, b) => b.stats.hr - a.stats.hr)

  if (error) {
    return (
      <div className="text-red-500">Error loading projections: {error}</div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Today's HR Projections</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Team</TableHead>
              <TableHead className="text-center">Pos</TableHead>
              <TableHead className="text-center">B</TableHead>
              <TableHead className="text-center">Season HR</TableHead>
              <TableHead className="text-center">HR Proj</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBatters.map((player) => (
              <TableRow key={`${player.id}-${player.team}`}>
                <TableCell className="text-center">{player.name}</TableCell>
                <TableCell className="text-center">{player.team}</TableCell>
                <TableCell className="text-center">{player.position}</TableCell>
                <TableCell className="text-center">{player.bats}</TableCell>
                <TableCell className="text-center">{player.stats.hr}</TableCell>
                <TableCell className="text-center">TBD</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 