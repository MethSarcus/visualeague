import { LeagueSettings } from "./LeagueSettings";
import { SleeperMatchup } from "./SleeperMatchup";
import { SleeperRoster } from "./SleeperRoster";
import { SleeperUser } from "./SleeperUser";

export default class SleeperLeague {
  public users: SleeperUser[];
  public sleeperDetails: LeagueSettings;
  public matchups: SleeperMatchup[][];
  public rosters: SleeperRoster[];
  public player_details: object[];

  constructor(
    users: SleeperUser[],
    leagueSettings: LeagueSettings,
    matchups: SleeperMatchup[][],
    rosters: SleeperRoster[],
    stats: any,
    projections: any,
    playerDetails: any
  ) {
    this.users = users;
    this.sleeperDetails = leagueSettings;
    this.matchups = matchups;
    this.rosters = rosters;
    this.player_details = playerDetails
  }
}
