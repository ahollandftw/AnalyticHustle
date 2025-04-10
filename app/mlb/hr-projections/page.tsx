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
import hittersVsR from "@/Data/HittersvR.json"
import hittersVsL from "@/Data/HittersvL.json"
import pitchersVsR from "@/Data/PitchersvR.json"
import pitchersVsL from "@/Data/PitchersvL.json"
import evBatters from "@/Data/EVBatters.json"
import evPitchers from "@/Data/EVPitchers.json"
import parkFactors from "@/Data/ParkFactors.json"
import { useState, useEffect } from "react"

interface Stats {
  avg: string
  obp: string
  slg: string
  ops: string
  hr: number
  rbi: number
  so: number
  bb: number
  pa: number
}

interface Player {
  id: string
  name: string
  position: string
  bats: string
  throws?: string
  stats: Stats
  team?: string
  opposingTeam?: string
  opposingPitcher?: string
  opposingPitcherThrows?: string
  homeGame?: boolean
}

interface Team {
  id: string
  name: string
  lineup: Player[]
  startingPitcher?: Player
}

interface Game {
  id: string
  startTime: string
  awayTeam: Team
  homeTeam: Team
}

interface HitterStats {
  HR_rate: number
  BarrelRate: number
  HardHitRate: number
  ExitVelo: number
  LaunchAngle: number
  FlyBallRate: number
  PullRate: number
  HR_FB_Rate: number
  ISO: number
}

interface PitcherStats {
  PitcherHR_9: number
  PitcherBarrelRate: number
  PitcherFBRate: number
}

// Default weights for HR probability calculation
const DEFAULT_WEIGHTS = {
  HR_rate: 1,
  BarrelRate: 1,
  HardHitRate: 1,
  ExitVelo: 1,
  LaunchAngle: 1,
  FlyBallRate: 1,
  PullRate: 1,
  HR_FB_Rate: 1,
  ISO: 1,
  PitcherHR_9: 1,
  PitcherBarrelRate: 1,
  PitcherFBRate: 1,
  ParkFactor: 1
}

function getHitterStats(playerName: string, bats: string, opposingPitcherThrows: string): HitterStats | null {
  // Get splits data based on batter handedness and pitcher handedness
  const splitData = opposingPitcherThrows === 'L' ? hittersVsL : hittersVsR
  const hitterSplits = splitData.find(h => h.Name_1 === playerName)

  // Get EV data
  const evData = evBatters.find(b => b["last_name, first_name"] === playerName)

  if (!hitterSplits || !evData) return null

  return {
    HR_rate: (hitterSplits.HR / hitterSplits.PA) * 100,
    BarrelRate: evData.brl_percent,
    HardHitRate: evData.ev95percent,
    ExitVelo: evData.avg_hit_speed,
    LaunchAngle: evData.avg_hit_angle,
    FlyBallRate: hitterSplits["FB%"] * 100,
    PullRate: hitterSplits["Pull%"] * 100,
    HR_FB_Rate: hitterSplits["HR/FB"] * 100,
    ISO: hitterSplits.ISO
  }
}

function getPitcherStats(pitcherName: string, opposingBatterHand: string): PitcherStats | null {
  // Get splits data based on batter handedness
  const splitData = opposingBatterHand === 'L' ? pitchersVsL : pitchersVsR
  const pitcherSplits = splitData.find(p => p.Name_1 === pitcherName)

  // Get EV data
  const evData = evPitchers.find(p => p["last_name, first_name"] === pitcherName)

  if (!pitcherSplits || !evData) return null

  return {
    PitcherHR_9: pitcherSplits["HR/9"],
    PitcherBarrelRate: evData.brl_percent,
    PitcherFBRate: pitcherSplits["FB%"] * 100
  }
}

function getParkFactor(teamName: string): number {
  const park = parkFactors.find(p => p.Team?.trim().includes(teamName.split(' ')[1]))
  return park?.["Park Factor"] ?? 100
}

async function calculateHRProbability(
  hitter: HitterStats,
  pitcher: PitcherStats,
  parkFactor: number
): Promise<number> {
  try {
    const response = await fetch('/api/hr-probability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hitter,
        pitcher,
        parkFactor,
        weights: DEFAULT_WEIGHTS
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to calculate HR probability')
    }

    const data = await response.json()
    return data.probability
  } catch (error) {
    console.error('Error calculating HR probability:', error)
    return 0
  }
}

export default function HRProjectionsPage() {
  const { data: games, loading, error } = useData<Game[]>({ 
    type: "games",
    sport: "mlb"
  })

  const [battersWithProbabilities, setBattersWithProbabilities] = useState<(Player & { probability: number })[]>([])

  useEffect(() => {
    async function calculateProbabilities() {
      if (!games) return

      // Get all batters from all teams with their matchups
      const allBatters = games.flatMap(game => [
        ...game.homeTeam.lineup.map(player => ({
          ...player,
          team: game.homeTeam.name,
          opposingTeam: game.awayTeam.name,
          opposingPitcher: game.awayTeam.startingPitcher?.name || 'TBD',
          opposingPitcherThrows: game.awayTeam.startingPitcher?.throws || 'R',
          homeGame: true
        })),
        ...game.awayTeam.lineup.map(player => ({
          ...player,
          team: game.awayTeam.name,
          opposingTeam: game.homeTeam.name,
          opposingPitcher: game.homeTeam.startingPitcher?.name || 'TBD',
          opposingPitcherThrows: game.homeTeam.startingPitcher?.throws || 'R',
          homeGame: false
        }))
      ])

      // Calculate HR probabilities for each batter
      const batterPromises = allBatters.map(async batter => {
        const hitterStats = getHitterStats(batter.name, batter.bats, batter.opposingPitcherThrows)
        const pitcherStats = getPitcherStats(batter.opposingPitcher, batter.bats)
        const parkFactor = getParkFactor(batter.homeGame ? batter.team : batter.opposingTeam)

        let probability = 0
        if (hitterStats && pitcherStats) {
          probability = await calculateHRProbability(hitterStats, pitcherStats, parkFactor)
        }

        return {
          ...batter,
          probability
        }
      })

      const completedBatters = await Promise.all(batterPromises)
      const sortedBatters = [...completedBatters].sort((a, b) => b.probability - a.probability)
      setBattersWithProbabilities(sortedBatters)
    }

    calculateProbabilities()
  }, [games])

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
              <TableHead className="text-center">vs Pitcher</TableHead>
              <TableHead className="text-center">HR Prob</TableHead>
              <TableHead className="text-center">Season HR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {battersWithProbabilities.map((player) => (
              <TableRow key={`${player.id}-${player.team}`}>
                <TableCell className="text-center">{player.name}</TableCell>
                <TableCell className="text-center">{player.team}</TableCell>
                <TableCell className="text-center">{player.opposingPitcher}</TableCell>
                <TableCell className="text-center">{(player.probability * 100).toFixed(1)}%</TableCell>
                <TableCell className="text-center">{player.stats.hr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 