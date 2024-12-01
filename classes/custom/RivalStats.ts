import Matchup from "./Matchup"
import { MatchupSide } from "./MatchupSide"

export default class RivalMap {
    rivals: Map<number, RivalStats> = new Map()
    memberRosterId: number

    constructor(memberRosterId: number) {
        this.memberRosterId = memberRosterId
    }
}

export class RivalStats {
    wins: number = 0
    losses: number = 0
    ties: number = 0
    pointsFor: number = 0
    pointsAgainst: number = 0
    rivalRosterId: number
    constructor(rivalRosterId: number) {
        this.rivalRosterId = rivalRosterId
    }

    addGame(rosterId: number, opponentRosterId: number, matchup: Matchup) {
        if (matchup.isTie) {
            this.ties += 1
        } else if(matchup.getWinner()?.roster_id == opponentRosterId) {
            this.losses += 1
        } else if (matchup.getWinner()?.roster_id == rosterId) {
            this.wins += 1
        }
        this.pointsFor += matchup.getMemberSide(rosterId)?.pf ?? 0
        this.pointsAgainst += matchup.getMemberSide(opponentRosterId)?.pf ?? 0
    }

    getAveragePointsFor() {
        return this.pointsFor / (this.wins + this.losses + this.ties)
    }

    getAveragePointsAgainst() {
        return this.pointsAgainst / (this.wins + this.losses + this.ties)
    }

    getWinPercentage() {
        return this.wins / (this.wins + this.losses + this.ties)
    }


    getPointDifferential() {
        return this.pointsFor - this.pointsAgainst
    }

    getWinDifferential() {
        return this.wins - this.losses
    }
}