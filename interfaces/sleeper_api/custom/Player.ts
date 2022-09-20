import { ScoringSettings } from "../LeagueSettings";

export default class Player {
  public points_scored: number = 0;
  public points_projected: number = 0;
  public rosterId: number;
  public week: number;
  public id: string;

  constructor(rosterId: number, week: number, details: SleeperPlayerDetails) {
    this.id = details.player_id;
    this.rosterId = rosterId;
    this.week = week;
  }

  calculatePoints(playerMap: PlayerMap, leagueSettings: ScoringSettings) {
    const scoreDetails = playerMap.weekly_scores.get(this.week)?.get(this.id);
    const projectionDetails = playerMap.weekly_scores
      .get(this.week)
      ?.get(this.id);
    if (scoreDetails != undefined) {
      for (const [key, value] of Object.entries(scoreDetails)) {
        this.points_scored += value * (leagueSettings[key as keyof ScoringSettings] as number)
      }
    }

    if (projectionDetails != undefined) {
        for (const [key, value] of Object.entries(projectionDetails)) {
          this.points_projected += value * (leagueSettings[key as keyof ScoringSettings] as number)
        }
      }
  }
}

//There should only be one of these to hold the stats for all players and a single instance of their details
export class PlayerMap {
  public playerDetails: Map<string, SleeperPlayerDetails> = new Map();
  //The first number is the week number and the second map maps a player_id to their stats object for the week
  public weekly_scores: Map<number, Map<string, ScoringSettings>> = new Map();
  public weekly_projections: Map<number, Map<string, ScoringSettings>> =
    new Map();

  addPlayerDetails(player_id: string, playerDetails: SleeperPlayerDetails) {
    this.playerDetails.set(player_id, playerDetails);
  }

  addPlayerWeekStats(
    weekNumber: number,
    player_id: string,
    statObject: object
  ) {
    if (weekNumber in this.weekly_scores.keys) {
      this.weekly_scores.get(weekNumber)?.set(player_id, statObject);
    } else {
      this.weekly_scores.set(weekNumber, new Map());
      this.weekly_scores.get(weekNumber)?.set(player_id, statObject);
    }
  }

  addPlayerWeekProjections(
    weekNumber: number,
    player_id: string,
    statObject: object
  ) {
    if (weekNumber in this.weekly_scores.keys) {
      this.weekly_projections.get(weekNumber)?.set(player_id, statObject);
    } else {
      this.weekly_projections.set(weekNumber, new Map());
      this.weekly_projections.get(weekNumber)?.set(player_id, statObject);
    }
  }
}

export interface SleeperPlayerDetails {
  first_name: string;
  injury_start_date?: any;
  rotowire_id: number;
  gsis_id?: any;
  team?: any;
  age: number;
  birth_country?: any;
  espn_id: number;
  sportradar_id: string;
  injury_notes?: any;
  injury_status?: any;
  search_full_name: string;
  depth_chart_order?: any;
  swish_id?: any;
  birth_city?: any;
  full_name: string;
  stats_id?: any;
  hashtag: string;
  news_updated?: any;
  depth_chart_position?: any;
  pandascore_id?: any;
  years_exp: number;
  status: string;
  search_rank: number;
  position: string;
  injury_body_part?: any;
  rotoworld_id?: any;
  number: number;
  yahoo_id: number;
  height: string;
  high_school?: any;
  college: string;
  player_id: string;
  last_name: string;
  practice_description?: any;
  fantasy_data_id: number;
  search_first_name: string;
  metadata?: any;
  sport: string;
  birth_state?: any;
  active: boolean;
  birth_date: string;
  fantasy_positions: string[];
  weight: string;
  practice_participation?: any;
  search_last_name: string;
}
