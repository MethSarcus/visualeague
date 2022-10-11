import { Week } from "./Week";
import { LeagueSettings } from "../sleeper/LeagueSettings";
import { SleeperMatchup } from "../sleeper/SleeperMatchup";
import { SleeperRoster } from "../sleeper/SleeperRoster";
import { SleeperTransaction } from "../sleeper/SleeperTransaction";
import { SleeperUser } from "../sleeper/SleeperUser";
import { SleeperPlayerDetails } from "./Player";
import SleeperLeague from "../sleeper/SleeperLeague";
import LeagueMember from "./LeagueMember";
import { MatchupSide } from "./MatchupSide";

export default class League {
  //members maps roster ID to leaguemember
  public members: Map<number, LeagueMember> = new Map();
  public weeks: Map<number, Week> = new Map();
  public transactions: SleeperTransaction[];
  public settings: LeagueSettings;
  public playerDetails: Map<string, SleeperPlayerDetails> = new Map();
  public playerStatMap: Map<number, any> = new Map();
  public playerProjectionMap: Map<number, any> = new Map();
  public memberIdToRosterId: Map<string, number> = new Map();

  constructor(sleeperLeague: SleeperLeague) {
    sleeperLeague.player_details.forEach((player: any) => {
      this.playerDetails.set(player._id, player.details);
    });
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
    this.setStats(sleeperLeague.player_stats);
    this.setProjections(sleeperLeague.player_projections);
    this.setWeeks(sleeperLeague.matchups);
    this.calcMemberScores();
    console.log(this);
  }

  //Creates a map mapping week number to a map of player id to the players stats
  setStats(stats: any) {
    stats.forEach((statList: any, index: number) => {
      let weekNum = index + 1;
      this.playerStatMap.set(weekNum, new Map());
      statList.forEach((stat: any) => {
        this.playerStatMap.get(weekNum).set(stat._id, stat.stats);
      });
    });
  }

  //Creates a map mapping week number to a map of player id to the players projections
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
      let isPlayoffs = false;
      if (
        this.settings.playoff_week_start &&
        this.settings.playoff_week_start <= weekNum
      ) {
        isPlayoffs = true;
      }
      let week = new Week(
        weekNum,
        weekMatchups,
        this.playerStatMap,
        this.playerProjectionMap,
        this.playerDetails,
        this.settings,
        isPlayoffs
      );
      this.weeks.set(weekNum, week);
    });
  }

  getPlayerStat(playerId: number, weekNum: number) {
    return this.playerStatMap.get(weekNum).get(playerId.toString());
  }

  getPlayerProjection(playerId: number, weekNum: number) {
    return this.playerProjectionMap.get(weekNum).get(playerId.toString());
  }

  changeName(name: string) {
    this.settings.name = name;
  }

  calcMemberScores() {
    this.weeks.forEach((week) => {
      week.matchups.forEach((matchup) => {
        if (matchup.awayTeam) {
          let homeId = matchup.homeTeam.roster_id;
          let awayId = matchup.awayTeam.roster_id;
          let homeMember = this.members.get(homeId);
          let awayMember = this.members.get(matchup.awayTeam.roster_id);
          let homeTeam = matchup.homeTeam;
          let awayTeam = matchup.awayTeam;

          if (homeMember && awayMember) {
            homeMember.stats.pf += homeTeam.pf;
            homeMember.stats.pp += homeTeam.pp;
            homeMember.stats.opslap += homeTeam.opslap;
            homeMember.stats.custom_points += homeTeam.custom_points;
            homeMember.stats.pa += awayTeam.pf;

            awayMember.stats.pf += awayTeam.pf;
            awayMember.stats.pp += awayTeam.pp;
            awayMember.stats.opslap += awayTeam.opslap;
            awayMember.stats.custom_points += awayTeam.custom_points;
            awayMember.stats.pa += homeTeam.pf;

            if (homeTeam.pf > awayTeam.pf) {
              homeMember.stats.wins += 1;
              awayMember.stats.losses += 1;
            } else if (homeTeam.pf < awayTeam.pf) {
              awayMember.stats.wins += 1;
              homeMember.stats.losses += 1;
            } else {
              homeMember.stats.ties += 1;
              awayMember.stats.ties += 1;
            }

            if (homeTeam.projectedScore < awayTeam.projectedScore) {
              homeMember.stats.timesUnderdog += 1;
              if (matchup.winnerRosterId == homeId) {
                homeMember.stats.upsets += 1;
              }
            } else {
              awayMember.stats.timesUnderdog += 1;
              if (matchup.winnerRosterId == awayId) {
                awayMember.stats.upsets += 1;
              }
            }
          }
        }
      });
      let teams: MatchupSide[] = [];
      week.matchups.forEach((matchup) => {
        if (matchup.awayTeam) {
          teams.push(matchup.homeTeam);
          teams.push(matchup.awayTeam);
        }
      });

      teams.sort((a: MatchupSide, b: MatchupSide) => {
        if (a.pf < b.pf) {
          return 1;
        } else if (a.pf > b.pf) {
          return -1;
        } else {
          return 0;
        }
      });

      teams.forEach((team, index) => {
        let member = this.members.get(team.roster_id);
        let pwrwins = this.members.size - index;
        let pwrlosses = this.members.size - pwrwins;
        if (member) {
          member.stats.power_wins += pwrwins - 1;
          member.stats.power_losses += pwrlosses;
        }
      });
    });
  }
}
