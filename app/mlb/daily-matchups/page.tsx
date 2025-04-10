"use client"

import { useState } from "react"
import { useData } from "@/lib/hooks/use-data"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import React from "react"

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

interface PitcherStats {
  era: string;
  whip: string;
  ip: number;
  so: number;
  bb: number;
  hr: number;
  wins: number;
  losses: number;
}

interface Player {
  id: string;
  name: string;
  position: string;
  bats: string;
  stats: Stats;
}

interface Pitcher {
  id: string;
  name: string;
  throws: string;
  stats: PitcherStats;
}

interface Team {
  id: string;
  name: string;
  lineup: Player[];
  startingPitcher: Pitcher | null;
}

interface Game {
  id: string;
  startTime: string;
  awayTeam: Team;
  homeTeam: Team;
}

const CustomSelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, children, ...props }, ref) => (
  <SelectItem
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </SelectItem>
))
CustomSelectItem.displayName = "CustomSelectItem"

export default function DailyMatchupsPage() {
  const { data: games, loading, error } = useData<Game[]>({ 
    type: "games",
    sport: "mlb"
  })

  console.log('Games data:', games)

  // Get all teams from games
  const allTeams = React.useMemo(() => {
    if (!games) return []
    return games.flatMap(game => [
      { 
        id: game.homeTeam.id,
        name: game.homeTeam.name,
        lineup: game.homeTeam.lineup,
        startingPitcher: game.homeTeam.startingPitcher,
        gameId: game.id,
        isHome: true 
      },
      { 
        id: game.awayTeam.id,
        name: game.awayTeam.name,
        lineup: game.awayTeam.lineup,
        startingPitcher: game.awayTeam.startingPitcher,
        gameId: game.id,
        isHome: false 
      }
    ])
  }, [games])

  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("")

  // Update selected team when data loads
  React.useEffect(() => {
    if (allTeams.length > 0 && !selectedTeamId) {
      const firstTeam = allTeams[0]
      setSelectedTeamId(`${firstTeam.id}-${firstTeam.gameId}-${firstTeam.isHome}`)
    }
  }, [allTeams, selectedTeamId])

  const selectedTeamWithGame = allTeams.find(team => {
    if (!selectedTeamId) return false
    const [teamId, gameId, isHome] = selectedTeamId.split('-')
    return team.id === teamId && 
           team.gameId === gameId && 
           team.isHome === (isHome === 'true')
  })

  const selectedGame = games?.find(game => game.id === selectedTeamWithGame?.gameId)
  
  const selectedTeam = selectedTeamWithGame

  const opposingTeam = selectedGame && selectedTeamWithGame && (
    selectedTeamWithGame.isHome ? selectedGame.awayTeam : selectedGame.homeTeam
  )

  const selectedPlayer = selectedTeam?.lineup.find(player => player.id === selectedPlayerId)

  if (error) {
    return (
      <div className="text-red-500">Error loading matchups: {error}</div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedTeamId}
          onValueChange={(value) => {
            setSelectedTeamId(value)
            setSelectedPlayerId("")
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
              </SelectTrigger>
              <SelectContent>
            {allTeams.map(team => (
              <SelectItem 
                key={`${team.id}-${team.gameId}-${team.isHome}`}
                value={`${team.id}-${team.gameId}-${team.isHome}`}
              >
                {team.name}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Team Lineup */}
        <Card className="p-4">
          <h2 className="mb-4 text-lg font-semibold">{selectedTeam?.name} Lineup</h2>
          {selectedTeam?.lineup && selectedTeam.lineup.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Pos</TableHead>
                  <TableHead className="text-center">B</TableHead>
                  <TableHead className="text-center">HR Proj</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTeam.lineup.map((player, index) => (
                  <TableRow 
                    key={player.id}
                    className={`cursor-pointer hover:bg-accent ${
                      player.id === selectedPlayerId ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedPlayerId(player.id)}
                  >
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="text-center">{player.name}</TableCell>
                    <TableCell className="text-center">{player.position}</TableCell>
                    <TableCell className="text-center">{player.bats}</TableCell>
                    <TableCell className="text-center">{player.stats.hr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground">
              No lineup available
                  </div>
          )}
              </Card>

        {/* Player Stats */}
        <Card className="p-4">
          <h2 className="mb-4 text-lg font-semibold">
            {selectedPlayer ? selectedPlayer.name : 'Select a Player'}
          </h2>
          {selectedPlayer ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">AVG</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.avg}</div>
                      </div>
                <div>
                  <div className="text-sm text-muted-foreground">OBP</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.obp}</div>
                      </div>
                <div>
                  <div className="text-sm text-muted-foreground">SLG</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.slg}</div>
                    </div>
                <div>
                  <div className="text-sm text-muted-foreground">OPS</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.ops}</div>
                            </div>
                          </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">HR</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.hr}</div>
                          </div>
                <div>
                  <div className="text-sm text-muted-foreground">RBI</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.rbi}</div>
                        </div>
                <div>
                  <div className="text-sm text-muted-foreground">PA</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.pa}</div>
                          </div>
                <div>
                  <div className="text-sm text-muted-foreground">SO</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.so}</div>
                            </div>
                <div>
                  <div className="text-sm text-muted-foreground">BB</div>
                  <div className="text-xl font-semibold">{selectedPlayer.stats.bb}</div>
                          </div>
                        </div>
                          </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Select a player to view their stats
                          </div>
          )}
              </Card>

        {/* Opposing Pitcher */}
        <Card className="p-4">
          <h2 className="mb-4 text-lg font-semibold">
            {opposingTeam?.startingPitcher ? 
              `${opposingTeam.startingPitcher.name} (${opposingTeam.name})` : 
              'No Pitcher Available'}
          </h2>
          {opposingTeam?.startingPitcher ? (
                  <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                    <div>
                  <div className="text-sm text-muted-foreground">ERA</div>
                  <div className="text-xl font-semibold">{opposingTeam.startingPitcher.stats.era}</div>
                        </div>
                <div>
                  <div className="text-sm text-muted-foreground">WHIP</div>
                  <div className="text-xl font-semibold">{opposingTeam.startingPitcher.stats.whip}</div>
                        </div>
                <div>
                  <div className="text-sm text-muted-foreground">IP</div>
                  <div className="text-xl font-semibold">{opposingTeam.startingPitcher.stats.ip}</div>
                    </div>
                    <div>
                  <div className="text-sm text-muted-foreground">Record</div>
                  <div className="text-xl font-semibold">
                    {opposingTeam.startingPitcher.stats.wins}-{opposingTeam.startingPitcher.stats.losses}
                        </div>
                      </div>
                    </div>
              <div className="grid grid-cols-3 gap-4">
                    <div>
                  <div className="text-sm text-muted-foreground">SO</div>
                  <div className="text-xl font-semibold">{opposingTeam.startingPitcher.stats.so}</div>
                            </div>
                <div>
                  <div className="text-sm text-muted-foreground">BB</div>
                  <div className="text-xl font-semibold">{opposingTeam.startingPitcher.stats.bb}</div>
                    </div>
                    <div>
                  <div className="text-sm text-muted-foreground">HR</div>
                  <div className="text-xl font-semibold">{opposingTeam.startingPitcher.stats.hr}</div>
                          </div>
                        </div>
                      </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No pitcher data available
            </div>
          )}
      </Card>
      </div>
    </div>
  )
}
