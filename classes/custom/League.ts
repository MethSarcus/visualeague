import produce, {immerable} from 'immer'
import {Transaction} from 'mongodb'
import {
	LINEUP_POSITION,
	ordinal_suffix_of,
	POSITION,
	standardDeviation,
	TIE_CONST,
} from '../../utility/rosterFunctions'
import {DraftPick} from '../sleeper/DraftPick'
import {LeagueSettings, ScoringSettings} from '../sleeper/LeagueSettings'
import SleeperLeague from '../sleeper/SleeperLeague'
import {SleeperMatchup} from '../sleeper/SleeperMatchup'
import {SleeperRoster} from '../sleeper/SleeperRoster'
import {SleeperTransaction} from '../sleeper/SleeperTransaction'
import {SleeperUser} from '../sleeper/SleeperUser'
import {Draft} from './Draft'
import LeagueMember from './LeagueMember'
import LeagueStats from './LeagueStats'
import Matchup from './Matchup'
import MatchupInterface from './MatchupInterface'
import {MatchupPlayer} from './MatchupPlayer'
import {MatchupSide} from './MatchupSide'
import MemberScores from './MemberStats'
import {OrdinalStatInfo} from './OrdinalStatInfo'
import {SleeperPlayerDetails} from './Player'
import SeasonPlayer from './SeasonPlayer'
import Trade from './Trade'
import {Week} from './Week'

export default class League {
	//members maps roster ID to leaguemember
	//Roster_id should always be number
	//player_id is a string always
	[immerable] = true
	public members: Map<number, LeagueMember> = new Map()
	public weeks: Map<number, Week> = new Map()
	public trades: Trade[]
	public allMatchups: SleeperMatchup[][]
	public settings: LeagueSettings
	public modifiedSettings?: LeagueSettings
	public useModifiedSettings: boolean = false
	public taxiIncludedInMaxPf: boolean = false
	public playerDetails: Map<string, SleeperPlayerDetails> = new Map()
	public playerStatMap: Map<number, any> = new Map()
	public playerProjectionMap: Map<number, any> = new Map()
	public memberIdToRosterId: Map<string, number> = new Map()
	public stats: LeagueStats = new LeagueStats()
	public draft: Draft

	constructor(
		sleeperLeague: SleeperLeague,
		draft: Draft,
		modifiedSettings?: LeagueSettings,
		trades?: SleeperTransaction[]
	) {
		if (modifiedSettings) {
			this.modifiedSettings = modifiedSettings
			this.useModifiedSettings = true
		} else {
			this.modifiedSettings = sleeperLeague.sleeperDetails
		}
		sleeperLeague.player_details.forEach((player: any) => {
			this.playerDetails.set(player._id, player.details)
		})
		sleeperLeague.users.forEach((user: SleeperUser) => {
			sleeperLeague.rosters.forEach((roster: SleeperRoster) => {
				if (roster.owner_id == user.user_id) {
					this.members.set(roster.roster_id, new LeagueMember(user, roster))
					this.memberIdToRosterId.set(user.user_id, roster.roster_id)
				}
			})
		})

		this.draft = draft
		this.allMatchups = sleeperLeague.matchups

		this.settings = sleeperLeague.sleeperDetails

		this.setStats(sleeperLeague.player_stats)
		this.initMemberTradeStats()
		this.setProjections(sleeperLeague.player_projections)
		this.setWeeks(sleeperLeague.matchups, this.getTaxiMap())
		this.calcMemberScores()
		this.setLeagueStats()
		this.setDraftValues()

		if (trades) {
			this.trades = trades?.map((trade) => {
				return new Trade(trade)
			})
		} else {
			this.trades = []
		}
		this.calcTradeStats()
	}

	getMember(rosterId: string | number) {
		if (typeof rosterId == 'string') {
			return this.members.get(parseInt(rosterId))
		} else {
			return this.members.get(rosterId)
		}
	}

	getUserNumberTrades(roster_id: number) {
		let memberTradeNum = 0
		this.trades.forEach((trade) => {
			if (trade.consenter_ids.includes(roster_id)) {
				memberTradeNum += 1
			}
		})

		return memberTradeNum
	}

