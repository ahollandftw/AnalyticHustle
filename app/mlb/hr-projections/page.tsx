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
import evBatters from "C:/AnalyticHustle1.0/EVBatters.json"
import evPitchers from "C:/AnalyticHustle1.0/EVPitchers.json"
import parkFactors from "C:/AnalyticHustle1.0/ParkFactors.json"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Check } from "lucide-react"
import hittersVsR from "C:/AnalyticHustle1.0/HittersvR.json"
import hittersVsL from "C:/AnalyticHustle1.0/HittersvL.json"
import pitchersVsR from "C:/AnalyticHustle1.0/PitchersvR.json"
import pitchersVsL from "C:/AnalyticHustle1.0/PitchersvL.json"
import statcastBatters from "C:/AnalyticHustle1.0/StatcastBatters.json"
import statcastPitchers from "C:/AnalyticHustle1.0/StatcastPitchers.json"
import { Slider } from "@/components/ui/slider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  rvComparison?: number;
  hrVsHand?: number;
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

interface StatWeights {
  HR_rate: number;
  BarrelRate: number;
  HardHitRate: number;
  ExitVelo: number;
  LaunchAngle: number;
  FlyBallRate: number;
  PullRate: number;
  HR_FB_Rate: number;
  xHR: number;
  ISO: number;
  RecentHRs: number;
  PitcherHR_9: number;
  PitcherBarrelRate: number;
  PitcherFBRate: number;
  ParkFactor: number;
}

interface PitchStats {
  pitch_type: string;
  pitch_name: string;
  run_value_per_100: number;
  pitch_usage: number;
}

