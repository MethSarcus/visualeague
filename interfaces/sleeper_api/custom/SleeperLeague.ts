import { LeagueSettings } from "../LeagueSettings";
import { SleeperMatchup } from "../SleeperMatchup";
import { SleeperRoster } from "../SleeperRoster";
import { SleeperUser } from "../SleeperUser";

export default class SleeperLeague {
   
    public users: SleeperUser[]
    public sleeperDetails: LeagueSettings
    public matchups: SleeperMatchup[]
    public rosters: SleeperRoster[]
    public matchupProjections: any


    constructor(users: SleeperUser[], leagueSettings: LeagueSettings, matchups: SleeperMatchup[], rosters: SleeperRoster[], matchupProjections: any) {
      this.users = users
      this.sleeperDetails = leagueSettings
      this.matchups = matchups
      this.rosters = rosters
      this.matchupProjections = matchupProjections
    }
  }