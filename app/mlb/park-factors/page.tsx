"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data for park factors
const parkFactorsData = [
  {
    id: 1,
    name: "Yankee Stadium",
    team: "New York Yankees",
    parkFactor: 105,
    wOBACon: 0.385,
    BACON: 0.32,
    hardHitPct: 38.5,
    R: 850,
    H: 1350,
    HR: 220,
    BB: 550,
    SO: 1450,
  },
  {
    id: 2,
    name: "Fenway Park",
    team: "Boston Red Sox",
    parkFactor: 107,
    wOBACon: 0.39,
    BACON: 0.325,
    hardHitPct: 39.2,
    R: 870,
    H: 1380,
    HR: 190,
    BB: 530,
    SO: 1400,
  },
  {
    id: 3,
    name: "Dodger Stadium",
    team: "Los Angeles Dodgers",
    parkFactor: 98,
    wOBACon: 0.365,
    BACON: 0.31,
    hardHitPct: 36.8,
    R: 780,
    H: 1320,
    HR: 175,
    BB: 520,
    SO: 1500,
  },
  {
    id: 4,
    name: "Wrigley Field",
    team: "Chicago Cubs",
    parkFactor: 104,
    wOBACon: 0.38,
    BACON: 0.318,
    hardHitPct: 38.0,
    R: 830,
    H: 1340,
    HR: 210,
    BB: 540,
    SO: 1470,
  },
  {
    id: 5,
    name: "Oracle Park",
    team: "San Francisco Giants",
    parkFactor: 95,
    wOBACon: 0.355,
    BACON: 0.305,
    hardHitPct: 35.5,
    R: 750,
    H: 1300,
    HR: 150,
    BB: 510,
    SO: 1520,
  },
  {
    id: 6,
    name: "Coors Field",
    team: "Colorado Rockies",
    parkFactor: 115,
    wOBACon: 0.41,
    BACON: 0.335,
    hardHitPct: 41.0,
    R: 920,
    H: 1420,
    HR: 240,
    BB: 560,
    SO: 1380,
  },
]

type SortConfig = {
  key: keyof (typeof parkFactorsData)[0]
  direction: "asc" | "desc"
}

export default function ParkFactorsPage() {
  const [year, setYear] = useState("2023")
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "parkFactor",
    direction: "desc",
  })

  const handleSort = (key: keyof (typeof parkFactorsData)[0]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }))
  }

  const sortedData = [...parkFactorsData].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
    } else {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
    }
  })

  const getValueColor = (key: string, value: number) => {
    // Different metrics have different scales for what's considered high/low
    if (key === "parkFactor") {
      if (value > 105) return "text-red-500"
      if (value < 95) return "text-blue-500"
    } else if (key === "wOBACon" || key === "BACON") {
      if (value > 0.38) return "text-red-500"
      if (value < 0.31) return "text-blue-500"
    } else if (key === "hardHitPct") {
      if (value > 38) return "text-red-500"
      if (value < 36) return "text-blue-500"
    } else if (key === "HR" || key === "R") {
      if (value > 200) return "text-red-500"
      if (value < 170) return "text-blue-500"
    } else if (key === "SO") {
      if (value > 1500) return "text-red-500"
      if (value < 1400) return "text-blue-500"
    }
    return ""
  }

  const getSortIcon = (key: keyof (typeof parkFactorsData)[0]) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MLB Park Factors</CardTitle>
              <CardDescription>Statistics and metrics for MLB ballparks</CardDescription>
            </div>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023 Season</SelectItem>
                <SelectItem value="2022">2022 Season</SelectItem>
                <SelectItem value="2021">2021 Season</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Park</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("parkFactor")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      Park Factor {getSortIcon("parkFactor")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("wOBACon")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      wOBACon {getSortIcon("wOBACon")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("BACON")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      BACON {getSortIcon("BACON")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("hardHitPct")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      Hard Hit % {getSortIcon("hardHitPct")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("R")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      R {getSortIcon("R")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("HR")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      HR {getSortIcon("HR")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("BB")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      BB {getSortIcon("BB")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("SO")}
                      className="flex items-center gap-1 p-0 font-semibold hover:bg-transparent"
                    >
                      SO {getSortIcon("SO")}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((park) => (
                  <TableRow key={park.id}>
                    <TableCell className="font-medium">{park.name}</TableCell>
                    <TableCell>{park.team}</TableCell>
                    <TableCell className={getValueColor("parkFactor", park.parkFactor)}>{park.parkFactor}</TableCell>
                    <TableCell className={getValueColor("wOBACon", park.wOBACon)}>{park.wOBACon.toFixed(3)}</TableCell>
                    <TableCell className={getValueColor("BACON", park.BACON)}>{park.BACON.toFixed(3)}</TableCell>
                    <TableCell className={getValueColor("hardHitPct", park.hardHitPct)}>
                      {park.hardHitPct.toFixed(1)}%
                    </TableCell>
                    <TableCell className={getValueColor("R", park.R)}>{park.R}</TableCell>
                    <TableCell className={getValueColor("HR", park.HR)}>{park.HR}</TableCell>
                    <TableCell>{park.BB}</TableCell>
                    <TableCell className={getValueColor("SO", park.SO)}>{park.SO}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
