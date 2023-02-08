import {BlankPlayer, MatchupPlayer} from '../classes/custom/MatchupPlayer'
import Player from '../classes/custom/Player'
import {
	LeagueSettings,
	ScoringSettings,
} from '../classes/sleeper/LeagueSettings'

export const getAllLeaguePositions = (leagues: LeagueSettings[]) => {
	var positions: POSITION[][] = []
	leagues.forEach((league) => {
		league.roster_positions?.forEach((slot) => {
			positions.push(getRosterSlotPositions(slot))
		})
	})

	return [...new Set(positions.flat())]
}

export const TIE_CONST = -1

//A function that takes in a sleeper roster slot designation and returns an array of positions that can fill that slot
export const getRosterSlotPositions = (slotId: string) => {
	switch (slotId) {
		case LINEUP_POSITION.QB: {
			return [POSITION.QB]
		}
		case LINEUP_POSITION.RB: {
			return [POSITION.RB]
		}
		case LINEUP_POSITION.WR: {
			return [POSITION.WR]
		}
		case LINEUP_POSITION.TE: {
			return [POSITION.TE]
		}
		case LINEUP_POSITION.DEF: {
			return [POSITION.DEF]
		}
		case LINEUP_POSITION.K: {
			return [POSITION.K]
		}
		case LINEUP_POSITION.DL: {
			return [POSITION.DL]
		}
		case LINEUP_POSITION.LB: {
			return [POSITION.LB]
		}
		case LINEUP_POSITION.DB: {
			return [POSITION.DB]
		}
		case LINEUP_POSITION.FLEX: {
			return [POSITION.RB, POSITION.WR, POSITION.TE]
		}
		case LINEUP_POSITION.WRRB_FLEX: {
			return [POSITION.RB, POSITION.WR]
		}
		case LINEUP_POSITION.REC_FLEX: {
			return [POSITION.WR, POSITION.TE]
		}
		case LINEUP_POSITION.SUPER_FLEX: {
			return [POSITION.QB, POSITION.RB, POSITION.WR, POSITION.TE]
		}

		case LINEUP_POSITION.IDP_FLEX: {
			return [POSITION.DL, POSITION.LB, POSITION.DB]
		}

		default: {
			return []
		}
	}
}

//A function that takes in a sleeper roster slot designation and returns an array of positions that can fill that slot
export const getPositionRosterSlots = (slotId: string) => {
	switch (slotId) {
		case POSITION.QB: {
			return [LINEUP_POSITION.QB, LINEUP_POSITION.SUPER_FLEX]
		}
		case POSITION.RB: {
			return [
				LINEUP_POSITION.RB,
				LINEUP_POSITION.FLEX,
				LINEUP_POSITION.SUPER_FLEX,
				LINEUP_POSITION.WRRB_FLEX,
			]
		}
		case POSITION.WR: {
			return [
				LINEUP_POSITION.WR,
				LINEUP_POSITION.FLEX,
				LINEUP_POSITION.SUPER_FLEX,
				LINEUP_POSITION.WRRB_FLEX,
				LINEUP_POSITION.REC_FLEX,
			]
		}
		case POSITION.TE: {
			return [
				LINEUP_POSITION.TE,
				LINEUP_POSITION.FLEX,
				LINEUP_POSITION.SUPER_FLEX,
				LINEUP_POSITION.REC_FLEX,
			]
		}
		case POSITION.DEF: {
			return [LINEUP_POSITION.DEF]
		}
		case POSITION.K: {
			return [LINEUP_POSITION.K]
		}
		case POSITION.DL: {
			return [LINEUP_POSITION.DL, LINEUP_POSITION.IDP_FLEX]
		}
		case POSITION.LB: {
			return [LINEUP_POSITION.LB, LINEUP_POSITION.IDP_FLEX]
		}
		case POSITION.DB: {
			return [LINEUP_POSITION.DB, LINEUP_POSITION.IDP_FLEX]
		}
		default: {
			return []
		}
	}
}

export enum POSITION {
	QB = 'QB',
	RB = 'RB',
	WR = 'WR',
	TE = 'TE',
	DEF = 'DEF',
	K = 'K',
	DL = 'DL',
	LB = 'LB',
	DB = 'DB',
}

export enum LINEUP_POSITION {
	QB = 'QB',
	RB = 'RB',
	WR = 'WR',
	TE = 'TE',
	DEF = 'DEF',
	K = 'K',
	DL = 'DL',
	LB = 'LB',
	DB = 'DB',
	FLEX = 'FLEX',
	WRRB_FLEX = 'WRRB_FLEX',
	REC_FLEX = 'REC_FLEX',
	SUPER_FLEX = 'SUPER_FLEX',
	IDP_FLEX = 'IDP_FLEX',
	BN = 'BN',
	IR = 'IR',
}