	calcTradeStats() {
		this.trades.forEach((trade) => {
			trade.playersTraded.forEach((player) => {
				trade.resetPlayerScore(player)
			})
		})

		this.trades.forEach((trade) => {
			let weeks = this.getWeeksSinceTrade(trade.leg)
			trade.playersTraded.forEach((playerId) => {
				trade.addPlayerScore(
					playerId,
					this.getPlayerPointsForSeasonPortion(playerId, weeks)
				)
			})

			trade.setMemberPlayerDifferential()
		})
	}

	//Takes a player_id and array of weeks and returns the total points the player scored during them
	getPlayerPointsForSeasonPortion(player_id: string, weeks: number[]) {
		let points = 0
		weeks.forEach((weekNum) => {
			let week = this.weeks.get(weekNum)
			week?.matchups.forEach((matchup) => {
				let player = matchup.homeTeam.starters.find(
					(element: MatchupPlayer) => {
						return element.playerId == player_id
					}
				)
				if (player != undefined) {
					points += player.score
				} else {
					player = matchup.awayTeam?.starters.find((element: MatchupPlayer) => {
						return element.playerId == player_id
					})
					if (player != undefined) {
						points += player.score
					}
				}
			})
		})

		return points
	}

	getWeeksSinceTrade(tradeLeg: number) {
		let curWeek = this.settings.settings.last_scored_leg
		let weeks = []
		for (let i = tradeLeg; i <= curWeek; i++) {
			weeks.push(i)
		}
		return weeks
	}

	getRosterIdByName(name: string): LeagueMember | void {
		let leagueMember
		this.members.forEach((member) => {
			if (member.name == name) {
				leagueMember = member
			}
		})

		return leagueMember
	}

	getMemberRank(memberId: number, statType: StatType) {
		let stats: LeagueMember[] = []
		this.members.forEach((member, rosterId) => {
			stats.push(member)
		})

		let sorted = stats
			.sort(
				(a: LeagueMember, b: LeagueMember) =>
					b.stats[statType] - a.stats[statType]
			)
			.map((member, index) => {
				if (member.roster.roster_id == memberId) {
					let isAboveAverage = null
					if (index + 1 < stats.length / 2) {
						isAboveAverage = true
					} else if (index + 1 > stats.length / 2) {
						isAboveAverage = false
					}
					return {rank: index + 1, aboveAverage: isAboveAverage}
				}
			})
			.filter((value) => value != undefined)

		return sorted[0]
	}

	getPfOrdinalStats(): OrdinalStatInfo[] {
		let pfStats: LeagueMember[] = []
		this.members.forEach((member, rosterId) => {
			pfStats.push(member)
		})

		return pfStats
			.sort((a: LeagueMember, b: LeagueMember) => b.stats.pf - a.stats.pf)
			.map((member, index) => {
				let isAboveAverage = null
				if (index + 1 < pfStats.length / 2) {
					isAboveAverage = true
				} else if (index + 1 > pfStats.length / 2) {
					isAboveAverage = false
				}
				return new OrdinalStatInfo(
					member.name,
					member.roster.roster_id,
					index + 1,
					`${member.stats.pf.toFixed(2)}`,
					member.avatar,
					isAboveAverage
				)
			})
	}

	getPaOrdinalStats(): OrdinalStatInfo[] {
		let paStats: LeagueMember[] = []
		this.members.forEach((member, rosterId) => {
			paStats.push(member)
		})

		return paStats
			.sort((a: LeagueMember, b: LeagueMember) => b.stats.pa - a.stats.pa)
			.map((member, index) => {
				let isAboveAverage = null
				if (index + 1 < paStats.length / 2) {
					isAboveAverage = true
				} else if (index + 1 > paStats.length / 2) {
					isAboveAverage = false
				}
				return new OrdinalStatInfo(
					member.name,
					member.roster.roster_id,
					index + 1,
					`${member.stats.pa.toFixed(2)}`,
					member.avatar,
					isAboveAverage
				)
			})
	}

	getGpOrdinalStats(): OrdinalStatInfo[] {
		let gpStats: LeagueMember[] = []
		this.members.forEach((member, rosterId) => {
			gpStats.push(member)
		})

		return gpStats
			.sort((a: LeagueMember, b: LeagueMember) => b.stats.gp - a.stats.gp)
			.map((member, index) => {
				let isAboveAverage = null
				if (index + 1 < gpStats.length / 2) {
					isAboveAverage = true
				} else if (index + 1 > gpStats.length / 2) {
					isAboveAverage = false
				}
				return new OrdinalStatInfo(
					member.name,
					member.roster.roster_id,
					index + 1,
					`${member.stats.gp.toFixed(2)}`,
					member.avatar,
					isAboveAverage
				)
			})
	}

