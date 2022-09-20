import { LeagueSettings } from "../LeagueSettings";
import { SleeperMatchup } from "../SleeperMatchup";
import { SleeperRoster } from "../SleeperRoster";
import { SleeperTransaction } from "../SleeperTransaction";
import { SleeperUser } from "../SleeperUser";
import SleeperLeague from "./SleeperLeague";

export default class League {
  public members: LeagueMember[] = [];
  public matchups: SleeperMatchup[];
  public transactions: SleeperTransaction[];
  public settings: LeagueSettings;

  constructor(sleeperLeague: SleeperLeague) {
    sleeperLeague.users.forEach((user: SleeperUser) => {
      sleeperLeague.rosters.forEach((roster: SleeperRoster) => {
        if (roster.owner_id == user.user_id) {
          this.members.push(new LeagueMember(user, roster));
        }
      });
    });
    this.matchups = sleeperLeague.matchups
    this.transactions = [] //TODO add api calls for getting this info
    this.settings = sleeperLeague.sleeperDetails
  }
}


class LeagueMember {
  public userDetails: SleeperUser;
  public roster: SleeperRoster;
  public name: string;
  public userId: string;
  public avatar: string;

  constructor(userDetails: SleeperUser, roster: SleeperRoster) {
    this.userDetails = userDetails;
    this.roster = roster;
    this.name = userDetails.display_name;
    this.userId = userDetails.user_id;
    this.avatar = userDetails.avatar;
  }
}
