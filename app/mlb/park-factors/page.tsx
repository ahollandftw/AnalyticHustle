"use client"

import { useState, useEffect } from "react"
import { useData } from "@/lib/hooks/use-data"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

interface RawParkFactor {
  "Rk.": number
  Team: string
  Venue: string
  Year: string | number
  "Park Factor": number
  wOBACon: number
  xwOBACon: number
  BACON: number
  xBACON: number
  HardHit: number
  R: number
  OBP: number
  H: number
  "1B": number
  "2B": number
  "3B": number
  HR: number
  BB: number
  SO: number
  PA: number
}

interface ParkFactor {
  rank: number
  team: string
  venue: string
  year: string
  parkFactor: number
  wOBACon: number
  xwOBACon: number
  BACON: number
  xBACON: number
  hardHit: number
  runs: number
  obp: number
  hits: number
  singles: number
  doubles: number
  triples: number
  hr: number
  bb: number
  so: number
  pa: number
}

export default function ParkFactorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const { data: rawData, loading, error } = useData<RawParkFactor[]>({ 
    type: "parkfactors",
    sport: "mlb"
  })

  // Debug logs
  useEffect(() => {
    console.log("Raw data:", rawData)
    console.log("Loading:", loading)
    console.log("Error:", error)
  }, [rawData, loading, error])

  // Get unique years from the data
  const years = Array.from(new Set((rawData || [])
    .map(park => park?.Year)
    .filter((year): year is string | number => year != null && year !== '')
    .map(year => String(year))))
    .sort()
    .reverse()

  // Debug log for years
  useEffect(() => {
    console.log("Available years:", years)
  }, [years])

  // Transform the raw data to match our interface
  const parkFactors: ParkFactor[] = (rawData || [])
    .filter(park => park && typeof park === 'object' && 'Team' in park && 'Venue' in park)
    .map(park => ({
      rank: Number(park["Rk."]) || 0,
      team: (park.Team || '').trim(),
      venue: park.Venue || '',
      year: String(park.Year || ''),
      parkFactor: Number(park["Park Factor"]) || 0,
      wOBACon: Number(park.wOBACon) || 0,
      xwOBACon: Number(park.xwOBACon) || 0,
      BACON: Number(park.BACON) || 0,
      xBACON: Number(park.xBACON) || 0,
      hardHit: Number(park.HardHit) || 0,
      runs: Number(park.R) || 0,
      obp: Number(park.OBP) || 0,
      hits: Number(park.H) || 0,
      singles: Number(park["1B"]) || 0,
      doubles: Number(park["2B"]) || 0,
      triples: Number(park["3B"]) || 0,
      hr: Number(park.HR) || 0,
      bb: Number(park.BB) || 0,
      so: Number(park.SO) || 0,
      pa: Number(park.PA) || 0
    }))

  // Debug log for transformed data
  useEffect(() => {
    console.log("Transformed park factors:", parkFactors)
  }, [parkFactors])

  // Filter based on both year and search term
  const filteredParks = parkFactors
    .filter(park => selectedYear === "all" || park.year === selectedYear)
    .filter(park => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      const teamName = park.team.toLowerCase()
      const venueName = park.venue.toLowerCase()
      return teamName.includes(searchLower) || venueName.includes(searchLower)
    })

  // Debug log for filtered data
  useEffect(() => {
    console.log("Selected year:", selectedYear)
    console.log("Search term:", searchTerm)
    console.log("Filtered parks:", filteredParks)
  }, [selectedYear, searchTerm, filteredParks])

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Error loading park factors: {error}</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">MLB Park Factors</h1>
        <div className="flex items-center gap-4">
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="search"
            placeholder="Search parks..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredParks.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {searchTerm || selectedYear ? "No parks found matching your filters" : "No park data available"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rk.</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Park Factor</TableHead>
                <TableHead className="text-right">wOBACon</TableHead>
                <TableHead className="text-right">xwOBACon</TableHead>
                <TableHead className="text-right">BACON</TableHead>
                <TableHead className="text-right">xBACON</TableHead>
                <TableHead className="text-right">HardHit</TableHead>
                <TableHead className="text-right">R</TableHead>
                <TableHead className="text-right">OBP</TableHead>
                <TableHead className="text-right">H</TableHead>
                <TableHead className="text-right">1B</TableHead>
                <TableHead className="text-right">2B</TableHead>
                <TableHead className="text-right">3B</TableHead>
                <TableHead className="text-right">HR</TableHead>
                <TableHead className="text-right">BB</TableHead>
                <TableHead className="text-right">SO</TableHead>
                <TableHead className="text-right">PA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParks.map((park, index) => (
                <TableRow key={`${park.team}-${index}`}>
                  <TableCell>{park.rank}</TableCell>
                  <TableCell className="font-medium">{park.team}</TableCell>
                  <TableCell>{park.venue}</TableCell>
                  <TableCell>{park.year}</TableCell>
                  <TableCell className="text-right">{park.parkFactor}</TableCell>
                  <TableCell className="text-right">{park.wOBACon}</TableCell>
                  <TableCell className="text-right">{park.xwOBACon}</TableCell>
                  <TableCell className="text-right">{park.BACON}</TableCell>
                  <TableCell className="text-right">{park.xBACON}</TableCell>
                  <TableCell className="text-right">{park.hardHit}</TableCell>
                  <TableCell className="text-right">{park.runs}</TableCell>
                  <TableCell className="text-right">{park.obp}</TableCell>
                  <TableCell className="text-right">{park.hits}</TableCell>
                  <TableCell className="text-right">{park.singles}</TableCell>
                  <TableCell className="text-right">{park.doubles}</TableCell>
                  <TableCell className="text-right">{park.triples}</TableCell>
                  <TableCell className="text-right">{park.hr}</TableCell>
                  <TableCell className="text-right">{park.bb}</TableCell>
                  <TableCell className="text-right">{park.so}</TableCell>
                  <TableCell className="text-right">{park.pa}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
