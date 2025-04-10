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

export function MainSidebar() {
  const pathname = usePathname()
  const currentSport = getSportFromPath(pathname)
  const { isAuthenticated } = useAuth()

  // Inside the MainSidebar component, add this line after the pathname and currentSport variables
  const { teamColor } = useTeamColor()
  const isMLBSection = pathname.startsWith("/mlb")

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
              {navItems.map((item) => (
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
