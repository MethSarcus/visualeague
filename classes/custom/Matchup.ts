import { MatchupSide } from "./MatchupSide"

export default class Matchup {
    weekNumber: number
    homeTeam: MatchupSide
    awayTeam?: MatchupSide
    winnerRosterId: number
    projectedWinnerRosterId: number
    matchup_id: number
    isTie: boolean = false
    isByeWeek: boolean
    isPlayoffs: boolean

    constructor(weekNumber: number, homeTeam: MatchupSide, isPlayoffs: boolean, awayTeam?: MatchupSide) {
        this.homeTeam = homeTeam;
        this.weekNumber = weekNumber
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



    public getMargin() {
        return Math.abs(this.homeTeam.pf - this.awayTeam?.pf!)
    }

    public getMemberSide(rosterId: number) {
        let matchupSide
        if (this.homeTeam.roster_id == rosterId) {
            matchupSide = this.homeTeam
        } else if (this.awayTeam?.roster_id == rosterId) {
            matchupSide = this.awayTeam
        }

        return matchupSide
    }
}