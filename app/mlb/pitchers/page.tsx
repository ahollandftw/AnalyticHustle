"use client"

import { useState } from "react"
import { useData } from "@/lib/hooks/use-data"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Pitcher {
  name: string
  team: string
  position: string
  stats: {
    era?: number
    whip?: number
    ip?: number
    k9?: number
    bb9?: number
    fip?: number
    wins?: number
    losses?: number
    saves?: number
    holds?: number
  }
}

export default function PitchersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: pitchers, loading, error } = useData<Pitcher[]>({ type: "pitchers" })

  const filteredPitchers = pitchers?.filter(pitcher => 
    pitcher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pitcher.team.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Error loading pitchers: {error}</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">MLB Pitchers</h1>
        <Input
          type="search"
          placeholder="Search pitchers..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">ERA</TableHead>
                <TableHead className="text-right">WHIP</TableHead>
                <TableHead className="text-right">IP</TableHead>
                <TableHead className="text-right">K/9</TableHead>
                <TableHead className="text-right">BB/9</TableHead>
                <TableHead className="text-right">FIP</TableHead>
                <TableHead className="text-right">W-L</TableHead>
                <TableHead className="text-right">SV/HLD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPitchers.map((pitcher, index) => (
                <TableRow key={`${pitcher.name}-${pitcher.team}-${index}`}>
                  <TableCell className="font-medium">{pitcher.name}</TableCell>
                  <TableCell>{pitcher.team}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{pitcher.position}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.era?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.whip?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.ip?.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.k9?.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.bb9?.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.fip?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.wins}-{pitcher.stats.losses}
                  </TableCell>
                  <TableCell className="text-right">
                    {pitcher.stats.saves}/{pitcher.stats.holds}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
} 