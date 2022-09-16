import { LeagueSettings } from "../LeagueSettings";
import { SleeperMatchup } from "../SleeperMatchup";
import { SleeperRoster } from "../SleeperRoster";
import { SleeperUser } from "../SleeperUser";
import FantasyLeagueMember from "./FantasyLeagueMember";

export default class SleeperLeague {
   
    public users: SleeperUser[]
    public sleeperDetails: LeagueSettings
    public matchups: SleeperMatchup[]
    public rosters: SleeperRoster[]


    constructor(users: SleeperUser[], leagueSettings: LeagueSettings, matchups: SleeperMatchup[], rosters: SleeperRoster[]) {
      this.sleeperDetails = leagueSettings
      this.matchups = matchups
      this.users = users
      this.rosters = rosters
    }
  }