//A function that takes in a sleeper scoring settings json object and returns what type of receiving points are given
export const getLeagueReceptionScoringType = (
	leagueSettings: LeagueSettings
) => {
	const ppr = getVariablePPR(leagueSettings.scoring_settings)
	const qbNum =
		leagueSettings.roster_positions?.filter((pos) => {
			return pos == 'SUPER_FLEX' || pos == POSITION.QB
		}).length + 'QB'
	var leagueType = ''
	switch (leagueSettings.settings.type) {
		case 0: {
			leagueType = 'Redraft'
			break
		}
		case 1: {
			leagueType = 'Keeper'
			break
		}
		case 2: {
			leagueType = 'Dynasty'
			break
		}
		default: {
			leagueType = ''
		}
	}

	const returnObj = {
		pprString: ppr,
		numQbString: qbNum,
		leagueTypeString: leagueType,
	}

	return returnObj
}

//A function that takes in a sleeper scoring settings json object and returns what type of receiving points are given
export const getVariablePPR = (scoring_settings: ScoringSettings) => {
	var returnString = ''
	var bonusPos = ''
	const varRec = [
		scoring_settings.rec_0_4,
		scoring_settings.rec_5_9,
		scoring_settings.rec_10_19,
		scoring_settings.rec_20_29,
		scoring_settings.rec_30_39,
		scoring_settings.bonus_rec_rb,
		scoring_settings.bonus_rec_wr,
		scoring_settings.bonus_rec_te,
		scoring_settings.rec_40p,
	]
		.filter((set) => {
			return set != null && set != undefined
		})
		.reduce((partialSum, a) => partialSum! + a!, 0)

	if (
		scoring_settings.bonus_rec_rb != null &&
		scoring_settings.bonus_rec_rb > 0
	) {
		bonusPos += 'RB '
	}

	if (
		scoring_settings.bonus_rec_wr != null &&
		scoring_settings.bonus_rec_wr > 0
	) {
		bonusPos += 'WR '
	}

	if (
		scoring_settings.bonus_rec_te != null &&
		scoring_settings.bonus_rec_te > 0
	) {
		bonusPos += 'TE'
	}
	const positionRec = [
		scoring_settings.bonus_rec_rb,
		scoring_settings.bonus_rec_wr,
		scoring_settings.bonus_rec_te,
	]
		.filter((set) => {
			return set != null && set != undefined
		})
		.reduce((partialSum, a) => partialSum! + a!, 0)
	if (varRec && varRec > 0) {
		returnString += 'V-PPR'
		if (positionRec && positionRec > 0) {
			returnString += ' ' + bonusPos + ' Prem'
		}

		return returnString
	} else if (scoring_settings.rec && scoring_settings.rec > 0) {
		returnString += scoring_settings.rec.toFixed(1) + ' PPR'
		if (positionRec && positionRec > 0) {
			returnString += ' ' + bonusPos + ' Prem'
		}

		return returnString
	} else {
		returnString += '0 PPR'
		if (positionRec && positionRec > 0) {
			returnString += ' ' + bonusPos + ' Prem'
		}

		return returnString
	}
}

//Returns true if any position scores extra points for receptions
export const hasPremiumScoring = (scoring_settings: ScoringSettings) => {
	if (
		scoring_settings.bonus_rec_rb != null &&
		scoring_settings.bonus_rec_rb > 0
	) {
		return true
	} else if (
		scoring_settings.bonus_rec_wr != null &&
		scoring_settings.bonus_rec_wr > 0
	) {
		return true
	} else if (
		scoring_settings.bonus_rec_te != null &&
		scoring_settings.bonus_rec_te > 0
	) {
		return true
	} else {
		return false
	}
}

//returns true if points are different based on length of reception
export const hasVariablePPR = (scoring_settings: ScoringSettings) => {
	const varRec = [
		scoring_settings.rec_0_4,
		scoring_settings.rec_5_9,
		scoring_settings.rec_10_19,
		scoring_settings.rec_20_29,
		scoring_settings.rec_30_39,
		scoring_settings.rec_40p,
	]
		.filter((set) => {
			return set != null && set != undefined
		})
		.reduce((partialSum, a) => partialSum! + a!, 0)

	if (varRec && varRec > 0) {
		return true
	} else {
		return false
	}
}

//Modified to accept boolean useProjections which determines if retrieving the optimal projected lineup or the actual optimal lineup
export function getOptimalLineup(
	players: MatchupPlayer[],
	starterPositions: LINEUP_POSITION[],
	useProjections: boolean
) {
	let optimalLineup: MatchupPlayer[] = []
	players = players.sort((a: MatchupPlayer, b: MatchupPlayer) => {
		let aScore = useProjections ? a.projectedScore : a.score
		let bScore = useProjections ? b.projectedScore : b.score
		if (aScore < bScore) {
			return 1
		} else if (aScore > bScore) {
			return -1
		} else {
			return 0
		}
	})

	starterPositions.forEach((position) => {
		let eligiblePlayers = players.filter((player) => {
			if (
				(useProjections ? player.projectedScore : player.score) < 0 ||
				optimalLineup.includes(player) ||
				!getPositionRosterSlots(
					player.eligiblePositions?.at(0) as LINEUP_POSITION
				).includes(position)
			) {
				return false
			} else {
				return true
			}
		})

		eligiblePlayers.length == 0 ? optimalLineup.push(new BlankPlayer()) : optimalLineup.push(eligiblePlayers[0])
	})

	return optimalLineup
}

