import { TIE_CONST } from "../../utility/rosterFunctions";
import { MatchupSide } from "./MatchupSide";

export default class Matchup {
  weekNumber: number;
  homeTeam: MatchupSide;
  awayTeam?: MatchupSide;
  winnerRosterId: number;
  loserRosterId?: number;
  projectedWinnerRosterId: number;
  projectedLoserRosterId?: number;
  matchup_id: number;
  isTie: boolean = false;
  isProjectedTie: boolean = false;
  isByeWeek: boolean;
  isPlayoffs: boolean;

  constructor(
    weekNumber: number,
    homeTeam: MatchupSide,
    isPlayoffs: boolean,
    awayTeam?: MatchupSide
  ) {
    this.homeTeam = homeTeam;
    this.weekNumber = weekNumber;
    this.awayTeam = awayTeam;
    this.isPlayoffs = isPlayoffs;
    this.matchup_id = homeTeam.matchup_id;
    if (awayTeam) {
      let homeScore = parseFloat(
        (homeTeam.pf + homeTeam.custom_points).toFixed(2)
      );
      let awayScore = parseFloat(
        (awayTeam.pf + awayTeam.custom_points).toFixed(2)
      );
      this.isByeWeek = false;

      this.isProjectedTie = parseFloat(this.homeTeam.projectedScore.toFixed(2)) == parseFloat(this.awayTeam?.projectedScore?.toFixed(2) ?? "0")
      if (this.isProjectedTie) {
        this.projectedWinnerRosterId = TIE_CONST
      } else {
        this.projectedWinnerRosterId =
        homeTeam.projectedScore > awayTeam.projectedScore
          ? homeTeam.roster_id
          : awayTeam.roster_id;
      this.projectedLoserRosterId =
        homeTeam.projectedScore < awayTeam.projectedScore
          ? homeTeam.roster_id
          : awayTeam.roster_id;
      }

      this.isTie = homeScore == awayScore ? true : false;
      if (this.isTie) {
        this.winnerRosterId = TIE_CONST
      } else {
        this.winnerRosterId =
          homeScore > awayScore ? homeTeam.roster_id : awayTeam.roster_id;
        this.loserRosterId =
          homeScore < awayScore ? homeTeam.roster_id : awayTeam.roster_id;
      }
    } else {
      this.projectedWinnerRosterId = homeTeam.roster_id;
      this.isByeWeek = false;
      this.winnerRosterId = homeTeam.roster_id;
    }
  }

  public getMargin() {
    return Math.abs(this.homeTeam.pf - this.awayTeam?.pf!);
  }

  public getWinner(): MatchupSide | undefined {
    let winner
    if (!this.isTie) {
      if (this.homeTeam.roster_id == this.winnerRosterId) {
        winner = this.homeTeam;
      } else {
        winner = this.awayTeam;
      }
    }


    return winner;
  }

  public getLoser(): MatchupSide |undefined {
    let loser

    if (this.homeTeam.roster_id == this.winnerRosterId) {
      loser = this.awayTeam!;
    } else if (this.awayTeam?.roster_id == this.winnerRosterId) {
      loser = this.homeTeam
    }

    return loser;
  }

  public getCombinedScore() {
    return this.homeTeam.pf + (this.awayTeam?.pf ?? 0);
  }

  public getMemberSide(rosterId: number) {
    let matchupSide;
    if (this.homeTeam.roster_id == rosterId) {
      matchupSide = this.homeTeam;
    } else if (this.awayTeam?.roster_id == rosterId) {
      matchupSide = this.awayTeam;
    }

    return matchupSide;
  }
}
