import { MatchupSide } from "./MatchupSide"

export class Matchup {
    homeTeam: MatchupSide
    awayTeam?: MatchupSide
    winnerRosterId: number
    projectedWinnerRosterId: number
    matchup_id: number
    isTie: boolean = false
    isByeWeek: boolean
    isPlayoffs: boolean

    constructor(homeTeam: MatchupSide, isPlayoffs: boolean, awayTeam?: MatchupSide) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.isPlayoffs = isPlayoffs;
        this.matchup_id = homeTeam.matchup_id
        if (awayTeam) {
            let homeScore = homeTeam.pf + homeTeam.custom_points
            let awayScore = awayTeam.pf + awayTeam.custom_points
            this.isByeWeek = false;
            this.winnerRosterId = (homeScore > awayScore) ? homeTeam.roster_id : awayTeam.roster_id;
            this.projectedWinnerRosterId = (homeTeam.projectedScore > awayTeam.projectedScore) ? homeTeam.roster_id : awayTeam.roster_id;
            this.isTie = (homeScore == awayScore) ? true : false;
            
        } else {
            this.projectedWinnerRosterId = homeTeam.roster_id
            this.isByeWeek = false
            this.winnerRosterId = homeTeam.roster_id
        }

        
    }
}