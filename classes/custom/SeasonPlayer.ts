import {
  LINEUP_POSITION,
  POSITION,
  standardDeviation,
} from "../../utility/rosterFunctions";
import { ScoringAct, ScoringSettings } from "../sleeper/LeagueSettings";
import League from "./League";

export default class SeasonPlayer {
  public playerScores: Map<number, number> = new Map();
  public playerProjectedScores: Map<number, number> = new Map();
  public roster_id: number;
  public lineupPosition: LINEUP_POSITION;
  public starter_points: number = 0;
  public bench_points: number = 0;
  public positions: POSITION[];
  public weeks_played: number[] = [];
  public weeks_benched: number[] = [];
  public id: string;
  public teamPositionRank: number = 0

  //These are subject to change
  public projected_points: number = 0;
  public points_scored: number = 0;
  public stdDev: number = 0;
  public rootMeanSquareError: number = 0;
  public avgPointsPerStart: number = 0;
  public avgPointsPerBench: number = 0;

  constructor(
    playerId: string,
    rosterId: number,
    position: LINEUP_POSITION,
    eligiblePositions: POSITION[]
  ) {
    this.id = playerId;
    this.roster_id = rosterId;
    this.lineupPosition = position;
    this.positions = eligiblePositions;
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
      this.starter_points += pointsScored
    } else {
      this.weeks_benched.push(weekNumber);
      this.bench_points += pointsScored
    }
  }

  clearStats() {
    this.stdDev = 0
    this.rootMeanSquareError = 0
    this.avgPointsPerStart = 0
    this.avgPointsPerBench = 0
  }

  calcStats() {
    this.clearStats()
    this.calcStarterStats()
    this.calcBenchStats()
    this.calcCombinedStats()
  }

  calcStarterStats() {
    let startWeeks = this.weeks_played
      .filter((weekNumber) => {
        return (
          this.playerProjectedScores.get(weekNumber) != undefined &&
          (this.playerProjectedScores.get(weekNumber) as number) > 0
        );
      })
      .sort((a: number, b: number) => {
        return a - b;
      }) as number[];

    let pointValues = startWeeks.map((value) =>
      this.playerScores.get(value)
    ) as number[];

    this.avgPointsPerStart = pointValues.reduce((a, b) => a + b, 0) / pointValues.length;
  }

  calcBenchStats() {
    let benchWeeks = this.weeks_benched
      .filter((weekNumber) => {
        return (
          this.playerProjectedScores.get(weekNumber) != undefined &&
          (this.playerProjectedScores.get(weekNumber) as number) > 0
        );
      })
      .sort((a: number, b: number) => {
        return a - b;
      }) as number[];
    let pointValues = benchWeeks.map((value) =>
      this.playerScores.get(value)
    ) as number[];

    this.avgPointsPerBench =
      pointValues.reduce((a, b) => a + b, 0) / pointValues.length;
  }

  calcCombinedStats() {
    let allActiveWeeks = this.weeks_played
      .concat(this.weeks_benched)
      .filter((weekNumber) => {
        return (
          this.playerProjectedScores.get(weekNumber) != undefined &&
          (this.playerProjectedScores.get(weekNumber) as number) > 0
        );
      })
      .sort((a: number, b: number) => {
        return a - b;
      }) as number[];

    let pointValues = allActiveWeeks.map((value) =>
      this.playerScores.get(value)
    ) as number[];
    
    this.stdDev = standardDeviation(pointValues);
    let weeklyDiffs: Map<number, number> = new Map();
    allActiveWeeks.forEach((weekNum) => {
      weeklyDiffs.set(
        weekNum,
        this.playerScores.get(weekNum)! -
          this.playerProjectedScores.get(weekNum)!
      );
    });

    let squaredDiffSum = 0;
    weeklyDiffs.forEach((diff, weekNum) => {
      squaredDiffSum += Math.pow(diff, 2);
    });

    squaredDiffSum = squaredDiffSum / allActiveWeeks.length;

    this.rootMeanSquareError = Math.sqrt(squaredDiffSum);
  }
}
