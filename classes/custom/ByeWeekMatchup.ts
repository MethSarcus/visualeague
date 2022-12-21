import Matchup from './Matchup'
import MatchupInterface from './MatchupInterface'
import {MatchupSide} from './MatchupSide'

export default class ByeWeekMatchup implements MatchupInterface {
	weekNumber: number
	homeTeam: MatchupSide
	awayTeam?: MatchupSide | undefined = undefined
	winnerRosterId: number | undefined = undefined
	loserRosterId: number | undefined = undefined
	projectedWinnerRosterId = undefined
	projectedLoserRosterId?: number | undefined = undefined
	matchup_id: number | undefined = undefined
	isTie: boolean = false
	isProjectedTie: boolean = false
	isByeWeek: boolean = true
	isPlayoffs: boolean = true

	constructor(weekNumber: number, homeTeam: MatchupSide) {
		this.homeTeam = homeTeam
		this.weekNumber = weekNumber
		this.isByeWeek = true
	}
	getMargin(): number | undefined {
		return undefined
	}
	getWinner(): MatchupSide | undefined {
		return undefined
	}
	getLoser(): MatchupSide | undefined {
		return undefined
	}
	getCombinedScore(): number {
		return this.homeTeam.pf
	}
	getMemberSide(rosterId: number): MatchupSide | undefined {
		if (this.homeTeam.roster_id == rosterId) {
            return this.homeTeam
        }
	}
}