	getPowerRankOrdinalStats(): OrdinalStatInfo[] {
		let powerRankStats: LeagueMember[] = []
		this.members.forEach((member, rosterId) => {
			powerRankStats.push(member)
		})

		return powerRankStats
			.sort(
				(a: LeagueMember, b: LeagueMember) =>
					b.stats.power_wins - a.stats.power_wins
			)
			.map((member, index) => {
				let isAboveAverage = null
				if (index + 1 < powerRankStats.length / 2) {
					isAboveAverage = true
				} else if (index + 1 > powerRankStats.length / 2) {
					isAboveAverage = false
				}
				return new OrdinalStatInfo(
					member.name,
					member.roster.roster_id,
					index + 1,
					`${(
						member.stats.power_wins /
						(member.stats.power_wins + member.stats.power_losses)
					).toFixed(3)}`,
					member.avatar,
					isAboveAverage
				)
			})
	}

	//Creates a map mapping week number to a map of player id to the players stats
	//The incoming array contains an array of stats objects
	setStats(stats: object[][]) {
		try {
			stats?.forEach((statList: any, index: number) => {
				let weekNum = index + 1
				this.playerStatMap.set(weekNum, new Map())
				statList?.forEach((stat: any) => {
					this.playerStatMap.get(weekNum).set(stat._id, stat.stats)
				})
			})
		} catch (error) {
			console.log(error)
		}
	}

	//Creates a map mapping week number to a map of player id to the players projections
	setProjections(projections: object[][]) {
		projections.forEach((projectionList: any, index: number) => {
			let weekNum = index + 1
			this.playerProjectionMap.set(weekNum, new Map())
			projectionList.forEach((stat: any) => {
				this.playerProjectionMap.get(weekNum).set(stat._id, stat.stats)
			})
		})
	}

	setTaxiSquadIncluded(include: boolean) {
		this.taxiIncludedInMaxPf = include
	}

	modifyStats(customSettings: ScoringSettings, useTaxiSquad: boolean) {
		this.modifiedSettings = produce(
			this.modifiedSettings,
			(draftState: LeagueSettings) => {
				draftState.scoring_settings = customSettings
			}
		)
		this.useModifiedSettings = true
		this.recalcStats(useTaxiSquad)
	}

	disableModifiedStats() {
		this.useModifiedSettings = false
	}

	getPositions() {
		if (this.settings.roster_positions != undefined) {
			return this.settings.roster_positions
				.map((pos) => {
					if (Object.values(POSITION).includes(pos as POSITION)) {
						return pos as POSITION
					}
				})
				.filter((value, index, array) => {
					return value != undefined && array.indexOf(value) === index
				})
		} else {
			return []
		}
	}

	setWeeks(allMatchups: SleeperMatchup[][], taxiMap?: Map<number, string[]>) {
		allMatchups.forEach((weekMatchups: SleeperMatchup[], index: number) => {
			let weekNum = index + 1
			let isPlayoffs = false
			if (
				this.settings.playoff_week_start &&
				this.settings.playoff_week_start <= weekNum
			) {
				isPlayoffs = true
			}
			let settings = this.settings
			if (this.useModifiedSettings && this.modifiedSettings) {
				settings = this.modifiedSettings
			}
			let week = new Week(
				weekNum,
				weekMatchups,
				this.playerStatMap,
				this.playerProjectionMap,
				this.playerDetails,
				settings,
				isPlayoffs,
				taxiMap
			)
			this.weeks.set(weekNum, week)
		})
	}

	setDraftValues() {
		this.weeks.forEach((week) => {
			week.matchups.forEach((matchup: Matchup) => {
				let players = [
					matchup.homeTeam.starters,
					matchup.homeTeam.bench,
					matchup.awayTeam?.starters,
					matchup.awayTeam?.bench,
				]
					.flat()
					.filter((player) => {
						return player != undefined
					})

				players.forEach((player) => {
					if (this.draft.picks.has(player?.playerId!)) {
						this.draft.picks
							.get(player?.playerId!)!
							.addGame(player?.score as number)
					}
				})
			})
		})

		this.draft.calculatePlayerDraftValue()

		this.draft.picks.forEach(pick => {
			this.members.get(pick.roster_id)?.stats?.addDraftValue(pick.draftValue)
		})
	}

