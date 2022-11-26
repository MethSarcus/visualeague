import { standardDeviation } from "../../utility/rosterFunctions";
import { ScoringAct, ScoringSettings } from "../sleeper/LeagueSettings";
import League from "./League";

export default class SeasonPlayer {
  public playerScores: Map<number, number> = new Map();
  public playerProjectedScores: Map<number, number> = new Map();
  public roster_id: number;
  public weeks_played: number[] = [];
  public weeks_benched: number[] = [];
  public id: string;

  //These are subject to change
  public projected_points: number = 0;
  public points_scored: number = 0;
  public stdDev: number = 0;
  public rootMeanSquareError: number = 0;
  public avgPointsPerStart: number = 0;


  constructor(playerId: string, rosterId: number) {
    this.id = playerId;
    this.roster_id = rosterId;
  }

  addWeek(
    weekNumber: number,
    pointsScored: number,
    projectedPoints: number,
    wasStarted: boolean
  ) {
    this.points_scored += pointsScored;
    this.projected_points += projectedPoints;

    this.playerScores.set(weekNumber, pointsScored);
    this.playerProjectedScores.set(weekNumber, projectedPoints);

    if (wasStarted) {
      this.weeks_played.push(weekNumber);
    } else {
      this.weeks_benched.push(weekNumber);
    }
  }

  calcStarterStats() {
    
  }

  calcAdvancedStats() {
    let allActiveWeeks = this.weeks_played
      .concat(this.weeks_benched)
      .filter((weekNumber) => {
        return (
          this.playerProjectedScores.get(weekNumber) != undefined &&
          (this.playerProjectedScores.get(weekNumber) as number) > 0
        );
      }).sort((a: number, b: number) => {return a - b}) as number[];

    let pointValues = allActiveWeeks.map((value) =>
      this.playerScores.get(value)
    ) as number[];
    let projectedPointValues = allActiveWeeks.map((value) =>
    this.playerProjectedScores.get(value)
  ) as number[];
    this.stdDev = standardDeviation(pointValues);
    this.avgPointsPerStart = pointValues.reduce((a, b) => a + b, 0) / pointValues.length;

    let weeklyDiffs: Map<number, number> = new Map()
    allActiveWeeks.forEach((weekNum) => {
      weeklyDiffs.set(weekNum, this.playerScores.get(weekNum)! - this.playerProjectedScores.get(weekNum)!)
    })

    let squaredDiffSum = 0
    weeklyDiffs.forEach((diff, weekNum) => {
      squaredDiffSum += Math.pow(diff, 2)
    })

    squaredDiffSum = squaredDiffSum / (allActiveWeeks.length)
    
    this.rootMeanSquareError = Math.sqrt(squaredDiffSum)
  }

  
}
