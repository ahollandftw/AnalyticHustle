"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"

export function TopNavigation() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <nav className="flex items-center gap-4">
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
    </nav>
  )
}