	getWorstTrade() {
		let worstTrade: undefined | Trade
		let biggestDiff = 0
		this.trades.forEach((trade) => {
			if (worstTrade == undefined) {
				worstTrade = trade
				biggestDiff = worstTrade.biggestPointDifferential
			} else {
				if (biggestDiff < trade.biggestPointDifferential) {
					worstTrade = trade
					biggestDiff = worstTrade.biggestPointDifferential
				}
			}
		})

		return worstTrade
	}

	getSortedTrades() {
		return this.trades.sort((a, b) => {
			if (a.biggestPointDifferential < b.biggestPointDifferential) {
				return 1
			} else if (a.biggestPointDifferential > b.biggestPointDifferential) {
				return -1
			} else {
				return 0
			}
		})
	}

	getTradeScoreSortedTrades() {
		return [...this.trades].sort((a, b) => {
			if (a.biggestTradeScoreDifferential < b.biggestTradeScoreDifferential) {
				return 1
			} else if (
				a.biggestTradeScoreDifferential > b.biggestTradeScoreDifferential
			) {
				return -1
			} else {
				return 0
			}
		})
	}

	getPointsPlayerScored(playerId: string, roster_id: number) {
		return this.members.get(roster_id)?.players.get(playerId)?.points_scored
	}

	getLeagueNotableWeeks() {
		let matchupForBestTeam: Matchup | undefined = undefined
		let matchupForWorstTeam: Matchup | undefined = undefined
		let closestGame: Matchup | undefined = undefined
		let furthestGame: Matchup | undefined = undefined
		let biggestShootout: Matchup | undefined = undefined //highest combined score
		let smallestShootout: Matchup | undefined = undefined
		this.weeks.forEach((week) => {
			week.matchups.forEach((matchup) => {
				if (matchup != undefined) {
					if (matchupForBestTeam == undefined) {
						matchupForBestTeam = matchup
						matchupForWorstTeam = matchup
						closestGame = matchup
						furthestGame = matchup
						biggestShootout = matchup
						smallestShootout = matchup
					} else {
						let homeTeam = matchup.homeTeam
						let awayTeam = matchup.awayTeam
						if (awayTeam) {
							let highScore =
								matchup.getMemberSide(matchup.winnerRosterId)?.pf ??
								matchup.homeTeam
							let lowScore =
								matchup.getMemberSide(matchup.loserRosterId!)?.pf ??
								matchup.awayTeam
							let margin = matchup.getMargin()
							let combinedScore = homeTeam.pf + (awayTeam?.pf ?? 0)

							if (
								highScore! >
								(matchupForBestTeam?.getWinner()?.pf ??
									matchupForBestTeam.homeTeam.pf)
							) {
								matchupForBestTeam = matchup
							}

							if (
								lowScore! <
								(matchupForWorstTeam?.getLoser()?.pf! ??
									matchupForWorstTeam?.homeTeam.pf)
							) {
								matchupForWorstTeam = matchup
							}

							if (margin < closestGame?.getMargin()!) {
								closestGame = matchup
							}

							if (margin > furthestGame?.getMargin()!) {
								furthestGame = matchup
							}

							if (combinedScore > biggestShootout?.getCombinedScore()!) {
								biggestShootout = matchup
							}

							if (
								combinedScore < smallestShootout?.getCombinedScore()! &&
								!matchup.isByeWeek
							) {
								smallestShootout = matchup
							}
						}
					}
				}
			})
		})

		return {
			matchupForBestTeam: matchupForBestTeam,
			matchupForWorstTeam: matchupForWorstTeam,
			closestGame: closestGame,
			furthestGame: furthestGame,
			biggestShootout: biggestShootout,
			smallestShootout: smallestShootout,
		}
	}

