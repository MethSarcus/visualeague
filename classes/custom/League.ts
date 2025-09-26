import e from 'cors'
import {produce, immerable} from 'immer'
import {
	LINEUP_POSITION,
	POSITION,
	standardDeviation,
	TIE_CONST,
} from '../../utility/rosterFunctions'
import {DraftPick} from '../sleeper/DraftPick'
import {DraftOrder} from '../sleeper/DraftSettings'
import {LeagueSettings, ScoringSettings} from '../sleeper/LeagueSettings'
import LeagueData from '../sleeper/SleeperLeague'
import {SleeperMatchup} from '../sleeper/SleeperMatchup'
import {SleeperRoster} from '../sleeper/SleeperRoster'
import {SleeperTransaction} from '../sleeper/SleeperTransaction'
import {SleeperUser, UserData} from '../sleeper/SleeperUser'
import {Draft, DraftPlayer} from './Draft'
import LeagueMember from './LeagueMember'
import LeagueStats from './LeagueStats'
import Matchup from './Matchup'
import MatchupInterface from './MatchupInterface'
import {MatchupPlayer} from './MatchupPlayer'
import {MatchupSide} from './MatchupSide'
import MemberScores from './MemberStats'
import {OrdinalStatInfo} from './OrdinalStatInfo'
import Player, {DatabasePlayer, PlayerScores, SleeperPlayerDetails} from './Player'
import RivalMap, {RivalStats} from './RivalStats'
import SeasonPlayer from './SeasonPlayer'
import StatsResponse from './StatsResponse'
import Trade from './Trade'
import {Week} from './Week'

export default class League {
	//members maps roster ID to leaguemember
	//Roster_id should always be number
	//player_id is a string always
	[immerable] = true
	public members: Map<number, LeagueMember> = new Map()
	public seasonPortion: SeasonPortion = SeasonPortion.ALL
	public weeks: Map<number, Week> = new Map()
	public rivals: Map<number, Map<number, RivalStats>> = new Map()
	public memberStreaks: Map<number, number> = new Map()
	public trades: Trade[]
	public allMatchups: SleeperMatchup[][]
	public settings: LeagueSettings
	public modifiedSettings?: LeagueSettings
	public useModifiedSettings: boolean = false
	public taxiIncludedInMaxPf: boolean = false
	public memberIdToRosterId: Map<string, number> = new Map()
	public stats: LeagueStats = new LeagueStats()
	public draft: Draft
	public userData: UserData[]
	customSettings?: ScoringSettings

