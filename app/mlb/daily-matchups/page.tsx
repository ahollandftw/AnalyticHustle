"use client"

import { useState, useEffect } from "react"
import { useData } from "@/lib/hooks/use-data"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import statcastPitchers from "C:/AnalyticHustle1.0/StatcastPitchers.json"
import evBatters from "C:/AnalyticHustle1.0/EVBatters.json"
import evPitchers from "C:/AnalyticHustle1.0/EVPitchers.json"
import parkFactors from "C:/AnalyticHustle1.0/ParkFactors.json"
import hittersVsR from "C:/AnalyticHustle1.0/HittersvR.json"
import hittersVsL from "C:/AnalyticHustle1.0/HittersvL.json"
import pitchersVsR from "C:/AnalyticHustle1.0/PitchersvR.json"
import pitchersVsL from "C:/AnalyticHustle1.0/PitchersvL.json"
import statcastBatters from "C:/AnalyticHustle1.0/StatcastBatters.json"

interface StatcastPitcher {
  "last_name, first_name": string
  pitch_type: string
  pitch_name: string
  pitch_usage: number
  whiff_percent: number
  run_value_per_100: number
  ba: number
  slg: number
  put_away: number
}

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

interface ParkFactor {
  Team: string;
  "Park Factor": number;
}

interface HitterData {
  Name: string;
  Team: string;
  Name_1: string;
  Team_1: string;
  HR: number;
  PA: number;
  "HR/FB": number;
  "FB%": number;
  "Pull%": number;
  ISO: number;
  NameASCII: string;
  PlayerId: number;
  MLBAMID: number;
  Name_original: string;
  _sheetName: string;
}

interface StatcastBatter {
  player_name: string;
  hard_hit_percent: number;
  pitch_type?: string;
  pitch_name?: string;
  run_value_per_100?: number;
  whiff_percent?: number;
  hard_hit_percent_by_pitch?: number;
  ba?: number;
  slg?: number;
}

interface EVData {
  "last_name, first_name": string;
  brl_pa: number;
}

interface PitcherData {
  Name_1: string;
  "HR/9": number;
  "FB%": number;
  "GB%": number;
}

interface StatcastPitcherData {
  "last_name, first_name": string;
  hard_hit_percent: number;
}

