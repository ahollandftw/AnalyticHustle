"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import statcastPitchers from "../../../Data/StatcastPitchers.json"
import statcastBatters from "C:/AnalyticHustle1.0/StatcastBatters.json"
import hittersVsR from "../../../Data/HittersvR.json"
import hittersVsL from "../../../Data/HittersvL.json"
import pitchersVsR from "../../../Data/PitchersvR.json"
import pitchersVsL from "../../../Data/PitchersvL.json"
import evBatters from "C:/AnalyticHustle1.0/EVBatters.json"
import evPitchers from "C:/AnalyticHustle1.0/EVPitchers.json"

interface StatcastPitcher {
  "last_name, first_name": string
  player_id: number
  team_name_alt: string
  pitch_type: string
  pitch_name: string
  run_value_per_100: number
  run_value: number
  pitches: number
  pitch_usage: number
  pa: number
  ba: number
  slg: number
  woba: number
  whiff_percent: number
  k_percent: number
  put_away: number
  est_ba: number
  est_slg: number
  est_woba: number
  hard_hit_percent: number
  [key: string]: any  // Allow for dynamic fields
}

interface StatcastBatter {
  player_name: string
  player_id: number
  team_name_alt: string
  ba: number
  slg: number
  woba: number
  whiff_percent: number
  k_percent: number
  hard_hit_percent: number
  [key: string]: any  // Allow for dynamic fields
}

interface HitterVsR {
  Name_1: string
  Team_1: string
  HR: number
  PA: number
  "FB%": number
  "Pull%": number
  "HR/FB": number
  ISO: number
  _year: number
  [key: string]: any  // Allow dynamic access for sorting
}

interface HitterVsL {
  Name_1: string
  Team_1: string
  HR: number
  PA: number
  "FB%": number
  "Pull%": number
  "HR/FB": number
  ISO: number
  _year: number
  [key: string]: any  // Allow dynamic access for sorting
}

interface PitcherVsR {
  Name_1: string
  Team_1: string
  HR: number
  "HR/9": number
  "FB%": number
  "GB%": number
  PlayerId: number
  _year: number
  [key: string]: any  // Allow dynamic access for sorting
}

interface PitcherVsL {
  Name_1: string
  Team_1: string
  HR: number
  "HR/9": number
  "FB%": number
  "GB%": number
  PlayerId: number
  _year: number
  [key: string]: any  // Allow dynamic access for sorting
}

interface EVBatter {
  "last_name, first_name": string
  player_id: number
  attempts: number
  avg_hit_angle: number
  anglesweetspotpercent: number
  max_hit_speed: number
  avg_hit_speed: number
  ev95percent: number
  brl_percent: number
  brl_pa: number
  avg_distance: number
  avg_hr_distance: number
  [key: string]: any
}

interface EVPitcher {
  "last_name, first_name": string
  player_id: number
  attempts: number
  avg_hit_angle: number
  anglesweetspotpercent: number
  max_hit_speed: number
  avg_hit_speed: number
  ev95percent: number
  brl_percent: number
  brl_pa: number
  avg_distance: number
  avg_hr_distance: number
  [key: string]: any
}

type StatcastPlayer = StatcastPitcher | StatcastBatter

type SortDirection = 'asc' | 'desc'

type SortConfig = {
  key: string | null
  direction: SortDirection
}

const HITTERS_VS_R_COLUMNS = [
  { key: "Name_1", label: "Name", width: "200px" },
  { key: "Team_1", label: "Team", width: "80px" },
  { key: "HR", label: "HR", width: "80px" },
  { key: "PA", label: "PA", width: "80px" },
  { key: "FB%", label: "FB%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "Pull%", label: "Pull%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "HR/FB", label: "HR/FB", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "ISO", label: "ISO", width: "80px", format: (val: number) => val.toFixed(3) }
]

const HITTERS_VS_L_COLUMNS = [
  { key: "Name_1", label: "Name", width: "200px" },
  { key: "Team_1", label: "Team", width: "80px" },
  { key: "HR", label: "HR", width: "80px" },
  { key: "PA", label: "PA", width: "80px" },
  { key: "FB%", label: "FB%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "Pull%", label: "Pull%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "HR/FB", label: "HR/FB", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "ISO", label: "ISO", width: "80px", format: (val: number) => val.toFixed(3) }
]

