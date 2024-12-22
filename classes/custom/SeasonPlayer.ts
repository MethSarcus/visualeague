import {
  LINEUP_POSITION,
  POSITION,
  standardDeviation,
} from "../../utility/rosterFunctions";
import { ScoringAct, ScoringSettings } from "../sleeper/LeagueSettings";
import League from "./League";

export default class SeasonPlayer {
  public roster_id: number;
  public lineupPosition: LINEUP_POSITION;
  public starter_points: number = 0;
  public bench_points: number = 0;
  public positions: POSITION[];
  public weeks_played: number[] = [];
  public weeks_benched: number[] = [];
  public id: string;
  public teamPositionRank: number = 0 //What positional rank the player is on the team it plays for

  //These are subject to change
  public projected_points: number = 0;
  public points_scored: number = 0;
  public stdDev: number = 0;
  public rootMeanSquareError: number = 0;
  public avgPointsPerStart: number = 0;
  public avgPointsPerBench: number = 0;
  public highestScore: number = 0;
  public lowestScore: number | undefined = undefined;

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

  resetStats() {
    this.stdDev = 0
    this.rootMeanSquareError = 0
    this.avgPointsPerStart = 0
    this.avgPointsPerBench = 0
    this.starter_points = 0
    this.bench_points = 0
    this.points_scored = 0
    this.weeks_played = []
    this.weeks_benched = []
    this.teamPositionRank = 0
    this.highestScore = 0
    this.lowestScore = undefined
    // this.playerScores = new Map()
    // this.playerProjectedScores = new Map()
  }

  addWeek(
    weekNumber: number,
    pointsScored: number,
    projectedPoints: number,
    wasStarted: boolean
  ) {
    this.points_scored += pointsScored;
    this.projected_points += projectedPoints;
    if (this.lowestScore == undefined || pointsScored < this.lowestScore) {
      this.lowestScore = pointsScored;
    }

    if (this.highestScore < pointsScored) {
      this.highestScore = pointsScored;
    }

    // this.playerScores.set(weekNumber, pointsScored);
    // this.playerProjectedScores.set(weekNumber, projectedPoints);

    if (wasStarted) {
      this.weeks_played.push(weekNumber);
    } else {
      this.weeks_benched.push(weekNumber);
    }
  }

  calcStats(playerScores: Map<number, number>, playerProjectedScores: Map<number, number>) {
    this.calcStarterStats(playerScores, playerProjectedScores)
    this.calcBenchStats(playerScores, playerProjectedScores)
    this.calcCombinedStats(playerScores, playerProjectedScores)
  }

  calcStarterStats(playerScores: Map<number, number>, playerProjectedScores: Map<number, number>) {
    let startWeeks = this.weeks_played
      .filter((weekNumber) => {
        return (
          playerProjectedScores.get(weekNumber) != undefined &&
          (playerProjectedScores.get(weekNumber) as number) > 0
        );
      })
      .sort((a: number, b: number) => {
        return a - b;
      }) as number[];

    let pointValues = startWeeks.map((value) =>
      playerScores.get(value)
    ) as number[];

    this.starter_points = pointValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    this.avgPointsPerStart = pointValues.reduce((a, b) => a + b, 0) / pointValues.length;
  }

  calcBenchStats(playerScores: Map<number, number>, playerProjectedScores: Map<number, number>) {
    let benchWeeks = this.weeks_benched
      .filter((weekNumber) => {
        return (
          playerProjectedScores.get(weekNumber) != undefined &&
          (playerProjectedScores.get(weekNumber) as number) > 0
        );
      })
      .sort((a: number, b: number) => {
        return a - b;
      }) as number[];
    let pointValues = benchWeeks.map((value) =>
      playerScores.get(value)
    ) as number[];
    this.bench_points = pointValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    this.avgPointsPerBench =
      pointValues.reduce((a, b) => a + b, 0) / pointValues.length;
  }

  calcCombinedStats(playerScores: Map<number, number>, playerProjectedScores: Map<number, number>) {
    let allActiveWeeks = this.weeks_played
      .concat(this.weeks_benched)
      .filter((weekNumber) => {
        return (
          playerProjectedScores.get(weekNumber) != undefined &&
          (playerProjectedScores.get(weekNumber) as number) > 0
        );
      })
      .sort((a: number, b: number) => {
        return a - b;
      }) as number[];

    let pointValues = allActiveWeeks.map((value) =>
      playerScores.get(value)
    ) as number[];
    
    this.stdDev = standardDeviation(pointValues);
    let weeklyDiffs: Map<number, number> = new Map();
    allActiveWeeks.forEach((weekNum) => {
      weeklyDiffs.set(
        weekNum,
        playerScores.get(weekNum)! -
          playerProjectedScores.get(weekNum)!
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
