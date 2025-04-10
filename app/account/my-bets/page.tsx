"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, Plus, Eye, EyeOff, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

// Mock data for user bets
const userBetsData = [
  {
    id: 1,
    date: "2023-10-15",
    title: "MLB HR Parlay",
    description: "Three sluggers to hit HRs tonight",
    odds: "+1250",
    stake: "$50",
    potentialPayout: "$675",
    sport: "MLB",
    status: "pending",
    isPublic: true,
    legs: [
      { player: "Aaron Judge", market: "To Hit a Home Run", odds: "+220" },
      { player: "Shohei Ohtani", market: "To Hit a Home Run", odds: "+270" },
      { player: "Juan Soto", market: "To Hit a Home Run", odds: "+330" },
    ],
  },
  {
    id: 2,
    date: "2023-10-14",
    title: "Yankees Moneyline",
    description: "Yankees to win against Red Sox",
    odds: "-150",
    stake: "$150",
    potentialPayout: "$250",
    sport: "MLB",
    status: "won",
    isPublic: true,
    legs: [{ player: "Yankees", market: "Moneyline", odds: "-150" }],
  },
  {
    id: 3,
    date: "2023-10-13",
    title: "Dodgers vs Giants Under",
    description: "Under 8.5 runs in Dodgers vs Giants",
    odds: "-110",
    stake: "$110",
    potentialPayout: "$210",
    sport: "MLB",
    status: "lost",
    isPublic: false,
    legs: [{ player: "LAD/SF", market: "Under 8.5 Runs", odds: "-110" }],
  },
  {
    id: 4,
    date: "2023-10-12",
    title: "Braves Game Parlay",
    description: "Braves to win and Acuña to homer",
    odds: "+350",
    stake: "$25",
    potentialPayout: "$112.50",
    sport: "MLB",
    status: "won",
    isPublic: true,
    legs: [
      { player: "Braves", market: "Moneyline", odds: "-130" },
      { player: "Ronald Acuña Jr.", market: "To Hit a Home Run", odds: "+310" },
    ],
  },
]

export default function MyBetsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [showAddBetForm, setShowAddBetForm] = useState(false)

  // Filter bets based on active tab and search term
  const filteredBets = userBetsData
    .filter((bet) => {
      if (activeTab === "all") return true
      if (activeTab === "pending") return bet.status === "pending"
      if (activeTab === "won") return bet.status === "won"
      if (activeTab === "lost") return bet.status === "lost"
      if (activeTab === "public") return bet.isPublic
      if (activeTab === "private") return !bet.isPublic
      return true
    })
    .filter((bet) => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      return (
        bet.title.toLowerCase().includes(searchLower) ||
        bet.description.toLowerCase().includes(searchLower) ||
        bet.sport.toLowerCase().includes(searchLower) ||
        bet.legs.some(
          (leg) => leg.player.toLowerCase().includes(searchLower) || leg.market.toLowerCase().includes(searchLower),
        )
      )
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      if (sortBy === "odds") {
        const oddsA = a.odds.startsWith("+")
          ? Number.parseInt(a.odds.substring(1))
          : -Number.parseInt(a.odds.substring(1))
        const oddsB = b.odds.startsWith("+")
          ? Number.parseInt(b.odds.substring(1))
          : -Number.parseInt(b.odds.substring(1))
        return oddsB - oddsA
      }
      if (sortBy === "stake") {
        return Number.parseFloat(b.stake.replace("$", "")) - Number.parseFloat(a.stake.replace("$", ""))
      }
      return 0
    })

  const toggleBetVisibility = (betId: number) => {
    // In a real app, this would update the bet in the database
    console.log(`Toggling visibility for bet ${betId}`)
  }

  const deleteBet = (betId: number) => {
    // In a real app, this would delete the bet from the database
    console.log(`Deleting bet ${betId}`)
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>My Bets</CardTitle>
              <CardDescription>Track and manage your betting history</CardDescription>
            </div>
            <Button onClick={() => setShowAddBetForm(!showAddBetForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Bet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddBetForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Bet</CardTitle>
                <CardDescription>Enter the details of your bet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bet-title">Bet Title</Label>
                      <Input id="bet-title" placeholder="e.g., MLB HR Parlay" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bet-sport">Sport</Label>
                      <Select>
                        <SelectTrigger id="bet-sport">
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mlb">MLB</SelectItem>
                          <SelectItem value="nba">NBA</SelectItem>
                          <SelectItem value="nfl">NFL</SelectItem>
                          <SelectItem value="nhl">NHL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bet-description">Description</Label>
                    <Input id="bet-description" placeholder="Brief description of your bet" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="bet-odds">Odds</Label>
                      <Input id="bet-odds" placeholder="e.g., +350" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bet-stake">Stake</Label>
                      <Input id="bet-stake" placeholder="e.g., $50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bet-status">Status</Label>
                      <Select>
                        <SelectTrigger id="bet-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bet-legs">Bet Legs</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Player/Team" className="flex-1" />
                        <Input placeholder="Market" className="flex-1" />
                        <Input placeholder="Odds" className="w-24" />
                        <Button variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="bet-public" />
                    <Label htmlFor="bet-public">Make this bet public</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddBetForm(false)}>
                      Cancel
                    </Button>
                    <Button>Save Bet</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your bets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="odds">Highest Odds</SelectItem>
                <SelectItem value="stake">Highest Stake</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredBets.length > 0 ? (
              filteredBets.map((bet) => (
                <Card key={bet.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              bet.status === "won"
                                ? "bg-green-500"
                                : bet.status === "lost"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                            }
                          >
                            {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">{bet.sport}</Badge>
                          <span className="text-xs text-muted-foreground">{bet.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBetVisibility(bet.id)}
                            title={bet.isPublic ? "Make Private" : "Make Public"}
                          >
                            {bet.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteBet(bet.id)} title="Delete Bet">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold">{bet.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{bet.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-xs text-muted-foreground">Odds</div>
                          <div className="font-medium">{bet.odds}</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="text-xs text-muted-foreground">Stake</div>
                          <div className="font-medium">{bet.stake}</div>
                        </div>
                        <div
                          className={`rounded-md p-2 ${
                            bet.status === "won" ? "bg-green-100 dark:bg-green-900" : "bg-muted"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground">
                            {bet.status === "won" ? "Payout" : "Potential"}
                          </div>
                          <div className="font-medium">{bet.potentialPayout}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Legs:</div>
                        <ul className="space-y-1">
                          {bet.legs.map((leg, index) => (
                            <li key={index} className="text-sm flex justify-between">
                              <span>
                                {leg.player} - {leg.market}
                              </span>
                              <span className="font-medium">{leg.odds}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No bets found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
