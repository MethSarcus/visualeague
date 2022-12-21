import { TIE_CONST } from "../../utility/rosterFunctions";
import { MatchupSide } from "./MatchupSide";

export default interface MatchupInterface {
  weekNumber: number;
  homeTeam: MatchupSide;
  awayTeam?: MatchupSide;
  winnerRosterId: number | undefined;
  loserRosterId: number | undefined;
  projectedWinnerRosterId: number | undefined;
  projectedLoserRosterId?: number | undefined;
  matchup_id: number | undefined;
  isTie: boolean
  isProjectedTie: boolean
  isByeWeek: boolean;
  isPlayoffs: boolean;

  getMargin(): number | undefined

  getWinner(): MatchupSide | undefined

  getLoser(): MatchupSide |undefined

  getCombinedScore(): number

  getMemberSide(rosterId: number): MatchupSide | undefined
}