function getEligiblePlayersForSlot(
	players: MatchupPlayer[],
	position: POSITION
) {
	let eligiblePlayers: MatchupPlayer[] = []
	players.forEach((player) => {
		if (player.eligiblePositions?.includes(position)) {
			eligiblePlayers.push(player)
		}
	})

	return eligiblePlayers
}

export function calcPlayerPoints(stats: ScoringSettings | undefined,  leagueSettings: ScoringSettings): number | undefined {
	let score: number | undefined = 0
	if (stats != undefined) {
	  for (const [key, value] of Object.entries(stats)) {
		let points = value * (leagueSettings[key as keyof ScoringSettings] as number)
		if (!isNaN(points)) {
			score += points
		}
	  }
	} else {
		score = undefined
	}

	return score
  }

export function getPositionColor(position: POSITION) {
	switch (position) {
		case POSITION.QB: {
			return 'rgba(239, 116, 161, 0.8)'
		}
		case POSITION.RB: {
			return 'rgba(143, 242, 202, 0.8)'
		}
		case POSITION.WR: {
			return 'rgba(86, 201, 248, 0.8)'
		}
		case POSITION.TE: {
			return 'rgba(254, 174, 88, 0.8)'
		}
		case POSITION.DL: {
			return 'rgba(250, 153, 97, 0.8)'
		}
		case POSITION.DB: {
			return 'rgba(254, 160, 202, 0.8)'
		}
		case POSITION.LB: {
			return 'rgba(174, 182, 252, 0.8)'
		}
		case POSITION.K: {
			return '#7988a1'
		}
		case POSITION.DEF: {
			return '#bd66ff'
		}
		default: {
			return '#000000'
		}
	}
}

export function ordinal_suffix_of(i: number) {
	var j = i % 10,
		k = i % 100
	if (j == 1 && k != 11) {
		return i + 'st'
	}
	if (j == 2 && k != 12) {
		return i + 'nd'
	}
	if (j == 3 && k != 13) {
		return i + 'rd'
	}
	return i + 'th'
}

export function standardDeviation(arr: number[], usePopulation = false) {
	const mean = arr.reduce((acc: any, val: any) => acc + val, 0) / arr.length
	return Math.sqrt(
		arr
			.reduce((acc: any[], val: number) => acc.concat((val - mean) ** 2), [])
			.reduce((acc: any, val: any) => acc + val, 0) /
			(arr.length - (usePopulation ? 0 : 1))
	)
}

//Written by chatGPT takes in a scoring key and returns the readable string
export function getReadableScoringKey(key: string): string {
	let readableKey = key
	// Expand shorthand in key
	readableKey = readableKey.replace('_allow_', ' Allowed ')
	readableKey = readableKey.replace('_int', ' Interception')
	readableKey = readableKey.replace('_2pt', ' Two Point Conversion')
	readableKey = readableKey.replaceAll('_td', ' Touchdown')
	readableKey = readableKey.replace('_sack', ' Sack')
	readableKey = readableKey.replaceAll('_ff', ' Forced Fumble')
	readableKey = readableKey.replace('_fum_rec', ' Fumble Recovery')
	readableKey = readableKey.replace('_fum_lost', ' Fumble Lost')
	readableKey = readableKey.replace('_kr_td', ' Kick Return Touchdown')
	readableKey = readableKey.replace('_pr_td', ' Punt Return Touchdown')
	readableKey = readableKey.replace('_st_', ' Special Teams ')
	readableKey = readableKey.replace('_def_', ' Defense ')
	readableKey = readableKey.replace('ff', 'Forced Fumble')
	readableKey = readableKey.replace('yds', 'Yards')
	readableKey = readableKey.replace('pts', 'Points')
	readableKey = readableKey.replace('rec', 'Reception')
	readableKey = readableKey.replace('yd', 'Yard')
	readableKey = readableKey.replace('fg', 'Field Goal')

	//Not written by chatbot
	readableKey = readableKey.replaceAll('ret', 'return')

	readableKey = readableKey.replaceAll('blk', 'block')
	readableKey = readableKey.replaceAll('Kr', 'Kick return')
	readableKey = readableKey.replaceAll('Pr', 'Punt return')
	readableKey = readableKey.replace('Goalmiss', 'Goal miss')
	readableKey = readableKey.replace('Goalm', 'Goal made')

	readableKey = readableKey.replace('Pass_def', 'Pass defended')

	//Remove underscores
	readableKey = readableKey.replaceAll('_', ' ')

	// Add hyphen between two numbers

	readableKey = readableKey.replace(/([0-9]+)([^\s0-9]+)([0-9]+)/, '$1-$3')
	// Convert p at end of number to +
	readableKey = readableKey.replace(/([0-9]+)p/, '$1+')
	// Capitalize each word
	readableKey = readableKey
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
	// Add colon at end of key
	readableKey += ':'

	return readableKey
}

export const createRangeArray = (start: number, end: number) => Array.from({length: (end - start)}, (v, k) => k + start);

