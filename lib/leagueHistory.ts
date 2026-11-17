export interface HistoryRoster {
	roster_id: number
	owner_id: string | null
	settings?: {division?: number | null} | null
}

export interface HistoryUser {
	user_id: string
	display_name: string
	avatar?: string | null
	metadata?: {team_name?: string | null; avatar?: string | null} | null
}

export interface HistoryMatchup {
	roster_id: number
	matchup_id: number | null
	points: number | null
	custom_points?: number | null
}

export interface HistorySeason {
	leagueId: string
	season: string
	divisionCount?: number
	divisionNames?: Record<string, string>
	championRosterId?: number | null
	rosters: HistoryRoster[]
	users: HistoryUser[]
	weeks: {week: number; matchups: HistoryMatchup[]}[]
}

export interface HistoryTeam {
	id: string
	name: string
	manager: string
	avatar: string | null
	seasons: number
	points: number
	scoredWeeks: number
	wins: number
	losses: number
	ties: number
	headToHead: HistoryRecord
	seasonRecords: HistorySeasonRecord[]
	opponents: HistoryRival[]
	nemeses: {losses: HistoryRival[]; points: HistoryRival[]}
}

export interface HistoryRival {
	id: string
	name: string
	avatar: string | null
	wins: number
	losses: number
	ties: number
	pointsFor: number
	pointsAgainst: number
	matchups: RivalryMatchup[]
}

export interface HistoryRecord {
	games: number
	wins: number
	losses: number
	ties: number
	pointsFor: number
	pointsAgainst: number
}

export interface HistorySeasonRecord extends HistoryRecord {
	leagueId: string
	season: string
	points: number
}

export interface RivalryMatchup {
	leagueId: string
	season: string
	week: number
	teamPoints: number
	opponentPoints: number
}

export interface HistoryScore {
	team: string
	points: number
	season: string
	week: number
}

export interface HistoryGame {
	winner: string
	loser: string
	margin: number
	season: string
	week: number
}

export interface LeagueHistory {
	seasons: string[]
	teams: HistoryTeam[]
	highScores: HistoryScore[]
	closestGame: HistoryGame | null
	biggestWin: HistoryGame | null
	games: number
	unpairedGroups: number
	divisionHistory: DivisionHistory
}

export type CurrentMembersHistory = Omit<LeagueHistory, 'teams'>

export interface LeagueHistoryResponse extends LeagueHistory {
	currentMemberIds: string[]
	currentMembers: CurrentMembersHistory
}

interface TeamAccumulator extends Omit<HistoryTeam, 'seasons' | 'nemeses' | 'opponents'> {
	seasons: Set<string>
	opponents: Map<string, {wins: number; losses: number; ties: number; matchups: RivalryMatchup[]}>
}

function emptyRecord(): HistoryRecord {
	return {games: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0}
}

