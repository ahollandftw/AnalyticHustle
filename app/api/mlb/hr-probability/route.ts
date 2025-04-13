import { NextResponse } from 'next/server'
import { fetchMLBLineups } from '@/lib/mlb'
import statcastBatters from "C:/AnalyticHustle1.0/StatcastBatters.json"
import statcastPitchers from "C:/AnalyticHustle1.0/StatcastPitchers.json"
import hittersVsR from "C:/AnalyticHustle1.0/HittersvR.json"
import hittersVsL from "C:/AnalyticHustle1.0/HittersvL.json"
import pitchersVsR from "C:/AnalyticHustle1.0/PitchersvR.json"
import pitchersVsL from "C:/AnalyticHustle1.0/PitchersvL.json"
import parkFactors from "C:/AnalyticHustle1.0/ParkFactors.json"

interface Weights {
  HR_rate: number;
  BarrelRate: number;
  HardHitRate: number;
  ExitVelo: number;
  LaunchAngle: number;
  FlyBallRate: number;
  PullRate: number;
  HR_FB_Rate: number;
  xHR: number;
  ISO: number;
  RecentHRs: number;
  PitcherHR_9: number;
  PitcherBarrelRate: number;
  PitcherFBRate: number;
  ParkFactor: number;
}

function getHitterStats(name: string, bats: string, pitcherThrows: string) {
  // Get platoon stats
  const hitterData = pitcherThrows === 'L' ? 
    hittersVsL.find(h => h.Name_1 === name) :
    hittersVsR.find(h => h.Name_1 === name)

  // Get Statcast data
  const statcastData = statcastBatters.find(h => h.player_name === name)

  if (!hitterData && !statcastData) {
    // Try alternate name format
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternateHitterData = pitcherThrows === 'L' ?
      hittersVsL.find(h => h.Name_1 === alternateName) :
      hittersVsR.find(h => h.Name_1 === alternateName)
    
    if (alternateHitterData) {
      return {
        hr_per_pa: alternateHitterData.HR / alternateHitterData.PA,
        hr_per_fb: alternateHitterData["HR/FB"],
        fb_percent: alternateHitterData["FB%"],
        pull_percent: alternateHitterData["Pull%"],
        hard_hit: statcastData?.hard_hit_percent ?? 35,
        barrel_rate: statcastData?.barrel_rate ?? 7,
        exit_velocity: statcastData?.exit_velocity ?? 88,
        launch_angle: statcastData?.launch_angle ?? 12,
        iso: alternateHitterData.ISO,
        recent_hr: alternateHitterData.HR
      }
    }
  }

  return {
    hr_per_pa: hitterData ? hitterData.HR / hitterData.PA : 0.03,
    hr_per_fb: hitterData?.["HR/FB"] ?? 0.1,
    fb_percent: hitterData?.["FB%"] ?? 0.35,
    pull_percent: hitterData?.["Pull%"] ?? 0.4,
    hard_hit: statcastData?.hard_hit_percent ?? 35,
    barrel_rate: statcastData?.barrel_rate ?? 7,
    exit_velocity: statcastData?.exit_velocity ?? 88,
    launch_angle: statcastData?.launch_angle ?? 12,
    iso: hitterData?.ISO ?? 0.15,
    recent_hr: hitterData?.HR ?? 0
  }
}

function getPitcherStats(name: string, batterHand: string) {
  // Get platoon stats
  const pitcherData = batterHand === 'L' ?
    pitchersVsL.find(p => p.Name_1 === name) :
    pitchersVsR.find(p => p.Name_1 === name)

  // Get Statcast data
  const statcastData = statcastPitchers.find(p => p["last_name, first_name"] === name)

  if (!pitcherData && !statcastData) {
    // Try alternate name format
    const [lastName, firstName] = name.split(', ').reverse()
    const alternateName = `${firstName} ${lastName}`
    const alternatePitcherData = batterHand === 'L' ?
      pitchersVsL.find(p => p.Name_1 === alternateName) :
      pitchersVsR.find(p => p.Name_1 === alternateName)

    if (alternatePitcherData) {
      return {
        hr_per_9: alternatePitcherData["HR/9"],
        fb_percent: alternatePitcherData["FB%"],
        barrel_rate: statcastData?.barrel_rate ?? 7
      }
    }
  }

  return {
    hr_per_9: pitcherData?.["HR/9"] ?? 1.2,
    fb_percent: pitcherData?.["FB%"] ?? 0.35,
    barrel_rate: statcastData?.barrel_rate ?? 7
  }
}