function getHitterStats(name: string, bats: string, pitcherThrows: string) {
  // Get platoon stats and average across multiple years
  const hitterData = pitcherThrows === 'L' ? 
    hittersVsL.filter(h => h.Name_1 === name) :
    hittersVsR.filter(h => h.Name_1 === name)

  // Get Statcast data and average across multiple years
  const statcastData = statcastBatters.filter(h => h.player_name === name)
  
  // Get EV data and average across multiple years
  const evData = evBatters.filter(h => h["last_name, first_name"] === name)

  // Calculate averages for hitter data
  const avgHitterData = hitterData.length > 0 ? {
    HR: hitterData.reduce((sum, h) => sum + h.HR, 0) / hitterData.length,
    PA: hitterData.reduce((sum, h) => sum + h.PA, 0) / hitterData.length,
    "HR/FB": hitterData.reduce((sum, h) => sum + h["HR/FB"], 0) / hitterData.length,
    "FB%": hitterData.reduce((sum, h) => sum + h["FB%"], 0) / hitterData.length,
    "Pull%": hitterData.reduce((sum, h) => sum + h["Pull%"], 0) / hitterData.length
  } : null

  // Calculate averages for statcast data
  const avgStatcastData = statcastData.length > 0 ? {
    hard_hit_percent: statcastData.reduce((sum, h) => sum + h.hard_hit_percent, 0) / statcastData.length
  } : null

  // Calculate averages for EV data
  const avgEvData = evData.length > 0 ? {
    brl_pa: evData.reduce((sum, h) => sum + h.brl_pa, 0) / evData.length
  } : null

  if (!avgHitterData) {
    // Try alternate name formats
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternateHitterData = pitcherThrows === 'L' ?
      hittersVsL.filter(h => h.Name_1 === alternateName) :
      hittersVsR.filter(h => h.Name_1 === alternateName)
    
    if (alternateHitterData.length > 0) {
      const avgAlternateData = {
        HR: alternateHitterData.reduce((sum, h) => sum + h.HR, 0) / alternateHitterData.length,
        PA: alternateHitterData.reduce((sum, h) => sum + h.PA, 0) / alternateHitterData.length,
        "HR/FB": alternateHitterData.reduce((sum, h) => sum + h["HR/FB"], 0) / alternateHitterData.length,
        "FB%": alternateHitterData.reduce((sum, h) => sum + h["FB%"], 0) / alternateHitterData.length,
        "Pull%": alternateHitterData.reduce((sum, h) => sum + h["Pull%"], 0) / alternateHitterData.length
      }
      return {
        hr_per_pa: avgAlternateData.HR / avgAlternateData.PA,
        hr_per_fb: avgAlternateData["HR/FB"],
        fb_percent: avgAlternateData["FB%"],
        pull_percent: avgAlternateData["Pull%"],
        hard_hit: avgStatcastData?.hard_hit_percent ?? 30,
        barrel_rate: avgEvData?.brl_pa ?? 5
      }
    }
    
    // If still no data, use league averages
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
    hr_per_pa: avgHitterData.HR / avgHitterData.PA,
    hr_per_fb: avgHitterData["HR/FB"],
    fb_percent: avgHitterData["FB%"],
    pull_percent: avgHitterData["Pull%"],
    hard_hit: avgStatcastData?.hard_hit_percent ?? 30,
    barrel_rate: avgEvData?.brl_pa ?? 5
  }
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

  // Get platoon stats and average across multiple years
  const pitcherData = batterHand === 'L' ?
    pitchersVsL.filter(p => p.Name_1 === name) :
    pitchersVsR.filter(p => p.Name_1 === name)

  // Get Statcast data and average across multiple years
  const statcastData = statcastPitchers.filter(p => p["last_name, first_name"] === name)

  // Get EV data and average across multiple years
  const evData = evPitchers.filter(p => p["last_name, first_name"] === name)

  // Calculate averages for pitcher data
  const avgPitcherData = pitcherData.length > 0 ? {
    "HR/9": pitcherData.reduce((sum, p) => sum + p["HR/9"], 0) / pitcherData.length,
    "FB%": pitcherData.reduce((sum, p) => sum + p["FB%"], 0) / pitcherData.length,
    "GB%": pitcherData.reduce((sum, p) => sum + p["GB%"], 0) / pitcherData.length
  } : null

  // Calculate averages for statcast data
  const avgStatcastData = statcastData.length > 0 ? {
    hard_hit_percent: statcastData.reduce((sum, p) => sum + p.hard_hit_percent, 0) / statcastData.length
  } : null

  // Calculate averages for EV data
  const avgEvData = evData.length > 0 ? {
    brl_pa: evData.reduce((sum, p) => sum + p.brl_pa, 0) / evData.length
  } : null

  if (!avgPitcherData) {
    // Try alternate name formats
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternatePitcherData = batterHand === 'L' ?
      pitchersVsL.filter(p => p.Name_1 === alternateName) :
      pitchersVsR.filter(p => p.Name_1 === alternateName)

    if (alternatePitcherData.length > 0) {
      const avgAlternateData = {
        "HR/9": alternatePitcherData.reduce((sum, p) => sum + p["HR/9"], 0) / alternatePitcherData.length,
        "FB%": alternatePitcherData.reduce((sum, p) => sum + p["FB%"], 0) / alternatePitcherData.length,
        "GB%": alternatePitcherData.reduce((sum, p) => sum + p["GB%"], 0) / alternatePitcherData.length
      }
      return {
        hr_per_9: avgAlternateData["HR/9"],
        fb_percent: avgAlternateData["FB%"],
        gb_percent: avgAlternateData["GB%"],
        hard_hit: avgStatcastData?.hard_hit_percent ?? 30,
        barrel_rate: avgEvData?.brl_pa ?? 5
      }
    }

    // If still no data, use league averages
    return {
      hr_per_9: 1.3,
      fb_percent: 0.38,
      gb_percent: 0.42,
      hard_hit: 35,
      barrel_rate: 7
    }
  }

  return {
    hr_per_9: avgPitcherData["HR/9"],
    fb_percent: avgPitcherData["FB%"],
    gb_percent: avgPitcherData["GB%"],
    hard_hit: avgStatcastData?.hard_hit_percent ?? 30,
    barrel_rate: avgEvData?.brl_pa ?? 5
  }
}

function getParkFactor(teamName: string) {
  const park = parkFactors.find(p => p.Team === teamName)
  return park?.["Park Factor"] ?? 1.0
}

