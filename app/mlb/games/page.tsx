"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Mock data for matchups
const matchupsData = [
  {
    id: 1,
    homeTeam: {
      name: "New York Yankees",
      record: "92-70",
      starter: {
        name: "Gerrit Cole",
        era: 3.14,
        whip: 0.98,
      },
      impliedRuns: 4.7,
      moneyline: -150,
    },
    awayTeam: {
      name: "Boston Red Sox",
      record: "78-84",
      starter: {
        name: "Chris Sale",
        era: 3.92,
        whip: 1.15,
      },
      impliedRuns: 3.9,
      moneyline: +130,
    },
    time: "7:05 PM ET",
    total: 8.5,
  },
  {
    id: 2,
    homeTeam: {
      name: "Los Angeles Dodgers",
      record: "100-62",
      starter: {
        name: "Shohei Ohtani",
        era: 3.14,
        whip: 1.06,
      },
      impliedRuns: 5.2,
      moneyline: -200,
    },
    awayTeam: {
      name: "San Francisco Giants",
      record: "79-83",
      starter: {
        name: "Logan Webb",
        era: 3.25,
        whip: 1.12,
      },
      impliedRuns: 3.3,
      moneyline: +170,
    },
    time: "10:10 PM ET",
    total: 8.5,
  },
  {
    id: 3,
    homeTeam: {
      name: "Atlanta Braves",
      record: "104-58",
      starter: {
        name: "Spencer Strider",
        era: 3.86,
        whip: 1.09,
      },
      impliedRuns: 5.0,
      moneyline: -180,
    },
    awayTeam: {
      name: "Philadelphia Phillies",
      record: "90-72",
      starter: {
        name: "Zack Wheeler",
        era: 2.87,
        whip: 1.04,
      },
      impliedRuns: 3.5,
      moneyline: +150,
    },
    time: "7:20 PM ET",
    total: 8.5,
  },
]

export default function MatchupsPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState("matchups")

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>MLB Daily Matchups</CardTitle>
              <CardDescription>View today's games, pitching matchups, and odds</CardDescription>
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
          <Tabs defaultValue="matchups" value={view} onValueChange={setView} className="mb-6">
            <TabsList>
              <TabsTrigger value="matchups">Matchups</TabsTrigger>
              <TabsTrigger value="odds">Odds</TabsTrigger>
              <TabsTrigger value="weather">Weather</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-6">
            {matchupsData.map((matchup) => (
              <Card key={matchup.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-lg font-semibold">{matchup.awayTeam.name}</div>
                      <div className="text-sm text-muted-foreground">{matchup.awayTeam.record}</div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">{matchup.awayTeam.starter.name}</span>
                        <div className="text-xs text-muted-foreground">
                          ERA: {matchup.awayTeam.starter.era} | WHIP: {matchup.awayTeam.starter.whip}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-sm font-medium">{matchup.time}</div>
                      <div className="my-2 text-2xl font-bold">@</div>
                      {view === "odds" && (
                        <div className="mt-2 flex flex-col items-center">
                          <div className="text-sm">
                            <span className="font-medium">Total:</span> O/U {matchup.total}
                          </div>
                          <div className="mt-1 flex gap-4 text-sm">
                            <div>
                              <span className="font-medium">ML:</span>{" "}
                              <span className={matchup.awayTeam.moneyline > 0 ? "text-green-500" : "text-red-500"}>
                                {matchup.awayTeam.moneyline > 0 ? "+" : ""}
                                {matchup.awayTeam.moneyline}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">ML:</span>{" "}
                              <span className={matchup.homeTeam.moneyline > 0 ? "text-green-500" : "text-red-500"}>
                                {matchup.homeTeam.moneyline > 0 ? "+" : ""}
                                {matchup.homeTeam.moneyline}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-lg font-semibold">{matchup.homeTeam.name}</div>
                      <div className="text-sm text-muted-foreground">{matchup.homeTeam.record}</div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">{matchup.homeTeam.starter.name}</span>
                        <div className="text-xs text-muted-foreground">
                          ERA: {matchup.homeTeam.starter.era} | WHIP: {matchup.homeTeam.starter.whip}
                        </div>
                      </div>
                    </div>
                  </div>
                  {view === "matchups" && (
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-medium">Implied Runs</div>
                        <div className="text-lg font-bold">{matchup.awayTeam.impliedRuns}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-medium">Implied Runs</div>
                        <div className="text-lg font-bold">{matchup.homeTeam.impliedRuns}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
