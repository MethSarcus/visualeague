import {LINEUP_POSITION, POSITION} from '../../utility/rosterFunctions'
import {SleeperRoster} from '../sleeper/SleeperRoster'
import {SleeperUser} from '../sleeper/SleeperUser'
import MemberBadgeData from './MemberBadge'
import MemberScores from './MemberStats'
import SeasonPlayer from './SeasonPlayer'



export default class MemberPageStats {
	teamAvatar?: string | undefined
	teamName: string
	stats: MemberScores = new MemberScores()
	players: Map<string, SeasonPlayer> = new Map()
	draft_pos: number

	constructor(userDetails: SleeperUser | undefined, roster: SleeperRoster, draft_pos: number) {
		this.draft_pos = draft_pos

		if (userDetails?.metadata.team_name != null) {
			this.teamName = userDetails.metadata.team_name
		} else {
			this.teamName = `Team ${userDetails?.display_name ?? "Blank"}`
		}

		if (userDetails?.metadata.avatar != null) {
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
