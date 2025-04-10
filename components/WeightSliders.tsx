"use client"

import React, { useState, useEffect } from 'react';

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

const defaultWeights: Weights = {
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
};

interface WeightSlidersProps {
  onWeightsChange: (weights: Weights) => void;
}

const WeightSliders: React.FC<WeightSlidersProps> = ({ onWeightsChange }) => {
  const [weights, setWeights] = useState<Weights>(defaultWeights);

  const updateWeight = (key: keyof Weights, value: number) => {
    const updated = { ...weights, [key]: value };
    setWeights(updated);
    onWeightsChange(updated);
  };

  useEffect(() => {
    onWeightsChange(weights);
  }, []); // send initial values once

  return (
    <div>
      <h4>Adjust Stat Weights</h4>
      {(Object.keys(weights) as Array<keyof Weights>).map(key => (
        <div key={key} className="mb-2">
          <label className="block text-sm font-medium mb-1">{key}: {weights[key].toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="0.25"
            step="0.01"
            value={weights[key]}
            onChange={(e) => updateWeight(key, parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};

export default WeightSliders; 