const PITCHERS_VS_R_COLUMNS = [
  { key: "Name_1", label: "Name", width: "200px" },
  { key: "Team_1", label: "Team", width: "80px" },
  { key: "HR", label: "HR", width: "80px" },
  { key: "HR/9", label: "HR/9", width: "80px", format: (val: number) => val.toFixed(2) },
  { key: "FB%", label: "FB%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "GB%", label: "GB%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' }
]

const PITCHERS_VS_L_COLUMNS = [
  { key: "Name_1", label: "Name", width: "200px" },
  { key: "Team_1", label: "Team", width: "80px" },
  { key: "HR", label: "HR", width: "80px" },
  { key: "HR/9", label: "HR/9", width: "80px", format: (val: number) => val.toFixed(2) },
  { key: "FB%", label: "FB%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' },
  { key: "GB%", label: "GB%", width: "80px", format: (val: number) => (val * 100).toFixed(1) + '%' }
]

const BATTER_COLUMNS = [
  { key: "last_name, first_name", label: "Name", width: "200px" },
  { key: "team_name_alt", label: "Team", width: "80px" },
  { key: "pitch_type", label: "Pitch Type", width: "100px" },
  { key: "pitch_name", label: "Pitch Name", width: "150px" },
  { key: "run_value_per_100", label: "RV/100", width: "90px", format: (val: number) => val?.toFixed(1) },
  { key: "run_value", label: "Run Value", width: "90px", format: (val: number) => val?.toFixed(0) },
  { key: "pitches", label: "Pitches", width: "80px" },
  { key: "pitch_usage", label: "Usage%", width: "80px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "pa", label: "PA", width: "80px" },
  { key: "ba", label: "BA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "slg", label: "SLG", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "woba", label: "wOBA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "whiff_percent", label: "Whiff%", width: "80px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "k_percent", label: "K%", width: "80px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "put_away", label: "Put Away%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "est_ba", label: "xBA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "est_slg", label: "xSLG", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "est_woba", label: "xwOBA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "hard_hit_percent", label: "Hard Hit%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' }
]

const PITCHER_COLUMNS = [
  { key: "last_name, first_name", label: "Name", width: "200px" },
  { key: "team_name_alt", label: "Team", width: "80px" },
  { key: "pitch_type", label: "Pitch Type", width: "100px" },
  { key: "pitch_name", label: "Pitch Name", width: "150px" },
  { key: "run_value_per_100", label: "RV/100", width: "90px", format: (val: number) => val?.toFixed(1) },
  { key: "run_value", label: "Run Value", width: "90px", format: (val: number) => val?.toFixed(0) },
  { key: "pitches", label: "Pitches", width: "80px" },
  { key: "pitch_usage", label: "Usage%", width: "80px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "pa", label: "PA", width: "80px" },
  { key: "ba", label: "BA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "slg", label: "SLG", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "woba", label: "wOBA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "whiff_percent", label: "Whiff%", width: "80px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "k_percent", label: "K%", width: "80px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "put_away", label: "Put Away%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "est_ba", label: "xBA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "est_slg", label: "xSLG", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "est_woba", label: "xwOBA", width: "80px", format: (val: number) => val?.toFixed(3) },
  { key: "hard_hit_percent", label: "Hard Hit%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' }
]

const EV_BATTERS_COLUMNS = [
  { key: "last_name, first_name", label: "Name", width: "200px" },
  { key: "attempts", label: "PA", width: "80px" },
  { key: "avg_hit_angle", label: "Launch Angle", width: "100px", format: (val: number) => val?.toFixed(1) },
  { key: "anglesweetspotpercent", label: "Sweet Spot%", width: "100px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "avg_hit_speed", label: "Exit Velo", width: "90px", format: (val: number) => val?.toFixed(1) },
  { key: "max_hit_speed", label: "Max EV", width: "90px", format: (val: number) => val?.toFixed(1) },
  { key: "ev95percent", label: "95+ EV%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "brl_percent", label: "Barrel%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "brl_pa", label: "Brl/PA", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "avg_distance", label: "Avg Dist", width: "90px", format: (val: number) => val?.toFixed(0) },
  { key: "avg_hr_distance", label: "Avg HR Dist", width: "100px", format: (val: number) => val?.toFixed(0) }
]

const EV_PITCHERS_COLUMNS = [
  { key: "last_name, first_name", label: "Name", width: "200px" },
  { key: "attempts", label: "BIP", width: "80px" },
  { key: "avg_hit_angle", label: "Launch Angle", width: "100px", format: (val: number) => val?.toFixed(1) },
  { key: "anglesweetspotpercent", label: "Sweet Spot%", width: "100px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "avg_hit_speed", label: "Exit Velo", width: "90px", format: (val: number) => val?.toFixed(1) },
  { key: "max_hit_speed", label: "Max EV", width: "90px", format: (val: number) => val?.toFixed(1) },
  { key: "ev95percent", label: "95+ EV%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "brl_percent", label: "Barrel%", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "brl_pa", label: "Brl/PA", width: "90px", format: (val: number) => val?.toFixed(1) + '%' },
  { key: "avg_distance", label: "Avg Dist", width: "90px", format: (val: number) => val?.toFixed(0) },
  { key: "avg_hr_distance", label: "Avg HR Dist", width: "100px", format: (val: number) => val?.toFixed(0) }
]

const TABS = [
  { label: "Statcast Batters", value: "batters", dataset: "batters", columns: BATTER_COLUMNS },
  { label: "Statcast Pitchers", value: "pitchers", dataset: "pitchers", columns: PITCHER_COLUMNS },
  { label: "Hitters vs R", value: "hittersVsR", dataset: "hittersVsR", columns: HITTERS_VS_R_COLUMNS },
  { label: "Hitters vs L", value: "hittersVsL", dataset: "hittersVsL", columns: HITTERS_VS_L_COLUMNS },
  { label: "Pitchers vs R", value: "pitchersVsR", dataset: "pitchersVsR", columns: PITCHERS_VS_R_COLUMNS },
  { label: "Pitchers vs L", value: "pitchersVsL", dataset: "pitchersVsL", columns: PITCHERS_VS_L_COLUMNS },
  { label: "EV Batters", value: "evBatters", dataset: "evBatters", columns: EV_BATTERS_COLUMNS },
  { label: "EV Pitchers", value: "evPitchers", dataset: "evPitchers", columns: EV_PITCHERS_COLUMNS }
]

const YEARS = ['2024', '2023', '2022']

// Add type assertion for imported data
const pitchersData = statcastPitchers as StatcastPitcher[]
const battersData = statcastBatters as StatcastBatter[]
const evBattersData = evBatters as EVBatter[]
const evPitchersData = evPitchers as EVPitcher[]

type DataType = StatcastPlayer | HitterVsR | HitterVsL | PitcherVsR | PitcherVsL | EVBatter | EVPitcher

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string>("All Teams")
  const [selectedTab, setSelectedTab] = useState(TABS[0])
  const [selectedYear, setSelectedYear] = useState(YEARS[0])
  const [selectedPitch, setSelectedPitch] = useState<string>("All Pitches")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')

  // Get the appropriate dataset based on selected tab
  const baseData = selectedTab.dataset === 'batters' 
    ? battersData 
    : selectedTab.dataset === 'pitchers'
    ? pitchersData
    : selectedTab.dataset === 'hittersVsR'
    ? hittersVsR as HitterVsR[]
    : selectedTab.dataset === 'hittersVsL'
    ? hittersVsL as HitterVsL[]
    : selectedTab.dataset === 'pitchersVsL'
    ? pitchersVsL as PitcherVsL[]
    : selectedTab.dataset === 'evBatters'
    ? evBattersData
    : selectedTab.dataset === 'evPitchers'
    ? evPitchersData
    : pitchersVsR as PitcherVsR[]

  // Get unique teams from the current dataset
  const teams = ["All Teams", ...Array.from(new Set(baseData.map(player => {
    if (selectedTab.dataset === 'hittersVsR' || selectedTab.dataset === 'hittersVsL' || selectedTab.dataset === 'pitchersVsR' || selectedTab.dataset === 'pitchersVsL') {
      return (player as HitterVsR | HitterVsL | PitcherVsR | PitcherVsL).Team_1
    }
    return (player as StatcastPlayer).team_name_alt
  }))).sort()]

  // Get unique pitch names for Statcast data
  const pitchNames = ["All Pitches", ...Array.from(new Set(
    (selectedTab.dataset === 'batters' ? battersData : pitchersData)
      .map(player => player.pitch_name)
  )).sort()]

  // Filter players based on search term, year, team, and pitch
  let filteredPlayers = baseData.filter(player => {
    if (selectedTab.dataset === 'hittersVsR' || selectedTab.dataset === 'hittersVsL' || selectedTab.dataset === 'pitchersVsR' || selectedTab.dataset === 'pitchersVsL') {
      const vsPlayer = player as HitterVsR | HitterVsL | PitcherVsR | PitcherVsL
      const nameMatch = !searchTerm || vsPlayer.Name_1?.toLowerCase().includes(searchTerm.toLowerCase())
      const yearMatch = vsPlayer._year?.toString() === selectedYear
      const teamMatch = selectedTeam === "All Teams" || vsPlayer.Team_1 === selectedTeam
      return nameMatch && yearMatch && teamMatch
    } else if (selectedTab.dataset === 'evBatters' || selectedTab.dataset === 'evPitchers') {
      const evPlayer = player as EVBatter | EVPitcher
      const nameMatch = !searchTerm || evPlayer["last_name, first_name"]?.toLowerCase().includes(searchTerm.toLowerCase())
      const teamMatch = true
      return nameMatch && teamMatch
    } else {
      const statcastPlayer = player as StatcastPlayer
      const nameMatch = !searchTerm || statcastPlayer["last_name, first_name"]?.toLowerCase().includes(searchTerm.toLowerCase())
      const yearMatch = statcastPlayer._year?.toString() === selectedYear
      const teamMatch = selectedTeam === "All Teams" || statcastPlayer.team_name_alt === selectedTeam
      const pitchMatch = selectedPitch === "All Pitches" || statcastPlayer.pitch_name === selectedPitch
      return nameMatch && yearMatch && teamMatch && pitchMatch
    }
  })

  // Sort players if sort config is set
  if (sortConfig && sortConfig.key) {
    filteredPlayers.sort((a, b) => {
      let aValue: any, bValue: any

      if (selectedTab.dataset === 'hittersVsR' || selectedTab.dataset === 'hittersVsL' || selectedTab.dataset === 'pitchersVsR' || selectedTab.dataset === 'pitchersVsL') {
        aValue = (a as HitterVsR | HitterVsL | PitcherVsR | PitcherVsL)[sortConfig.key as keyof HitterVsR | keyof HitterVsL | keyof PitcherVsR | keyof PitcherVsL]
        bValue = (b as HitterVsR | HitterVsL | PitcherVsR | PitcherVsL)[sortConfig.key as keyof HitterVsR | keyof HitterVsL | keyof PitcherVsR | keyof PitcherVsL]
      } else {
        aValue = (a as StatcastPlayer)[sortConfig.key as keyof StatcastPlayer]
        bValue = (b as StatcastPlayer)[sortConfig.key as keyof StatcastPlayer]
      }

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle string values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  // Debug logging to check year filtering
  console.log('Selected year:', selectedYear)
  console.log('Sample player years:', baseData.slice(0, 5).map(p => p._year))
  console.log('Players after year filtering:', filteredPlayers.length)
  console.log('EV Batters data sample:', evBattersData.slice(0, 3))
  console.log('EV Batters total count:', evBattersData.length)

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4 inline" />
      : <ArrowDown className="ml-1 h-4 w-4 inline" />
  }

  // Get columns based on selected tab
  const columns = selectedTab.columns

  // Get available years based on the selected dataset
  const getYearsForDataset = () => {
    return ['2024', '2023', '2022']
  }

  // Update years when tab changes
  useEffect(() => {
    const availableYears = getYearsForDataset()
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [selectedTab.dataset])

  // Reset team selection when changing tabs
  useEffect(() => {
    setSelectedTeam("All Teams")
  }, [selectedTab])

  // Reset pitch selection when changing tabs
  useEffect(() => {
    setSelectedPitch("All Pitches")
  }, [selectedTab])

  // If no data is loaded yet, show loading state
  if (!baseData || baseData.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">MLB Players</h1>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card>
        <div className="border-b border-border">
          <div className="flex flex-col gap-6 p-4">
            <div className="flex items-center justify-center gap-4">
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTab.dataset !== 'hittersVsR' && (
                <Select
                  value={selectedPitch}
                  onValueChange={setSelectedPitch}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Pitch" />
                  </SelectTrigger>
                  <SelectContent>
                    {pitchNames.map(pitch => (
                      <SelectItem key={pitch} value={pitch}>
                        {pitch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select
                value={selectedTeam}
                onValueChange={setSelectedTeam}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                <Input
                  placeholder="Search players..."
                className="w-[200px] md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            <div className="flex gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedTab(tab)}
                  className={cn(
                    "px-6 py-3 text-sm font-medium transition-colors hover:bg-muted/50 rounded-t-lg -mb-px",
                    selectedTab.value === tab.value
                      ? "border-2 border-b-0 border-border bg-background"
                      : "border border-transparent"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="text-center cursor-pointer hover:bg-muted/50"
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label} <SortIcon columnKey={column.key} />
                        </TableHead>
                ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
              {filteredPlayers.map((player, idx) => (
                <TableRow key={idx}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-center">
                      {column.format 
                        ? column.format(player[column.key])
                        : player[column.key]}
                    </TableCell>
                  ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
      </Card>
    </div>
  )
}
