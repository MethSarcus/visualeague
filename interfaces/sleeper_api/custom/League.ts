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
  public playerStatMap: Map<number, any> = new Map();
  public playerProjectionMap: Map<number, any> = new Map();

  constructor(sleeperLeague: SleeperLeague) {
    sleeperLeague.users.forEach((user: SleeperUser) => {
      sleeperLeague.rosters.forEach((roster: SleeperRoster) => {
        if (roster.owner_id == user.user_id) {
          this.members.push(new LeagueMember(user, roster));
        }
      });
    });
    this.matchups = sleeperLeague.matchups;
    this.transactions = []; //TODO add api calls for getting this info
    this.settings = sleeperLeague.sleeperDetails;
    this.setStats(sleeperLeague.player_stats);
    this.setProjections(sleeperLeague.player_projections);
  }

  setStats(stats: any) {
    stats.forEach((statList: any, index: number) => {
      let weekNum = index + 1;
      this.playerStatMap.set(weekNum, new Map());
      statList.forEach((stat: any) => {
        this.playerStatMap.get(weekNum).set(stat._id, stat.stats);
      });
    });
  }

  setProjections(projections: any) {
    projections.forEach((projectionList: any, index: number) => {
      let weekNum = index + 1;
      this.playerProjectionMap.set(weekNum, new Map());
      projectionList.forEach((stat: any) => {
        this.playerProjectionMap.get(weekNum).set(stat._id, stat.stats);
      });
    });
  }

  getPlayerStat(playerId: number, weekNum: number) {
    return this.playerStatMap.get(weekNum).get(playerId.toString())
  }

  getPlayerProjection(playerId: number, weekNum: number) {
    return this.playerProjectionMap.get(weekNum).get(playerId.toString())
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
