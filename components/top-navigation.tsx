"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BeerIcon as Baseball,
  ShoppingBasketIcon as Basketball,
  ClubIcon as Football,
  HopIcon as Hockey,
  User,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

const sports = [
  {
    name: "MLB",
    href: "/mlb",
    icon: Baseball,
  },
  {
    name: "NBA",
    href: "/nba",
    icon: Basketball,
  },
  {
    name: "NFL",
    href: "/nfl",
    icon: Football,
  },
  {
    name: "NHL",
    href: "/nhl",
    icon: Hockey,
  },
]

export function TopNavigation() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()
  const currentSport = sports.find((sport) => pathname.startsWith(sport.href))

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">AbsoluteHeaters</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {sports.map((sport) => {
            const isActive = pathname.startsWith(sport.href)
            return (
              <Link
                key={sport.name}
                href={sport.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <sport.icon className="h-4 w-4" />
                {sport.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/subscribe">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscribe
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAuthenticated ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/account/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/my-bets">My Bets</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/subscription">Subscription</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login">Sign in</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/register">Sign up</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
