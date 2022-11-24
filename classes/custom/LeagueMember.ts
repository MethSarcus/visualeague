import { SleeperRoster } from "../sleeper/SleeperRoster";
import { SleeperUser } from "../sleeper/SleeperUser";
import MemberScores from "./MemberStats";
import SeasonPlayer from "./SeasonPlayer";

export default class LeagueMember {
  public userDetails: SleeperUser;
  public roster: SleeperRoster;
  public name: string;
  public userId: string;
  public avatar: string;
  public stats: MemberScores = new MemberScores();
  public tradeStats: Map<number, number> = new Map();
  public players: Map<string, SeasonPlayer> = new Map();

  constructor(userDetails: SleeperUser, roster: SleeperRoster) {
    this.userDetails = userDetails;
    this.roster = roster;
    this.name = userDetails.display_name;
    this.userId = userDetails.user_id;
    this.avatar = userDetails.avatar;
  }

  getBestPlayer() {
    var mapAsc = new Map(
      [...this.players.entries()].sort(
        (a: [string, SeasonPlayer], b: [string, SeasonPlayer]) => {
          if (a[1].points_scored < b[1].points_scored) {
            return 1;
          } else if (a[1].points_scored > b[1].points_scored) {
            return -1;
          } else {
            return 0;
          }
        }
      )
    );

    this.players = mapAsc;
    const [firstValue] = this.players.values();
    return firstValue;
  }

  getPlayers() {
    let [bestPlayer] = this.players.values()
    let [worstPlayer] = this.players.values()
    let [overAchiever] = this.players.values()
    let [underAchiever] = this.players.values()
    let [mostConsistent] = this.players.values()
    return bestPlayer;
  }
}
