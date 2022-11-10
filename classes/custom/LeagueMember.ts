import { SleeperRoster } from "../sleeper/SleeperRoster";
import { SleeperUser } from "../sleeper/SleeperUser";
import MemberScores from "./MemberStats";

export default class LeagueMember {
    public userDetails: SleeperUser;
    public roster: SleeperRoster;
    public name: string;
    public userId: string;
    public avatar: string;
    public stats: MemberScores = new MemberScores();
    public tradeStats: Map<number, number> = new Map();
  
    constructor(userDetails: SleeperUser, roster: SleeperRoster) {
      this.userDetails = userDetails;
      this.roster = roster;
      this.name = userDetails.display_name;
      this.userId = userDetails.user_id;
      this.avatar = userDetails.avatar;
    }
  }