function getParkFactor(teamName: string) {
  const park = parkFactors.find(p => p.Team === teamName)
  return park?.["Park Factor"] ?? 1.0
}

function calculateHRProbability(
  hitterStats: any,
  pitcherStats: any,
  parkFactor: number,
  weights: Weights
) {
  // Base HR rate component
  const baseHRRate = hitterStats.hr_per_pa * weights.HR_rate

  // Statcast metrics
  const barrelComponent = (hitterStats.barrel_rate / 100) * weights.BarrelRate
  const hardHitComponent = (hitterStats.hard_hit / 100) * weights.HardHitRate
  const exitVeloComponent = (hitterStats.exit_velocity / 95) * weights.ExitVelo
  const launchComponent = (hitterStats.launch_angle / 25) * weights.LaunchAngle

  // Batted ball profile
  const fbComponent = hitterStats.fb_percent * weights.FlyBallRate
  const pullComponent = hitterStats.pull_percent * weights.PullRate
  const hrFbComponent = hitterStats.hr_per_fb * weights.HR_FB_Rate

  // Expected stats
  const xhrComponent = (hitterStats.xHR || 0) * weights.xHR
  const isoComponent = (hitterStats.iso || 0) * weights.ISO
  const recentHRComponent = (hitterStats.recent_hr || 0) * weights.RecentHRs

  // Pitcher factors
  const pitcherHRComponent = (pitcherStats.hr_per_9 / 2) * weights.PitcherHR_9
  const pitcherBarrelComponent = (pitcherStats.barrel_rate / 100) * weights.PitcherBarrelRate
  const pitcherFBComponent = pitcherStats.fb_percent * weights.PitcherFBRate

  // Park factor
  const parkComponent = (parkFactor - 1) * weights.ParkFactor

  // Combine all components
  let probability = baseHRRate +
    barrelComponent +
    hardHitComponent +
    exitVeloComponent +
    launchComponent +
    fbComponent +
    pullComponent +
    hrFbComponent +
    xhrComponent +
    isoComponent +
    recentHRComponent +
    pitcherHRComponent +
    pitcherBarrelComponent +
    pitcherFBComponent +
    parkComponent

  // Keep only the minimum floor for MLB hitters
  return Math.max(probability, 0.02)
}

export async function POST(request: Request) {
  try {
    const { weights, variance } = await request.json()
    
    // Get current games and lineups
    const games = await fetchMLBLineups()
    if (!games || !Array.isArray(games)) {
      return NextResponse.json(
        { error: 'Failed to fetch current lineups' },
        { status: 500 }
      )
    }

    const projections = []
    
    // Process each game
    for (const game of games) {
      // Process home team
      for (const player of game.homeTeam.lineup) {
        const hitterStats = getHitterStats(
          player.name,
          player.bats,
          game.awayTeam.startingPitcher?.throws || 'R'
        )
        
        const pitcherStats = getPitcherStats(
          game.awayTeam.startingPitcher?.name || 'TBD',
          player.bats
        )
        
        const parkFactor = getParkFactor(game.homeTeam.name)
        const probability = calculateHRProbability(hitterStats, pitcherStats, parkFactor, weights)
        
        projections.push({
          name: player.name,
          team: game.homeTeam.name,
          probability,
          rawProbability: probability // Store the raw value for reference
        })
      }

      // Process away team
      for (const player of game.awayTeam.lineup) {
        const hitterStats = getHitterStats(
          player.name,
          player.bats,
          game.homeTeam.startingPitcher?.throws || 'R'
        )
        
        const pitcherStats = getPitcherStats(
          game.homeTeam.startingPitcher?.name || 'TBD',
          player.bats
        )
        
        const parkFactor = getParkFactor(game.homeTeam.name)
        const probability = calculateHRProbability(hitterStats, pitcherStats, parkFactor, weights)
        
        projections.push({
          name: player.name,
          team: game.awayTeam.name,
          probability,
          rawProbability: probability // Store the raw value for reference
        })
      }
    }

    // Sort by raw probability descending
    projections.sort((a, b) => b.rawProbability - a.rawProbability)

    // Find the highest probability
    const maxProb = projections[0]?.rawProbability || 1

    // If any probability is over 100%, normalize all probabilities
    if (maxProb > 1) {
      const scaleFactor = 1 / maxProb // This will make the highest value exactly 1 (100%)
      
      // Scale all probabilities
      projections.forEach(proj => {
        proj.probability = proj.rawProbability * scaleFactor
      })
    }

    return NextResponse.json(projections)
  } catch (error) {
    console.error('Error in HR probability endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 