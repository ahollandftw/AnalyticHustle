import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { cache } from "react"
import { fetchMLBLineups } from '@/lib/mlb'

// Cache the file reading operation
const readJsonFile = cache(async (filename: string) => {
  const filePath = path.join(process.cwd(), "Data", filename);
  console.log('Reading file from:', filePath);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(data);
    console.log('Successfully read and parsed JSON data');
    return jsonData;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
})

// Helper to merge duplicate player entries
function mergeDuplicatePlayers(players: any[]) {
  const playerMap = new Map()
  
  players.forEach(player => {
    const key = `${player.name}-${player.team}`.toLowerCase()
    if (playerMap.has(key)) {
      // Merge stats, taking the most recent or highest value
      const existing = playerMap.get(key)
      playerMap.set(key, {
        ...existing,
        ...player,
        // Add any specific stat merging logic here
        stats: {
          ...existing.stats,
          ...player.stats
        }
      })
    } else {
      playerMap.set(key, player)
    }
  })

  return Array.from(playerMap.values())
}

interface Pitcher {
  name: string
  pitcherHand: string
  pitcherRecord: string
  pitcherEra: string
}

interface Player {
  name: string;
  position: string;
  battingOrder?: number;
  stats?: {
    avg: string;
    hr: number;
    rbi: number;
  };
}

interface Team {
  name: string;
  lineup: Player[];
  startingPitcher?: Player;
  projectedLineup?: Player[];
}

interface Game {
  time: string
  weather: string
  away: Team
  home: Team
}

interface MLBTeam {
  team: {
    name: string;
  };
  leagueRecord: {
    wins: number;
    losses: number;
  };
}

interface MLBGame {
  gamePk: number;
  gameDate: string;
  status: {
    detailedState: string;
  };
  teams: {
    away: {
      team: {
        name: string;
      };
      leagueRecord: {
        wins: number;
        losses: number;
      };
    };
    home: {
      team: {
        name: string;
      };
      leagueRecord: {
        wins: number;
        losses: number;
      };
    };
  };
  venue: {
    name: string;
  };
}

interface MLBPlayer {
  id: number;
  fullName: string;
  primaryPosition: {
    abbreviation: string;
  };
  batSide?: {
    code: string;
  };
  pitchHand?: {
    code: string;
  };
}

interface MLBLineupData {
  dates?: Array<{
    games?: Array<{
      lineups?: {
        awayPlayers?: MLBPlayer[];
        homePlayers?: MLBPlayer[];
      };
    }>;
  }>;
}

interface TransformedPlayer {
  player: string;
  ID: string;
  position: string;
  bats: string;
  batting: number;
  isProjected?: boolean;
}

interface TransformedTeam {
  name: string;
  record: string;
  lineup: TransformedPlayer[];
}

interface TransformedGame {
  id: string;
  startTime: string;
  awayTeam: Team;
  homeTeam: Team;
}

const transformLineup = (players: any[]): Player[] => {
  if (!Array.isArray(players)) return [];
  
  return players.map((player, index) => ({
    name: player.fullName || player.name || 'Unknown Player',
    position: player.position?.abbreviation || player.position || 'Unknown',
    battingOrder: index + 1,
    stats: player.stats ? {
      avg: player.stats.batting?.avg || '.000',
      hr: player.stats.batting?.homeRuns || 0,
      rbi: player.stats.batting?.rbi || 0
    } : undefined
  }));
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sport = searchParams.get('sport');

    if (!type || !sport) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and sport' },
        { status: 400 }
      );
    }

    if ((type === 'games' || type === 'lineups') && sport === 'mlb') {
      console.log('Fetching MLB data...');
      const data = await fetchMLBLineups();
      console.log('MLB data fetched:', JSON.stringify(data, null, 2));
      return NextResponse.json(data);
    }

    if (type.toLowerCase() === 'parkfactors' && sport === 'mlb') {
      console.log('Loading park factors data...');
      try {
        const data = await readJsonFile('ParkFactors.json');
        if (!data) {
          throw new Error('No data returned from readJsonFile');
        }
        console.log('Park factors data loaded:', data.length, 'entries');
        return NextResponse.json(data);
      } catch (error) {
        console.error('Error loading park factors:', error);
        return NextResponse.json(
          { error: 'Failed to load park factors data' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid type or sport parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in data route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