// Seasons are supplied newest first so returning managers keep their latest name.
export function calculateLeagueHistory(seasons: HistorySeason[], memberIds?: ReadonlySet<string>): LeagueHistory {
	const teams = new Map<string, TeamAccumulator>()
	const highScores: HistoryScore[] = []
	let closestGame: HistoryGame | null = null
	let biggestWin: HistoryGame | null = null
	let games = 0
	let unpairedGroups = 0

	for (const season of seasons) {
		const rosterTeams = new Map<number, TeamAccumulator>()
		const seasonRecords = new Map<number, HistorySeasonRecord>()
		const users = new Map(season.users.map((user) => [user.user_id, user]))
		for (const roster of season.rosters) {
			const id = roster.owner_id || `unowned:${season.leagueId}:${roster.roster_id}`
			const user = roster.owner_id ? users.get(roster.owner_id) : undefined
			let team = teams.get(id)
			if (!team) {
				const manager = user?.display_name || (roster.owner_id ? `Manager ${roster.owner_id}` : `Unowned roster ${roster.roster_id} (${season.season})`)
				const avatar = user?.metadata?.avatar || (user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null)
				team = {id, name: user?.metadata?.team_name || manager, manager, avatar, seasons: new Set(), points: 0, scoredWeeks: 0, wins: 0, losses: 0, ties: 0, headToHead: emptyRecord(), seasonRecords: [], opponents: new Map()}
				teams.set(id, team)
			}
			team.seasons.add(season.leagueId)
			let seasonRecord = team.seasonRecords.find((record) => record.leagueId === season.leagueId)
			if (!seasonRecord) {
				seasonRecord = {leagueId: season.leagueId, season: season.season, points: 0, ...emptyRecord()}
				team.seasonRecords.push(seasonRecord)
			}
			rosterTeams.set(roster.roster_id, team)
			seasonRecords.set(roster.roster_id, seasonRecord)
		}

		for (const {week, matchups} of season.weeks) {
			const groups = new Map<number, HistoryMatchup[]>()
			for (const matchup of matchups) {
				if (matchup.matchup_id != null) {
					const group = groups.get(matchup.matchup_id) || []
					group.push(matchup)
					groups.set(matchup.matchup_id, group)
				}
				const team = rosterTeams.get(matchup.roster_id)
				const points = matchup.custom_points ?? matchup.points
				if (!team || typeof points !== 'number' || !Number.isFinite(points)) continue
				team.points += points
				team.scoredWeeks++
				seasonRecords.get(matchup.roster_id)!.points += points
				if (!memberIds || memberIds.has(team.id)) highScores.push({team: team.name, points, season: season.season, week})
			}
			for (const group of groups.values()) {
				const resolve = (matchup: HistoryMatchup) => {
					const team = rosterTeams.get(matchup.roster_id)
					const seasonRecord = seasonRecords.get(matchup.roster_id)
					const points = matchup.custom_points ?? matchup.points
					return team && seasonRecord && typeof points === 'number' && Number.isFinite(points)
						? {team, seasonRecord, points} : null
				}
				const a = group.length === 2 ? resolve(group[0]) : null
				const b = group.length === 2 ? resolve(group[1]) : null
				if (!a || !b || a.team.id === b.team.id) {
					if (!memberIds || group.some((matchup) => {
						const team = rosterTeams.get(matchup.roster_id)
						return team && memberIds.has(team.id)
					})) unpairedGroups++
					continue
				}
				for (const [record, own, opponent] of [
					[a.team.headToHead, a.points, b.points],
					[a.seasonRecord, a.points, b.points],
					[b.team.headToHead, b.points, a.points],
					[b.seasonRecord, b.points, a.points],
				] as [HistoryRecord, number, number][]) {
					record.games++
					record.pointsFor += own
					record.pointsAgainst += opponent
					if (own > opponent) record.wins++
					else if (own < opponent) record.losses++
					else record.ties++
				}
				const aRecord = a.team.opponents.get(b.team.id) || {wins: 0, losses: 0, ties: 0, matchups: []}
				const bRecord = b.team.opponents.get(a.team.id) || {wins: 0, losses: 0, ties: 0, matchups: []}
				a.team.opponents.set(b.team.id, aRecord)
				b.team.opponents.set(a.team.id, bRecord)
				aRecord.matchups.push({leagueId: season.leagueId, season: season.season, week, teamPoints: a.points, opponentPoints: b.points})
				bRecord.matchups.push({leagueId: season.leagueId, season: season.season, week, teamPoints: b.points, opponentPoints: a.points})
				const includedGame = !memberIds || memberIds.has(a.team.id) || memberIds.has(b.team.id)
				if (includedGame) games++
				if (a.points === b.points) {
					a.team.ties++; b.team.ties++; aRecord.ties++; bRecord.ties++
					continue
				}
				const [winner, loser, winRecord, lossRecord] = a.points > b.points
					? [a, b, aRecord, bRecord] : [b, a, bRecord, aRecord]
				winner.team.wins++; loser.team.losses++; winRecord.wins++; lossRecord.losses++
				const game = {winner: winner.team.name, loser: loser.team.name, margin: Math.abs(a.points - b.points), season: season.season, week}
				if (includedGame && (!closestGame || game.margin < closestGame.margin)) closestGame = game
				if (includedGame && (!biggestWin || game.margin > biggestWin.margin)) biggestWin = game
			}
		}
	}

	const resultTeams = Array.from(teams.values()).filter((team) => !memberIds || memberIds.has(team.id)).map((team): HistoryTeam => {
		const rivals: HistoryRival[] = Array.from(team.opponents, ([id, record]) => ({
			id, name: teams.get(id)!.name, avatar: teams.get(id)!.avatar, ...record,
			pointsFor: record.matchups.reduce((sum, matchup) => sum + matchup.teamPoints, 0),
			pointsAgainst: record.matchups.reduce((sum, matchup) => sum + matchup.opponentPoints, 0),
			matchups: [...record.matchups].sort((a, b) => b.season.localeCompare(a.season) || b.week - a.week || a.leagueId.localeCompare(b.leagueId)),
		}))
		const mostLosses = Math.max(0, ...rivals.map((rival) => rival.losses))
		const lossCandidates = rivals.filter((rival) => rival.losses === mostLosses && mostLosses > 0)
		const normalizedPoints = (value: number) => Math.round(value * 1e8) / 1e8
		const lossTiePoints = Math.max(...lossCandidates.map((rival) => normalizedPoints(rival.pointsAgainst)))
		const differential = (rival: HistoryRival) => Math.round((rival.pointsAgainst - rival.pointsFor) * 1e8) / 1e8
		const mostPoints = Math.max(0, ...rivals.map(differential))
		const nemeses = {
			losses: lossCandidates.filter((rival) => normalizedPoints(rival.pointsAgainst) === lossTiePoints),
			points: rivals.filter((rival) => mostPoints > 0 && differential(rival) === mostPoints),
		}
		return {id: team.id, name: team.name, manager: team.manager, avatar: team.avatar, seasons: team.seasons.size, points: team.points, scoredWeeks: team.scoredWeeks, wins: team.wins, losses: team.losses, ties: team.ties, headToHead: team.headToHead, seasonRecords: team.seasonRecords, opponents: rivals, nemeses}
	})
	resultTeams.sort((a, b) => b.wins - a.wins || b.points - a.points || a.name.localeCompare(b.name))
	highScores.sort((a, b) => b.points - a.points)
	return {seasons: seasons.map((season) => season.season), teams: resultTeams, highScores: highScores.slice(0, 10), closestGame, biggestWin, games, unpairedGroups, divisionHistory: calculateDivisionHistory(seasons, memberIds)}
}