	constructor(
		users: UserData[],
		matchups: SleeperMatchup[][],
		leagueSettings: LeagueSettings,
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, DatabasePlayer>,
		draft: Draft,
		trades?: SleeperTransaction[],
		customSettings?: ScoringSettings
	) {
		this.userData = users
		users.forEach((user: UserData) => {
			let order = draft.settings.draft_order
			let draftPos = order[user.user_id as unknown as keyof DraftOrder]
			this.members.set(user.roster.roster_id, new LeagueMember(user, draftPos))
			this.memberIdToRosterId.set(user.user_id, user.roster.roster_id)
		})

		this.draft = draft
		this.allMatchups = matchups
		this.customSettings = customSettings
		this.settings = leagueSettings
		this.initMemberTradeMap()
		this.calcStats(playerScores, playerDetails, false)
		this.createRivalsMaps()
		//this.setRivalWeeks()
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

	getMemberByName(name: string | number): LeagueMember | undefined {
		let member = undefined
		this.members.forEach((mem) => {
			if (name == mem.name) {
				member = mem
			}
		})
		return member
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

	setSeasonPortion(
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, DatabasePlayer>,
		portion: SeasonPortion
	) {
		this.seasonPortion = portion
		this.reCalcStats(playerScores, playerDetails, this.taxiIncludedInMaxPf)
	}

	getLeagueStreaks(): {winStreakMember: LeagueMember | null, winStreak: number, losingStreak: number, losingStreakMember: LeagueMember | null} {
		let winStreak = 0
		let bestWinStreak: LeagueMember | null = null
		let losingStreak = 0
		let worstLossMember: LeagueMember | null = null
		this.members.forEach(member => {
				let currentStreak = this.calcMemberStreak(member.roster.roster_id)
				if (currentStreak > winStreak) {
					bestWinStreak = member
					winStreak = currentStreak
				} else if (currentStreak < losingStreak) {
					losingStreak = currentStreak
					worstLossMember = member
				}
			})
			return {
				winStreakMember: bestWinStreak,
				winStreak: winStreak,
				losingStreak: losingStreak,
				losingStreakMember: worstLossMember
			}
	}

	getLeagueSuperStats() {
		let streaks = this.getLeagueStreaks()
		let underdog = this.members.get(0)
		let favored = this.members.get(0)
		let mostConsistent = this.members.get(0)
		let leastConsistent = this.members.get(0)
		let bestTrajectory = this.members.get(0)
		let worstTrajectory = this.members.get(0)


		this.members.forEach((member) => {
			if (member.stats.upsets > (underdog?.stats.timesUnderdog ?? 0)) {
				underdog = member
			}

			if (member.stats.wasUpset > (favored?.stats.wasUpset ?? 0)) {
				favored = member
			}

			if (member.stats.stdDev < (mostConsistent?.stats.stdDev ?? 1000)) {
				mostConsistent = member
			}

			if (member.stats.stdDev > (leastConsistent?.stats.stdDev ?? 0)) {
				leastConsistent = member
			}

			if (member.stats.trajectory > (bestTrajectory?.stats.trajectory ?? 0)) {
				bestTrajectory = member
			}

			if (member.stats.trajectory < (worstTrajectory?.stats.trajectory ?? 0)) {
				worstTrajectory = member
			}
		})

		return {
			underdog: underdog,
			tooBigToFail: favored,
			mostConsistent: mostConsistent,
			leastConsistent: leastConsistent,
			bestTrajectory: bestTrajectory,
			worstTrajectory: worstTrajectory,
			bestStreak: streaks.winStreakMember,
			worstStreak: streaks.losingStreakMember
		}
	}

	calcMemberStreak(roster_id: number) {
		let currentStreak = 0
		let member = this.members.get(roster_id)
		if (member) {
			let memberResults = member?.stats.weekResults ?? []
			let latestResult: WEEK_RESULT = member?.stats.weekResults[memberResults.length - 1] ?? WEEK_RESULT.TIE
			let currentWeek = memberResults.length - 1
			while (latestResult == memberResults[currentWeek]) {
				if (latestResult == WEEK_RESULT.WIN) {
					currentStreak += 1
				} else if (latestResult == WEEK_RESULT.LOSS) {
					currentStreak -= 1
				}

				currentWeek -= 1
			}
			member.stats.currentStreak = currentStreak
		}
		return currentStreak

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
				trade.addPlayerScore(playerId, this.getPlayerPointsForSeasonPortion(playerId, weeks))
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
				let player = matchup.homeTeam.starters.find((element: MatchupPlayer) => {
					return element.playerId == player_id
				})
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

	createRivalsMaps() {
		this.members.forEach((member) => {
			let memberRivalMap = new Map<number, RivalStats>()
			this.members.forEach((rival) => {
				memberRivalMap.set(rival.roster.roster_id, new RivalStats(rival.roster.roster_id))
			})

			this.weeks.forEach((week) => {
				let memberMatchup = week.getMemberMatchup(member.roster.roster_id)
				if (memberMatchup != undefined && memberMatchup instanceof Matchup) {
					let opponent = memberMatchup.getOpponent(member.roster.roster_id)
					if (opponent != undefined) {
						memberRivalMap
							.get(opponent.roster_id)
							?.addGame(member.roster.roster_id, opponent.roster_id, memberMatchup)
					}
				}
			})
			this.rivals.set(member.roster.roster_id, memberRivalMap)
		})
	}

	getMemberRival(rosterId: number): RivalStats | null {
		let memberRival: RivalStats | null = null
		let smallestDiff: number | null = null
		this.rivals.get(rosterId)?.forEach((rival) => {
			if (rival.wins + rival.losses + rival.ties > 0) {
				if (smallestDiff == null) {
					smallestDiff = Math.abs(rival.getPointDifferential())
					memberRival = rival
				} else {
					if (rival.getPointDifferential() < smallestDiff) {
						smallestDiff = Math.abs(rival.getPointDifferential())
						memberRival = rival
					}
				}
			}
		})

		return memberRival
	}

	getMemberNemesis(rosterId: number): RivalStats | null {
		let memberRival: RivalStats | null = null
		let biggestDiff: number | null = null
		this.rivals.get(rosterId)?.forEach((rival) => {
			if (rival.wins + rival.losses + rival.ties > 0) {
				if (biggestDiff == null) {
					biggestDiff = rival.getPointDifferential()
					memberRival = rival
				} else {
					if (rival.getPointDifferential() < biggestDiff) {
						biggestDiff = rival.getPointDifferential()
						memberRival = rival
					}
				}
			}
		})

		return memberRival
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
			.sort((a: LeagueMember, b: LeagueMember) => b.stats[statType] - a.stats[statType])
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
			.sort((a: LeagueMember, b: LeagueMember) => b.stats.power_wins - a.stats.power_wins)
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
					`${(member.stats.power_wins / (member.stats.power_wins + member.stats.power_losses)).toFixed(3)}`,
					member.avatar,
					isAboveAverage
				)
			})
	}

