import produce, { immerable } from "immer";
import { ordinal_suffix_of, POSITION } from "../../utility/rosterFunctions";
import { LeagueSettings, ScoringSettings } from "../sleeper/LeagueSettings";
import SleeperLeague from "../sleeper/SleeperLeague";
import { SleeperMatchup } from "../sleeper/SleeperMatchup";
import { SleeperRoster } from "../sleeper/SleeperRoster";
import { SleeperTransaction } from "../sleeper/SleeperTransaction";
import { SleeperUser } from "../sleeper/SleeperUser";
import LeagueMember from "./LeagueMember";
import LeagueStats from "./LeagueStats";
import { MatchupSide } from "./MatchupSide";
import MemberScores from "./MemberStats";
import { OrdinalStatInfo } from "./OrdinalStatInfo";
import { SleeperPlayerDetails } from "./Player";
import SeasonPlayer from "./SeasonPlayer";
import { Week } from "./Week";

export default class League {
  //members maps roster ID to leaguemember
  [immerable] = true;
  public members: Map<number, LeagueMember> = new Map();
  public weeks: Map<number, Week> = new Map();
  public transactions: SleeperTransaction[];
  public allMatchups: SleeperMatchup[][];
  public settings: LeagueSettings;
  public modifiedSettings?: LeagueSettings;
  public useModifiedSettings: boolean = false;
  public playerDetails: Map<string, SleeperPlayerDetails> = new Map();
  public playerStatMap: Map<number, any> = new Map();
  public playerProjectionMap: Map<number, any> = new Map();
  public memberIdToRosterId: Map<string, number> = new Map();
  public stats: LeagueStats = new LeagueStats()

  constructor(sleeperLeague: SleeperLeague, modifiedSettings?: LeagueSettings) {
    if (modifiedSettings) {
      this.modifiedSettings = modifiedSettings;
      this.useModifiedSettings = true;
    } else {
      this.modifiedSettings = sleeperLeague.sleeperDetails;
    }
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

    this.allMatchups = sleeperLeague.matchups;
    this.transactions = []; //TODO add api calls for getting this info
    this.settings = sleeperLeague.sleeperDetails;
    this.settings = sleeperLeague.sleeperDetails;
    this.setStats(sleeperLeague.player_stats);
    this.initMemberTradeStats();
    this.setProjections(sleeperLeague.player_projections);
    this.setWeeks(sleeperLeague.matchups);
    this.calcMemberScores();
    this.setLeagueStats();
  }

  getMemberRank(memberId: number, statType: StatType) {
    let stats: LeagueMember[] = []
    this.members.forEach((member, rosterId) => {
      stats.push(member)
    })

    let sorted = stats.sort((a:LeagueMember, b:LeagueMember) => b.stats[statType] - a.stats[statType]).map((member, index) => {
      if (member.roster.roster_id == memberId) {
        let isAboveAverage = null
        if (index + 1 < stats.length/2) {
          isAboveAverage = true
        } else if (index + 1 > stats.length/2) {
          isAboveAverage = false
        }
        return {rank: index + 1, aboveAverage: isAboveAverage}
      }
    }).filter(value => value!= undefined)

    return sorted[0]
  }

  getPfOrdinalStats(): OrdinalStatInfo[] {
    let pfStats: LeagueMember[] = []
    this.members.forEach((member, rosterId) => {
      pfStats.push(member)
    })

    return pfStats.sort((a:LeagueMember, b:LeagueMember) => b.stats.pf - a.stats.pf).map((member, index) => {
      let isAboveAverage = null
      if (index + 1 < pfStats.length/2) {
        isAboveAverage = true
      } else if (index + 1 > pfStats.length/2) {
        isAboveAverage = false
      }
      return new OrdinalStatInfo(member.name, member.roster.roster_id, index + 1, `${member.stats.pf.toFixed(2)}`, member.avatar, isAboveAverage)
    })
  }

  getPaOrdinalStats(): OrdinalStatInfo[] {
    let paStats: LeagueMember[] = []
    this.members.forEach((member, rosterId) => {
      paStats.push(member)
    })

    return paStats.sort((a:LeagueMember, b:LeagueMember) => b.stats.pa - a.stats.pa).map((member, index) => {
      let isAboveAverage = null
      if (index + 1 < paStats.length/2) {
        isAboveAverage = true
      } else if (index + 1 > paStats.length/2) {
        isAboveAverage = false
      }
      return new OrdinalStatInfo(member.name, member.roster.roster_id, index + 1, `${member.stats.pa.toFixed(2)}`, member.avatar, isAboveAverage)
    })
  }

