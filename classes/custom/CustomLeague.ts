import { immerable } from "immer";
import { LeagueSettings } from "../sleeper/LeagueSettings";
import SleeperLeague from "../sleeper/SleeperLeague";
import { SleeperMatchup } from "../sleeper/SleeperMatchup";
import { SleeperRoster } from "../sleeper/SleeperRoster";
import { SleeperTransaction } from "../sleeper/SleeperTransaction";
import { SleeperUser } from "../sleeper/SleeperUser";
import LeagueMember from "./LeagueMember";
import { MatchupSide } from "./MatchupSide";
import MemberScores from "./MemberStats";
import { SleeperPlayerDetails } from "./Player";
import { Week } from "./Week";

export default interface CustomSleeperLeague {
    //members maps roster ID to leaguemember
    members: Map<number, LeagueMember>
    weeks: Map<number, Week>
    transactions: SleeperTransaction[];
    settings: LeagueSettings;
    modifiedSettings?: LeagueSettings;
    useModifiedSettings: boolean
    playerDetails: Map<string, SleeperPlayerDetails>
    playerStatMap: Map<number, any>
    playerProjectionMap: Map<number, any>
    memberIdToRosterId: Map<string, number>
  }