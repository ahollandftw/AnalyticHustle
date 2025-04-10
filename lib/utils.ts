import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to normalize player names
export function normalizeName(name: string) {
  // Check if name is in "Last, First" format
  if (name.includes(",")) {
    const [lastName, firstName] = name.split(",").map((part) => part.trim())
    return `${firstName} ${lastName}`
  }
  return name
}

// Helper function to get team color based on team name
export function getTeamColor(teamName: string): string {
  const teamColors: Record<string, string> = {
    "New York Yankees": "#0C2340",
    "Boston Red Sox": "#BD3039",
    "Los Angeles Dodgers": "#005A9C",
    "San Francisco Giants": "#FD5A1E",
    "Chicago Cubs": "#0E3386",
    "Atlanta Braves": "#CE1141",
    "Philadelphia Phillies": "#E81828",
    "Houston Astros": "#002D62",
    "New York Mets": "#FF5910",
    "St. Louis Cardinals": "#C41E3A",
    "Baltimore Orioles": "#DF4601",
    "Tampa Bay Rays": "#092C5C",
    // Add more teams as needed
  }

  return teamColors[teamName] || "#333333"
}

// Helper function to format column names for display
export function formatColumnName(columnName: string): string {
  // Special cases mapping
  const specialCases: Record<string, string> = {
    "last_name, first_name": "Player Name",
    last_name: "Last Name",
    first_name: "First Name",
    player_id: "Player ID",
    attempts: "Attempts",
    avg_hit_angle: "Avg. Hit Angle",
    anglesweetspotpercent: "Sweet Spot %",
    max_hit_speed: "Max Exit Velocity",
    avg_hit_speed: "Avg. Exit Velocity",
    ev50: "EV 50%",
    fbld: "FB/LD %",
    gb: "GB %",
    max_distance: "Max Distance",
    avg_distance: "Avg. Distance",
    avg_hr_distance: "Avg. HR Distance",
    ev95plus: "EV 95+ Count",
    ev95percent: "EV 95+ %",
    barrels: "Barrels",
    brl_percent: "Barrel %",
    brl_pa: "Barrel/PA",
    xba: "xBA",
    xslg: "xSLG",
    woba: "wOBA",
    xwoba: "xwOBA",
    xwobacon: "xwOBACON",
    exit_velocity_avg: "Avg. Exit Velocity",
    launch_angle_avg: "Avg. Launch Angle",
    sweet_spot_percent: "Sweet Spot %",
    barrel_batted_rate: "Barrel %",
    hard_hit_percent: "Hard Hit %",
    z_swing_percent: "Z-Swing %",
    z_contact_percent: "Z-Contact %",
    oz_swing_percent: "O-Swing %",
    oz_contact_percent: "O-Contact %",
    whiff_percent: "Whiff %",
    k_percent: "K %",
    bb_percent: "BB %",
    era: "ERA",
    whip: "WHIP",
    avg: "AVG",
    obp: "OBP",
    slg: "SLG",
    ops: "OPS",
    hr: "HR",
    rbi: "RBI",
    sb: "SB",
    r: "R",
    h: "H",
    "2b": "2B",
    "3b": "3B",
    so: "SO",
    bb: "BB",
  }

  // Return the special case if it exists
  if (specialCases[columnName]) {
    return specialCases[columnName]
  }

  // Otherwise, format the column name
  return columnName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Function to get the highest implied runs team for the day
export function getHighestImpliedRunsTeam(games: any[]): { team: string; impliedRuns: number } {
  if (!games || games.length === 0) {
    return { team: "", impliedRuns: 0 }
  }

  let highestTeam = ""
  let highestRuns = 0

  games.forEach((game) => {
    if (game.homeTeam.impliedRuns > highestRuns) {
      highestRuns = game.homeTeam.impliedRuns
      highestTeam = game.homeTeam.name
    }
    if (game.awayTeam.impliedRuns > highestRuns) {
      highestRuns = game.awayTeam.impliedRuns
      highestTeam = game.awayTeam.name
    }
  })

  return { team: highestTeam, impliedRuns: highestRuns }
}
