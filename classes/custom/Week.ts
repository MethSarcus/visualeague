import { SleeperPlayerDetails } from "./Player"
import { LeagueSettings } from "../sleeper/LeagueSettings"
import { SleeperMatchup } from "../sleeper/SleeperMatchup"
import Matchup from "./Matchup"
import { MatchupSide } from "./MatchupSide"

export class Week {
    matchups: Map<number, Matchup> = new Map()
    weekNumber: number

    constructor(weekNumber: number, sleeperMatchups: SleeperMatchup[], playerStats: any, playerProjections: any, playerDetails: Map<string, SleeperPlayerDetails>, leagueSettings: LeagueSettings, isPlayoffs: boolean) {
        this.weekNumber = weekNumber
        let matchupIds = new Map()
        sleeperMatchups.forEach((matchup: SleeperMatchup) => {
            if (!matchupIds.has(matchup.matchup_id)) {
              matchupIds.set(matchup.matchup_id, [matchup])
            } else {
              matchupIds.get(matchup.matchup_id).push(matchup)
            }
          });
    
          matchupIds.forEach((matchupPair: SleeperMatchup[], matchupId: number) => {
            if (matchupPair.length == 2) {
                this.matchups.set(matchupId, new Matchup(weekNumber, new MatchupSide(weekNumber, matchupPair[0], playerStats.get(weekNumber), playerProjections.get(weekNumber), playerDetails, leagueSettings),
                isPlayoffs,
                new MatchupSide(weekNumber, matchupPair[1], playerStats.get(weekNumber), playerProjections.get(weekNumber), playerDetails, leagueSettings)))
            } else {
                this.matchups.set(matchupId, new Matchup(weekNumber, new MatchupSide(weekNumber, matchupPair[0], playerStats.get(weekNumber), playerProjections.get(weekNumber), playerDetails, leagueSettings), isPlayoffs))
            }
        });
    }

    getHighestScorer() {

    }

    getAllTeams() {
      let teams: MatchupSide[] = []
      this.matchups.forEach((matchup) => {
        if (matchup.awayTeam) {
          teams.push(matchup.homeTeam)
          teams.push(matchup.awayTeam)
        }
      })

      return teams
    }

    getMemberMatchup(rosterId: number): Matchup {
      let memberMatchup;
      this.matchups.forEach(matchup => {
        if (matchup.homeTeam.roster_id == rosterId || matchup.awayTeam?.roster_id == rosterId) {
          memberMatchup = matchup;
        }
      })

      return memberMatchup as unknown as Matchup
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
