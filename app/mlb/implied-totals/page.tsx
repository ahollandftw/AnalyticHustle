"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Mock data for implied totals
const impliedTotalsData = [
  {
    id: 1,
    date: new Date(),
    homeTeam: {
      name: "Baltimore Orioles",
      impliedRuns: 6.3,
      moneyline: -180,
      record: "101-61",
    },
    awayTeam: {
      name: "Tampa Bay Rays",
      impliedRuns: 3.8,
      moneyline: +160,
      record: "80-82",
    },
    total: 10.1,
    time: "7:05 PM ET",
  },
  {
    id: 2,
    date: new Date(),
    homeTeam: {
      name: "New York Yankees",
      impliedRuns: 4.7,
      moneyline: -150,
      record: "92-70",
    },
    awayTeam: {
      name: "Boston Red Sox",
      impliedRuns: 3.9,
      moneyline: +130,
      record: "78-84",
    },
    total: 8.6,
    time: "7:05 PM ET",
  },
  {
    id: 3,
    date: new Date(),
    homeTeam: {
      name: "Los Angeles Dodgers",
      impliedRuns: 5.2,
      moneyline: -200,
      record: "100-62",
    },
    awayTeam: {
      name: "San Francisco Giants",
      impliedRuns: 3.3,
      moneyline: +170,
      record: "79-83",
    },
    total: 8.5,
    time: "10:10 PM ET",
  },
  {
    id: 4,
    date: new Date(),
    homeTeam: {
      name: "Atlanta Braves",
      impliedRuns: 5.0,
      moneyline: -180,
      record: "104-58",
    },
    awayTeam: {
      name: "Philadelphia Phillies",
      impliedRuns: 3.5,
      moneyline: +150,
      record: "90-72",
    },
    total: 8.5,
    time: "7:20 PM ET",
  },
  {
    id: 5,
    date: new Date(),
    homeTeam: {
      name: "Houston Astros",
      impliedRuns: 4.8,
      moneyline: -160,
      record: "90-72",
    },
    awayTeam: {
      name: "Texas Rangers",
      impliedRuns: 3.7,
      moneyline: +140,
      record: "90-72",
    },
    total: 8.5,
    time: "8:10 PM ET",
  },
]

export default function ImpliedTotalsPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [sortedData, setSortedData] = useState<any[]>([])
  const [highestImpliedTeam, setHighestImpliedTeam] = useState<string>("")

  useEffect(() => {
    // Create a flattened array of teams with their implied runs
    const teamsWithImpliedRuns = impliedTotalsData.flatMap((game) => [
      { ...game.homeTeam, gameId: game.id, isHome: true, time: game.time, opponent: game.awayTeam.name },
      { ...game.awayTeam, gameId: game.id, isHome: false, time: game.time, opponent: game.homeTeam.name },
    ])

    // Sort by implied runs (descending)
    const sorted = teamsWithImpliedRuns.sort((a, b) => b.impliedRuns - a.impliedRuns)
    setSortedData(sorted)

    // Set the team with highest implied runs
    if (sorted.length > 0) {
      setHighestImpliedTeam(sorted[0].name)
    }
  }, [])

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>MLB Implied Team Totals</CardTitle>
              <CardDescription>Projected run totals derived from betting lines</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Implied Runs</TableHead>
                  <TableHead>Moneyline</TableHead>
                  <TableHead>Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((team, index) => (
                  <TableRow key={`${team.gameId}-${team.isHome ? "home" : "away"}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span
                            className="inline-block w-2 h-2 rounded-full bg-primary"
                            title="Highest implied runs"
                          ></span>
                        )}
                        {team.name}
                        {team.isHome ? " (H)" : " (A)"}
                      </div>
                    </TableCell>
                    <TableCell>{team.opponent}</TableCell>
                    <TableCell>{team.time}</TableCell>
                    <TableCell className="font-bold">{team.impliedRuns.toFixed(1)}</TableCell>
                    <TableCell className={team.moneyline > 0 ? "text-green-500" : "text-red-500"}>
                      {team.moneyline > 0 ? "+" : ""}
                      {team.moneyline}
                    </TableCell>
                    <TableCell>{team.record}</TableCell>
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
