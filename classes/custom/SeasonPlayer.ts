import { ScoringAct, ScoringSettings } from "../sleeper/LeagueSettings";
import { PlayerMap, SleeperPlayerDetails } from "./Player";



export default class SeasonPlayer {
  public details: SleeperPlayerDetails;
  public playerStats: Map<number, ScoringAct> = new Map()
  public playerProjections: Map<number, ScoringAct> = new Map()
  public projected_points: number = 0;
  public points_scored: number = 0;
  public games_played: number = 0;
  public roster_id: number;
  public weeks_played: number[] = []
  public id: string;

  constructor(rosterId: number, details: SleeperPlayerDetails) {
    this.id = details.player_id;
    this.details = details
    this.roster_id = rosterId;
  }

  addWeek(weekNumber: number, pointsScored: number, projectedPoints: number, playerStats: ScoringAct, playerProjections: ScoringAct) {
    this.weeks_played.push(weekNumber)
    this.points_scored += pointsScored
    this.projected_points += projectedPoints
    this.playerStats.set(weekNumber, playerStats)
    this.playerProjections.set(weekNumber, playerProjections)
    this.games_played += 1
  }
}
