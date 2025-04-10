"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Share2 } from "lucide-react"

// Mock data for winning bet slips
const hallOfBangData = [
  {
    id: 1,
    user: {
      name: "John Smith",
      username: "johnsmith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2023-10-15",
    title: "5-Leg MLB Parlay Hit!",
    description: "Hit this crazy parlay with Judge, Ohtani, and Soto all homering in the same night!",
    odds: "+2500",
    payout: "$1,250",
    stake: "$50",
    sport: "MLB",
    legs: [
      { player: "Aaron Judge", market: "To Hit a Home Run", odds: "+220" },
      { player: "Shohei Ohtani", market: "To Hit a Home Run", odds: "+270" },
      { player: "Juan Soto", market: "To Hit a Home Run", odds: "+330" },
      { player: "Yankees", market: "Moneyline", odds: "-150" },
      { player: "Dodgers", market: "Moneyline", odds: "-200" },
    ],
    likes: 124,
    comments: 18,
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 2,
    user: {
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2023-10-12",
    title: "Longshot HR Parlay",
    description: "Can't believe all three of these guys went yard tonight! What a sweat!",
    odds: "+1850",
    payout: "$950",
    stake: "$50",
    sport: "MLB",
    legs: [
      { player: "Mookie Betts", market: "To Hit a Home Run", odds: "+400" },
      { player: "Rafael Devers", market: "To Hit a Home Run", odds: "+370" },
      { player: "Ronald Acuña Jr.", market: "To Hit a Home Run", odds: "+310" },
    ],
    likes: 87,
    comments: 12,
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 3,
    user: {
      name: "Mike Williams",
      username: "mikew",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2023-10-10",
    title: "Same Game Parlay Cashes!",
    description: "Yankees vs Red Sox SGP hits! Judge and Devers both homered, and the over cashed easily.",
    odds: "+1200",
    payout: "$600",
    stake: "$50",
    sport: "MLB",
    legs: [
      { player: "Aaron Judge", market: "To Hit a Home Run", odds: "+220" },
      { player: "Rafael Devers", market: "To Hit a Home Run", odds: "+370" },
      { player: "NYY/BOS", market: "Over 8.5 Runs", odds: "-110" },
    ],
    likes: 65,
    comments: 8,
    image: "/placeholder.svg?height=300&width=500",
  },
]

export default function HallOfBangPage() {
  const [timeFilter, setTimeFilter] = useState("all-time")

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Hall of Bang 🏆</CardTitle>
              <CardDescription>Celebrate the biggest wins from our community</CardDescription>
            </div>
            <Tabs defaultValue="all-time" value={timeFilter} onValueChange={setTimeFilter}>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="this-week">This Week</TabsTrigger>
                <TabsTrigger value="this-month">This Month</TabsTrigger>
                <TabsTrigger value="all-time">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hallOfBangData.map((slip) => (
              <Card key={slip.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img src={slip.image || "/placeholder.svg"} alt={slip.title} className="h-full w-full object-cover" />
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={slip.user.avatar} alt={slip.user.name} />
                      <AvatarFallback>{slip.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{slip.user.name}</div>
                      <div className="text-xs text-muted-foreground">@{slip.user.username}</div>
                    </div>
                    <Badge className="ml-auto">{slip.sport}</Badge>
                  </div>
                  <CardTitle className="text-lg">{slip.title}</CardTitle>
                  <CardDescription>{slip.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Odds</div>
                      <div className="font-medium">{slip.odds}</div>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <div className="text-xs text-muted-foreground">Stake</div>
                      <div className="font-medium">{slip.stake}</div>
                    </div>
                    <div className="rounded-md bg-green-100 dark:bg-green-900 p-2">
                      <div className="text-xs text-muted-foreground">Payout</div>
                      <div className="font-medium">{slip.payout}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Legs:</div>
                    <ul className="space-y-1 text-sm">
                      {slip.legs.map((leg, index) => (
                        <li key={index} className="flex justify-between">
                          <span>
                            {leg.player} - {leg.market}
                          </span>
                          <span className="font-medium">{leg.odds}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{slip.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{slip.comments}</span>
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
