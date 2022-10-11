import { SleeperPlayerDetails } from "../interfaces/sleeper_api/custom/Player"
import { LeagueSettings } from "../interfaces/sleeper_api/LeagueSettings"
import { SleeperMatchup } from "../interfaces/sleeper_api/SleeperMatchup"
import { Matchup } from "./Matchup"
import { MatchupPlayer } from "./MatchupPlayer"
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
                this.matchups.set(matchupId, new Matchup(new MatchupSide(matchupPair[0], playerStats.get(weekNumber), playerProjections.get(weekNumber), playerDetails, leagueSettings),
                isPlayoffs,
                new MatchupSide(matchupPair[1], playerStats.get(weekNumber), playerProjections.get(weekNumber), playerDetails, leagueSettings)))
            } else {
                this.matchups.set(matchupId, new Matchup(new MatchupSide(matchupPair[0], playerStats.get(weekNumber), playerProjections.get(weekNumber), playerDetails, leagueSettings), isPlayoffs))
            }
            
        });
    }

    getHighestScorer() {

    }
}