	setTaxiSquadIncluded(include: boolean) {
		this.taxiIncludedInMaxPf = include
	}

	modifyStats(
		customSettings: ScoringSettings,
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, DatabasePlayer>,
		useTaxiSquad: boolean
	) {
		this.modifiedSettings = produce(this.modifiedSettings, (draftState: LeagueSettings) => {
			draftState.scoring_settings = customSettings
		})

		this.useModifiedSettings = true
		this.reCalcStats(playerScores, playerDetails, useTaxiSquad)
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

	calcLeagueWeeks(
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, DatabasePlayer>,
		taxiMap?: Map<number, string[]>
	) {
		this.weeks = new Map()
		let matchups = this.getEligibleMatchups()
		matchups.forEach((week) => {
			let weekNum = week.weekNumber
			let isPlayoffs = false
			if (this.settings.settings.playoff_week_start && this.settings.settings.playoff_week_start <= weekNum) {
				isPlayoffs = true
			}
			let settings = this.settings
			if (this.useModifiedSettings && this.modifiedSettings) {
				settings = this.modifiedSettings
			}
			let weekObj = new Week(
				weekNum,
				week.matchups ?? [],
				playerScores,
				playerDetails,
				settings,
				isPlayoffs,
				taxiMap
			)
			this.weeks.set(weekNum, weekObj)
		})
	}

	calcDraftValues(playerScores: Map<string, PlayerScores>, playerDetails: Map<string, DatabasePlayer>) {
		let totalDraftValue = 0
		let posScoreMap = new Map()
		this.getPositions().forEach((position) => {
			if (position != undefined) {
				posScoreMap.set(position, this.stats.getPositionAvgPPG(position))
			}
		})
		this.draft.picks.forEach((pick, player_id) => {
			//TODO revisit this and maybe change to be based on projections in case a player scores 0 points
			this.getEnabledWeeks().forEach((weekNum) => {
				if (playerScores.get(pick.player_id)?.stats?.has(weekNum)) {
					pick.addGame(playerScores.get(player_id)?.stats.get(weekNum) ?? 0)
				} else {
					pick.addGame(0)
				}
			})

			pick.setDraftValue(posScoreMap.get(pick.metadata.position as POSITION))
			this.members.get(pick.roster_id)?.stats?.addDraftValue(pick.draftValue)
		})

		this.draft.calcNotableDraftStats()

		this.members.forEach((member) => {
			totalDraftValue += member.stats.draftValue
		})

		this.members.forEach((mem) => {
			mem.stats.draftPercentage = parseFloat(((mem.stats.draftValue / totalDraftValue) * 100).toFixed(2))
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
			} else if (a.biggestTradeScoreDifferential > b.biggestTradeScoreDifferential) {
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
							let highScore = matchup.getMemberSide(matchup.winnerRosterId)?.pf ?? matchup.homeTeam?.pf
							let lowScore = matchup.getMemberSide(matchup.loserRosterId!)?.pf ?? matchup.awayTeam?.pf
							let margin = matchup.getMargin()
							let combinedScore = homeTeam.pf + (awayTeam?.pf ?? 0)

							if (highScore! > (matchupForBestTeam?.getWinner()?.pf ?? matchupForBestTeam.homeTeam.pf)) {
								matchupForBestTeam = matchup
							}

							if (lowScore! < (matchupForWorstTeam?.getLoser()?.pf! ?? matchupForWorstTeam?.homeTeam.pf)) {
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

							if (combinedScore < smallestShootout?.getCombinedScore()! && !matchup.isByeWeek) {
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
		this.getEnabledWeeks().forEach((weekNum) => {
			let matchup = this.weeks.get(weekNum)?.getMemberMatchup(rosterId)
			if (matchup != undefined) {
				if (closestGame == undefined && !matchup.isByeWeek) {
					closestGame = matchup
					furthestGame = matchup
				}
				if (bestWeek == undefined) {
					bestWeek = matchup
					worstWeek = matchup
				} else {
					if (matchup.getMemberSide(rosterId)!.pf > bestWeek.getMemberSide(rosterId)!.pf) {
						bestWeek = matchup
					}

					if (matchup.getMemberSide(rosterId)!.pf < worstWeek!.getMemberSide(rosterId)!.pf) {
						worstWeek = matchup
					}
					if (!matchup.isByeWeek) {
						if (matchup.getMargin()! < closestGame?.getMargin()!) {
							closestGame = matchup
						}

						if (matchup.getMargin()! > furthestGame?.getMargin()!) {
							furthestGame = matchup
						}
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

	//Needs members to have scores
	calcLeagueStats() {
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

	calcAllPlayStats() {
		this.weeks.forEach((week) => {
			let scores = week.getAllScores()

			this.members.forEach((member) => {
				let memberWeekScore = week.getMemberMatchupSide(member.roster.roster_id).pf
				scores.forEach((scoreObj) => {
					if (member.roster.roster_id != scoreObj.id) {
						let opponent = this.members.get(scoreObj.id)
						if (memberWeekScore > scoreObj.score) {
							if (!member.stats.allPlayWinMap.has(scoreObj.id)) {
								member.stats.allPlayWinMap.set(scoreObj.id, 1)
							} else {
								member.stats.allPlayWinMap.set(scoreObj.id, member.stats.allPlayWinMap.get(scoreObj.id)! + 1)
							}

							if (!opponent?.stats.allPlayLossMap.has(member.roster.roster_id)) {
								opponent?.stats.allPlayLossMap.set(member.roster.roster_id, 1)
							} else {
								opponent.stats.allPlayLossMap.set(
									member.roster.roster_id,
									opponent.stats.allPlayLossMap.get(member.roster.roster_id)! + 1
								)
							}
						} else if (memberWeekScore == scoreObj.score) {
							if (!member.stats.allPlayTieMap.has(scoreObj.id)) {
								member.stats.allPlayTieMap.set(scoreObj.id, 1)
							} else {
								member.stats.allPlayTieMap.set(scoreObj.id, member.stats.allPlayTieMap.get(scoreObj.id)! + 1)
							}

							if (!opponent?.stats.allPlayTieMap.has(member.roster.roster_id)) {
								opponent?.stats.allPlayTieMap.set(member.roster.roster_id, 1)
							} else {
								opponent.stats.allPlayTieMap.set(
									member.roster.roster_id,
									opponent.stats.allPlayTieMap.get(member.roster.roster_id)! + 1
								)
							}
						}
					}
				})
			})
		})
	}

	// getPlayerStat(playerId: number, weekNum: number) {
	// 	return this.playerDetails.get(playerId + "")?.stats.get(weekNum)
	// }

	// getPlayerProjection(playerId: number, weekNum: number) {
	// 	return this.playerDetails.get(playerId + "")?.projections.get(weekNum)
	// }

	//Creates a map for each member that maps their roster id to number of trades done
	initMemberTradeMap() {
		this.members.forEach((member: LeagueMember, rosterId: number) => {
			for (let i = 1; i <= this.members.size; i++) member.tradePartnerMap.set(i, 0)
		})
	}

	getBestAndWorstDrafter() {
		let bestDrafter: LeagueMember | null = null
		let bestDrafterScore: number = 0
		let worstDrafter: LeagueMember | null = null
		let worstDrafterScore: number = 10000000000
		this.members.forEach((member) => {
			if (member.stats.draftValue > bestDrafterScore) {
				bestDrafterScore = member.stats.draftValue
				bestDrafter = member
			}

			if (member.stats.draftValue < worstDrafterScore) {
				worstDrafterScore = member.stats.draftValue
				worstDrafter = member
			}
		})

		return {
			bestDrafter: bestDrafter as unknown as LeagueMember,
			worstDrafter: worstDrafter as unknown as LeagueMember,
		}
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

	getEligibleMatchups() {
		let eligibleWeeks = [...Array(this.allMatchups.length).keys()]

		switch (this.seasonPortion) {
			case SeasonPortion.REGULAR: {
				eligibleWeeks = eligibleWeeks.slice(0, this.settings.settings.playoff_week_start - 1)
				break
			}
			case SeasonPortion.POST: {
				eligibleWeeks = eligibleWeeks.slice(
					this.settings.settings.playoff_week_start - 1,
					eligibleWeeks.length
				)
				break
			}
		}

		return eligibleWeeks.map((weekNum) => {
			return {matchups: this.allMatchups.at(weekNum), weekNumber: weekNum + 1}
		})
	}
	reCalcStats(
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, DatabasePlayer>,
		useTaxiSquad: boolean
	) {
		this.resetAllStats()
		this.calcStats(playerScores, playerDetails, useTaxiSquad)
	}

	calcStats(
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, DatabasePlayer>,
		useTaxiSquad: boolean
	) {
		let taxiMap
		if (!useTaxiSquad) {
			this.taxiIncludedInMaxPf = useTaxiSquad
			taxiMap = this.getTaxiMap()
		}
		this.calcLeagueWeeks(playerScores, playerDetails, taxiMap ?? new Map())
		this.calcMemberScores(playerScores)
		this.calcLeagueStats()
		this.calcDraftValues(playerScores, playerDetails)
		this.calcAllPlayStats()
	}

	getSettings() {
		if (this.useModifiedSettings) {
			return this.modifiedSettings
		} else {
			return this.settings
		}
	}

	resetSeasonPlayers() {
		this.members.forEach((member) => {
			member.players.forEach((player) => {
				player.resetStats()
			})
		})
	}

	resetAllStats() {
		this.stats.reset()
		this.resetSeasonPlayers()
		this.draft.resetAllDraftPlayers()
		this.members.forEach((member) => {
			member.stats.resetStats()
		})
	}

	//Returns a map of roster id to list of player ids on taxi squad
	getTaxiMap() {
		let taxiMap = new Map<number, string[] | undefined>()
		this.members.forEach((member) => {
			taxiMap.set(member.roster.roster_id, member.roster.taxi)
		})

		return taxiMap
	}

	//Needs weeks to be set
	calcMemberScores(playerInfo: Map<string, PlayerScores>) {
		this.weeks.forEach((week) => {
			week.matchups.forEach((matchup) => {
				let homeId = matchup.homeTeam.roster_id
				let homeMember = this.members.get(homeId)
				let homeTeam = matchup.homeTeam
				if (homeMember) {
					if (homeTeam.custom_points > 0) {
						homeMember.stats.pf += homeTeam.custom_points
					} else {
						homeMember.stats.pf += homeTeam.pf
					}

					homeMember.stats.pp += homeTeam.pp
					homeMember.stats.opslap += homeTeam.opslap
					homeMember.stats.gp += homeTeam.gp
					homeMember.stats.gutPlays += homeTeam.gut_plays

					homeTeam.starters.forEach((player) => {
						if (homeMember!.players.has(player.playerId!)) {
							homeMember!.players
								.get(player.playerId!)!
								.addWeek(week.weekNumber, player.score, player.projectedScore, true)
						} else {
							let seasonPlayer = new SeasonPlayer(
								player.playerId!,
								homeTeam.roster_id,
								player.position as LINEUP_POSITION,
								player.eligiblePositions as POSITION[]
							)
							seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, true)
							homeMember!.players.set(player.playerId!, seasonPlayer)
						}
					})

					homeTeam.bench.forEach((player) => {
						if (homeMember!.players.has(player.playerId!)) {
							homeMember!.players
								.get(player.playerId!)!
								.addWeek(week.weekNumber, player.score, player.projectedScore, false)
						} else {
							let seasonPlayer = new SeasonPlayer(
								player.playerId!,
								homeTeam.roster_id,
								player.position as LINEUP_POSITION,
								player.eligiblePositions as POSITION[]
							)
							seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, false)
							homeMember!.players.set(player.playerId!, seasonPlayer)
						}
					})
					homeTeam.position_starts.forEach((value, key) => {
						if (homeMember?.stats.position_scores.has(key)) {
							homeMember?.stats.position_starts.set(key, homeMember.stats.position_starts.get(key)!! + value)
							homeMember?.stats.position_scores.set(
								key,
								homeMember.stats.position_scores.get(key)!! + homeTeam.position_scores.get(key)!!
							)
							homeMember?.stats.projected_position_scores.set(
								key,
								homeMember.stats.projected_position_scores.get(key)!! +
									homeTeam.position_projected_scores.get(key)!!
							)
						} else {
							homeMember?.stats.position_starts.set(key, value)
							homeMember?.stats.position_scores.set(key, homeTeam.position_scores.get(key)!!)
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
						if (awayTeam.custom_points > 0) {
							awayMember.stats.pf += awayTeam.custom_points
							homeMember.stats.pa += awayTeam.custom_points
						} else {
							awayMember.stats.pf += awayTeam.pf
							homeMember.stats.pa += awayTeam.pf
						}

						if (homeTeam.custom_points > 0) {
							awayMember.stats.pa += homeTeam.custom_points
						} else {
							awayMember.stats.pa += homeTeam.pf
						}

						awayMember.stats.pp += awayTeam.pp
						awayMember.stats.opslap += awayTeam.opslap
						awayMember.stats.gp += awayTeam.gp
						awayMember.stats.gutPlays += awayTeam.gut_plays

						awayTeam.starters.forEach((player) => {
							if (awayMember!.players.has(player.playerId!)) {
								awayMember!.players
									.get(player.playerId!)!
									.addWeek(week.weekNumber, player.score, player.projectedScore, true)
							} else {
								let seasonPlayer = new SeasonPlayer(
									player.playerId!,
									homeTeam.roster_id,
									player.position as LINEUP_POSITION,
									player.eligiblePositions as POSITION[]
								)
								seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, true)
								awayMember!.players.set(player.playerId!, seasonPlayer)
							}
						})

						awayTeam.bench.forEach((player) => {
							if (awayMember!.players.has(player.playerId!)) {
								awayMember!.players
									.get(player.playerId!)!
									.addWeek(week.weekNumber, player.score, player.projectedScore, false)
							} else {
								let seasonPlayer = new SeasonPlayer(
									player.playerId!,
									homeTeam.roster_id,
									player.position as LINEUP_POSITION,
									player.eligiblePositions as POSITION[]
								)
								seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, false)
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
									awayMember.stats.position_scores.get(key)!! + awayTeam?.position_scores.get(key)!!
								)
								awayMember?.stats.projected_position_scores.set(
									key,
									awayMember.stats.projected_position_scores.get(key)!! +
										awayTeam?.position_projected_scores.get(key)!!
								)
							} else {
								awayMember?.stats.position_starts.set(key, value)
								awayMember?.stats.position_scores.set(key, awayTeam?.position_scores.get(key)!!)
								awayMember?.stats.projected_position_scores.set(
									key,
									awayTeam?.position_projected_scores.get(key)!!
								)
							}
						})

						if (matchup.winnerRosterId == homeMember.roster.roster_id) {
							homeMember.stats.wins += 1
							homeMember.stats.weekResults.push(WEEK_RESULT.WIN)

							awayMember.stats.losses += 1
							awayMember.stats.weekResults.push(WEEK_RESULT.LOSS)

							if (homeMember.division_id == awayMember.division_id) {
								homeMember.stats.divisionWins += 1
								awayMember.stats.divisionLosses += 1
							}

						} else if (awayMember.roster.roster_id == matchup.winnerRosterId) {
							awayMember.stats.wins += 1
							awayMember.stats.weekResults.push(WEEK_RESULT.WIN)
							homeMember.stats.losses += 1
							homeMember.stats.weekResults.push(WEEK_RESULT.LOSS)
							if (homeMember.division_id == awayMember.division_id) {
								awayMember.stats.divisionWins += 1
								homeMember.stats.divisionLosses += 1
							}
						} else if (matchup.winnerRosterId == TIE_CONST) {
							homeMember.stats.ties += 1
							awayMember.stats.ties += 1
							homeMember.stats.weekResults.push(WEEK_RESULT.TIE)
							awayMember.stats.weekResults.push(WEEK_RESULT.TIE)
							if (homeMember.division_id == awayMember.division_id) {
								homeMember.stats.divisionTies += 1
								awayMember.stats.divisionTies += 1
							}
						}

						if (homeMember.roster.roster_id == matchup.projectedWinnerRosterId) {
							awayMember.stats.timesUnderdog += 1
							if (matchup.winnerRosterId != homeId) {
								homeMember.stats.wasUpset += 1
								awayMember.stats.upsets += 1
							}
						} else if (awayMember.roster.roster_id == matchup.projectedWinnerRosterId) {
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
				let homeMember = this.members.get(homeTeam.roster_id)!
				if (homeTeam.custom_points > 0) {
					homeMember.stats.pf += homeTeam.custom_points
				} else {
					homeMember.stats.pf += homeTeam.pf
				}

				homeMember.stats.pp += homeTeam.pp
				homeMember.stats.opslap += homeTeam.opslap
				homeMember.stats.gp += homeTeam.gp
				homeMember.stats.gutPlays += homeTeam.gut_plays
				homeTeam.starters.forEach((player) => {
					if (homeMember!.players.has(player.playerId!)) {
						homeMember!.players
							.get(player.playerId!)!
							.addWeek(week.weekNumber, player.score, player.projectedScore, true)
					} else {
						let seasonPlayer = new SeasonPlayer(
							player.playerId!,
							homeTeam.roster_id,
							player.position as LINEUP_POSITION,
							player.eligiblePositions as POSITION[]
						)
						seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, true)
						homeMember!.players.set(player.playerId!, seasonPlayer)
					}
				})

				homeTeam.bench.forEach((player) => {
					if (homeMember!.players.has(player.playerId!)) {
						homeMember!.players
							.get(player.playerId!)!
							.addWeek(week.weekNumber, player.score, player.projectedScore, false)
					} else {
						let seasonPlayer = new SeasonPlayer(
							player.playerId!,
							homeTeam.roster_id,
							player.position as LINEUP_POSITION,
							player.eligiblePositions as POSITION[]
						)
						seasonPlayer.addWeek(week.weekNumber, player.score, player.projectedScore, false)
						homeMember!.players.set(player.playerId!, seasonPlayer)
					}
				})
				homeTeam.position_starts.forEach((value, key) => {
					if (homeMember?.stats.position_scores.has(key)) {
						homeMember?.stats.position_starts.set(key, homeMember.stats.position_starts.get(key)!! + value)
						homeMember?.stats.position_scores.set(
							key,
							homeMember.stats.position_scores.get(key)!! + homeTeam.position_scores.get(key)!!
						)
						homeMember?.stats.projected_position_scores.set(
							key,
							homeMember.stats.projected_position_scores.get(key)!! +
								homeTeam.position_projected_scores.get(key)!!
						)
					} else {
						homeMember?.stats.position_starts.set(key, value)
						homeMember?.stats.position_scores.set(key, homeTeam.position_scores.get(key)!!)
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
			member.stats.win_pct = member.stats.wins / (member.stats.wins + member.stats.losses + member.stats.ties)
		})

		this.members.forEach((member) => {
			member.stats.overall_rank = this.getMemberRank(member.roster.roster_id, StatType.OVERALL)?.rank!

			member.players.forEach((player) => {
				let playerInformation = playerInfo.get(player.id)
				player.calcStats(playerInformation?.stats ?? new Map(), playerInformation?.projections ?? new Map())
			})

			this.getPositions().forEach((position) => {
				if (position) {
					Array.from(member.players.values())
						.filter(
							(player) => player.positions.includes(position) && member.roster.players.includes(player.id)
						)
						.sort((a: SeasonPlayer, b: SeasonPlayer) => b.points_scored - a.points_scored)
						.forEach((player, index) => {
							player.teamPositionRank = index + 1
						})
				}
			})
		})

		this.setMembersTrajectory()
	}

	getAllWeekScoresForPlayer(
		playerId: string,
		playerScores: Map<string, PlayerScores>,
		playerDetails: Map<string, SleeperPlayerDetails>
	) {
		let player = playerScores.get(playerId)
		return {
			scores: player?.stats ?? new Map(),
			projectedScores: player?.projections ?? new Map(),
			details: playerDetails.get(playerId),
		}
	}

	getEnabledWeeks() {
		let enabledWeeks = Array.from({length: this.allMatchups.length}, (_, i) => i + 1)
		switch (this.seasonPortion) {
			case SeasonPortion.REGULAR: {
				enabledWeeks = enabledWeeks.slice(0, this.settings.settings.playoff_week_start - 1)
				break
			}
			case SeasonPortion.POST: {
				enabledWeeks = enabledWeeks.slice(this.settings.settings.playoff_week_start - 1, enabledWeeks.length)
				break
			}
		}
		return enabledWeeks
	}

	getAllWeeksForMember(rosterId: number) {
		let allWeeks: MatchupInterface[] = []

		this.getEnabledWeeks().forEach((weekNumber) => {
			allWeeks.push(this.weeks.get(weekNumber)!.getMemberMatchup(rosterId))
		})

		return allWeeks
	}

	getAllWeeksWithOpponentForMember(rosterId: number) {
		let allWeeks: Matchup[] = []

		this.getEnabledWeeks().forEach((weekNumber) => {
			if (
				this.weeks.get(weekNumber)!.getMemberMatchup(rosterId) instanceof Matchup &&
				this.weeks.get(weekNumber)!.getMemberMatchup(rosterId).isByeWeek == false
			) {
				allWeeks.push(this.weeks.get(weekNumber)!.getMemberMatchup(rosterId) as Matchup)
			}
		})

		return allWeeks
	}

	setMembersTrajectory() {
		Array.from(this.members.keys()).forEach((memberRosterId) => {
			let member = this.members.get(memberRosterId)
			let seasonLength = this.getEnabledWeeks().length
			let beforeWeeks = seasonLength <= 3 ? 2 : seasonLength - 3
			let beforeScore = 0
			for (let weekNumber = 1; weekNumber <= beforeWeeks; weekNumber++) {
				let week = this.weeks.get(weekNumber)
				beforeScore += week?.getMemberMatchupSide(memberRosterId).pf ?? 0
			}

			let memberAverageBeforePoints = beforeScore / beforeWeeks

			let afterScore = 0
			for (let weekNumber = beforeWeeks + 1; weekNumber <= seasonLength; weekNumber++) {
				let week = this.weeks.get(weekNumber)
				afterScore += week?.getMemberMatchupSide(memberRosterId).pf ?? 0
			}

			let memberAveragePointsAfter = afterScore / (seasonLength - beforeWeeks)

			let trajectory = memberAveragePointsAfter - memberAverageBeforePoints
			if (member != undefined) {
				member.stats.trajectory = trajectory
			}
		})
	}

	getOpponentPositionalScores(roster_id: number) {
		let opponentPositionalScores = new Map()
		let memberMatchups = this.getAllWeeksWithOpponentForMember(roster_id)
		memberMatchups.forEach((matchup) => {
			let opponentWeeklyPositonScores = matchup.getOpponent(roster_id)?.position_scores
			if (opponentWeeklyPositonScores != undefined) {
				Array.from(opponentWeeklyPositonScores.keys()).forEach((position) => {
					if (opponentPositionalScores.has(position)) {
						let currentScore = opponentPositionalScores.get(position)
						opponentPositionalScores.set(position, currentScore + opponentWeeklyPositonScores!.get(position))
					} else {
						opponentPositionalScores.set(position, opponentWeeklyPositonScores!.get(position))
					}
				})
			}
		})

		return opponentPositionalScores
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

export enum SeasonPortion {
	REGULAR = 'Regular',
	POST = 'Post',
	ALL = 'All',
}

export enum WEEK_RESULT {
	WIN = "W",
	LOSS = "L",
	TIE = "T"
}
