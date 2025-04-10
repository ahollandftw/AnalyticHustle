interface Player {
  name: string;
  position: string;
  battingOrder?: number;
  stats?: {
    avg: string;
    hr: number;
    rbi: number;
  };
  isProjected?: boolean;
}

interface Team {
  name: string;
  lineup: Player[];
  startingPitcher?: Player;
  projectedLineup?: Player[];
  score?: number;
  record?: string;
  moneyLine?: number;
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
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${formattedToday}&hydrate=probablePitcher,lineups,team,game(content(summary,media(epg))),linescore,weather,odds`
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
      const transformLineup = (players: any[] = [], isProjected = false) => {
        return players.map(player => ({
          name: player.fullName,
          position: player.position?.abbreviation || '',
          battingOrder: player.battingOrder,
          stats: {
            avg: player.seasonStats?.batting?.avg || '.000',
            hr: player.seasonStats?.batting?.homeRuns || 0,
            rbi: player.seasonStats?.batting?.rbi || 0
          },
          isProjected
        }));
      };

      // Get confirmed or projected lineups for each team
      const awayTeamId = game.teams.away.team.id;
      const homeTeamId = game.teams.home.team.id;
      
      let awayLineup: Player[] = [];
      let homeLineup: Player[] = [];

      // Check if today's lineups are available
      if (game.lineups?.awayPlayers && game.lineups.awayPlayers.length > 0) {
        awayLineup = transformLineup(game.lineups.awayPlayers, false);
      } else {
        // Use yesterday's lineup as projection if available
        const yesterdayAwayLineup = teamLastLineups.get(awayTeamId);
        if (yesterdayAwayLineup) {
          awayLineup = transformLineup(yesterdayAwayLineup, true);
        }
      }

      if (game.lineups?.homePlayers && game.lineups.homePlayers.length > 0) {
        homeLineup = transformLineup(game.lineups.homePlayers, false);
      } else {
        // Use yesterday's lineup as projection if available
        const yesterdayHomeLineup = teamLastLineups.get(homeTeamId);
        if (yesterdayHomeLineup) {
          homeLineup = transformLineup(yesterdayHomeLineup, true);
        }
      }

      const awayTeam = {
        name: game.teams.away.team.name,
        record: `${game.teams.away.leagueRecord?.wins || 0}-${game.teams.away.leagueRecord?.losses || 0}`,
        moneyLine: game.teams.away.odds?.moneyLine,
        startingPitcher: game.teams.away.probablePitcher ? {
          name: game.teams.away.probablePitcher.fullName,
          position: 'P',
          stats: {
            avg: '.000',
            hr: 0,
            rbi: 0
          }
        } : undefined,
        lineup: awayLineup,
        score: game.linescore?.teams?.away?.runs
      };

      const homeTeam = {
        name: game.teams.home.team.name,
        record: `${game.teams.home.leagueRecord?.wins || 0}-${game.teams.home.leagueRecord?.losses || 0}`,
        moneyLine: game.teams.home.odds?.moneyLine,
        startingPitcher: game.teams.home.probablePitcher ? {
          name: game.teams.home.probablePitcher.fullName,
          position: 'P',
          stats: {
            avg: '.000',
            hr: 0,
            rbi: 0
          }
        } : undefined,
        lineup: homeLineup,
        score: game.linescore?.teams?.home?.runs
      };

      return {
        id: game.gamePk.toString(),
        status: game.status.abstractGameState,
        startTime: game.gameDate,
        inning: game.linescore?.currentInning,
        isTopInning: game.linescore?.isTopInning,
        awayTeam,
        homeTeam,
        weather: game.weather ? {
          temperature: game.weather.temp,
          condition: game.weather.condition,
          windSpeed: game.weather.wind,
          windDirection: game.weather.windDirection
        } : undefined,
        odds: game.odds ? {
          spread: `${game.odds.overUnder}`,
          total: parseFloat(game.odds.overUnder)
        } : undefined
      };
    });
  } catch (error) {
    console.error('Error fetching MLB lineups:', error);
    throw error;
  }
} 