	getMemberNotableWeeks(rosterId: number) {
		let bestWeek: MatchupInterface | undefined = undefined
		let worstWeek: MatchupInterface | undefined = undefined
		let closestGame: MatchupInterface | undefined = undefined
		let furthestGame: MatchupInterface | undefined = undefined
		this.weeks.forEach((week) => {
			let matchup = week.getMemberMatchup(rosterId)
			if (matchup != undefined && !matchup.isByeWeek) {
				if (bestWeek == undefined) {
					bestWeek = matchup
					worstWeek = matchup
					closestGame = matchup
					furthestGame = matchup
				} else {
					if (
						matchup.getMemberSide(rosterId)!.pf >
						bestWeek.getMemberSide(rosterId)!.pf
					) {
						bestWeek = matchup
					}

					if (
						matchup.getMemberSide(rosterId)!.pf <
						worstWeek!.getMemberSide(rosterId)!.pf
					) {
						worstWeek = matchup
					}

					if (matchup.getMargin()! < closestGame?.getMargin()!) {
						closestGame = matchup
					}

					if (matchup.getMargin()! > furthestGame?.getMargin()!) {
						furthestGame = matchup
					}
				}
			}
		})

		return {
			bestWeek: bestWeek,
			worstWeek: worstWeek,
			closestGame: closestGame,
			furthestGame: furthestGame,
		}
	}

	setLeagueStats() {
		let pf = 0
		let pa = 0
		let pp = 0
		let opslap = 0
		let gp = 0
		this.members.forEach((member, rosterId) => {
			pf += member.stats.pf
			pa += member.stats.pa
			pp += member.stats.pp
			opslap += member.stats.opslap
			gp += member.stats.gp
		})
		let positionStarts: Map<POSITION, number> = new Map()
		let positionScores: Map<POSITION, number> = new Map()
		this.members.forEach((member, rosterId) => {
			member.stats.position_starts.forEach((numStarts, pos) => {
				if (positionStarts.has(pos)) {
					positionStarts.set(pos, positionStarts.get(pos)! + numStarts)
				} else {
					positionStarts.set(pos, numStarts)
				}
			})

			member.stats.position_scores.forEach((points, pos) => {
				if (positionScores.has(pos)) {
					positionScores.set(pos, positionScores.get(pos)! + points)
				} else {
					positionScores.set(pos, points)
				}
			})
		})

		this.stats.position_scores = positionScores
		this.stats.position_starts = positionStarts

		this.stats.avg_pf = pf / this.members.size
		this.stats.avg_pa = pa / this.members.size
		this.stats.avg_pp = pp / this.members.size
		this.stats.avg_opslap = opslap / this.members.size
		this.stats.avg_gp = gp / this.members.size
	}

	getPlayerStat(playerId: number, weekNum: number) {
		return this.playerStatMap.get(weekNum).get(playerId.toString())
	}

	getPlayerProjection(playerId: number, weekNum: number) {
		return this.playerProjectionMap.get(weekNum).get(playerId.toString())
	}

	changeName(name: string) {
		this.settings.name = name
	}

	initMemberTradeStats() {
		this.members.forEach((member: LeagueMember, rosterId: number) => {
			for (let i = 1; i <= this.members.size; i++) member.tradeStats.set(i, 0)
		})
	}

	getNotableMembers() {
		let bestManager: LeagueMember
		let worstManager: LeagueMember
		let highestScoring: LeagueMember
		let lowestScoring: LeagueMember
		let mostConsistent: LeagueMember
		let leastConsistent: LeagueMember

		this.members.forEach((member, rosterId) => {
			if (!bestManager) {
				bestManager = member
				worstManager = member
				highestScoring = member
				lowestScoring = member
				mostConsistent = member
				leastConsistent = member
			} else {
				if (member.stats.pf > highestScoring.stats.pf) {
					highestScoring = member
				}
				if (member.stats.pf < lowestScoring.stats.pf) {
					lowestScoring = member
				}
				if (member.stats.gp > bestManager.stats.gp) {
					bestManager = member
				}
				if (member.stats.gp < worstManager.stats.gp) {
					worstManager = member
				}

				if (member.stats.stdDev < mostConsistent.stats.stdDev) {
					mostConsistent = member
				}
				if (member.stats.stdDev > leastConsistent.stats.stdDev) {
					leastConsistent = member
				}
			}
		})

		return {
			bestManager: bestManager!,
			worstManager: worstManager!,
			highestScoring: highestScoring!,
			lowestScoring: lowestScoring!,
			mostConsistent: mostConsistent!,
			leastConsistent: leastConsistent!,
		}
	}

