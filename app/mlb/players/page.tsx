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
import statcastBatters from "@/data/StatcastBatters.json"

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

type StatcastPlayer = StatcastPitcher | StatcastBatter

type SortConfig = {
  key: keyof StatcastPlayer | null
  direction: 'asc' | 'desc'
}

const TABS = [
  { id: 'statcastBatters', name: 'Statcast Batters', dataset: 'batters' },
  { id: 'statcastPitchers', name: 'Statcast Pitchers', dataset: 'pitchers' },
]

const YEARS = ['2024', '2023']

// Define column configurations for each dataset
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

// Add type assertion for imported data
const pitchersData = statcastPitchers as StatcastPitcher[]
const battersData = statcastBatters as StatcastBatter[]

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState(TABS[0])
  const [selectedYear, setSelectedYear] = useState(YEARS[0])
  const [selectedTeam, setSelectedTeam] = useState<string>("All Teams")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  // Get the appropriate dataset based on selected tab
  const baseData = selectedTab.dataset === 'batters' ? battersData : pitchersData

  // Get unique teams from the current dataset
  const teams = ["All Teams", ...Array.from(new Set(baseData.map(player => player.team_name_alt))).sort()]

  // Filter players based on search term
  const data = baseData as StatcastPlayer[]
  
  // Debug logging for the first few players' specific fields
  console.log('Detailed field inspection for first 3 players:')
  data.slice(0, 3).forEach(player => {
    console.log(`Player: ${player.player_name || player["last_name, first_name"]}`)
    console.log('All keys:', Object.keys(player))
    console.log('Full player data:', JSON.stringify(player, null, 2))
  })
  
  // Filter players based on search term, year and team
  let filteredPlayers = data.filter(player => {
    // Only filter by name if search term is provided
    const nameMatch = !searchTerm || (player["last_name, first_name"] && 
      player["last_name, first_name"].toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filter by year using _year field
    const yearMatch = player._year?.toString() === selectedYear

    // Filter by team
    const teamMatch = selectedTeam === "All Teams" || player.team_name_alt === selectedTeam
    
    return nameMatch && yearMatch && teamMatch
  })

  // Remove duplicate players (keep only one entry per player)
  filteredPlayers = filteredPlayers.reduce((unique, player) => {
    const exists = unique.find(p => p.player_id === player.player_id)
    if (!exists) {
      unique.push(player)
    }
    return unique
  }, [] as StatcastPlayer[])

  // Sort players if sort config is set
  if (sortConfig.key) {
    filteredPlayers = [...filteredPlayers].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]
      
      // Handle undefined values in sorting
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  // Debug logging to check year filtering
  console.log('Selected year:', selectedYear)
  console.log('Sample player years:', data.slice(0, 5).map(p => p._year))
  console.log('Players after year filtering:', filteredPlayers.length)

  const handleSort = (key: keyof StatcastPlayer) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof StatcastPlayer }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4 inline" />
      : <ArrowDown className="ml-1 h-4 w-4 inline" />
  }

  // Get columns based on selected tab
  const columns = selectedTab.dataset === 'batters' ? BATTER_COLUMNS : PITCHER_COLUMNS

  // Get available years based on the selected dataset
  const getYearsForDataset = () => {
    return ['2024', '2023']
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

  // If no data is loaded yet, show loading state
  if (!data || data.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">MLB Players</h1>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">MLB Players</h1>
            <span className="text-sm text-muted-foreground">
              {filteredPlayers.length} players found
            </span>
            </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {getYearsForDataset().map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            </div>

        <div className="flex gap-1 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors hover:bg-muted/50 rounded-t-lg -mb-px",
                selectedTab.id === tab.id
                  ? "border-2 border-b-0 border-border bg-background"
                  : "border border-transparent"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-center cursor-pointer hover:bg-muted/50"
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key as keyof StatcastPlayer)}
                >
                  {column.label} <SortIcon columnKey={column.key as keyof StatcastPlayer} />
                        </TableHead>
              ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
            {filteredPlayers.map((player) => (
              <TableRow key={player.player_id}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-center">
                    {column.format ? column.format(player[column.key]) : player[column.key]}
                  </TableCell>
                ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
      </Card>
    </div>
  )
}
