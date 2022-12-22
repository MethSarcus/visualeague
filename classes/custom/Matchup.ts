import {TIE_CONST} from '../../utility/rosterFunctions'
import MatchupInterface from './MatchupInterface'
import {MatchupSide} from './MatchupSide'

export default class Matchup implements MatchupInterface {
	weekNumber: number
	homeTeam: MatchupSide
	awayTeam?: MatchupSide
	winnerRosterId: number
	loserRosterId: number | undefined
	projectedWinnerRosterId: number
	projectedLoserRosterId: number
	matchup_id: number | undefined
	isTie: boolean = false
	isProjectedTie: boolean = false
	isByeWeek: boolean
	isPlayoffs: boolean

	constructor(
		weekNumber: number,
		homeTeam: MatchupSide,
		isPlayoffs: boolean,
		awayTeam: MatchupSide
	) {
		this.homeTeam = homeTeam
		this.weekNumber = weekNumber
		this.awayTeam = awayTeam
		this.isPlayoffs = isPlayoffs
		this.matchup_id = homeTeam.matchup_id
		let homeScore = parseFloat(
			(homeTeam.pf + homeTeam.custom_points).toFixed(2)
		)
		let awayScore = parseFloat(
			(awayTeam.pf + awayTeam.custom_points).toFixed(2)
		)
		this.isByeWeek = false

		this.isProjectedTie =
			parseFloat(this.homeTeam.projectedScore.toFixed(2)) ==
			parseFloat(this.awayTeam?.projectedScore?.toFixed(2) ?? '0')
		if (this.isProjectedTie) {
			this.projectedWinnerRosterId = TIE_CONST
      this.projectedLoserRosterId = TIE_CONST
		} else {
			this.projectedWinnerRosterId =
				homeTeam.projectedScore > awayTeam.projectedScore
					? homeTeam.roster_id
					: awayTeam.roster_id
			this.projectedLoserRosterId =
				homeTeam.projectedScore < awayTeam.projectedScore
					? homeTeam.roster_id
					: awayTeam.roster_id
		}

		this.isTie = homeScore == awayScore ? true : false
		if (this.isTie) {
			this.winnerRosterId = TIE_CONST
		} else {
			this.winnerRosterId =
				homeScore > awayScore ? homeTeam.roster_id : awayTeam.roster_id
			this.loserRosterId =
				homeScore < awayScore ? homeTeam.roster_id : awayTeam.roster_id
		}
	}

	public getMargin() {
		return Math.abs(this.homeTeam.pf - (this.awayTeam?.pf ?? this.homeTeam.pf))
	}

	public getWinner() {
		let winner
		if (!this.isTie) {
			if (this.homeTeam.roster_id == this.winnerRosterId) {
				winner = this.homeTeam
			} else {
				winner = this.awayTeam
			}
		}

		return winner
	}

	public getLoser() {
		let loser

		if (this.homeTeam.roster_id == this.winnerRosterId) {
			loser = this.awayTeam!
		} else if (this.awayTeam?.roster_id == this.winnerRosterId) {
			loser = this.homeTeam
		}

		return loser
	}

	public getCombinedScore() {
		return this.homeTeam.pf + (this.awayTeam?.pf ?? 0)
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
