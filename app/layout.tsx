"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/components/notification-provider"
import { TeamColorProvider } from "@/components/team-color-provider"
import { TopNavigation } from "@/components/top-navigation"
import { AuthProvider } from "@/components/auth-provider"
import { MainSidebar } from "@/components/main-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BeerIcon as Baseball,
  ShoppingBasketIcon as Basketball,
  ClubIcon as Football,
  HopIcon as Hockey,
} from "lucide-react"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Analytic Hustle - MLB Analytics & Insights</title>
        <meta name="description" content="Your premier destination for MLB analytics and insights" />
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className={cn(inter.className, "h-full bg-[#0A0C10]")}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <TeamColorProvider>
              <NotificationProvider>
                <SidebarProvider>
                  <div className="fixed inset-0 flex flex-col">
                    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-[#0A0C10] px-4">
                      <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                          <Image
                            src="/logo.svg"
                            alt="Analytic Hustle"
                            width={32}
                            height={32}
                            priority
                          />
                          <span className="text-xl font-bold">Analytic Hustle</span>
                        </Link>
                        <nav className="flex items-center gap-6">
                          {sports.map((sport) => {
                            const isActive = pathname?.startsWith(sport.href)
                            return (
                              <Link
                                key={sport.name}
                                href={sport.href}
                                className={cn(
                                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                                  isActive ? "text-primary" : "text-muted-foreground"
                                )}
                              >
                                <sport.icon className="h-4 w-4" />
                                {sport.name}
                              </Link>
                            )
                          })}
                        </nav>
                      </div>
                      <TopNavigation />
                    </header>
                    <div className="flex flex-1 overflow-hidden">
                      <MainSidebar />
                      <main className="flex-1 overflow-auto p-6">
                        {children}
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </NotificationProvider>
            </TeamColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'