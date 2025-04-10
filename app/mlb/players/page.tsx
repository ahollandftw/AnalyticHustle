"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Player {
  id: number
  name: string
  team: string
  position: string
  avg: number
  obp: number
  slg: number
  ops: number
  hr: number
  rbi: number
  sb: number
  wOBA: number
  xwOBA: number
  barrelPct: number
  hardHitPct: number
  exitVelo: number
}

interface Pitcher {
  id: number
  name: string
  team: string
  position: string
  era: number
  whip: number
  ip: number
  so: number
  bb: number
  w: number
  l: number
  sv: number
  kPct: number
  bbPct: number
  xERA: number
  fip: number
  velo: number
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [pitchers, setPitchers] = useState<Pitcher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState("hitters")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch hitters data
        const hittersResponse = await fetch('/api/data?type=players&sport=mlb')
        const hittersData = await hittersResponse.json()
        setPlayers(hittersData.data || [])

        // Fetch pitchers data
        const pitchersResponse = await fetch('/api/data?type=pitchers&sport=mlb')
        const pitchersData = await pitchersResponse.json()
        setPitchers(pitchersData.data || [])

        setLoading(false)
      } catch (err) {
        setError('Failed to fetch data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPitchers = pitchers.filter((pitcher) =>
    pitcher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pitcher.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (!sortField) return 0
    const aValue = a[sortField as keyof Player]
    const bValue = b[sortField as keyof Player]
    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
  })

  const sortedPitchers = [...filteredPitchers].sort((a, b) => {
    if (!sortField) return 0
    const aValue = a[sortField as keyof Pitcher]
    const bValue = b[sortField as keyof Pitcher]
    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>MLB Players</CardTitle>
          <CardDescription>View and analyze MLB player statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="hitters">Hitters</TabsTrigger>
                <TabsTrigger value="pitchers">Pitchers</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex-1">
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          {activeTab === "hitters" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("name")}>
                      Name {sortField === "name" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Pos</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("avg")}>
                      AVG {sortField === "avg" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("obp")}>
                      OBP {sortField === "obp" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("slg")}>
                      SLG {sortField === "slg" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("ops")}>
                      OPS {sortField === "ops" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("hr")}>
                      HR {sortField === "hr" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("rbi")}>
                      RBI {sortField === "rbi" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("sb")}>
                      SB {sortField === "sb" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell>{player.avg.toFixed(3)}</TableCell>
                    <TableCell>{player.obp.toFixed(3)}</TableCell>
                    <TableCell>{player.slg.toFixed(3)}</TableCell>
                    <TableCell>{player.ops.toFixed(3)}</TableCell>
                    <TableCell>{player.hr}</TableCell>
                    <TableCell>{player.rbi}</TableCell>
                    <TableCell>{player.sb}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("name")}>
                      Name {sortField === "name" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Pos</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("era")}>
                      ERA {sortField === "era" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("whip")}>
                      WHIP {sortField === "whip" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("ip")}>
                      IP {sortField === "ip" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("so")}>
                      SO {sortField === "so" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("bb")}>
                      BB {sortField === "bb" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                  <TableHead>W-L</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("sv")}>
                      SV {sortField === "sv" && (sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPitchers.map((pitcher) => (
                  <TableRow key={pitcher.id}>
                    <TableCell>{pitcher.name}</TableCell>
                    <TableCell>{pitcher.team}</TableCell>
                    <TableCell>{pitcher.position}</TableCell>
                    <TableCell>{pitcher.era.toFixed(2)}</TableCell>
                    <TableCell>{pitcher.whip.toFixed(2)}</TableCell>
                    <TableCell>{pitcher.ip.toFixed(1)}</TableCell>
                    <TableCell>{pitcher.so}</TableCell>
                    <TableCell>{pitcher.bb}</TableCell>
                    <TableCell>{pitcher.w}-{pitcher.l}</TableCell>
                    <TableCell>{pitcher.sv}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