async function calculateHRProbability(
  hitterStats: any,
  pitcherStats: any,
  parkFactor: number,
  weights: StatWeights
) {
  // Ensure all values have defaults to prevent NaN
  const {
    hr_per_pa = 0.03,
    barrel_rate = 5,
    hard_hit = 30,
    exit_velocity = 85,
    launch_angle = 12,
    fb_percent = 0.35,
    pull_percent = 0.40,
    hr_per_fb = 0.10,
    xHR = 0,
    iso = 0.150,
    recent_hr = 0
  } = hitterStats

  const {
    hr_per_9 = 1.3,
    barrel_rate: pitcherBarrelRate = 5,
    fb_percent: pitcherFbPercent = 0.35
  } = pitcherStats

  // Base HR rate from historical data
  const baseHRRate = hr_per_pa * weights.HR_rate

  // Statcast metrics
  const barrelComponent = (barrel_rate / 100) * weights.BarrelRate
  const hardHitComponent = (hard_hit / 100) * weights.HardHitRate
  const exitVeloComponent = (exit_velocity / 95) * weights.ExitVelo // Normalized to ~95 mph
  const launchComponent = (launch_angle / 25) * weights.LaunchAngle // Normalized to optimal ~25 degrees

  // Batted ball profile
  const fbComponent = fb_percent * weights.FlyBallRate
  const pullComponent = pull_percent * weights.PullRate
  const hrFbComponent = hr_per_fb * weights.HR_FB_Rate

  // Expected stats
  const xhrComponent = xHR * weights.xHR
  const isoComponent = iso * weights.ISO
  const recentHRComponent = recent_hr * weights.RecentHRs

  // Pitcher factors
  const pitcherHRComponent = (hr_per_9 / 2) * weights.PitcherHR_9 // Normalized to ~2 HR/9
  const pitcherBarrelComponent = (pitcherBarrelRate / 100) * weights.PitcherBarrelRate
  const pitcherFBComponent = pitcherFbPercent * weights.PitcherFBRate

  // Park factor (ensure it's a number)
  const normalizedParkFactor = typeof parkFactor === 'number' ? parkFactor : 1.0
  const parkComponent = (normalizedParkFactor - 1) * weights.ParkFactor

  // Combine all components
  let probability = baseHRRate +
    barrelComponent +
    hardHitComponent +
    exitVeloComponent +
    launchComponent +
    fbComponent +
    pullComponent +
    hrFbComponent +
    xhrComponent +
    isoComponent +
    recentHRComponent +
    pitcherHRComponent +
    pitcherBarrelComponent +
    pitcherFBComponent +
    parkComponent

  // Ensure probability is a valid number
  if (isNaN(probability) || !isFinite(probability)) {
    console.warn('Invalid probability calculated, using default', {
      hitterStats,
      pitcherStats,
      parkFactor,
      probability
    })
    probability = 0.03 // Default to 3% if calculation results in NaN
  }

  // Cap the probability at reasonable limits (2% min for MLB hitters, 100% max)
  return Math.min(Math.max(probability, 0.02), 1.00)
}

