"use client"

import { useState } from "react"
import { useData } from "@/lib/hooks/use-data"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Player {
  name: string
  team: string
  position: string
  stats: {
    avg?: number
    obp?: number
    slg?: number
    ops?: number
    hr?: number
    rbi?: number
    sb?: number
    era?: number
    whip?: number
    k9?: number
    bb9?: number
    fip?: number
  }
}

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: players, loading, error } = useData<Player[]>({ type: "batters" })

  const filteredPlayers = players?.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Error loading players: {error}</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">MLB Players</h1>
        <Input
          type="search"
          placeholder="Search players..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">AVG</TableHead>
                <TableHead className="text-right">OBP</TableHead>
                <TableHead className="text-right">SLG</TableHead>
                <TableHead className="text-right">OPS</TableHead>
                <TableHead className="text-right">HR</TableHead>
                <TableHead className="text-right">RBI</TableHead>
                <TableHead className="text-right">SB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player, index) => (
                <TableRow key={`${player.name}-${player.team}-${index}`}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{player.position}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {player.stats.avg?.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right">
                    {player.stats.obp?.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right">
                    {player.stats.slg?.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right">
                    {player.stats.ops?.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right">{player.stats.hr}</TableCell>
                  <TableCell className="text-right">{player.stats.rbi}</TableCell>
                  <TableCell className="text-right">{player.stats.sb}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
