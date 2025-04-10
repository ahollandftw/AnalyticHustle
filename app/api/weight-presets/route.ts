import { NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/file-utils"

// Type for the weight preset data structure
interface WeightPreset {
  id: string
  name: string
  weights: {
    HR_rate: number
    BarrelRate: number
    HardHitRate: number
    ExitVelo: number
    LaunchAngle: number
    FlyBallRate: number
    PullRate: number
    HR_FB_Rate: number
    xHR: number
    ISO: number
    RecentHRs: number
    PitcherHR_9: number
    PitcherBarrelRate: number
    PitcherFBRate: number
    ParkFactor: number
  }
  userId: string
  createdAt: string
}

// Generate a unique ID using timestamp and random number
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const presets = await readJsonFile('WeightPresets.json')
    const userPresets = presets.filter((preset: WeightPreset) => preset.userId === userId)
    return NextResponse.json(userPresets)
  } catch (error) {
    console.error('Error reading weight presets:', error)
    return NextResponse.json({ error: 'Failed to load weight presets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, weights, userId } = await request.json()

    if (!name || !weights || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newPreset: WeightPreset = {
      id: generateId(),
      name,
      weights,
      userId,
      createdAt: new Date().toISOString()
    }

    // Read existing presets
    let presets: WeightPreset[] = []
    try {
      presets = await readJsonFile('WeightPresets.json')
    } catch {
      // File doesn't exist yet, start with empty array
    }

    // Add new preset
    presets.push(newPreset)

    // Save updated presets
    await writeJsonFile('WeightPresets.json', presets)

    return NextResponse.json(newPreset)
  } catch (error) {
    console.error('Error saving weight preset:', error)
    return NextResponse.json({ error: 'Failed to save weight preset' }, { status: 500 })
  }
} 