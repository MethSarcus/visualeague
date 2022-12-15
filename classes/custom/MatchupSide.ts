import { SleeperPlayerDetails } from "./Player";
import { LeagueSettings } from "../sleeper/LeagueSettings";
import { SleeperMatchup } from "../sleeper/SleeperMatchup";
import {
  getOptimalLineup,
  getOptimalProjectedLineup,
  getRosterSlotPositions,
  LINEUP_POSITION,
  POSITION,
} from "../../utility/rosterFunctions";
import { MatchupPlayer } from "./MatchupPlayer";

export class MatchupSide {
  weekNumber: number
  pf: number = 0;
  pp: number = 0;
  opslap: number = 0;
  gp: number = 0;
  projectedScore: number = 0;
  roster_id: number;
  starters: MatchupPlayer[];
  bench: MatchupPlayer[];
  matchup_id: number;
  custom_points: number = 0;
  gut_plays: number = 0;
  position_scores: Map<POSITION, number> = new Map();
  position_projected_scores: Map<POSITION, number> = new Map();
  position_starts: Map<POSITION, number> = new Map();
  

  constructor(
    weekNumber: number,
    matchup: SleeperMatchup,
    stats: Map<string, any>,
    projections: Map<string, any>,
    playerDetails: Map<string, SleeperPlayerDetails>,
    settings: LeagueSettings,
    filteredPlayers?: string[]
  ) {
    this.weekNumber = weekNumber
    this.roster_id = matchup.roster_id;
    this.matchup_id = matchup.matchup_id;
    this.starters = matchup.starters.map((playerId, index) => {
      if (playerId == "0") {
        return new MatchupPlayer(playerId);
      } else {
        return new MatchupPlayer(
          playerId,
          settings.roster_positions?.at(index),
          stats.get(playerId),
          projections.get(playerId),
          playerDetails.get(playerId)!.fantasy_positions,
          settings.scoring_settings
        );
      }
    });
    this.bench = matchup.players
      .filter((player) => !matchup.starters.includes(player))
      .map((playerId, index) => {
        return new MatchupPlayer(
          playerId,
          "BN",
          stats.get(playerId),
          projections.get(playerId),
          playerDetails.get(playerId)!.fantasy_positions,
          settings.scoring_settings
        );
      });
    if (matchup.custom_points) {
      this.custom_points = matchup.custom_points;
    }
    this.calcPoints(settings, filteredPlayers);
  }

  calcPoints(settings: LeagueSettings, filteredPlayers?: string[]) {
    this.starters.forEach((starter) => {
      this.pf += starter.score;
      this.projectedScore += starter.projectedScore;
      let starterPosition = starter.eligiblePositions!![0] as POSITION;
      if (this.position_starts.has(starterPosition)) {
        this.position_starts.set(starterPosition, (this.position_starts.get(starterPosition) as number) + 1);
      } else {
        this.position_starts.set(starterPosition, 1);
      }
      if (starterPosition) {
        if (
          this.position_scores.has(starterPosition) &&
          this.position_scores.get(starterPosition) != undefined
        ) {
          let positionScore = (this.position_scores.get(starterPosition) as number) + starter.score;
          let positionProjectedScore = (this.position_projected_scores.get(starterPosition) as number) + starter.projectedScore;
          this.position_scores.set(starterPosition, positionScore);
          this.position_projected_scores.set(starterPosition, positionProjectedScore);
        } else {
          this.position_scores.set(starterPosition, starter.score);
          this.position_projected_scores.set(starterPosition, starter.projectedScore);
        }
      }
    });
    this.pf += this.custom_points;

    if (settings.roster_positions) {
      let startingLineupSlots = settings.roster_positions
        .map((pos) => {
          return pos as LINEUP_POSITION;
        })
        .filter((pos) => {
          return pos != LINEUP_POSITION.BN && pos != LINEUP_POSITION.IR;
        });

      if (startingLineupSlots != undefined && startingLineupSlots.length > 0) {
        let eligiblePlayers = [this.starters, this.bench].flat().filter(player => !filteredPlayers?.includes(player?.playerId ?? "-1"))
        let optimalLineup = getOptimalLineup(
          eligiblePlayers,
          startingLineupSlots
        );
        let optimalProjectedLineup = getOptimalProjectedLineup(
          eligiblePlayers,
          startingLineupSlots
        );

        optimalLineup.forEach((starter) => {
          this.pp += starter.score;
        });

        optimalProjectedLineup.forEach((starter) => {
          this.opslap += starter.score;
        });

        this.gp = this.pf - this.opslap;
        this.gut_plays += this.getGutPlays(
          this.starters,
          optimalProjectedLineup
        ).length;
      }
    }
  }

  getGutPlays(
    lineup: MatchupPlayer[],
    optimalProjectedLineup: MatchupPlayer[]
  ) {
    let gutPlays = lineup.filter((player) => {
      return !optimalProjectedLineup.includes(player);
    });

    return gutPlays;
  }

  getTeamBreakdownPieChart() {
    
  }
}
