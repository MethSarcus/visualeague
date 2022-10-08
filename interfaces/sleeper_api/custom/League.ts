import { Week } from "../../../data_classes/Week";
import { LeagueSettings, ScoringSettings } from "../LeagueSettings";
import { SleeperMatchup } from "../SleeperMatchup";
import { SleeperRoster } from "../SleeperRoster";
import { SleeperTransaction } from "../SleeperTransaction";
import { SleeperUser } from "../SleeperUser";
import { SleeperPlayerDetails } from "./Player";
import SleeperLeague from "./SleeperLeague";

export default class League {

  //members maps roster ID to leaguemember
  public members: Map<number, LeagueMember> = new Map();
  public weeks: Map<number, Week> = new Map();
  public transactions: SleeperTransaction[];
  public settings: LeagueSettings;
  public playerDetails: Map<string, SleeperPlayerDetails> = new Map()
  public playerStatMap: Map<number, any> = new Map();
  public playerProjectionMap: Map<number, any> = new Map();
  public memberIdToRosterId: Map <string, number> = new Map()

  constructor(sleeperLeague: SleeperLeague) {
    sleeperLeague.player_details.forEach((player: any) => {
      this.playerDetails.set(player._id, player.details)
    })
    sleeperLeague.users.forEach((user: SleeperUser) => {
      sleeperLeague.rosters.forEach((roster: SleeperRoster) => {
        if (roster.owner_id == user.user_id) {
          this.members.set(roster.roster_id, new LeagueMember(user, roster));
          this.memberIdToRosterId.set(user.user_id, roster.roster_id);
        }
      });
    });

    this.transactions = []; //TODO add api calls for getting this info
    this.settings = sleeperLeague.sleeperDetails;
    this.setStats(sleeperLeague.player_stats, sleeperLeague.player_projections);
    this.setProjections(sleeperLeague.player_projections);
    this.setWeeks(sleeperLeague.matchups)
    this.calcMemberScores()
    console.log(this)
  }

  setStats(stats: any, projections: any) {
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

  setWeeks(allMatchups: SleeperMatchup[][]) {
    allMatchups.forEach((weekMatchups: SleeperMatchup[], index: number) => {
      let weekNum = index + 1;
      let isPlayoffs = false
      if (this.settings.playoff_week_start && this.settings.playoff_week_start <= weekNum) {
        isPlayoffs = true
      }
      let week = new Week(weekNum, weekMatchups, this.playerStatMap, this.playerProjectionMap, this.playerDetails, this.settings, isPlayoffs)
      this.weeks.set(weekNum, week)
    });
  }

  getPlayerStat(playerId: number, weekNum: number) {
    return this.playerStatMap.get(weekNum).get(playerId.toString())
  }

  getPlayerProjection(playerId: number, weekNum: number) {
    return this.playerProjectionMap.get(weekNum).get(playerId.toString())
  }

  changeName(name: string) {
    this.settings.name = name
  }

  calcMemberScores() {
    this.weeks.forEach((week) => {
        week.matchups.forEach(matchup => {
          
          

          if (matchup.awayTeam) {
            let homeId = matchup.homeTeam.roster_id
            let awayId = matchup.awayTeam.roster_id
            let homeMember = this.members.get(homeId)
            let awayMember = this.members.get(matchup.awayTeam.roster_id)
            let homeTeam = matchup.homeTeam
            let awayTeam = matchup.awayTeam

            if (homeMember && awayMember) {

              homeMember.stats.pf += homeTeam.pf
              homeMember.stats.pp += homeTeam.pp
              homeMember.stats.opslap += homeTeam.opslap
              homeMember.stats.custom_points += homeTeam.custom_points
              homeMember.stats.pa += awayTeam.pf

              awayMember.stats.pf += awayTeam.pf
              awayMember.stats.pp += awayTeam.pp
              awayMember.stats.opslap += awayTeam.opslap
              awayMember.stats.custom_points += awayTeam.custom_points
              awayMember.stats.pa += homeTeam.pf

              if (homeTeam.projectedScore < awayTeam.projectedScore) {
                homeMember.stats.timesUnderdog += 1
                if (matchup.winnerRosterId == homeId) {
                  homeMember.stats.upsets += 1
                }
              } else {
                awayMember.stats.timesUnderdog += 1
                if (matchup.winnerRosterId == awayId) {
                  awayMember.stats.upsets += 1
                }
              }
            }
          }
          
        })
    })
  }
}

class LeagueMember {
  public userDetails: SleeperUser;
  public roster: SleeperRoster;
  public name: string;
  public userId: string;
  public avatar: string;
  public stats: MemberScores = new MemberScores();


  constructor(userDetails: SleeperUser, roster: SleeperRoster) {
    this.userDetails = userDetails;
    this.roster = roster;
    this.name = userDetails.display_name;
    this.userId = userDetails.user_id;
    this.avatar = userDetails.avatar;
  }
}

class MemberScores {
  public pf: number = 0
  public pa: number = 0
  public pp: number = 0
  public opslap: number = 0
  public custom_points: number = 0
  public gp: number = 0
  public winnableLosses: number = 0
  public timesUnderdog: number = 0
  public upsets: number = 0
}
