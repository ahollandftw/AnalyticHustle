"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MessageSquare, Share2, Search } from "lucide-react"

// Mock data for community bets
const communityBetsData = [
  {
    id: 1,
    user: {
      name: "John Smith",
      username: "johnsmith",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    date: "2023-10-15T14:30:00",
    title: "MLB HR Parlay for Tonight",
    description: "Going with these three sluggers to go yard tonight. All facing pitchers they've had success against.",
    odds: "+1250",
    stake: "$50",
    potentialPayout: "$675",
    sport: "MLB",
    status: "pending",
    legs: [
      { player: "Aaron Judge", market: "To Hit a Home Run", odds: "+220" },
      { player: "Shohei Ohtani", market: "To Hit a Home Run", odds: "+270" },
      { player: "Juan Soto", market: "To Hit a Home Run", odds: "+330" },
    ],
    likes: 24,
    comments: 8,
    tags: ["parlay", "home runs", "value picks"],
  },
  {
    id: 2,
    user: {
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
    date: "2023-10-15T12:15:00",
    title: "Red Sox vs Yankees SGP",
    description: "Same game parlay for tonight's rivalry game. Expecting a high-scoring affair.",
    odds: "+850",
    stake: "$25",
    potentialPayout: "$237.50",
    sport: "MLB",
    status: "pending",
    legs: [
      { player: "NYY/BOS", market: "Over 8.5 Runs", odds: "-110" },
      { player: "Rafael Devers", market: "2+ Hits", odds: "+175" },
      { player: "Aaron Judge", market: "To Hit a Home Run", odds: "+220" },
    ],
    likes: 18,
    comments: 5,
    tags: ["sgp", "over", "rivalry"],
  },
  {
    id: 3,
    user: {
      name: "Mike Williams",
      username: "mikew",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    date: "2023-10-15T10:45:00",
    title: "Dodgers Moneyline + Ohtani HR",
    description: "Dodgers should handle the Giants tonight, and Ohtani has been on fire lately.",
    odds: "+320",
    stake: "$100",
    potentialPayout: "$420",
    sport: "MLB",
    status: "pending",
    legs: [
      { player: "Dodgers", market: "Moneyline", odds: "-200" },
      { player: "Shohei Ohtani", market: "To Hit a Home Run", odds: "+270" },
    ],
    likes: 42,
    comments: 12,
    tags: ["moneyline", "home run", "value"],
  },
  {
    id: 4,
    user: {
      name: "Alex Thompson",
      username: "alext",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
    date: "2023-10-15T09:30:00",
    title: "Braves vs Phillies Under",
    description: "Two great pitchers on the mound tonight. Expecting a low-scoring game.",
    odds: "-110",
    stake: "$110",
    potentialPayout: "$210",
    sport: "MLB",
    status: "pending",
    legs: [{ player: "ATL/PHI", market: "Under 7.5 Runs", odds: "-110" }],
    likes: 15,
    comments: 4,
    tags: ["under", "pitching duel", "straight bet"],
  },
]

export default function CommunityBetsPage() {
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter and sort data
  const filteredData = communityBetsData
    .filter((bet) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          bet.title.toLowerCase().includes(searchLower) ||
          bet.description.toLowerCase().includes(searchLower) ||
          bet.user.name.toLowerCase().includes(searchLower) ||
          bet.user.username.toLowerCase().includes(searchLower) ||
          bet.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        )
      }
      return true
    })
    .filter((bet) => {
      if (filter === "all") return true
      if (filter === "parlays") return bet.legs.length > 1
      if (filter === "straight") return bet.legs.length === 1
      if (filter === "verified") return bet.user.verified
      return true
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      if (sortBy === "popular") {
        return b.likes - a.likes
      }
      if (sortBy === "odds") {
        // Convert odds to numbers for comparison
        const oddsA = a.odds.startsWith("+")
          ? Number.parseInt(a.odds.substring(1))
          : -Number.parseInt(a.odds.substring(1))
        const oddsB = b.odds.startsWith("+")
          ? Number.parseInt(b.odds.substring(1))
          : -Number.parseInt(b.odds.substring(1))
        return oddsB - oddsA
      }
      return 0
    })

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Community Bets</CardTitle>
              <CardDescription>See what the community is betting on today</CardDescription>
            </div>
            <Button className="w-full sm:w-auto">Share Your Bet</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bets, users, or tags..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bets</SelectItem>
                  <SelectItem value="parlays">Parlays</SelectItem>
                  <SelectItem value="straight">Straight Bets</SelectItem>
                  <SelectItem value="verified">Verified Users</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="odds">Highest Odds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredData.map((bet) => (
              <Card key={bet.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={bet.user.avatar} alt={bet.user.name} />
                      <AvatarFallback>{bet.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{bet.user.name}</span>
                        {bet.user.verified && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">@{bet.user.username}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Badge>{bet.sport}</Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bet.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{bet.title}</CardTitle>
                  <CardDescription>{bet.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Odds</div>
                      <div className="font-medium">{bet.odds}</div>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Stake</div>
                      <div className="font-medium">{bet.stake}</div>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Potential Payout</div>
                      <div className="font-medium">{bet.potentialPayout}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Legs:</div>
                    <ul className="space-y-1 text-sm">
                      {bet.legs.map((leg, index) => (
                        <li key={index} className="flex justify-between">
                          <span>
                            {leg.player} - {leg.market}
                          </span>
                          <span className="font-medium">{leg.odds}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {bet.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{bet.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{bet.comments}</span>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
