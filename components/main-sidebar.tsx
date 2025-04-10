"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Calendar,
  Home,
  ListFilter,
  PieChart,
  StickerIcon as Stadium,
  TrendingUp,
  Users,
  Zap,
  Trophy,
  Wallet,
  Users2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useTeamColor } from "@/components/team-color-provider"
import { useAuth } from "@/components/auth-provider"

const getSportFromPath = (pathname: string) => {
  const parts = pathname.split("/")
  if (parts.length > 1 && ["mlb", "nba", "nfl", "nhl"].includes(parts[1])) {
    return parts[1]
  }
  return "mlb" // Default to MLB
}

const navItems = {
  mlb: [
    { title: "Lineups", href: "/mlb/lineups", icon: ListFilter },
    { title: "BvP", href: "/mlb/bvp", icon: BarChart3 },
    { title: "Daily Matchups", href: "/mlb/daily-matchups", icon: Calendar },
    { title: "Games", href: "/mlb/games", icon: Home },
    { title: "HR Live Odds", href: "/mlb/hr-live-odds", icon: Zap },
    { title: "Implied Totals", href: "/mlb/implied-totals", icon: TrendingUp },
    { title: "Park Factors", href: "/mlb/park-factors", icon: Stadium },
    { title: "Players", href: "/mlb/players", icon: Users },
  ],
  nba: [
    { title: "Games", href: "/nba/games", icon: Home },
    { title: "Players", href: "/nba/players", icon: Users },
    { title: "Teams", href: "/nba/teams", icon: Users2 },
  ],
  nfl: [
    { title: "Games", href: "/nfl/games", icon: Home },
    { title: "Players", href: "/nfl/players", icon: Users },
    { title: "Teams", href: "/nfl/teams", icon: Users2 },
  ],
  nhl: [
    { title: "Games", href: "/nhl/games", icon: Home },
    { title: "Players", href: "/nhl/players", icon: Users },
    { title: "Teams", href: "/nhl/teams", icon: Users2 },
  ],
}

const communityItems = [
  { title: "Hall of Bang", href: "/community/hall-of-bang", icon: Trophy },
  { title: "Community Bets", href: "/community/bets", icon: Users2 },
]

export function MainSidebar() {
  const pathname = usePathname()
  const currentSport = getSportFromPath(pathname)
  const { isAuthenticated } = useAuth()
  const { teamColor } = useTeamColor()
  const isMLBSection = pathname.startsWith("/mlb")

  const currentNavItems = navItems[currentSport as keyof typeof navItems] || []

  if (!currentNavItems.length) return null

  return (
    <aside className="w-64 shrink-0 border-r border-border/40 bg-[#0A0C10]">
      <div className="flex h-full flex-col">
        <div className="border-b border-border/40 px-4 py-2">
          <h2 className="text-sm font-medium">Navigation</h2>
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="space-y-1 p-2">
            {currentNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-white/60"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="mt-4 px-4 py-2">
            <h2 className="mb-2 text-sm font-medium text-white/70">Community</h2>
            <nav className="space-y-1">
              {communityItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5",
                    pathname === item.href
                      ? "bg-white/10 text-white"
                      : "text-white/60"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  )
}
