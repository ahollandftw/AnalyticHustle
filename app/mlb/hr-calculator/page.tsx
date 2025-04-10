"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import WeightSliders from "@/components/WeightSliders"
import { useAuth } from "@/components/auth-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Plus } from "lucide-react"

// Import the Weights type from the component file
type Weights = {
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

type WeightPreset = {
  id: string;
  name: string;
  weights: Weights;
  isDefault?: boolean;
}

const defaultPreset: WeightPreset = {
  id: 'default',
  name: 'Default Weights',
  weights: {
    HR_rate: 0.15,
    BarrelRate: 0.12,
    HardHitRate: 0.1,
    ExitVelo: 0.08,
    LaunchAngle: 0.05,
    FlyBallRate: 0.07,
    PullRate: 0.05,
    HR_FB_Rate: 0.05,
    xHR: 0.1,
    ISO: 0.08,
    RecentHRs: 0.05,
    PitcherHR_9: 0.1,
    PitcherBarrelRate: 0.05,
    PitcherFBRate: 0.05,
    ParkFactor: 0.05
  },
  isDefault: true
}

export default function HRCalculatorPage() {
  const { user } = useAuth()
  const [weights, setWeights] = useState<Weights | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('default')
  const [newPresetName, setNewPresetName] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [userPresets, setUserPresets] = useState<WeightPreset[]>([])
  
  // Fetch user's weight presets
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/weight-presets?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setUserPresets(data))
        .catch(error => console.error('Failed to load presets:', error))
    }
  }, [user?.id])

  // Combine default preset with user presets
  const allPresets = [defaultPreset, ...userPresets]

  const handleWeightsChange = (newWeights: Weights) => {
    setWeights(newWeights)
  }

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId)
    const preset = allPresets.find(p => p.id === presetId)
    if (preset) {
      setWeights(preset.weights)
    }
  }

  const saveNewPreset = async () => {
    if (!user || !weights || !newPresetName.trim()) return

    try {
      const response = await fetch('/api/weight-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPresetName,
          weights,
          userId: user.id
        })
      })
      
      if (!response.ok) throw new Error('Failed to save preset')
      
      const newPreset = await response.json()
      setUserPresets([...userPresets, newPreset])
      setNewPresetName('')
      setIsCreatingNew(false)
    } catch (error) {
      console.error('Failed to save preset:', error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">HR Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="mb-4 space-y-4">
            <div className="flex items-center gap-2">
              <Select value={selectedPresetId} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select weights" />
                </SelectTrigger>
                <SelectContent>
                  {allPresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {user && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCreatingNew(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isCreatingNew && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New preset name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={saveNewPreset}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <WeightSliders onWeightsChange={handleWeightsChange} />
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          <div className="space-y-4">
            {weights && (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(weights, null, 2)}
              </pre>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
} 