interface EVPitcherData {
  "last_name, first_name": string;
  brl_pa: number;
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

function getHitterStats(name: string, bats: string, pitcherThrows: string) {
  // Get platoon stats
  const hitterData = pitcherThrows === 'L' ? 
    (hittersVsL as HitterData[]).find(h => h.Name_1 === name) :
    (hittersVsR as HitterData[]).find(h => h.Name_1 === name)

  // Get Statcast data
  const statcastData = (statcastBatters as StatcastBatter[]).find(h => h.player_name === name)
  
  // Get EV data
  const evData = (evBatters as EVData[]).find(h => h["last_name, first_name"] === name)

  if (!hitterData) {
    // Try alternate name formats
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternateHitterData = pitcherThrows === 'L' ?
      (hittersVsL as HitterData[]).find(h => h.Name_1 === alternateName) :
      (hittersVsR as HitterData[]).find(h => h.Name_1 === alternateName)
    
    if (alternateHitterData) {
      return {
        hr_per_pa: alternateHitterData.HR / alternateHitterData.PA,
        hr_per_fb: alternateHitterData["HR/FB"],
        fb_percent: alternateHitterData["FB%"],
        pull_percent: alternateHitterData["Pull%"],
        hard_hit: statcastData?.hard_hit_percent ?? 30,
        barrel_rate: evData?.brl_pa ?? 5
      }
    }
    
    return {
      hr_per_pa: 0.035,
      hr_per_fb: 0.12,
      fb_percent: 0.38,
      pull_percent: 0.42,
      hard_hit: 35,
      barrel_rate: 7
    }
  }

  return {
    hr_per_pa: hitterData.HR / hitterData.PA,
    hr_per_fb: hitterData["HR/FB"],
    fb_percent: hitterData["FB%"],
    pull_percent: hitterData["Pull%"],
    hard_hit: statcastData?.hard_hit_percent ?? 30,
    barrel_rate: evData?.brl_pa ?? 5
  }
}

function getHRsVsHand(name: string, pitcherThrows: string): number {
  // Get platoon stats based on pitcher handedness
  let hitterData = pitcherThrows === 'L' ? 
    hittersVsL.filter(h => h.Name_1 === name) :
    hittersVsR.filter(h => h.Name_1 === name)

  // If no data found, try alternate name format
  if (hitterData.length === 0) {
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    hitterData = pitcherThrows === 'L' ?
      hittersVsL.filter(h => h.Name_1 === alternateName) :
      hittersVsR.filter(h => h.Name_1 === alternateName)
  }

  // If still no data, return 0
  if (hitterData.length === 0) {
    return 0
  }

  // Take only the last 3 years of data if more exists
  const sortedData = hitterData.sort((a, b) => {
    const yearA = parseInt(a._sheetName.replace('FG', ''))
    const yearB = parseInt(b._sheetName.replace('FG', ''))
    return yearB - yearA
  }).slice(0, 3)
  
  // Sum up HRs for the last 3 years
  return sortedData.reduce((sum, h) => sum + h.HR, 0)
}

function getPitcherStats(name: string, batterHand: string) {
  if (name === 'TBD') {
    return {
      hr_per_9: 1.3,
      fb_percent: 0.38,
      gb_percent: 0.42,
      hard_hit: 35,
      barrel_rate: 7
    }
  }

  // Get platoon stats
  const pitcherData = batterHand === 'L' ?
    (pitchersVsL as PitcherData[]).find(p => p.Name_1 === name) :
    (pitchersVsR as PitcherData[]).find(p => p.Name_1 === name)

  // Get Statcast data
  const statcastData = (statcastPitchers as StatcastPitcherData[]).find(p => p["last_name, first_name"] === name)

  // Get EV data
  const evData = (evPitchers as EVPitcherData[]).find(p => p["last_name, first_name"] === name)

  if (!pitcherData) {
    // Try alternate name formats
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternatePitcherData = batterHand === 'L' ?
      (pitchersVsL as PitcherData[]).find(p => p.Name_1 === alternateName) :
      (pitchersVsR as PitcherData[]).find(p => p.Name_1 === alternateName)

    if (alternatePitcherData) {
      return {
        hr_per_9: alternatePitcherData["HR/9"],
        fb_percent: alternatePitcherData["FB%"],
        gb_percent: alternatePitcherData["GB%"],
        hard_hit: statcastData?.hard_hit_percent ?? 30,
        barrel_rate: evData?.brl_pa ?? 5
      }
    }

    return {
      hr_per_9: 1.3,
      fb_percent: 0.38,
      gb_percent: 0.42,
      hard_hit: 35,
      barrel_rate: 7
    }
  }

  return {
    hr_per_9: pitcherData["HR/9"],
    fb_percent: pitcherData["FB%"],
    gb_percent: pitcherData["GB%"],
    hard_hit: statcastData?.hard_hit_percent ?? 30,
    barrel_rate: evData?.brl_pa ?? 5
  }
}

function getParkFactor(teamName: string): number {
  const parkFactor = (parkFactors as ParkFactor[]).find(p => p.Team === teamName)
  return parkFactor?.["Park Factor"] ?? 1.0
}

async function calculateHRProbability(
  hitterStats: any,
  pitcherStats: any,
  parkFactor: number
) {
  // Base HR rate from historical data
  const baseHRRate = hitterStats.hr_per_pa * 0.15

  // Statcast metrics
  const barrelComponent = (hitterStats.barrel_rate / 100) * 0.12
  const hardHitComponent = (hitterStats.hard_hit / 100) * 0.10

  // Batted ball profile
  const fbComponent = hitterStats.fb_percent * 0.07
  const pullComponent = hitterStats.pull_percent * 0.05
  const hrFbComponent = hitterStats.hr_per_fb * 0.05

  // Pitcher factors
  const pitcherHRComponent = (pitcherStats.hr_per_9 / 2) * 0.10
  const pitcherBarrelComponent = (pitcherStats.barrel_rate / 100) * 0.05
  const pitcherFBComponent = pitcherStats.fb_percent * 0.05

  // Park factor
  const parkComponent = (parkFactor - 1) * 0.05

  // Combine all components
  let probability = baseHRRate +
    barrelComponent +
    hardHitComponent +
    fbComponent +
    pullComponent +
    hrFbComponent +
    pitcherHRComponent +
    pitcherBarrelComponent +
    pitcherFBComponent +
    parkComponent

  // Cap the probability at reasonable limits (2% min for MLB hitters, 30% max for elite matchups)
  return Math.min(Math.max(probability, 0.02), 0.30)
}

// Get pitch types for the selected batter
const getBatterPitchTypes = (batterName: string): string[] => {
  const batterData = (statcastBatters as StatcastBatter[]).filter(b => b.player_name === batterName)
  return Array.from(new Set(batterData.map(b => b.pitch_type).filter(Boolean) as string[]))
}

// Get pitch types and stats for the selected pitcher
function getPitchTypes(pitcherName: string): PitchStats[] {
  if (!pitcherName || pitcherName === 'TBD') return []
  
  // Group pitches by type and calculate averages
  const pitchGroups = (statcastPitchers as any[])
    .filter(p => p["last_name, first_name"] === pitcherName && p.pitch_usage > 0)
    .reduce((acc, pitch) => {
      // Create a unique key combining pitch type and name
      const key = `${pitch.pitch_type}_${pitch.pitch_name}_${pitch.pitch_hand || ''}`
      if (!acc[key]) {
        acc[key] = {
          pitch_type: pitch.pitch_type,
          pitch_name: pitch.pitch_name,
          pitch_hand: pitch.pitch_hand,
          run_value_per_100: 0,
          pitch_usage: 0,
          count: 0
        }
      }
      acc[key].run_value_per_100 += pitch.run_value_per_100
      acc[key].pitch_usage += pitch.pitch_usage
      acc[key].count++
      return acc
    }, {} as Record<string, { pitch_type: string; pitch_name: string; pitch_hand?: string; run_value_per_100: number; pitch_usage: number; count: number }>)

  // Calculate averages and sort by usage
  return Object.values(pitchGroups)
    .map(pitch => ({
      pitch_type: pitch.pitch_type,
      pitch_name: pitch.pitch_name,
      run_value_per_100: pitch.run_value_per_100 / pitch.count,
      pitch_usage: pitch.pitch_usage / pitch.count
    }))
    .sort((a, b) => b.pitch_usage - a.pitch_usage)
}

// Get batter stats for selected pitch type, return undefined if no data
function getBatterPitchStats(batterName: string, pitchType: string, pitchName: string): {
  run_value_per_100?: number;
} | undefined {
  return (statcastBatters as any[]).find(b => 
    b.player_name === batterName && 
    b.pitch_type === pitchType &&
    b.pitch_name === pitchName
  )
}

// Update the calculateRunValueComparison function
const calculateRunValueComparison = (batterName: string, pitcherName: string): number => {
  if (!batterName || !pitcherName) return 0

  const pitcherPitches = getPitchTypes(pitcherName)
  if (pitcherPitches.length === 0) return 0

  let batterTotal = 0
  let pitcherTotal = 0
  let matchedPitches = 0

  pitcherPitches.forEach(pitch => {
    const batterStats = getBatterPitchStats(batterName, pitch.pitch_type, pitch.pitch_name)
    if (batterStats?.run_value_per_100 !== undefined) {
      batterTotal += batterStats.run_value_per_100
      pitcherTotal += pitch.run_value_per_100
      matchedPitches++
    }
  })

  if (matchedPitches === 0) return 0

  const batterAvg = batterTotal / matchedPitches
  const pitcherAvg = pitcherTotal / matchedPitches
  return batterAvg - pitcherAvg
}

// Add CircularProgress component
function CircularProgress({ value, type, minValue, maxValue }: { 
  value: number, 
  type: 'rv' | 'probability',
  minValue?: number,
  maxValue?: number 
}) {
  if (type === 'rv') {
    const normalizedValue = Math.min(Math.max(value, -5), 5) / 5
    const percentage = (normalizedValue + 1) / 2 * 100
    const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500'
    
    return (
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90">
          <circle
            className="text-muted-foreground/20"
            cx="28"
            cy="28"
            r="24"
            strokeWidth="4"
            fill="none"
            stroke="currentColor"
          />
          <circle
            className={color}
            cx="28"
            cy="28"
            r="24"
            strokeWidth="4"
            fill="none"
            stroke="currentColor"
            strokeDasharray={`${percentage * 1.51} 151`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {value.toFixed(1)}
        </div>
      </div>
    )
  }

  // Probability logic with relative coloring
  const percentage = value * 100
  let color = 'text-gray-500'
  
  if (minValue !== undefined && maxValue !== undefined) {
    const range = maxValue - minValue
    const relativePosition = (value - minValue) / range
    
    if (relativePosition >= 0.67) {
      color = 'text-green-500'
    } else if (relativePosition >= 0.33) {
      color = 'text-yellow-500'
    } else {
      color = 'text-red-500'
    }
  }
  
  return (
    <div className="relative w-14 h-14">
      <svg className="w-14 h-14 -rotate-90">
        <circle
          className="text-muted-foreground/20"
          cx="28"
          cy="28"
          r="24"
          strokeWidth="4"
          fill="none"
          stroke="currentColor"
        />
        <circle
          className={color}
          cx="28"
          cy="28"
          r="24"
          strokeWidth="4"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${percentage * 1.51} 151`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {percentage.toFixed(1)}%
      </div>
    </div>
  )
}

export default function DailyMatchupsPage() {
  const { data: games, loading, error } = useData<Game[]>({ 
    type: "games",
    sport: "mlb"
  })

  const [hrProbabilities, setHrProbabilities] = useState<{[key: string]: number}>({})
  const [minHrProb, setMinHrProb] = useState<number>(0)
  const [maxHrProb, setMaxHrProb] = useState<number>(0)

  // Calculate HR probabilities when games data changes
  useEffect(() => {
    async function calculateProbabilities() {
      if (!games) return

      const newProbabilities: {[key: string]: number} = {}
      let min = 1
      let max = 0

      for (const game of games) {
        const processTeam = async (team: Team, isHome: boolean) => {
          const opposingTeam = isHome ? game.awayTeam : game.homeTeam
          
          for (const player of team.lineup) {
            const hitterStats = getHitterStats(
              player.name,
              player.bats,
              opposingTeam.startingPitcher?.throws || 'R'
            )
            
            const pitcherStats = getPitcherStats(
              opposingTeam.startingPitcher?.name || 'TBD',
              player.bats
            )
            
            const parkFactor = getParkFactor(isHome ? team.name : opposingTeam.name)
            const probability = await calculateHRProbability(hitterStats, pitcherStats, parkFactor)
            
            newProbabilities[player.id] = probability
            min = Math.min(min, probability)
            max = Math.max(max, probability)
          }
        }

        await processTeam(game.homeTeam, true)
        await processTeam(game.awayTeam, false)
      }

      setHrProbabilities(newProbabilities)
      setMinHrProb(min)
      setMaxHrProb(max)
    }

    calculateProbabilities()
  }, [games])

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
  const [selectedPitchType, setSelectedPitchType] = useState<string>("")

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
                  <TableHead className="text-center">HR Proj</TableHead>
                  <TableHead className="text-center">RV Comp</TableHead>
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
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <CircularProgress 
                          value={hrProbabilities[player.id] || 0} 
                          type="probability"
                          minValue={minHrProb}
                          maxValue={maxHrProb}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <CircularProgress 
                          value={calculateRunValueComparison(
                            player.name,
                            opposingTeam?.startingPitcher?.name || ''
                          )} 
                          type="rv" 
                        />
                      </div>
                    </TableCell>
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

              {/* Pitch Values Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">vs {opposingTeam?.startingPitcher?.name}'s Pitches</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>HH%</TableHead>
                      <TableHead>RV/100</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const pitcherName = opposingTeam?.startingPitcher?.name
                      if (!pitcherName || !selectedPlayer) {
                        return (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No pitch data available
                            </TableCell>
                          </TableRow>
                        )
                      }

                      const pitcherPitches = getPitchTypes(pitcherName)
                      if (pitcherPitches.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No pitch data available for {pitcherName}
                            </TableCell>
                          </TableRow>
                        )
                      }

                      return pitcherPitches.map(pitch => {
                        const key = `${pitch.pitch_type}_${pitch.pitch_name}`
                        const batterStats = getBatterPitchStats(selectedPlayer.name, pitch.pitch_type, pitch.pitch_name)
                        return (
                          <TableRow key={key}>
                            <TableCell>{pitch.pitch_type}</TableCell>
                            <TableCell>{pitch.pitch_usage.toFixed(1)}%</TableCell>
                            <TableCell>{batterStats?.hard_hit_percent_by_pitch?.toFixed(1) ?? 'NA'}%</TableCell>
                            <TableCell>{batterStats?.run_value_per_100?.toFixed(1) ?? 'NA'}</TableCell>
                          </TableRow>
                        )
                      })
                    })()}
                  </TableBody>
                </Table>
              </div>

              {/* Batter Stats Section */}
              <Card className="w-full mt-6">
                <CardHeader>
                  <CardTitle>Batter Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">HR Probability</span>
                        <div className="flex justify-center">
                          <CircularProgress 
                            value={hrProbabilities[selectedPlayerId] || 0} 
                            type="probability"
                            minValue={minHrProb}
                            maxValue={maxHrProb}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">RV Comparison</span>
                        <div className="flex justify-center">
                          <CircularProgress 
                            value={calculateRunValueComparison(selectedPlayer.name, opposingTeam?.startingPitcher?.name || '')} 
                            type="rv" 
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Prob+RV</span>
                        <div className="flex justify-center">
                          <CircularProgress value={(hrProbabilities[selectedPlayerId] || 0) * (calculateRunValueComparison(selectedPlayer.name, opposingTeam?.startingPitcher?.name || '') || 0)} type="rv" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Season HR</span>
                        <span className="text-sm">{selectedPlayer.stats.hr}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">HR vs Hand(Past 3)</span>
                        <span className="text-sm">
                          {selectedPlayer && opposingTeam?.startingPitcher ? 
                            getHRsVsHand(
                              selectedPlayer.name, 
                              opposingTeam.startingPitcher.throws || 'R'
                            ) : 
                            'NA'
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">HR/AB</span>
                        <span className="text-sm">{selectedPlayer.stats.hr / selectedPlayer.stats.pa}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

              {/* Pitch Values Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Pitch Values</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>RV/100</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const pitcherName = opposingTeam?.startingPitcher?.name
                      if (!pitcherName) {
                        return (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No pitch data available
                            </TableCell>
                          </TableRow>
                        )
                      }
                      
                      const pitcherPitches = getPitchTypes(pitcherName)
                      if (pitcherPitches.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No pitch data available
                            </TableCell>
                          </TableRow>
                        )
                      }

                      return pitcherPitches.map(pitch => (
                        <TableRow key={pitch.pitch_type}>
                          <TableCell>{pitch.pitch_type}</TableCell>
                          <TableCell>{pitch.pitch_usage.toFixed(1)}%</TableCell>
                          <TableCell>{pitch.run_value_per_100.toFixed(1)}</TableCell>
                        </TableRow>
                      ))
                    })()}
                  </TableBody>
                </Table>
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
