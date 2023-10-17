import { DatabasePlayer } from "../custom/Player";
import { LeagueSettings } from "./LeagueSettings";
import { SleeperMatchup } from "./SleeperMatchup";
import { SleeperRoster } from "./SleeperRoster";
import { SleeperUser } from "./SleeperUser";

export default class LeagueData {
  public users: SleeperUser[];
  public sleeperDetails: LeagueSettings;
  public matchups: SleeperMatchup[][];
  public rosters: SleeperRoster[];
  public player_details: DatabasePlayer[];

  constructor(
    users: SleeperUser[],
    leagueSettings: LeagueSettings,
    matchups: SleeperMatchup[][],
    rosters: SleeperRoster[],
    playerDetails: any
  ) {
    this.users = users;
    this.sleeperDetails = leagueSettings;
    this.matchups = matchups;
    this.rosters = rosters;
    this.player_details = playerDetails
  }
}
