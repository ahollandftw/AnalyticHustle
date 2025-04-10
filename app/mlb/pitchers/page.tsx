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

// Add console logging to verify data
console.log("Loaded data:", (statcastPitchers as StatcastPitcher[])?.slice(0, 2))

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

type SortConfig = {
  key: keyof StatcastPitcher | null
  direction: 'asc' | 'desc'
}

const YEARS = ['2024', '2023']

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

export default function PitchersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string>("All Teams")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  // Debug logging
  console.log("Total players before filtering:", (statcastPitchers as StatcastPitcher[]).length)
  console.log("Sample player data:", (statcastPitchers as StatcastPitcher[])[0])

  // Get unique teams from the dataset
  const teams = ["All Teams", ...Array.from(new Set((statcastPitchers as StatcastPitcher[]).map(player => player.team_name_alt))).sort()]

  // Filter players based on search term and team
  let filteredPlayers = (statcastPitchers as StatcastPitcher[]).filter(player => {
    // Only filter by name if search term is provided
    const nameMatch = !searchTerm || (player["last_name, first_name"] && 
      player["last_name, first_name"].toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filter by team
    const teamMatch = selectedTeam === "All Teams" || player.team_name_alt === selectedTeam
    
    return nameMatch && teamMatch
  })

  // Sort players if sort config is set
  if (sortConfig && sortConfig.key) {
    filteredPlayers.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof StatcastPitcher]
      const bValue = b[sortConfig.key as keyof StatcastPitcher]

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

  const handleSort = (key: keyof StatcastPitcher) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof StatcastPitcher }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4 inline" />
      : <ArrowDown className="ml-1 h-4 w-4 inline" />
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">MLB Pitchers</h1>
            <span className="text-sm text-muted-foreground">
              {filteredPlayers.length} pitchers found
            </span>
          </div>
          <div className="flex items-center gap-4">
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
              placeholder="Search pitchers..."
              className="w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {PITCHER_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-center cursor-pointer hover:bg-muted/50"
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key as keyof StatcastPitcher)}
                >
                  {column.label} <SortIcon columnKey={column.key as keyof StatcastPitcher} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player) => (
              <TableRow key={player.player_id}>
                {PITCHER_COLUMNS.map((column) => (
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