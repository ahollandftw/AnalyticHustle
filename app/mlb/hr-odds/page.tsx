"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface Player {
  name: string;
  team: string;
  game: string;
  time: string;
  odds: string;
  season: {
    hr: number;
    pa: number;
    hrRate: string;
  };
}

export default function HROddsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/odds/hr');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          throw new Error('Expected array of players but received different data structure');
        }
        
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching odds data:', error);
        setError('Failed to load odds data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique teams for filter - only if players is an array
  const teams = Array.isArray(players) ? Array.from(new Set(players.map(player => player.team))) : [];

  // Filter players - only if players is an array
  const filteredPlayers = Array.isArray(players) ? players.filter(player => {
    const matchesSearch = 
      searchTerm === "" || 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = 
      selectedTeam === "All Teams" || 
      player.team === selectedTeam;

    return matchesSearch && matchesTeam;
  }) : [];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Home Run Odds</h1>
          <p className="text-sm text-muted-foreground mt-1">Today's home run odds from SportsRadar</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search players or teams..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Teams">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Game</TableHead>
              <TableHead>Odds</TableHead>
              <TableHead>Season HR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-xs text-muted-foreground">{player.team}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{player.game}</div>
                    <div className="text-xs text-muted-foreground">{player.time}</div>
                  </div>
                </TableCell>
                <TableCell>{player.odds}</TableCell>
                <TableCell>
                  <div>
                    <div>{player.season.hr}</div>
                    <div className="text-xs text-muted-foreground">{player.season.hrRate}</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>* Odds are provided by SportsRadar and are updated in real-time.</p>
      </div>
    </div>
  );
} 