import { DatabasePlayer, PlayerScores, SleeperPlayerDetails } from "./Player"
import { LeagueSettings } from "../sleeper/LeagueSettings"
import { SleeperMatchup } from "../sleeper/SleeperMatchup"
import Matchup from "./Matchup"
import { MatchupSide } from "./MatchupSide"
import { Match } from "@testing-library/react"
import ByeWeekMatchup from "./ByeWeekMatchup"

export class Week {
    matchups: Map<number, Matchup> = new Map()
    byeWeeks: ByeWeekMatchup[] = []
    weekNumber: number

    constructor(weekNumber: number, sleeperMatchups: SleeperMatchup[], playerScores: Map<string, PlayerScores>, playerDetails: Map<string, SleeperPlayerDetails>, leagueSettings: LeagueSettings, isPlayoffs: boolean, taxiMap?: Map<number, string[]>) {
        this.weekNumber = weekNumber
        let matchupIds = new Map()
        sleeperMatchups.forEach((matchup: SleeperMatchup) => {
          if (matchup.matchup_id == undefined) {
            let homeTeam = new MatchupSide(weekNumber, matchup, playerScores, playerDetails, leagueSettings, taxiMap?.get(matchup.roster_id) ?? [])
            this.byeWeeks.push(new ByeWeekMatchup(weekNumber, homeTeam))
          } else if (!matchupIds.has(matchup.matchup_id)) {
              matchupIds.set(matchup.matchup_id, [matchup])
            } else {
              matchupIds.get(matchup.matchup_id).push(matchup)
            }
          });
    
          matchupIds.forEach((matchupPair: SleeperMatchup[], matchupId: number) => {
            if (matchupPair.length == 2) {
                let homeMatchupSide = new MatchupSide(weekNumber, matchupPair[0], playerScores, playerDetails, leagueSettings, taxiMap?.get(matchupPair[0].roster_id) ?? [])
                let awayMatchupSide = new MatchupSide(weekNumber, matchupPair[1], playerScores, playerDetails, leagueSettings, taxiMap?.get(matchupPair[1].roster_id) ?? [])
                this.matchups.set(matchupId, new Matchup(weekNumber, homeMatchupSide, isPlayoffs, awayMatchupSide))
            }
        });
      }

    getAllTeams() {
      let teams: MatchupSide[] = []
      this.matchups.forEach((matchup) => {
        if (matchup.awayTeam) {
          teams.push(matchup.homeTeam)
          teams.push(matchup.awayTeam)
        }
      })

      this.byeWeeks.forEach((byeWeek) => {
        teams.push(byeWeek.homeTeam)
      })

      return teams
    }

    getHighestWeeklyScorerRosterId(): number {
      let highestScorerRosterId = -1
      let highScore = 0
      this.getAllTeams().forEach(team => {
        if (team.pf > highScore) {
          highestScorerRosterId = team.roster_id
        }
      });

      return highestScorerRosterId
    }

    getMemberMatchup(rosterId: number): Matchup | ByeWeekMatchup {
      let memberMatchup: Matchup | undefined | ByeWeekMatchup
      this.matchups.forEach(matchup => {
        if (matchup.homeTeam.roster_id == rosterId || matchup.awayTeam?.roster_id == rosterId) {
          memberMatchup = matchup;
        }
      })

      if (!memberMatchup) {
        this.byeWeeks.forEach(byeWeek => {
          if (byeWeek.homeTeam.roster_id == rosterId) {
            memberMatchup = byeWeek
          }
        })
      }

      return memberMatchup as Matchup | ByeWeekMatchup
    }

    getMemberMatchupSide(rosterId: number): MatchupSide {
      let memberMatchupSide;
      this.matchups.forEach(matchup => {
        if (matchup.homeTeam.roster_id == rosterId) {
          memberMatchupSide = matchup.homeTeam;
        } else if (matchup.awayTeam?.roster_id == rosterId) {
          memberMatchupSide = matchup.awayTeam!
        }
      })

      if (!memberMatchupSide) {
        this.byeWeeks.forEach(byeWeek => {
          if (byeWeek.homeTeam.roster_id == rosterId) {
            memberMatchupSide = byeWeek.homeTeam
          }
        })
      }

      return memberMatchupSide as unknown as MatchupSide
    }

    getAllScores() {
      let teams = this.getAllTeams()
      return teams.sort((a: MatchupSide, b: MatchupSide) => {
        if (a.pf < b.pf) {
          return 1;
        } else if (a.pf > b.pf) {
          return -1;
        } else {
          return 0;
        }
      }).map((value, index) => {
        return {
          id: value.roster_id,
          score: value.pf,
          week: this.weekNumber,
          rank: index + 1,
          gp: value.gp,
          pp: value.pp
        }
      })
    }
}
