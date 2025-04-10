import { NextResponse } from "next/server"

interface HitterStats {
  HR_rate: number
  BarrelRate: number
  HardHitRate: number
  ExitVelo: number
  LaunchAngle: number
  FlyBallRate: number
  PullRate: number
  HR_FB_Rate: number
  ISO: number
}

interface PitcherStats {
  PitcherHR_9: number
  PitcherBarrelRate: number
  PitcherFBRate: number
}

interface Weights {
  HR_rate: number
  BarrelRate: number
  HardHitRate: number
  ExitVelo: number
  LaunchAngle: number
  FlyBallRate: number
  PullRate: number
  HR_FB_Rate: number
  ISO: number
  PitcherHR_9: number
  PitcherBarrelRate: number
  PitcherFBRate: number
  ParkFactor: number
}

function calculateHRProbability(
  hitter: HitterStats,
  pitcher: PitcherStats,
  parkFactor: number,
  weights: Weights
): number {
  // Normalize each stat to a 0-1 scale (you'll need to define min/max values)
  const normalizedStats = {
    HR_rate: hitter.HR_rate / 100,
    BarrelRate: hitter.BarrelRate / 100,
    HardHitRate: hitter.HardHitRate / 100,
    ExitVelo: (hitter.ExitVelo - 75) / (115 - 75), // Assuming range 75-115 mph
    LaunchAngle: (hitter.LaunchAngle + 30) / 60, // Assuming range -30 to 30 degrees
    FlyBallRate: hitter.FlyBallRate / 100,
    PullRate: hitter.PullRate / 100,
    HR_FB_Rate: hitter.HR_FB_Rate / 100,
    ISO: hitter.ISO / 0.300, // Assuming max ISO of .300
    PitcherHR_9: pitcher.PitcherHR_9 / 3, // Normalize around league average
    PitcherBarrelRate: pitcher.PitcherBarrelRate / 100,
    PitcherFBRate: pitcher.PitcherFBRate / 100,
    ParkFactor: parkFactor / 150 // Assuming max park factor of 150
  }

  // Calculate weighted sum
  let weightedSum = 0
  let totalWeight = 0

  for (const [key, value] of Object.entries(normalizedStats)) {
    const weight = weights[key as keyof Weights]
    weightedSum += value * weight
    totalWeight += weight
  }

  // Calculate final probability (0-1)
  const probability = weightedSum / totalWeight

  // Ensure probability is between 0 and 1
  return Math.max(0, Math.min(1, probability))
}

export async function POST(request: Request) {
  try {
    const { hitter, pitcher, parkFactor, weights } = await request.json()

    // Validate required fields
    if (!hitter || !pitcher || !parkFactor || !weights) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const probability = calculateHRProbability(hitter, pitcher, parkFactor, weights)

    return NextResponse.json({
      probability,
      probabilityPercent: (probability * 100).toFixed(1) + '%'
    })
  } catch (error) {
    console.error('Error calculating HR probability:', error)
    return NextResponse.json(
      { error: 'Failed to calculate HR probability' },
      { status: 500 }
    )
  }
} 