function CircularProgress({ value, type }: { value: number, type: 'rv' | 'probability' }) {
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

  // Probability logic
  const percentage = value * 100
  const color = percentage > 50 ? 'text-green-500' : 
                percentage > 25 ? 'text-yellow-500' : 
                'text-red-500'
  
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

function getPitchTypes(pitcherName: string): PitchStats[] {
  if (!pitcherName) return []
  
  // Group pitches by type and calculate averages
  const pitchGroups = (statcastPitchers as any[])
    .filter(p => p["last_name, first_name"] === pitcherName && p.pitch_usage > 0)
    .reduce((acc, pitch) => {
      // Create a unique key combining pitch type and name
      const key = `${pitch.pitch_type}_${pitch.pitch_name}`
      if (!acc[key]) {
        acc[key] = {
          pitch_type: pitch.pitch_type,
          pitch_name: pitch.pitch_name,
          run_value_per_100: 0,
          pitch_usage: 0,
          count: 0
        }
      }
      acc[key].run_value_per_100 += pitch.run_value_per_100
      acc[key].pitch_usage += pitch.pitch_usage
      acc[key].count++
      return acc
    }, {} as Record<string, { pitch_type: string; pitch_name: string; run_value_per_100: number; pitch_usage: number; count: number }>)

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

function getBatterPitchStats(batterName: string, pitchType: string): {
  run_value_per_100?: number;
} | undefined {
  // Also update the find condition to match the unique key format
  return (statcastBatters as any[]).find(b => 
    b.player_name === batterName && 
    `${b.pitch_type}_${b.pitch_name}` === pitchType
  )
}

function calculateRunValueComparison(batterName: string, pitcherName: string): number {
  if (!batterName || !pitcherName || pitcherName === 'TBD') return 0

  // Get pitcher's pitch types and usage
  const pitcherPitches = getPitchTypes(pitcherName)
  let batterTotal = 0
  let pitcherTotal = 0
  let matchedPitches = 0

  // For each pitch type the pitcher throws
  pitcherPitches.forEach(pitch => {
    const batterStats = getBatterPitchStats(batterName, pitch.pitch_type)
    if (batterStats?.run_value_per_100 !== undefined) {
      batterTotal += batterStats.run_value_per_100 * (pitch.pitch_usage / 100)
      pitcherTotal += pitch.run_value_per_100 * (pitch.pitch_usage / 100)
      matchedPitches++
    }
  })

  // If we found matching pitches, calculate the weighted difference
  if (matchedPitches > 0) {
    return batterTotal - pitcherTotal
  }

  return 0
}

function getHRsVsHand(batterName: string, pitcherThrows: string): number {
  const hitterData = pitcherThrows === 'L' ? 
    hittersVsL.filter(h => h.Name_1 === batterName) :
    hittersVsR.filter(h => h.Name_1 === batterName)

  if (hitterData.length > 0) {
    return hitterData.reduce((sum, h) => sum + h.HR, 0) / hitterData.length
  }

  return 0
}

export default function HRProjectionsPage() {
  const { data: games, loading, error } = useData<Game[]>({ 
    type: "games",
    sport: "mlb"
  })

  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [weights, setWeights] = useState<StatWeights>({
    HR_rate: 0.15,
    BarrelRate: 0.12,
    HardHitRate: 0.10,
    ExitVelo: 0.08,
    LaunchAngle: 0.05,
    FlyBallRate: 0.07,
    PullRate: 0.05,
    HR_FB_Rate: 0.05,
    xHR: 0.10,
    ISO: 0.08,
    RecentHRs: 0.05,
    PitcherHR_9: 0.10,
    PitcherBarrelRate: 0.05,
    PitcherFBRate: 0.05,
    ParkFactor: 0.05
  })
  const [allPlayers, setAllPlayers] = useState<(Player & { 
    probability: number;
    team?: string;
    opposingTeam?: string;
    opposingPitcher?: string;
    opposingPitcherThrows?: string;
    homeGame?: boolean;
    seasonHR?: number;
    hrPerAB?: number;
    rvComparison?: number;
    hrVsHand?: number;
  })[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'probability',
    direction: 'desc'
  })
  const [sortedData, setSortedData] = useState<typeof allPlayers>([])

  // Calculate probabilities when games data changes
  useEffect(() => {
    async function calculateProbabilities() {
      if (!games) return
      const players: (Player & { 
        probability: number;
        team?: string;
        opposingTeam?: string;
        opposingPitcher?: string;
        opposingPitcherThrows?: string;
        homeGame?: boolean;
        seasonHR?: number;
        hrPerAB?: number;
        rvComparison?: number;
        hrVsHand?: number;
      })[] = []

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
            const probability = await calculateHRProbability(hitterStats, pitcherStats, parkFactor, weights)
            
            // Calculate RV comparison
            const rvComparison = calculateRunValueComparison(
              player.name,
              opposingTeam.startingPitcher?.name || ''
            )

            // Get HR vs Hand
            const hrVsHand = getHRsVsHand(
              player.name,
              opposingTeam.startingPitcher?.throws || 'R'
            )

            players.push({
              ...player,
              team: team.name,
              opposingTeam: opposingTeam.name,
              opposingPitcher: opposingTeam.startingPitcher?.name || 'TBD',
              opposingPitcherThrows: opposingTeam.startingPitcher?.throws || 'R',
              homeGame: isHome,
              probability,
              seasonHR: player.stats.hr,
              hrPerAB: player.stats.hr / player.stats.pa,
              rvComparison,
              hrVsHand
            })
          }
        }

        await processTeam(game.homeTeam, true)
        await processTeam(game.awayTeam, false)
      }

      setAllPlayers(players)
    }

    calculateProbabilities()
  }, [games, weights])

  // Combine filtering and sorting in one effect
  useEffect(() => {
    if (!allPlayers.length) return

    // First filter
    const filtered = allPlayers.filter(player => 
      selectedTeams.length === 0 || selectedTeams.includes(player.team || '')
    )

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortConfig.key) {
        case 'probability':
          aValue = a.probability;
          bValue = b.probability;
          break;
        case 'rvComparison':
          aValue = a.rvComparison || 0;
          bValue = b.rvComparison || 0;
          break;
        case 'probRV':
          aValue = a.probability * (a.rvComparison || 0);
          bValue = b.probability * (b.rvComparison || 0);
          break;
        case 'seasonHR':
          aValue = a.seasonHR || 0;
          bValue = b.seasonHR || 0;
          break;
        case 'hrVsHand':
          aValue = typeof a.hrVsHand === 'number' ? a.hrVsHand : -1;
          bValue = typeof b.hrVsHand === 'number' ? b.hrVsHand : -1;
          break;
        case 'hrPerAB':
          aValue = a.hrPerAB || 0;
          bValue = b.hrPerAB || 0;
          break;
        default:
          aValue = a.stats.hr;
          bValue = b.stats.hr;
      }
      
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    })

    setSortedData(sorted)
  }, [allPlayers, selectedTeams, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  // Get unique team names from games
  const teams = games ? Array.from(new Set([
    ...games.map(game => game.homeTeam.name),
    ...games.map(game => game.awayTeam.name)
  ])).sort() : []

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[250px] justify-between">
                {selectedTeams.length > 0 ? (
                  <>
                    <span className="truncate">
                      {selectedTeams.length} team{selectedTeams.length === 1 ? '' : 's'} selected
                    </span>
                    <X
                      className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTeams([])
                      }}
                    />
                  </>
                ) : (
                  <span>All Teams</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Search teams..." className="h-9" />
                <CommandEmpty>No team found.</CommandEmpty>
                <CommandGroup>
                  {teams.map((team) => (
                    <CommandItem
                      key={team}
                      onSelect={() => {
                        setSelectedTeams((prev) =>
                          prev.includes(team)
                            ? prev.filter((t) => t !== team)
                            : [...prev, team]
                        )
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedTeams.includes(team)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      {team}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedTeams.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTeams.map(team => (
                <Badge
                  key={team}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {team}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedTeams(prev => prev.filter(t => t !== team))}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading data: {error}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>vs Pitcher</TableHead>
                <TableHead>Season HR</TableHead>
                <TableHead>HR/AB</TableHead>
                <TableHead onClick={() => handleSort('probability')} className="cursor-pointer">
                  HR Prob {sortConfig.key === 'probability' && (
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  )}
                </TableHead>
                <TableHead onClick={() => handleSort('rvComparison')} className="cursor-pointer">
                  RV Comp {sortConfig.key === 'rvComparison' && (
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  )}
                </TableHead>
                <TableHead onClick={() => handleSort('probRV')} className="cursor-pointer">
                  Prob+RV {sortConfig.key === 'probRV' && (
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player) => {
                const probRV = player.probability * (player.rvComparison || 0)
                return (
                  <TableRow key={`${player.name}-${player.team}`}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell>{player.opposingPitcher}</TableCell>
                    <TableCell>{player.seasonHR}</TableCell>
                    <TableCell>{player.hrPerAB?.toFixed(3)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <CircularProgress 
                          value={player.probability} 
                          type="probability"
                          minValue={Math.min(...sortedData.map(p => p.probability))}
                          maxValue={Math.max(...sortedData.map(p => p.probability))}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <CircularProgress 
                          value={player.rvComparison || 0} 
                          type="rv" 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <CircularProgress 
                          value={probRV} 
                          type="rv" 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
} 