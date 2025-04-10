"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

// Mock data for HR odds
const hrOddsData = [
  {
    id: 1,
    player: "Aaron Judge",
    team: "New York Yankees",
    game: "NYY vs BOS",
    time: "7:05 PM ET",
    odds: {
      draftkings: "+210",
      fanduel: "+220",
      betmgm: "+200",
      caesars: "+215",
    },
    bestOdds: "+220",
    bestBook: "FanDuel",
    impliedProbability: "31.3%",
    modelProbability: "35.2%",
    value: "+3.9%",
    season: {
      hr: 62,
      pa: 675,
      hrRate: "9.2%",
    },
  },
  {
    id: 2,
    player: "Shohei Ohtani",
    team: "Los Angeles Dodgers",
    game: "LAD vs SF",
    time: "10:10 PM ET",
    odds: {
      draftkings: "+260",
      fanduel: "+270",
      betmgm: "+250",
      caesars: "+265",
    },
    bestOdds: "+270",
    bestBook: "FanDuel",
    impliedProbability: "27.0%",
    modelProbability: "29.5%",
    value: "+2.5%",
    season: {
      hr: 44,
      pa: 708,
      hrRate: "6.2%",
    },
  },
  {
    id: 3,
    player: "Juan Soto",
    team: "New York Yankees",
    game: "NYY vs BOS",
    time: "7:05 PM ET",
    odds: {
      draftkings: "+320",
      fanduel: "+330",
      betmgm: "+310",
      caesars: "+325",
    },
    bestOdds: "+330",
    bestBook: "FanDuel",
    impliedProbability: "23.3%",
    modelProbability: "25.1%",
    value: "+1.8%",
    season: {
      hr: 35,
      pa: 708,
      hrRate: "4.9%",
    },
  },
  {
    id: 4,
    player: "Rafael Devers",
    team: "Boston Red Sox",
    game: "NYY vs BOS",
    time: "7:05 PM ET",
    odds: {
      draftkings: "+350",
      fanduel: "+370",
      betmgm: "+340",
      caesars: "+360",
    },
    bestOdds: "+370",
    bestBook: "FanDuel",
    impliedProbability: "21.3%",
    modelProbability: "24.0%",
    value: "+2.7%",
    season: {
      hr: 33,
      pa: 680,
      hrRate: "4.9%",
    },
  },
  {
    id: 5,
    player: "Mookie Betts",
    team: "Los Angeles Dodgers",
    game: "LAD vs SF",
    time: "10:10 PM ET",
    odds: {
      draftkings: "+380",
      fanduel: "+400",
      betmgm: "+375",
      caesars: "+390",
    },
    bestOdds: "+400",
    bestBook: "FanDuel",
    impliedProbability: "20.0%",
    modelProbability: "22.5%",
    value: "+2.5%",
    season: {
      hr: 39,
      pa: 690,
      hrRate: "5.7%",
    },
  },
  {
    id: 6,
    player: "Ronald Acuña Jr.",
    team: "Atlanta Braves",
    game: "ATL vs PHI",
    time: "7:20 PM ET",
    odds: {
      draftkings: "+290",
      fanduel: "+310",
      betmgm: "+280",
      caesars: "+300",
    },
    bestOdds: "+310",
    bestBook: "FanDuel",
    impliedProbability: "24.4%",
    modelProbability: "27.8%",
    value: "+3.4%",
    season: {
      hr: 41,
      pa: 706,
      hrRate: "5.8%",
    },
  },
]

export default function HRLiveOddsPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("value")
  const [filterTeam, setFilterTeam] = useState<string>("all")

  // Get unique teams for filter
  const teams = Array.from(new Set(hrOddsData.map((item) => item.team)))

  // Filter and sort data
  const filteredData = hrOddsData
    .filter(
      (item) =>
        (searchTerm === "" ||
          item.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.team.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterTeam === "all" || item.team === filterTeam),
    )
    .sort((a, b) => {
      if (sortBy === "value") {
        return Number.parseFloat(b.value) - Number.parseFloat(a.value)
      } else if (sortBy === "odds") {
        return Number.parseFloat(b.bestOdds.replace("+", "")) - Number.parseFloat(a.bestOdds.replace("+", ""))
      } else if (sortBy === "probability") {
        return Number.parseFloat(b.modelProbability) - Number.parseFloat(a.modelProbability)
      }
      return 0
    })

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Home Run Live Odds</CardTitle>
              <CardDescription>Compare home run odds across major sportsbooks</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players or teams..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Best Value</SelectItem>
                  <SelectItem value="odds">Best Odds</SelectItem>
                  <SelectItem value="probability">Highest Probability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>DraftKings</TableHead>
                  <TableHead>FanDuel</TableHead>
                  <TableHead>BetMGM</TableHead>
                  <TableHead>Caesars</TableHead>
                  <TableHead>Best Odds</TableHead>
                  <TableHead>Model Prob</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Season HR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.player}</div>
                        <div className="text-xs text-muted-foreground">{item.team}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{item.game}</div>
                        <div className="text-xs text-muted-foreground">{item.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.odds.draftkings}</TableCell>
                    <TableCell>{item.odds.fanduel}</TableCell>
                    <TableCell>{item.odds.betmgm}</TableCell>
                    <TableCell>{item.odds.caesars}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {item.bestOdds}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.bestBook}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.modelProbability}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          Number.parseFloat(item.value) > 3
                            ? "bg-green-500"
                            : Number.parseFloat(item.value) > 1
                              ? "bg-green-300"
                              : "bg-gray-200 text-gray-800"
                        }
                      >
                        {item.value}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{item.season.hr}</div>
                        <div className="text-xs text-muted-foreground">{item.season.hrRate}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              * Odds are updated in real-time. Model probability is based on our proprietary algorithm that factors in
              player performance, matchups, ballpark factors, and weather conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
