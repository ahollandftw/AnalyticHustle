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
import { Badge } from "@/components/ui/badge"

interface Player {
  name: string;
  team: string;
  game: string;
  time: string;
  odds: {
    draftkings: string;
    fanduel: string;
    betmgm: string;
    caesars: string;
  };
  bestOdds: string;
  bestBook: string;
  modelProb: string;
  value: string;
  season: {
    hr: number;
    pa: number;
    hrRate: string;
  };
}

export default function LiveOddsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [sortBy, setSortBy] = useState("value");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/odds/hr');
        const data = await response.json();
        console.log('Players with odds:', data);
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching odds data:', error);
      }
    };

    fetchData();
  }, []);

  // Get unique teams for filter
  const teams = Array.from(new Set(players.map(player => player.team)));

  // Filter and sort players
  const filteredPlayers = players
    .filter(player => {
      const matchesSearch = 
        searchTerm === "" || 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTeam = 
        selectedTeam === "All Teams" || 
        player.team === selectedTeam;

      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => {
      if (sortBy === "value") {
        return parseFloat(b.value.replace('+', '')) - parseFloat(a.value.replace('+', ''));
      } else if (sortBy === "odds") {
        return parseFloat(b.bestOdds.replace('+', '')) - parseFloat(a.bestOdds.replace('+', ''));
      } else if (sortBy === "probability") {
        return parseFloat(b.modelProb) - parseFloat(a.modelProb);
      }
      return 0;
    });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Home Run Live Odds</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare home run odds across major sportsbooks</p>
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
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value">Best Value</SelectItem>
            <SelectItem value="odds">Best Odds</SelectItem>
            <SelectItem value="probability">Highest Probability</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Game</TableHead>
              <TableHead>DraftKings</TableHead>
              <TableHead>FanDuel</TableHead>
              <TableHead>BetMGM</TableHead>
              <TableHead>Caesars</TableHead>
              <TableHead>Best Odds</TableHead>
              <TableHead>Model Prob</TableHead>
              <TableHead>Value</TableHead>
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
                <TableCell>{player.odds.draftkings}</TableCell>
                <TableCell>{player.odds.fanduel}</TableCell>
                <TableCell>{player.odds.betmgm}</TableCell>
                <TableCell>{player.odds.caesars}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {player.bestOdds}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{player.bestBook}</span>
                  </div>
                </TableCell>
                <TableCell>{player.modelProb}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      parseFloat(player.value) > 3
                        ? "bg-green-500"
                        : parseFloat(player.value) > 1
                          ? "bg-green-300"
                          : "bg-gray-200 text-gray-800"
                    }
                  >
                    {player.value}
                  </Badge>
                </TableCell>
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
        <p>
          * Odds are updated in real-time. Model probability is based on our proprietary algorithm that factors in
          player performance, matchups, ballpark factors, and weather conditions.
        </p>
      </div>
    </div>
  );
} 