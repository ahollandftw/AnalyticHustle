interface Player {
  id: string;
  name: string;
  position: string;
  bats: string;
  stats: {
    avg: string;
    obp: string;
    slg: string;
    ops: string;
    hr: number;
    rbi: number;
    so: number;
    bb: number;
    pa: number;
  };
}

interface Pitcher {
  id: string;
  name: string;
  throws: string;
  stats: {
    era: string;
    whip: string;
    ip: number;
    so: number;
    bb: number;
    hr: number;
    wins: number;
    losses: number;
  };
}

interface Team {
  id: string;
  name: string;
  lineup: Player[];
  startingPitcher: Pitcher | null;
}

interface Game {
  id: string;
  startTime: string;
  status: string;
  inning?: number;
  isTopInning?: boolean;
  awayTeam: Team;
  homeTeam: Team;
  weather?: {
    temperature: number;
    condition: string;
    windSpeed: number;
    windDirection: string;
  };
  odds?: {
    spread: string;
    total: number;
  };
}

export async function fetchMLBLineups(): Promise<Game[]> {
  try {
    // Get today's date for games
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    // Get yesterday's date for projected lineups
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];

    // Fetch today's games
    const todayResponse = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${formattedToday}&hydrate=probablePitcher(stats),lineups,team,game(content(summary,media(epg))),linescore,weather,odds`
    );

    if (!todayResponse.ok) {
      throw new Error(`MLB API returned ${todayResponse.status}`);
    }

    const todayData = await todayResponse.json();
    const todayGames = todayData.dates[0]?.games || [];

    // Fetch yesterday's games for projected lineups
    const yesterdayResponse = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${formattedYesterday}&hydrate=lineups,team`
    );

    if (!yesterdayResponse.ok) {
      throw new Error(`MLB API returned ${yesterdayResponse.status}`);
    }

    const yesterdayData = await yesterdayResponse.json();
    const yesterdayGames = yesterdayData.dates[0]?.games || [];

    // Create a map of team IDs to their last lineups
    const teamLastLineups = new Map();
    yesterdayGames.forEach((game: any) => {
      if (game.lineups?.awayPlayers) {
        teamLastLineups.set(game.teams.away.team.id, game.lineups.awayPlayers);
      }
      if (game.lineups?.homePlayers) {
        teamLastLineups.set(game.teams.home.team.id, game.lineups.homePlayers);
      }
    });

    return todayGames.map((game: any) => {
      const transformLineup = (players: any[] = []): Player[] => {
        return players.map(player => ({
          id: player.id?.toString() || player.person?.id?.toString(),
          name: player.fullName || player.person?.fullName || 'Unknown Player',
          position: player.position?.abbreviation || player.position?.code || 'Unknown',
          bats: player.batSide?.code || 'Unknown',
          stats: {
            avg: player.seasonStats?.batting?.avg || '.000',
            obp: player.seasonStats?.batting?.obp || '.000',
            slg: player.seasonStats?.batting?.slg || '.000',
            ops: player.seasonStats?.batting?.ops || '.000',
            hr: player.seasonStats?.batting?.homeRuns || 0,
            rbi: player.seasonStats?.batting?.rbi || 0,
            so: player.seasonStats?.batting?.strikeOuts || 0,
            bb: player.seasonStats?.batting?.baseOnBalls || 0,
            pa: player.seasonStats?.batting?.plateAppearances || 0
          }
        }));
      };

      const transformPitcher = (pitcher: any): Pitcher | null => {
        if (!pitcher) return null;
        return {
          id: pitcher.id?.toString(),
          name: pitcher.fullName || 'Unknown Pitcher',
          throws: pitcher.pitchHand?.code || 'Unknown',
          stats: {
            era: pitcher.stats?.pitching?.era || '0.00',
            whip: pitcher.stats?.pitching?.whip || '0.00',
            ip: pitcher.stats?.pitching?.inningsPitched || 0,
            so: pitcher.stats?.pitching?.strikeOuts || 0,
            bb: pitcher.stats?.pitching?.baseOnBalls || 0,
            hr: pitcher.stats?.pitching?.homeRuns || 0,
            wins: pitcher.stats?.pitching?.wins || 0,
            losses: pitcher.stats?.pitching?.losses || 0
          }
        };
      };

      // Get confirmed or projected lineups for each team
      const awayTeamId = game.teams.away.team.id;
      const homeTeamId = game.teams.home.team.id;
      
      let awayLineup: Player[] = [];
      let homeLineup: Player[] = [];

      // Check if today's lineups are available
      if (game.lineups?.awayPlayers && game.lineups.awayPlayers.length > 0) {
        awayLineup = transformLineup(game.lineups.awayPlayers);
      } else {
        // Use yesterday's lineup as projection if available
        const yesterdayAwayLineup = teamLastLineups.get(awayTeamId);
        if (yesterdayAwayLineup) {
          awayLineup = transformLineup(yesterdayAwayLineup);
        }
      }

      if (game.lineups?.homePlayers && game.lineups.homePlayers.length > 0) {
        homeLineup = transformLineup(game.lineups.homePlayers);
      } else {
        // Use yesterday's lineup as projection if available
        const yesterdayHomeLineup = teamLastLineups.get(homeTeamId);
        if (yesterdayHomeLineup) {
          homeLineup = transformLineup(yesterdayHomeLineup);
        }
      }

      return {
        id: game.gamePk.toString(),
        startTime: game.gameDate,
        awayTeam: {
          id: awayTeamId.toString(),
          name: game.teams.away.team.name,
          lineup: awayLineup,
          startingPitcher: transformPitcher(game.teams.away.probablePitcher)
        },
        homeTeam: {
          id: homeTeamId.toString(),
          name: game.teams.home.team.name,
          lineup: homeLineup,
          startingPitcher: transformPitcher(game.teams.home.probablePitcher)
        }
      };
    });
  } catch (error) {
    console.error('Error fetching MLB lineups:', error);
    throw error;
  }
} 