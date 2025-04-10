import Link from "next/link"
import {
  BeerIcon as Baseball,
  ShoppingBasketIcon as Basketball,
  ClubIcon as Football,
  HopIcon as Hockey,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const sports = [
    {
      name: "MLB",
      href: "/mlb",
      icon: Baseball,
      description: "Major League Baseball statistics and analytics",
    },
    {
      name: "NBA",
      href: "/nba",
      icon: Basketball,
      description: "National Basketball Association statistics and analytics",
    },
    {
      name: "NFL",
      href: "/nfl",
      icon: Football,
      description: "National Football League statistics and analytics",
    },
    {
      name: "NHL",
      href: "/nhl",
      icon: Hockey,
      description: "National Hockey League statistics and analytics",
    },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">AbsoluteHeaters</h1>
      <p className="text-muted-foreground mb-8">
        Comprehensive sports analytics for MLB, NBA, NFL, and NHL. Select a sport to get started.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sports.map((sport) => (
          <Link key={sport.name} href={sport.href} className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <sport.icon className="h-5 w-5" />
                  {sport.name}
                </CardTitle>
                <CardDescription>{sport.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>View {sport.name} statistics, matchups, and analytics.</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
