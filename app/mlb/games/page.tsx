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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Player {
  name: string;
  position: string;
  battingOrder?: number;
  stats?: {
    avg: string;
    hr: number;
    rbi: number;
    hrProj?: number;
  };
  isProjected?: boolean;
}

interface Team {
  name: string;
  lineup: Player[];
  startingPitcher?: Player;
  projectedLineup?: Player[];
  score?: number;
  record?: string;
  moneyLine?: number;
  impliedRuns?: number;
}

interface Weather {
  temperature: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
}

interface Game {
  id: string;
  startTime: string;
  status: string;
  inning?: number;
  isTopInning?: boolean;
  awayTeam: Team;
  homeTeam: Team;
  weather?: Weather;
  odds?: {
    spread: string;
    total: number;
  };
}

const StatusDot = ({ confirmed }: { confirmed: boolean }) => (
  <div className="flex items-center gap-2">
    <div 
      className={`h-2 w-2 rounded-full ${confirmed ? 'bg-green-500' : 'bg-yellow-500'}`} 
    />
    <span className="text-xs text-muted-foreground">
      {confirmed ? 'Confirmed' : 'Projected'}
    </span>
  </div>
)

const GameStatus = ({ game }: { game: Game }) => {
  if (game.status === "LIVE") {
    return (
      <Badge variant="default" className="bg-green-500">
        {game.isTopInning ? "Top" : "Bottom"} {game.inning}
      </Badge>
    )
  }
  if (game.status === "FINAL") {
    return <Badge variant="secondary">Final</Badge>
  }
  return <Badge variant="outline">Scheduled</Badge>
}

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data, loading, error } = useData<Game[]>({ 
    type: "games",
    sport: "mlb"
  })

  // Filter games based on search term
  const filteredGames = data?.filter(game => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      game.awayTeam.name.toLowerCase().includes(searchLower) ||
      game.homeTeam.name.toLowerCase().includes(searchLower)
    )
  }) || []

  const getLineupToShow = (team: Team) => {
    if (team.lineup && team.lineup.length > 0) {
      return { lineup: team.lineup, isProjected: false };
    }
    if (team.projectedLineup && team.projectedLineup.length > 0) {
      const projectedLineup = team.projectedLineup.map(player => ({
        ...player,
        isProjected: true
      }));
      return { lineup: projectedLineup, isProjected: true };
    }
    return { lineup: [], isProjected: true };
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Error loading games: {error}</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">MLB Games</h1>
        <Input
          type="search"
          placeholder="Search teams..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-[400px] w-full" />
            </Card>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            {searchTerm ? "No games found matching your search" : "No games scheduled"}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredGames.map((game) => {
            const awayLineup = getLineupToShow(game.awayTeam);
            const homeLineup = getLineupToShow(game.homeTeam);

            return (
              <Card key={game.id} className="p-4">
                {/* Game Header */}
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <GameStatus game={game} />
                    <div className="text-muted-foreground">
                      {new Date(game.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>

                {/* Lineups */}
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Away Team */}
                  <div>
                    <div className="mb-4 text-center">
                      <h3 className="text-xl font-semibold">{game.awayTeam.name}</h3>
                      {game.awayTeam.startingPitcher && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {game.awayTeam.startingPitcher.name} (P)
                          {game.awayTeam.moneyLine && (
                            <span className="ml-2">({game.awayTeam.moneyLine > 0 ? '+' : ''}{game.awayTeam.moneyLine})</span>
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-sm font-medium">
                        Implied Runs: {game.awayTeam.impliedRuns || '-'}
                      </div>
                    </div>
                    {game.awayTeam.lineup.length > 0 ? (
                      <div>
                        <div className="mb-2 flex items-center justify-end">
                          <StatusDot confirmed={!game.awayTeam.lineup[0]?.isProjected} />
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[10%] text-center">#</TableHead>
                              <TableHead className="w-[40%]">Player</TableHead>
                              <TableHead className="w-[15%] text-center">Pos</TableHead>
                              <TableHead className="w-[15%] text-center">AVG</TableHead>
                              <TableHead className="w-[20%] text-center">HR Proj.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {game.awayTeam.lineup.map((player, index) => (
                              <TableRow 
                                key={`${game.id}-away-${index}-${player.name}`}
                                className={player.isProjected ? "opacity-75" : ""}
                              >
                                <TableCell className="text-center">{player.battingOrder || (index + 1)}</TableCell>
                                <TableCell>{player.name}</TableCell>
                                <TableCell className="text-center">{player.position}</TableCell>
                                <TableCell className="text-center">{player.stats?.avg || '.000'}</TableCell>
                                <TableCell className="text-center">{player.stats?.hrProj || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Lineup not yet available
                      </div>
                    )}
                  </div>

                  {/* Home Team */}
                  <div>
                    <div className="mb-4 text-center">
                      <h3 className="text-xl font-semibold">{game.homeTeam.name}</h3>
                      {game.homeTeam.startingPitcher && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {game.homeTeam.startingPitcher.name} (P)
                          {game.homeTeam.moneyLine && (
                            <span className="ml-2">({game.homeTeam.moneyLine > 0 ? '+' : ''}{game.homeTeam.moneyLine})</span>
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-sm font-medium">
                        Implied Runs: {game.homeTeam.impliedRuns || '-'}
                      </div>
                    </div>
                    {game.homeTeam.lineup.length > 0 ? (
                      <div>
                        <div className="mb-2 flex items-center justify-end">
                          <StatusDot confirmed={!game.homeTeam.lineup[0]?.isProjected} />
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[10%] text-center">#</TableHead>
                              <TableHead className="w-[40%]">Player</TableHead>
                              <TableHead className="w-[15%] text-center">Pos</TableHead>
                              <TableHead className="w-[15%] text-center">AVG</TableHead>
                              <TableHead className="w-[20%] text-center">HR Proj.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {game.homeTeam.lineup.map((player, index) => (
                              <TableRow 
                                key={`${game.id}-home-${index}-${player.name}`}
                                className={player.isProjected ? "opacity-75" : ""}
                              >
                                <TableCell className="text-center">{player.battingOrder || (index + 1)}</TableCell>
                                <TableCell>{player.name}</TableCell>
                                <TableCell className="text-center">{player.position}</TableCell>
                                <TableCell className="text-center">{player.stats?.avg || '.000'}</TableCell>
                                <TableCell className="text-center">{player.stats?.hrProj || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Lineup not yet available
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Weather and Odds */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                    {game.weather && (
                      <div className="flex items-center gap-2">
                        <span>{game.weather.temperature}°F</span>
                        <span>•</span>
                        <span>{game.weather.condition}</span>
                        <span>•</span>
                        <span>{game.weather.windSpeed} mph {game.weather.windDirection}</span>
                      </div>
                    )}
                    {game.odds && (
                      <div className="flex items-center gap-4">
                        <span>Spread: {game.odds.spread}</span>
                        <span>•</span>
                        <span>O/U: {game.odds.total}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
}
