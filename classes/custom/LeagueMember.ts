import {LINEUP_POSITION, POSITION} from '../../utility/rosterFunctions'
import {SleeperRoster} from '../sleeper/SleeperRoster'
import {SleeperUser} from '../sleeper/SleeperUser'
import MemberBadgeData from './MemberBadge'
import MemberScores from './MemberStats'
import SeasonPlayer from './SeasonPlayer'

export default class LeagueMember {
	userDetails: SleeperUser
	roster: SleeperRoster
	name: string
	userId: string
	avatar: string
	teamAvatar?: string | undefined
	teamName: string
	stats: MemberScores = new MemberScores()
	tradePartnerMap: Map<number, number> = new Map()
	players: Map<string, SeasonPlayer> = new Map()
	division_id: number
	badges: MemberBadgeData[] = []

	constructor(userDetails: SleeperUser, roster: SleeperRoster) {
		this.userDetails = userDetails
		this.roster = roster
		this.name = userDetails.display_name
		this.userId = userDetails.user_id
		this.avatar = userDetails.avatar
		this.division_id = roster.settings.division

		if (userDetails.metadata.team_name != null) {
			this.teamName = userDetails.metadata.team_name
		} else {
			this.teamName = `Team ${userDetails.display_name}`
		}

		if (userDetails.metadata.avatar != null) {
			this.teamAvatar = userDetails.metadata.avatar
		}
	}

	getBestPlayer() {
		var mapAsc = new Map(
			[...this.players.entries()].sort(
				(a: [string, SeasonPlayer], b: [string, SeasonPlayer]) => {
					if (a[1].points_scored < b[1].points_scored) {
						return 1
					} else if (a[1].points_scored > b[1].points_scored) {
						return -1
					} else {
						return 0
					}
				}
			)
		)

		this.players = mapAsc
		const [firstValue] = this.players.values()
		return firstValue
	}

	getAvatar() {
		return `https://sleepercdn.com/avatars/thumbs/${this.avatar}`
	}

	getRecord() {
		return `${this.stats.wins}-${this.stats.losses}${
			this.stats.ties > 0 ? '-' + this.stats.ties : ''
		}`
	}

	getPowerRecord() {
		return `${this.stats.power_wins}-${this.stats.power_losses}${
			this.stats.power_ties > 0 ? '-' + this.stats.power_ties : ''
		}`
	}

	getTeamAvatar() {
		if (!this.teamAvatar) {
			return this.getAvatar()
		} else {
			return this.teamAvatar
		}
	}

	getNotablePlayers(filteredPositions: POSITION[] = []) {
		let highestScorer: SeasonPlayer | null
		let mostConsistent: SeasonPlayer
		let leastConsistent: SeasonPlayer
		let lowestAvgScorer: SeasonPlayer
		let mostAccuratePredictions: SeasonPlayer
		let leastAccuratePredictions: SeasonPlayer

		this.players.forEach((player, id) => {
			if (
				highestScorer == null &&
				player.weeks_played.length >= 3 &&
				!filteredPositions.includes(player.positions[0])
			) {
				highestScorer = player
				leastConsistent = player
				lowestAvgScorer = player
				mostConsistent = player
				mostAccuratePredictions = player
				leastAccuratePredictions = player
			}
			if (player.weeks_played.length >= 3) {
				if (player.starter_points > highestScorer?.starter_points!) {
					highestScorer = player
				}

				if (player.avgPointsPerStart < lowestAvgScorer.avgPointsPerStart) {
					lowestAvgScorer = player
				}

				if (player.stdDev > leastConsistent.stdDev) {
					leastConsistent = player
				}

				if (player.stdDev < mostConsistent.stdDev) {
					mostConsistent = player
				}

				if (
					player.rootMeanSquareError <
						mostAccuratePredictions.rootMeanSquareError &&
					player.rootMeanSquareError > 0
				) {
					mostAccuratePredictions = player
				}

				if (
					player.rootMeanSquareError >
						leastAccuratePredictions.rootMeanSquareError &&
					player.rootMeanSquareError > 0
				) {
					leastAccuratePredictions = player
				}
			}
		})

		let notablePlayers = {
			bestPlayer: highestScorer!,
			lowestAvgScorer: lowestAvgScorer!,
			leastConsistent: leastConsistent!,
			mostConsistent: mostConsistent!,
			mostAccuratePredictions: mostAccuratePredictions!,
			leastAccuratePredictions: leastAccuratePredictions!,
		}

		return notablePlayers
	}
}
