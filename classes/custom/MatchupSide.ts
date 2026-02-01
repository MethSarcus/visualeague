import {DatabasePlayer, PlayerScores, SleeperPlayerDetails} from './Player'
import {LeagueSettings} from '../sleeper/LeagueSettings'
import {SleeperMatchup} from '../sleeper/SleeperMatchup'
import {
	getOptimalLineup,
	getRosterSlotPositions,
	LINEUP_POSITION,
	POSITION,
} from '../../utility/rosterFunctions'
import {MatchupPlayer} from './MatchupPlayer'
import { position } from '@chakra-ui/react'

export class MatchupSide {
	weekNumber: number
	pf: number = 0
	pp: number = 0
	opslap: number = 0
	gp: number = 0
	projectedScore: number = 0
	roster_id: number
	starters: MatchupPlayer[]
	bench: MatchupPlayer[]
	matchup_id: number | undefined
	custom_points: number = 0
	gut_plays: number = 0
	position_scores: Map<POSITION, number> = new Map()
	position_projected_scores: Map<POSITION, number> = new Map()
	position_starts: Map<POSITION, number> = new Map()
	optimalLineup: MatchupPlayer[] = []
	maxPfLineup: MatchupPlayer[] = []
	optimalProjectedLineup: MatchupPlayer[] = []

	constructor(
		weekNumber: number,
		matchup: SleeperMatchup,
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, DatabasePlayer>,
		settings: LeagueSettings,
		filteredPlayers?: string[]
	) {
		this.weekNumber = weekNumber
		this.roster_id = matchup.roster_id
		this.matchup_id = matchup.matchup_id
		this.starters = matchup.starters.map((playerId, index) => {
			if (playerId == '0') {
				return new MatchupPlayer(playerId, 0, 0)
			} else {
				let scores = playerScores.get(playerId)
				let details = playerDetails.get(playerId)
				return new MatchupPlayer(
					playerId,
					scores?.stats.get(weekNumber) ?? 0,
					scores?.projections.get(weekNumber) ?? 0,
					settings.roster_positions?.at(index),
					details?.details?.fantasy_positions.filter(((pos) => settings.roster_positions?.includes(pos)))
				)
			}
		})
		this.bench = matchup.players
			.filter((player) => !matchup.starters.includes(player))
			.map((playerId, index) => {
				let scores = playerScores.get(playerId)
				let details = playerDetails.get(playerId)
				return new MatchupPlayer(
					playerId,
					scores?.stats.get(weekNumber) ?? 0,
					scores?.projections.get(weekNumber) ?? 0,
					'BN',
					details?.details?.fantasy_positions.filter(((pos) => settings.roster_positions?.includes(pos)))
				)
			})
		if (matchup.custom_points) {
			this.custom_points = matchup.custom_points
		}
		this.calcPoints(settings, filteredPlayers)
	}

	calcPoints(settings: LeagueSettings, filteredPlayers?: string[]) {
		this.starters.forEach((starter) => {
			this.pf += starter.score
			this.projectedScore += starter.projectedScore
			let starterPosition = starter.eligiblePositions!![0] as POSITION
			if (this.position_starts.has(starterPosition)) {
				this.position_starts.set(
					starterPosition,
					(this.position_starts.get(starterPosition) as number) + 1
				)
			} else {
				this.position_starts.set(starterPosition, 1)
			}
			if (starterPosition) {
				if (
					this.position_scores.has(starterPosition) &&
					this.position_scores.get(starterPosition) != undefined
				) {
					let positionScore =
						(this.position_scores.get(starterPosition) as number) +
						starter.score
					let positionProjectedScore =
						(this.position_projected_scores.get(starterPosition) as number) +
						starter.projectedScore
					this.position_scores.set(starterPosition, positionScore)
					this.position_projected_scores.set(
						starterPosition,
						positionProjectedScore
					)
				} else {
					this.position_scores.set(starterPosition, starter.score)
					this.position_projected_scores.set(
						starterPosition,
						starter.projectedScore
					)
				}
			}
		})
		if (this.custom_points > 0) {
			this.pf = this.custom_points
		}

		if (settings.roster_positions) {
			let startingLineupSlots = settings.roster_positions
				.map((pos) => {
					return pos as LINEUP_POSITION
				})
				.filter((pos) => {
					return pos != LINEUP_POSITION.BN && pos != LINEUP_POSITION.IR
				})

			if (startingLineupSlots != undefined && startingLineupSlots.length > 0) {
				let eligiblePlayers = [this.starters, this.bench]
					.flat()
					.filter(
						(player) => !filteredPlayers?.includes(player?.playerId ?? '-1')
					)
				let optimalLineup = getOptimalLineup(
					eligiblePlayers,
					startingLineupSlots,
					false
				)
				this.optimalLineup = optimalLineup
				let optimalProjectedLineup = getOptimalLineup(
					eligiblePlayers,
					startingLineupSlots,
					true
				)

				this.optimalProjectedLineup = optimalProjectedLineup

				optimalLineup.forEach((starter) => {
					this.pp += starter.score
				})

				optimalProjectedLineup.forEach((starter) => {
					this.opslap += starter.score
				})

				this.gp = this.pf - this.opslap
				this.gut_plays += this.getGutPlays(
					this.starters,
					optimalProjectedLineup
				).length
			}
		}
	}

	getOptimalLineupAndBench() {
		let projectedScore = 0
		this.optimalLineup.forEach((player) => {
			projectedScore += player.projectedScore
		})
		return {
			starters: this.optimalLineup,
			bench: this.starters.concat(this.bench).filter((player) => {
				return !this.optimalLineup.includes(player)
			}),
			score: this.pp,
			projected_score: projectedScore,
		}
	}

	getOptimalProjectedLineupAndBench() {
		let projectedScore = 0
		this.optimalProjectedLineup.forEach((player) => {
			projectedScore += player.projectedScore
		})
		return {
			starters: this.optimalProjectedLineup,
			bench: this.starters.concat(this.bench).filter((player) => {
				return !this.optimalProjectedLineup.includes(player)
			}),
			score: this.opslap,
			projected_score: projectedScore,
		}
	}

	getGutPlays(
		lineup: MatchupPlayer[],
		optimalProjectedLineup: MatchupPlayer[]
	) {
		let gutPlays = lineup.filter((player) => {
			return !optimalProjectedLineup.includes(player)
		})

		return gutPlays
	}

	getTeamBreakdownPieChart() {}
}
