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
import { useState, useEffect } from "react"
import evBatters from "@/Data/EVBatters.json"
import evPitchers from "@/Data/EVPitchers.json"
import parkFactors from "@/Data/ParkFactors.json"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import hittersVsR from "@/Data/HittersvR.json"
import hittersVsL from "@/Data/HittersvL.json"
import pitchersVsR from "@/Data/PitchersvR.json"
import pitchersVsL from "@/Data/PitchersvL.json"
import statcastBatters from "@/Data/StatcastBatters.json"
import statcastPitchers from "@/Data/StatcastPitchers.json"

interface EVBatter {
  "last_name, first_name": string;
  player_id: number;
  attempts: number;
  brl_pa: number;
  brl_percent: number;
  _sheetName: string;
}

interface EVPitcher {
  "last_name, first_name": string;
  player_id: number;
  attempts: number;
  brl_pa: number;
  brl_percent: number;
  _sheetName: string;
}

interface ParkFactor {
  Team: string;
  "Park Factor": number;
}

interface StartingPitcher {
  name: string;
  throws: "L" | "R";
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

interface Player {
  id: string;
  name: string;
  position: string;
  bats: string;
  stats: Stats;
  team?: string;
  opposingTeam?: string;
  opposingPitcher?: string;
  opposingPitcherThrows?: string;
  homeGame?: boolean;
}

interface Team {
  id: string;
  name: string;
  lineup: Player[];
  startingPitcher?: StartingPitcher;
}

interface Game {
  id: string;
  startTime: string;
  awayTeam: Team;
  homeTeam: Team;
}

function getHitterStats(name: string, bats: string, pitcherThrows: string) {
  // Get platoon stats
  const hitterData = pitcherThrows === 'L' ? 
    hittersVsL.find(h => h.Name_1 === name) :
    hittersVsR.find(h => h.Name_1 === name)

  // Get Statcast data
  const statcastData = statcastBatters.find(h => h.player_name === name)
  
  // Get EV data
  const evData = evBatters.find(h => h["last_name, first_name"] === name)

  // Debug logging
  console.log('Hitter lookup:', {
    name,
    foundInPlatoon: !!hitterData,
    foundInStatcast: !!statcastData,
    foundInEV: !!evData,
    platoonData: hitterData,
    statcastData,
    evData
  })

  if (!hitterData) {
    // Try alternate name formats
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternateHitterData = pitcherThrows === 'L' ?
      hittersVsL.find(h => h.Name_1 === alternateName) :
      hittersVsR.find(h => h.Name_1 === alternateName)
    
    if (alternateHitterData) {
      console.log('Found hitter with alternate name format:', alternateName)
      return {
        hr_per_pa: alternateHitterData.HR / alternateHitterData.PA,
        hr_per_fb: alternateHitterData["HR/FB"],
        fb_percent: alternateHitterData["FB%"],
        pull_percent: alternateHitterData["Pull%"],
        hard_hit: statcastData?.hard_hit_percent ?? 35, // League average fallback
        barrel_rate: evData?.brl_pa ?? 7 // League average fallback
      }
    }
    
    // If still no data, use league averages
    console.log('Using league averages for hitter:', name)
    return {
      hr_per_pa: 0.035, // League average ~3.5% HR/PA
      hr_per_fb: 0.15,  // League average ~15% HR/FB
      fb_percent: 0.35, // League average ~35% FB
      pull_percent: 0.40, // League average ~40% Pull
      hard_hit: 35, // League average ~35%
      barrel_rate: 7 // League average ~7%
    }
  }

  return {
    hr_per_pa: hitterData.HR / hitterData.PA,
    hr_per_fb: hitterData["HR/FB"],
    fb_percent: hitterData["FB%"],
    pull_percent: hitterData["Pull%"],
    hard_hit: statcastData?.hard_hit_percent ?? 35,
    barrel_rate: evData?.brl_pa ?? 7
  }
}

function getPitcherStats(name: string, batterHand: string) {
  if (name === 'TBD') {
    console.log('Using league averages for TBD pitcher')
    return {
      hr_per_9: 1.2,  // League average HR/9
      fb_percent: 0.35, // League average FB%
      gb_percent: 0.43, // League average GB%
      hard_hit: 35, // League average hard hit%
      barrel_rate: 7 // League average barrel rate
    }
  }

  // Get platoon stats
  const pitcherData = batterHand === 'L' ?
    pitchersVsL.find(p => p.Name_1 === name) :
    pitchersVsR.find(p => p.Name_1 === name)

  // Get Statcast data
  const statcastData = statcastPitchers.find(p => p["last_name, first_name"] === name)

  // Get EV data
  const evData = evPitchers.find(p => p["last_name, first_name"] === name)

  // Debug logging
  console.log('Pitcher lookup:', {
    name,
    foundInPlatoon: !!pitcherData,
    foundInStatcast: !!statcastData,
    foundInEV: !!evData,
    platoonData: pitcherData,
    statcastData,
    evData
  })

  if (!pitcherData) {
    // Try alternate name formats
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternatePitcherData = batterHand === 'L' ?
      pitchersVsL.find(p => p.Name_1 === alternateName) :
      pitchersVsR.find(p => p.Name_1 === alternateName)

    if (alternatePitcherData) {
      console.log('Found pitcher with alternate name format:', alternateName)
      return {
        hr_per_9: alternatePitcherData["HR/9"],
        fb_percent: alternatePitcherData["FB%"],
        gb_percent: alternatePitcherData["GB%"],
        hard_hit: statcastData?.hard_hit_percent ?? 35,
        barrel_rate: evData?.brl_pa ?? 7
      }
    }

    // If still no data, use league averages
    console.log('Using league averages for pitcher:', name)
    return {
      hr_per_9: 1.2,
      fb_percent: 0.35,
      gb_percent: 0.43,
      hard_hit: 35,
      barrel_rate: 7
    }
  }

  return {
    hr_per_9: pitcherData["HR/9"],
    fb_percent: pitcherData["FB%"],
    gb_percent: pitcherData["GB%"],
    hard_hit: statcastData?.hard_hit_percent ?? 35,
    barrel_rate: evData?.brl_pa ?? 7
  }
}

function getParkFactor(teamName: string) {
  const park = parkFactors.find(p => p.Team === teamName)
  return park?.["Park Factor"] ?? 1.0
}

async function calculateHRProbability(
  hitterStats: any,
  pitcherStats: any,
  parkFactor: number
) {
  // Base HR rate from historical data (convert HR/PA to a percentage)
  const baseHRRate = hitterStats.hr_per_pa * 100 // Convert to percentage

  // Adjust for pitcher quality (HR/9 where league average is 1.2)
  const pitcherAdjustment = (pitcherStats.hr_per_9 / 1.2)

  // Adjust for matchup factors
  const fbAdjustment = Math.min(2.0, (hitterStats.fb_percent * pitcherStats.fb_percent) / 0.1225) // 0.35 * 0.35 = 0.1225
  const pullAdjustment = hitterStats.pull_percent > 0.45 ? 1.2 : 1.0 // Bigger boost for pull hitters
  const hardHitAdjustment = Math.min(2.0, ((hitterStats.hard_hit + pitcherStats.hard_hit) / 2) / 30) // Normalize to league average
  
  // Combine all factors
  let adjustedRate = (baseHRRate * pitcherAdjustment * fbAdjustment * pullAdjustment * hardHitAdjustment * parkFactor)

  // Cap the probability at reasonable limits (between 2% and 35% per PA)
  return Math.min(Math.max(adjustedRate / 100, 0.02), 0.35)
}

export default function HRProjectionsPage() {
  const { data: games, loading, error } = useData<Game[]>({ 
    type: "games",
    sport: "mlb"
  })

  const [battersWithProbabilities, setBattersWithProbabilities] = useState<(Player & { probability: number })[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: 'probability' | 'hr', direction: 'asc' | 'desc' }>({
    key: 'probability',
    direction: 'desc'
  })

  const sortData = (data: (Player & { probability: number })[], key: 'probability' | 'hr', direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const aValue = key === 'hr' ? a.stats[key] : a[key]
      const bValue = key === 'hr' ? b.stats[key] : b[key]
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    })
  }

  const handleSort = (key: 'probability' | 'hr') => {
    setSortConfig(current => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key, direction: 'desc' }
    })
  }

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
      const sortedBatters = sortData(completedBatters, sortConfig.key, sortConfig.direction)
      setBattersWithProbabilities(sortedBatters)
    }

    calculateProbabilities()
  }, [games, sortConfig])

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
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('probability')}
                  className="w-full"
                >
                  HR Prob
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('hr')}
                  className="w-full"
                >
                  Season HR
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
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