  getGpOrdinalStats(): OrdinalStatInfo[] {
    let gpStats: LeagueMember[] = []
    this.members.forEach((member, rosterId) => {
      gpStats.push(member)
    })

    return gpStats.sort((a:LeagueMember, b:LeagueMember) => b.stats.gp - a.stats.gp).map((member, index) => {
      let isAboveAverage = null
      if (index + 1 < gpStats.length/2) {
        isAboveAverage = true
      } else if (index + 1 > gpStats.length/2) {
        isAboveAverage = false
      }
      return new OrdinalStatInfo(member.name, member.roster.roster_id, index + 1, `${member.stats.gp.toFixed(2)}`, member.avatar, isAboveAverage)
    })
  }

  getPowerRankOrdinalStats(): OrdinalStatInfo[] {
    let powerRankStats: LeagueMember[] = []
    this.members.forEach((member, rosterId) => {
      powerRankStats.push(member)
    })

    return powerRankStats.sort((a:LeagueMember, b:LeagueMember) => b.stats.power_wins - a.stats.power_wins).map((member, index) => {
      let isAboveAverage = null
      if (index + 1 < powerRankStats.length/2) {
        isAboveAverage = true
      } else if (index + 1 > powerRankStats.length/2) {
        isAboveAverage = false
      }
      return new OrdinalStatInfo(member.name, member.roster.roster_id, index + 1, `${(member.stats.power_wins/(member.stats.power_wins + member.stats.power_losses)).toFixed(3)}`, member.avatar, isAboveAverage)
    })
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

  modifyStats(customSettings: ScoringSettings) {
    this.modifiedSettings = produce(
      this.modifiedSettings,
      (draftState: LeagueSettings) => {
        draftState.scoring_settings = customSettings;
      }
    );
    this.useModifiedSettings = true;
    this.recalcStats();
  }

  disableModifiedStats() {
    this.useModifiedSettings = false;
  }

  getPositions() {
    if (this.settings.roster_positions != undefined) {
      return this.settings.roster_positions
        .map((pos) => {
          if (Object.values(POSITION).includes(pos as POSITION)) {
            return pos as POSITION;
          }
        })
        .filter((value, index, array) => {
          return value != undefined && array.indexOf(value) === index;
        });
    } else {
      return [];
    }
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
      let settings = this.settings;
      if (this.useModifiedSettings && this.modifiedSettings) {
        settings = this.modifiedSettings;
      }
      let week = new Week(
        weekNum,
        weekMatchups,
        this.playerStatMap,
        this.playerProjectionMap,
        this.playerDetails,
        settings,
        isPlayoffs
      );
      this.weeks.set(weekNum, week);
    });
  }

  setLeagueStats() {
    let pf = 0
    let pa = 0
    let pp = 0
    let opslap = 0
    let gp = 0
    this.members.forEach((member, rosterId) => {
      pf += member.stats.pf
      pa += member.stats.pa
      pp += member.stats.pp
      opslap += member.stats.opslap
      gp += member.stats.gp
    })

    this.stats.avg_pf = (pf/this.members.size)
    this.stats.avg_pa = (pa/this.members.size)
    this.stats.avg_pp = (pp/this.members.size)
    this.stats.avg_opslap = (opslap/this.members.size)
    this.stats.avg_gp = (gp/this.members.size)

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

  initMemberTradeStats() {
    this.members.forEach((member: LeagueMember, rosterId: number) => {
      for (let i = 1; i <= this.members.size; i++) member.tradeStats.set(i, 0);
    });
  }

  recalcStats() {
    for (let [key, member] of this.members) {
      member.stats = new MemberScores();
    }
    this.setWeeks(this.allMatchups);
    this.calcMemberScores();
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
            homeMember.stats.gp += homeTeam.gp;
            homeMember.stats.gutPlays += homeTeam.gut_plays;
            homeMember.stats.custom_points += homeTeam.custom_points;
            homeMember.stats.pa += awayTeam.pf;

            homeTeam.starters.forEach(player => {
              if (homeMember!.players.has(player.playerId!)) {
                homeMember!.players.get(player.playerId!)!.addWeek(week.weekNumber, player.score, player.projectedScore, true)
              } else {
                let seasonPlayer = new SeasonPlayer(player.playerId!, homeTeam.roster_id)
                seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, true)
                homeMember!.players.set(player.playerId!, seasonPlayer)
              }
            })

            homeTeam.bench.forEach(player => {
              if (homeMember!.players.has(player.playerId!)) {
                homeMember!.players.get(player.playerId!)!.addWeek(week.weekNumber, player.score, player.projectedScore, false)
              } else {
                let seasonPlayer = new SeasonPlayer(player.playerId!, homeTeam.roster_id)
                seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, false)
                homeMember!.players.set(player.playerId!, seasonPlayer)
              }
            })
            homeTeam.position_starts.forEach((value, key) => {
              if (homeMember?.stats.position_scores.has(key)) {
                homeMember?.stats.position_starts.set(
                  key,
                  homeMember.stats.position_starts.get(key)!! + value
                );
                homeMember?.stats.position_scores.set(
                  key,
                  homeMember.stats.position_scores.get(key)!! +
                    homeTeam.position_scores.get(key)!!
                );
                homeMember?.stats.projected_position_scores.set(
                  key,
                  homeMember.stats.projected_position_scores.get(key)!! +
                    homeTeam.position_projected_scores.get(key)!!
                );
              } else {
                homeMember?.stats.position_starts.set(key, value);
                homeMember?.stats.position_scores.set(
                  key,
                  homeTeam.position_scores.get(key)!!
                );
                homeMember?.stats.projected_position_scores.set(
                  key,
                  homeTeam.position_projected_scores.get(key)!!
                );
              }
            });

            awayMember.stats.pf += awayTeam.pf;
            awayMember.stats.pp += awayTeam.pp;
            awayMember.stats.opslap += awayTeam.opslap;
            awayMember.stats.gp += awayTeam.gp;
            awayMember.stats.gutPlays += awayTeam.gut_plays;
            awayMember.stats.custom_points += awayTeam.custom_points;
            awayMember.stats.pa += homeTeam.pf;

            awayTeam.starters.forEach(player => {
              if (awayMember!.players.has(player.playerId!)) {
                awayMember!.players.get(player.playerId!)!.addWeek(week.weekNumber, player.score, player.projectedScore, true)
              } else {
                let seasonPlayer = new SeasonPlayer(player.playerId!, homeTeam.roster_id)
                seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, true)
                awayMember!.players.set(player.playerId!, seasonPlayer)
              }
            })

            awayTeam.bench.forEach(player => {
              if (awayMember!.players.has(player.playerId!)) {
                awayMember!.players.get(player.playerId!)!.addWeek(week.weekNumber, player.score, player.projectedScore, false)
              } else {
                let seasonPlayer = new SeasonPlayer(player.playerId!, homeTeam.roster_id)
                seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, false)
                awayMember!.players.set(player.playerId!, seasonPlayer)
              }
            })

            awayTeam.position_starts.forEach((value, key) => {
              if (awayMember?.stats.position_scores.has(key)) {
                awayMember?.stats.position_starts.set(
                  key,
                  awayMember.stats.position_starts.get(key)!! + value
                );
                awayMember?.stats.position_scores.set(
                  key,
                  awayMember.stats.position_scores.get(key)!! +
                    awayTeam.position_scores.get(key)!!
                );
                awayMember?.stats.projected_position_scores.set(
                  key,
                  awayMember.stats.projected_position_scores.get(key)!! +
                    awayTeam.position_projected_scores.get(key)!!
                );
              } else {
                awayMember?.stats.position_starts.set(key, value);
                awayMember?.stats.position_scores.set(
                  key,
                  awayTeam.position_scores.get(key)!!
                );
                awayMember?.stats.projected_position_scores.set(
                  key,
                  awayTeam.position_projected_scores.get(key)!!
                );
              }
            });

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
      let teams: MatchupSide[] = week.getAllTeams();

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

export enum StatType {
  PF = "pf",
  PA = "pa",
  PP = "pp",
  GP = "gp",
  OPSLAP = "opslap",
  POWER_RANK = "power_wins"
}
