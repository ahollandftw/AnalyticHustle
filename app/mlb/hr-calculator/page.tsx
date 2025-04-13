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
import { Slider } from "@/components/ui/slider"

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
  const [weights, setWeights] = useState<Weights>(defaultPreset.weights)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('default')
  const [newPresetName, setNewPresetName] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [userPresets, setUserPresets] = useState<WeightPreset[]>([])
  const [variance, setVariance] = useState(0)
  const [projections, setProjections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user's weight presets
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/weight-presets?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setUserPresets(data))
        .catch(error => console.error('Failed to load presets:', error))
    }
  }, [user?.id])

  // Update projections whenever weights or variance changes
  useEffect(() => {
    const updateProjections = async () => {
      if (!weights) return
      
      setIsLoading(true)
      try {
        const response = await fetch('/api/mlb/hr-probability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weights, variance })
        })
        
        if (!response.ok) throw new Error('Failed to fetch projections')
        
        const data = await response.json()
        setProjections(data)
      } catch (error) {
        console.error('Error updating projections:', error)
      } finally {
        setIsLoading(false)
      }
    }

    updateProjections()
  }, [weights, variance])

  // Combine default preset with user presets
  const allPresets = [defaultPreset, ...userPresets]

  const handleWeightsChange = (newWeights: Weights) => {
    setWeights(newWeights)
    // Mark as custom by deselecting current preset
    setSelectedPresetId('')
  }

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId)
    const preset = allPresets.find(p => p.id === presetId)
    if (preset) {
      // Reset completely to the preset weights
      setWeights({...preset.weights})
      // Reset variance when selecting a preset
      setVariance(0)
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
      setSelectedPresetId(newPreset.id)
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
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Variance</h2>
            <div className="flex items-center gap-4">
              <label htmlFor="variance" className="text-sm font-medium w-40">
                Variance: {Math.round(variance * 100)}%
              </label>
              <Slider
                id="variance"
                min={0}
                max={0.5}
                step={0.01}
                value={[variance]}
                onValueChange={([value]) => setVariance(value)}
                className="w-[300px]"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Adjust variance to see how random factors might affect HR probabilities (0-50%)
            </p>
          </div>

          <div className="mb-4 space-y-4">
            <div className="flex items-center gap-2">
              <Select value={selectedPresetId} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Custom Weights" />
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
                  disabled={!weights}
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
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={saveNewPreset}
                  disabled={!newPresetName.trim()}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreatingNew(false)
                    setNewPresetName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <WeightSliders 
            onWeightsChange={handleWeightsChange} 
            currentWeights={weights}
            isPreset={selectedPresetId !== ''}
          />
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Projections</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div>Loading projections...</div>
            ) : projections.length > 0 ? (
              <div className="overflow-auto max-h-[600px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      <th className="text-left p-2">Player</th>
                      <th className="text-right p-2">HR Probability</th>
                      {variance > 0 && (
                        <th className="text-right p-2">Range</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {projections.map((player, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{player.name}</td>
                        <td className="text-right p-2">
                          {(player.probability * 100).toFixed(1)}%
                        </td>
                        {variance > 0 && (
                          <td className="text-right p-2">
                            {(player.probability * (1 - variance) * 100).toFixed(1)}% - 
                            {(player.probability * (1 + variance) * 100).toFixed(1)}%
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No projections available</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
} 