	recalcStats(useTaxiSquad: boolean) {
		let taxiMap
		for (let [key, member] of this.members) {
			member.stats = new MemberScores()
		}
		if (!useTaxiSquad) {
			this.taxiIncludedInMaxPf = useTaxiSquad
			taxiMap = this.getTaxiMap()
		}
		this.setWeeks(this.allMatchups, taxiMap)
		this.calcMemberScores()
		this.calcTradeStats()
	}

	//Returns a map of roster id to list of player ids on taxi squad
	getTaxiMap() {
		let taxiMap = new Map()
		this.members.forEach((member) => {
			taxiMap.set(member.roster.roster_id, member.roster.taxi)
		})

		return taxiMap
	}

	calcMemberScores() {
		this.weeks.forEach((week) => {
			week.matchups.forEach((matchup) => {
				let homeId = matchup.homeTeam.roster_id
				let homeMember = this.members.get(homeId)
				let homeTeam = matchup.homeTeam
				if (homeMember) {
					homeMember.stats.pf += homeTeam.pf
					homeMember.stats.pp += homeTeam.pp
					homeMember.stats.opslap += homeTeam.opslap
					homeMember.stats.gp += homeTeam.gp
					homeMember.stats.gutPlays += homeTeam.gut_plays
					homeMember.stats.custom_points += homeTeam.custom_points

					homeTeam.starters.forEach((player) => {
						if (homeMember!.players.has(player.playerId!)) {
							homeMember!.players
								.get(player.playerId!)!
								.addWeek(
									week.weekNumber,
									player.score,
									player.projectedScore,
									true
								)
						} else {
							let seasonPlayer = new SeasonPlayer(
								player.playerId!,
								homeTeam.roster_id,
								player.position as LINEUP_POSITION,
								player.eligiblePositions as POSITION[]
							)
							seasonPlayer.addWeek(
								week.weekNumber,
								player.score,
								player.projectedScore,
								true
							)
							homeMember!.players.set(player.playerId!, seasonPlayer)
						}
					})

					homeTeam.bench.forEach((player) => {
						if (homeMember!.players.has(player.playerId!)) {
							homeMember!.players
								.get(player.playerId!)!
								.addWeek(
									week.weekNumber,
									player.score,
									player.projectedScore,
									false
								)
						} else {
							let seasonPlayer = new SeasonPlayer(
								player.playerId!,
								homeTeam.roster_id,
								player.position as LINEUP_POSITION,
								player.eligiblePositions as POSITION[]
							)
							seasonPlayer.addWeek(
								week.weekNumber,
								player.score,
								player.projectedScore,
								false
							)
							homeMember!.players.set(player.playerId!, seasonPlayer)
						}
					})
					homeTeam.position_starts.forEach((value, key) => {
						if (homeMember?.stats.position_scores.has(key)) {
							homeMember?.stats.position_starts.set(
								key,
								homeMember.stats.position_starts.get(key)!! + value
							)
							homeMember?.stats.position_scores.set(
								key,
								homeMember.stats.position_scores.get(key)!! +
									homeTeam.position_scores.get(key)!!
							)
							homeMember?.stats.projected_position_scores.set(
								key,
								homeMember.stats.projected_position_scores.get(key)!! +
									homeTeam.position_projected_scores.get(key)!!
							)
						} else {
							homeMember?.stats.position_starts.set(key, value)
							homeMember?.stats.position_scores.set(
								key,
								homeTeam.position_scores.get(key)!!
							)
							homeMember?.stats.projected_position_scores.set(
								key,
								homeTeam.position_projected_scores.get(key)!!
							)
						}
					})
					let awayTeam = matchup.awayTeam
					let awayMember = this.members.get(matchup.awayTeam?.roster_id ?? 0)
					if (awayTeam && awayMember) {
						let awayId = matchup.awayTeam?.roster_id

						homeMember.stats.pa += awayTeam.pf
						awayMember.stats.pf += awayTeam.pf
						awayMember.stats.pp += awayTeam.pp
						awayMember.stats.opslap += awayTeam.opslap
						awayMember.stats.gp += awayTeam.gp
						awayMember.stats.gutPlays += awayTeam.gut_plays
						awayMember.stats.custom_points += awayTeam.custom_points
						awayMember.stats.pa += homeTeam.pf

						awayTeam.starters.forEach((player) => {
							if (awayMember!.players.has(player.playerId!)) {
								awayMember!.players
									.get(player.playerId!)!
									.addWeek(
										week.weekNumber,
										player.score,
										player.projectedScore,
										true
									)
							} else {
								let seasonPlayer = new SeasonPlayer(
									player.playerId!,
									homeTeam.roster_id,
									player.position as LINEUP_POSITION,
									player.eligiblePositions as POSITION[]
								)
								seasonPlayer.addWeek(
									week.weekNumber,
									player.score,
									player.projectedScore,
									true
								)
								awayMember!.players.set(player.playerId!, seasonPlayer)
							}
						})

						awayTeam.bench.forEach((player) => {
							if (awayMember!.players.has(player.playerId!)) {
								awayMember!.players
									.get(player.playerId!)!
									.addWeek(
										week.weekNumber,
										player.score,
										player.projectedScore,
										false
									)
							} else {
								let seasonPlayer = new SeasonPlayer(
									player.playerId!,
									homeTeam.roster_id,
									player.position as LINEUP_POSITION,
									player.eligiblePositions as POSITION[]
								)
								seasonPlayer.addWeek(
									week.weekNumber,
									player.score,
									player.projectedScore,
									false
								)
								awayMember!.players.set(player.playerId!, seasonPlayer)
							}
						})

						awayTeam.position_starts.forEach((value, key) => {
							if (awayMember?.stats.position_scores.has(key)) {
								awayMember?.stats.position_starts.set(
									key,
									awayMember.stats.position_starts.get(key)!! + value
								)
								awayMember?.stats.position_scores.set(
									key,
									awayMember.stats.position_scores.get(key)!! +
										awayTeam?.position_scores.get(key)!!
								)
								awayMember?.stats.projected_position_scores.set(
									key,
									awayMember.stats.projected_position_scores.get(key)!! +
										awayTeam?.position_projected_scores.get(key)!!
								)
							} else {
								awayMember?.stats.position_starts.set(key, value)
								awayMember?.stats.position_scores.set(
									key,
									awayTeam?.position_scores.get(key)!!
								)
								awayMember?.stats.projected_position_scores.set(
									key,
									awayTeam?.position_projected_scores.get(key)!!
								)
							}
						})

						if (matchup.winnerRosterId == homeMember.roster.roster_id) {
							homeMember.stats.wins += 1
							awayMember.stats.losses += 1
							if (homeMember.division_id == awayMember.division_id) {
								homeMember.stats.divisionWins += 1
								awayMember.stats.divisionLosses += 1
							}
						} else if (awayMember.roster.roster_id == matchup.winnerRosterId) {
							awayMember.stats.wins += 1
							homeMember.stats.losses += 1
							if (homeMember.division_id == awayMember.division_id) {
								awayMember.stats.divisionWins += 1
								homeMember.stats.divisionLosses += 1
							}
						} else if (matchup.winnerRosterId == TIE_CONST) {
							homeMember.stats.ties += 1
							awayMember.stats.ties += 1
							if (homeMember.division_id == awayMember.division_id) {
								homeMember.stats.divisionTies += 1
								awayMember.stats.divisionTies += 1
							}
						}

						if (
							homeMember.roster.roster_id == matchup.projectedWinnerRosterId
						) {
							awayMember.stats.timesUnderdog += 1
							if (matchup.winnerRosterId != homeId) {
								homeMember.stats.wasUpset += 1
								awayMember.stats.upsets += 1
							}
						} else if (
							awayMember.roster.roster_id == matchup.projectedWinnerRosterId
						) {
							homeMember.stats.timesUnderdog += 1
							if (matchup.winnerRosterId != awayId) {
								awayMember.stats.wasUpset += 1
								homeMember.stats.upsets += 1
							}
						}
					}
				}
			})

			week.byeWeeks.forEach((byeweek) => {
				let homeTeam = byeweek.homeTeam
				let homeMember = this.members.get(homeTeam.roster_id)
				homeTeam.starters.forEach((player) => {
					if (homeMember!.players.has(player.playerId!)) {
						homeMember!.players
							.get(player.playerId!)!
							.addWeek(
								week.weekNumber,
								player.score,
								player.projectedScore,
								true
							)
					} else {
						let seasonPlayer = new SeasonPlayer(
							player.playerId!,
							homeTeam.roster_id,
							player.position as LINEUP_POSITION,
							player.eligiblePositions as POSITION[]
						)
						seasonPlayer.addWeek(
							week.weekNumber,
							player.score,
							player.projectedScore,
							true
						)
						homeMember!.players.set(player.playerId!, seasonPlayer)
					}
				})

				homeTeam.bench.forEach((player) => {
					if (homeMember!.players.has(player.playerId!)) {
						homeMember!.players
							.get(player.playerId!)!
							.addWeek(
								week.weekNumber,
								player.score,
								player.projectedScore,
								false
							)
					} else {
						let seasonPlayer = new SeasonPlayer(
							player.playerId!,
							homeTeam.roster_id,
							player.position as LINEUP_POSITION,
							player.eligiblePositions as POSITION[]
						)
						seasonPlayer.addWeek(
							week.weekNumber,
							player.score,
							player.projectedScore,
							false
						)
						homeMember!.players.set(player.playerId!, seasonPlayer)
					}
				})
				homeTeam.position_starts.forEach((value, key) => {
					if (homeMember?.stats.position_scores.has(key)) {
						homeMember?.stats.position_starts.set(
							key,
							homeMember.stats.position_starts.get(key)!! + value
						)
						homeMember?.stats.position_scores.set(
							key,
							homeMember.stats.position_scores.get(key)!! +
								homeTeam.position_scores.get(key)!!
						)
						homeMember?.stats.projected_position_scores.set(
							key,
							homeMember.stats.projected_position_scores.get(key)!! +
								homeTeam.position_projected_scores.get(key)!!
						)
					} else {
						homeMember?.stats.position_starts.set(key, value)
						homeMember?.stats.position_scores.set(
							key,
							homeTeam.position_scores.get(key)!!
						)
						homeMember?.stats.projected_position_scores.set(
							key,
							homeTeam.position_projected_scores.get(key)!!
						)
					}
				})
			})
			let teams: MatchupSide[] = week.getAllTeams()

			teams.sort((a: MatchupSide, b: MatchupSide) => {
				if (a.pf < b.pf) {
					return 1
				} else if (a.pf > b.pf) {
					return -1
				} else {
					return 0
				}
			})

			teams.forEach((team, index) => {
				let member = this.members.get(team.roster_id)
				let pwrwins = this.members.size - index
				let pwrlosses = this.members.size - pwrwins
				if (member) {
					member.stats.power_wins += pwrwins - 1
					member.stats.power_losses += pwrlosses
				}
			})
		})

		this.members.forEach((member) => {
			let allWeekScores: number[] = []
			this.getAllWeeksForMember(member.roster.roster_id).forEach((matchup) => {
				allWeekScores.push(matchup.getMemberSide(member.roster.roster_id)?.pf!)
			})

			member.stats.stdDev = standardDeviation(allWeekScores)
			member.stats.win_pct =
				member.stats.wins /
				(member.stats.wins + member.stats.losses + member.stats.ties)
		})

		this.members.forEach((member) => {
			member.stats.overall_rank = this.getMemberRank(
				member.roster.roster_id,
				StatType.OVERALL
			)?.rank!

			member.players.forEach((player) => {
				player.calcStats()
			})

			this.getPositions().forEach(position => {
				if (position) {
					Array.from(member.players.values()).filter(player => player.positions.includes(position) && member.roster.players.includes(player.id)).sort(
						(a: SeasonPlayer, b: SeasonPlayer) =>
							b.points_scored - a.points_scored
					).forEach((player, index) => {
						player.teamPositionRank = index + 1
					})
				}

			})


		})
	}

	getAllWeeksForMember(rosterId: number) {
		let allWeeks: MatchupInterface[] = []
		this.weeks.forEach((week, weekNumber) => {
			allWeeks.push(week.getMemberMatchup(rosterId))
		})

		return allWeeks
	}
}

export enum StatType {
	PF = 'pf',
	PA = 'pa',
	PP = 'pp',
	GP = 'gp',
	OPSLAP = 'opslap',
	POWER_RANK = 'power_wins',
	OVERALL = 'win_pct',
}
