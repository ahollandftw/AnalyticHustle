"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { getTeamColor } from "@/lib/utils"

// Mock data for implied totals (same as in the implied-totals page)
const impliedTotalsData = [
  {
    id: 1,
    date: new Date(),
    homeTeam: {
      name: "Baltimore Orioles",
      impliedRuns: 6.3,
      moneyline: -180,
      record: "101-61",
    },
    awayTeam: {
      name: "Tampa Bay Rays",
      impliedRuns: 3.8,
      moneyline: +160,
      record: "80-82",
    },
    total: 10.1,
    time: "7:05 PM ET",
  },
  {
    id: 2,
    date: new Date(),
    homeTeam: {
      name: "New York Yankees",
      impliedRuns: 4.7,
      moneyline: -150,
      record: "92-70",
    },
    awayTeam: {
      name: "Boston Red Sox",
      impliedRuns: 3.9,
      moneyline: +130,
      record: "78-84",
    },
    total: 8.6,
    time: "7:05 PM ET",
  },
  {
    id: 3,
    date: new Date(),
    homeTeam: {
      name: "Los Angeles Dodgers",
      impliedRuns: 5.2,
      moneyline: -200,
      record: "100-62",
    },
    awayTeam: {
      name: "San Francisco Giants",
      impliedRuns: 3.3,
      moneyline: +170,
      record: "79-83",
    },
    total: 8.5,
    time: "10:10 PM ET",
  },
]

type TeamColorContextType = {
  teamWithHighestImpliedRuns: string
  teamColor: string
  impliedRuns: number
}

const TeamColorContext = createContext<TeamColorContextType | undefined>(undefined)

export function TeamColorProvider({ children }: { children: ReactNode }) {
  const [teamWithHighestImpliedRuns, setTeamWithHighestImpliedRuns] = useState<string>("Baltimore Orioles")
  const [teamColor, setTeamColor] = useState<string>("#DF4601") // Default to Orioles orange
  const [impliedRuns, setImpliedRuns] = useState<number>(6.3)
  const pathname = usePathname()
  const isMLBSection = pathname.startsWith("/mlb")

  useEffect(() => {
    // Find the team with the highest implied runs
    let highestTeam = ""
    let highestRuns = 0

    impliedTotalsData.forEach((game) => {
      if (game.homeTeam.impliedRuns > highestRuns) {
        highestRuns = game.homeTeam.impliedRuns
        highestTeam = game.homeTeam.name
      }
      if (game.awayTeam.impliedRuns > highestRuns) {
        highestRuns = game.awayTeam.impliedRuns
        highestTeam = game.awayTeam.name
      }
    })

    setTeamWithHighestImpliedRuns(highestTeam)
    setImpliedRuns(highestRuns)

    if (highestTeam) {
      const color = getTeamColor(highestTeam)
      setTeamColor(color)

      if (isMLBSection) {
        applyTeamColorToMLBSection(color)
      } else {
        resetColors()
      }
    }
  }, [isMLBSection])

  const applyTeamColorToMLBSection = (color: string) => {
    // Get the RGB values from the hex color
    const r = Number.parseInt(color.slice(1, 3), 16)
    const g = Number.parseInt(color.slice(3, 5), 16)
    const b = Number.parseInt(color.slice(5, 7), 16)

    // Create lighter and darker versions for various UI elements
    const colorRgb = `${r}, ${g}, ${b}`
    const colorLight = `rgba(${r}, ${g}, ${b}, 0.1)`
    const colorMedium = `rgba(${r}, ${g}, ${b}, 0.3)`
    const colorDark = `rgba(${r}, ${g}, ${b}, 0.8)`

    // Calculate text color (white or black) based on color brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    const textColor = brightness > 128 ? "#000000" : "#ffffff"

    // Apply colors to CSS variables
    document.documentElement.style.setProperty("--team-color", color)
    document.documentElement.style.setProperty("--team-color-rgb", colorRgb)
    document.documentElement.style.setProperty("--team-color-light", colorLight)
    document.documentElement.style.setProperty("--team-color-medium", colorMedium)
    document.documentElement.style.setProperty("--team-color-dark", colorDark)
    document.documentElement.style.setProperty("--team-text-color", textColor)

    // Update primary color to match team color
    document.documentElement.style.setProperty("--primary", color)
    document.documentElement.style.setProperty("--primary-foreground", textColor)

    // Update other UI elements
    document.documentElement.style.setProperty("--ring", color)
    document.documentElement.style.setProperty("--border", colorMedium)
    document.documentElement.style.setProperty("--accent", colorLight)
    document.documentElement.style.setProperty("--accent-foreground", color)
  }

  const resetColors = () => {
    // Reset to default theme colors
    document.documentElement.style.removeProperty("--team-color")
    document.documentElement.style.removeProperty("--team-color-rgb")
    document.documentElement.style.removeProperty("--team-color-light")
    document.documentElement.style.removeProperty("--team-color-medium")
    document.documentElement.style.removeProperty("--team-color-dark")
    document.documentElement.style.removeProperty("--team-text-color")

    // Reset primary color
    document.documentElement.style.removeProperty("--primary")
    document.documentElement.style.removeProperty("--primary-foreground")

    // Reset other UI elements
    document.documentElement.style.removeProperty("--ring")
    document.documentElement.style.removeProperty("--border")
    document.documentElement.style.removeProperty("--accent")
    document.documentElement.style.removeProperty("--accent-foreground")
  }

  return (
    <TeamColorContext.Provider value={{ teamWithHighestImpliedRuns, teamColor, impliedRuns }}>
      {children}
    </TeamColorContext.Provider>
  )
}

export function useTeamColor() {
  const context = useContext(TeamColorContext)
  if (!context) {
    throw new Error("useTeamColor must be used within a TeamColorProvider")
  }
  return context
}
