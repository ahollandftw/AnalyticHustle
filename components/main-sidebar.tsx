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

// Add useTeamColor import
import { useTeamColor } from "@/components/team-color-provider"
import { useAuth } from "@/components/auth-provider"

const getSportFromPath = (pathname: string) => {
  const parts = pathname.split("/")
  if (parts.length > 1 && ["mlb", "nba", "nfl", "nhl"].includes(parts[1])) {
    return parts[1]
  }
  return "mlb" // Default to MLB
}

const mlbLinks = [
  { name: "Lineups", href: "/mlb/lineups" },
  { name: "BvP", href: "/mlb/bvp" },
  { name: "Daily Matchups", href: "/mlb/daily-matchups" },
  { name: "Games", href: "/mlb/games" },
  { name: "HR Live Odds", href: "/mlb/hr-live-odds" },
  { name: "Implied Totals", href: "/mlb/implied-totals" },
  { name: "Park Factors", href: "/mlb/park-factors" },
  { name: "Players", href: "/mlb/players" },
]

const nbaLinks = [
  { name: "Games", href: "/nba/games" },
  { name: "Players", href: "/nba/players" },
  { name: "Teams", href: "/nba/teams" },
]

const nflLinks = [
  { name: "Games", href: "/nfl/games" },
  { name: "Players", href: "/nfl/players" },
  { name: "Teams", href: "/nfl/teams" },
]

const nhlLinks = [
  { name: "Games", href: "/nhl/games" },
  { name: "Players", href: "/nhl/players" },
  { name: "Teams", href: "/nhl/teams" },
]

export function MainSidebar() {
  const pathname = usePathname()
  const currentSport = getSportFromPath(pathname)
  const { isAuthenticated } = useAuth()

  // Inside the MainSidebar component, add this line after the pathname and currentSport variables
  const { teamColor } = useTeamColor()
  const isMLBSection = pathname.startsWith("/mlb")

  const getLinks = () => {
    switch (currentSport) {
      case "mlb":
        return mlbLinks
      case "nba":
        return nbaLinks
      case "nfl":
        return nflLinks
      case "nhl":
        return nhlLinks
      default:
        return []
    }
  }

  const links = getLinks()

  const navItems = [
    {
      title: "Dashboard",
      href: `/${currentSport}`,
      icon: Home,
    },
    {
      title: "Player Statistics",
      href: `/${currentSport}/players`,
      icon: Users,
    },
    {
      title: "Park Factors",
      href: `/${currentSport}/park-factors`,
      icon: Stadium,
    },
    {
      title: "Today's Games",
      href: `/${currentSport}/games`,
      icon: Calendar,
    },
    {
      title: "Daily Matchups",
      href: `/${currentSport}/daily-matchups`,
      icon: BarChart3,
    },
    {
      title: "Implied Team Totals",
      href: `/${currentSport}/implied-totals`,
      icon: TrendingUp,
    },
    {
      title: "HR Live Odds",
      href: `/${currentSport}/hr-live-odds`,
      icon: Zap,
    },
    {
      title: "Batter vs Pitcher",
      href: `/${currentSport}/bvp`,
      icon: BarChart3,
    },
    {
      title: "Starting Lineups",
      href: `/${currentSport}/lineups`,
      icon: ListFilter,
    },
    {
      title: "Team Statistics",
      href: `/${currentSport}/teams`,
      icon: PieChart,
    },
  ]

  const communityItems = [
    {
      title: "Hall of Bang",
      href: "/community/hall-of-bang",
      icon: Trophy,
    },
    {
      title: "Community Bets",
      href: "/community/bets",
      icon: Users2,
    },
  ]

  const accountItems = isAuthenticated
    ? [
        {
          title: "My Bets",
          href: "/account/my-bets",
          icon: Wallet,
        },
        {
          title: "My Profile",
          href: "/account/profile",
          icon: Users,
        },
      ]
    : []

  if (links.length === 0) return null

  return (
    <Sidebar>
      {/* Update the SidebarHeader to use team colors in MLB section */}
      <SidebarHeader className="border-b">
        <div className={`px-4 py-2 ${isMLBSection ? "team-color-bg" : ""}`}>
          <h2 className="text-lg font-semibold capitalize">{currentSport.toUpperCase()} Analytics</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild isActive={pathname === link.href} tooltip={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === link.href
                          ? "bg-accent text-accent-foreground"
                          : "transparent"
                      )}
                    >
                      <span>{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupLabel>My Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