export function calculateCurrentMembersHistory(seasons: HistorySeason[], memberIds: ReadonlySet<string>): CurrentMembersHistory {
	const highScores: HistoryScore[] = []
	let closestGame: HistoryGame | null = null
	let biggestWin: HistoryGame | null = null
	let games = 0
	let unpairedGroups = 0

	const currentNames = new Map<string, string>()
	for (const season of seasons) {
		const users = new Map(season.users.map((user) => [user.user_id, user]))
		for (const roster of season.rosters) {
			const id = roster.owner_id || `unowned:${season.leagueId}:${roster.roster_id}`
			if (currentNames.has(id)) continue
			const user = roster.owner_id ? users.get(roster.owner_id) : undefined
			const manager = user?.display_name || (roster.owner_id ? `Manager ${roster.owner_id}` : `Unowned roster ${roster.roster_id} (${season.season})`)
			currentNames.set(id, user?.metadata?.team_name || manager)
		}
	}

	for (const season of seasons) {
		const teamIds = new Map(season.rosters.map((roster) => [
			roster.roster_id, roster.owner_id || `unowned:${season.leagueId}:${roster.roster_id}`,
		]))
		const names = new Map(season.rosters.map((roster) => [roster.roster_id, currentNames.get(teamIds.get(roster.roster_id)!)!]))
		for (const {week, matchups} of season.weeks) {
			const groups = new Map<number, HistoryMatchup[]>()
			for (const matchup of matchups) {
				if (matchup.matchup_id != null) {
					const group = groups.get(matchup.matchup_id) || []
					group.push(matchup)
					groups.set(matchup.matchup_id, group)
				}
				const teamId = teamIds.get(matchup.roster_id)
				const points = matchup.custom_points ?? matchup.points
				if (teamId && memberIds.has(teamId) && typeof points === 'number' && Number.isFinite(points)) {
					highScores.push({team: names.get(matchup.roster_id)!, points, season: season.season, week})
				}
			}
			for (const group of groups.values()) {
				const memberInGroup = group.some((matchup) => {
					const teamId = teamIds.get(matchup.roster_id)
					return teamId !== undefined && memberIds.has(teamId)
				})
				const [a, b] = group
				const aId = a && teamIds.get(a.roster_id)
				const bId = b && teamIds.get(b.roster_id)
				const aPoints = a && (a.custom_points ?? a.points)
				const bPoints = b && (b.custom_points ?? b.points)
				if (group.length !== 2 || aId === undefined || bId === undefined || aId === bId ||
					typeof aPoints !== 'number' || !Number.isFinite(aPoints) ||
					typeof bPoints !== 'number' || !Number.isFinite(bPoints)) {
					if (memberInGroup) unpairedGroups++
					continue
				}
				if (!memberIds.has(aId) && !memberIds.has(bId)) continue
				games++
				if (aPoints === bPoints) continue
				const game = {
					winner: names.get(aPoints > bPoints ? a.roster_id : b.roster_id)!,
					loser: names.get(aPoints > bPoints ? b.roster_id : a.roster_id)!,
					margin: Math.abs(aPoints - bPoints), season: season.season, week,
				}
				if (!closestGame || game.margin < closestGame.margin) closestGame = game
				if (!biggestWin || game.margin > biggestWin.margin) biggestWin = game
			}
		}
	}

	highScores.sort((a, b) => b.points - a.points)
	return {
		seasons: seasons.map((season) => season.season), highScores: highScores.slice(0, 10),
		closestGame, biggestWin, games, unpairedGroups, divisionHistory: calculateDivisionHistory(seasons, memberIds),
	}
}
import {calculateDivisionHistory, DivisionHistory} from './divisionHistory'
