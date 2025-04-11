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
  seasonHR?: number;
  hrPerAB?: number;
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

interface TeamStats {
  team: {
    name: string;
    id: string;
  };
  players: {
    name: string;
    seasonHR: number;
    abhr: number;
  }[];
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
        hard_hit: statcastData?.hard_hit_percent ?? 30, // League average fallback
        barrel_rate: evData?.brl_pa ?? 5 // League average fallback
      }
    }
    
    // If still no data, use league averages with slightly higher baseline
    console.log('Using league averages for hitter:', name)
    return {
      hr_per_pa: 0.035, // League average ~3.5% HR/PA
      hr_per_fb: 0.12, // League average ~12% HR/FB
      fb_percent: 0.38, // League average ~38% FB
      pull_percent: 0.42, // League average ~42% Pull
      hard_hit: 35, // League average ~35%
      barrel_rate: 7 // League average ~7%
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

function getPitcherStats(name: string, batterHand: string) {
  if (name === 'TBD') {
    console.log('Using league averages for TBD pitcher')
    return {
      hr_per_9: 1.3, // League average HR/9
      fb_percent: 0.38, // League average FB%
      gb_percent: 0.42, // League average GB%
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
        hard_hit: statcastData?.hard_hit_percent ?? 30,
        barrel_rate: evData?.brl_pa ?? 5
      }
    }

    // If still no data, use league averages
    console.log('Using league averages for pitcher:', name)
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

function getParkFactor(teamName: string) {
  const park = parkFactors.find(p => p.Team === teamName)
  return park?.["Park Factor"] ?? 1.0
}

async function calculateHRProbability(
  hitterStats: any,
  pitcherStats: any,
  parkFactor: number
) {
  // Base HR rate from historical data (convert HR/9 to HR/PA)
  const pitcherHRperPA = (pitcherStats.hr_per_9 / 9) * 0.11 // Approx 11% of PA end in HR for HR-prone pitchers
  const baseHRRate = Math.max(hitterStats.hr_per_pa, pitcherHRperPA) || 0.03

  // Adjust for matchup factors
  const fbAdjustment = Math.min(
    (hitterStats.fb_percent * (1 - pitcherStats.gb_percent)) / 0.35, 
    1.5
  ) // Cap flyball adjustment

  // Pull and hard hit bonuses
  const pullBonus = hitterStats.pull_percent > 0.45 ? 1.2 : 1.0
  const hardHitBonus = ((hitterStats.hard_hit + pitcherStats.hard_hit) / 2) > 35 ? 1.2 : 1.0
  
  // Barrel rate impact (significant factor in HR probability)
  const barrelBonus = ((hitterStats.barrel_rate + 5) / 5)

  // Combine all factors
  let adjustedRate = baseHRRate * fbAdjustment * pullBonus * hardHitBonus * barrelBonus * parkFactor

  // Scale up the final probability to better reflect real-world HR rates
  adjustedRate = adjustedRate * 1.5

  // Only keep the minimum floor to ensure realistic probabilities
  return Math.max(adjustedRate, 0.02)
}

export default function HRProjectionsPage() {
  const { data: games, error } = useData<Game[]>({ type: 'games', sport: 'mlb' })
  const [sortedData, setSortedData] = useState<(Player & { probability: number })[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'probability', direction: 'desc' })
  const [loading, setLoading] = useState(true)

  const sortData = (data: (Player & { probability: number })[], key: 'probability' | 'hr', direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const aValue = key === 'hr' ? a.stats[key] : a[key]
      const bValue = key === 'hr' ? b.stats[key] : b[key]
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    })
  }

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      ...current,
      key,
      direction: current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  useEffect(() => {
    async function calculateProbabilities() {
      if (!games) return

      const allPlayers: (Player & { probability: number })[] = []

      for (const game of games) {
        const processTeam = async (team: Team, isHome: boolean) => {
          const opposingTeam = isHome ? game.awayTeam : game.homeTeam
          
          for (const player of team.lineup) {
            try {
              const statsResponse = await fetch(`/api/mlb/team-stats?teamId=${team.id}`)
              const statsData = await statsResponse.json() as TeamStats
              const playerStats = statsData.players?.find((p: { name: string }) => p.name === player.name)
              
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
              
              allPlayers.push({
                ...player,
                team: team.name,
                opposingTeam: opposingTeam.name,
                opposingPitcher: opposingTeam.startingPitcher?.name || 'TBD',
                opposingPitcherThrows: opposingTeam.startingPitcher?.throws || 'R',
                homeGame: isHome,
                probability,
                seasonHR: playerStats?.seasonHR || 0,
                hrPerAB: playerStats?.abhr || 0
              })
            } catch (error) {
              console.error('Error fetching player stats:', error)
            }
          }
        }

        await Promise.all([
          processTeam(game.homeTeam, true),
          processTeam(game.awayTeam, false)
        ])
      }

      setSortedData(sortData(allPlayers, sortConfig.key as 'probability' | 'hr', sortConfig.direction))
      setLoading(false)
    }

    calculateProbabilities()
  }, [games, sortConfig])

  if (error) {
    return (
      <div className="text-red-500">Error loading projections: {error}</div>
    )
  }

  return (
    <Card className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>vs Pitcher</TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => handleSort('probability')}>
                HR Prob {sortConfig.key === 'probability' && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
            </TableHead>
            <TableHead className="text-right">Season HR</TableHead>
            <TableHead className="text-right">HR/AB</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((player) => (
              <TableRow key={`${player.name}-${player.team}`}>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell>{player.opposingPitcher}</TableCell>
                <TableCell className="text-right">{(player.probability * 100).toFixed(1)}%</TableCell>
                <TableCell className="text-right">{player.seasonHR}</TableCell>
                <TableCell className="text-right">{player.hrPerAB}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
} 