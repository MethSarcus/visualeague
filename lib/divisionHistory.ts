import type {HistorySeason} from './leagueHistory'

export interface DivisionRecord {
	id: number
	name: string
	rosters: number
	games: number
	wins: number
	losses: number
	ties: number
	pointsFor: number
	pointsAgainst: number
}

export interface DivisionSeason {
	leagueId: string
	season: string
	divisions: DivisionRecord[]
	matchups: DivisionPair[]
	missingDivisionRosters: number
	excludedGames: number
	championDivisionId?: number | null
}

export interface DivisionPair {
	first: DivisionRecord
	second: DivisionRecord
}

export interface DivisionHistory {
	seasons: DivisionSeason[]
	seasonsWithoutDivisions: number
}

export interface AllTimeDivision extends DivisionRecord {
	names: string[]
	seasons: number
}

export function aggregateDivisionHistory(history: DivisionHistory): AllTimeDivision[] {
	const divisions = new Map<number, AllTimeDivision>()
	for (const season of [...history.seasons].sort((a, b) => a.season.localeCompare(b.season) || a.leagueId.localeCompare(b.leagueId))) {
		for (const division of season.divisions) {
			let total = divisions.get(division.id)
			if (!total) {
				total = {...division, rosters: 0, games: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, names: [], seasons: 0}
				divisions.set(division.id, total)
			}
			total.name = division.name
			if (!total.names.includes(division.name)) total.names.push(division.name)
			total.seasons++
			total.rosters += division.rosters
			total.games += division.games
			total.wins += division.wins
			total.losses += division.losses
			total.ties += division.ties
			total.pointsFor += division.pointsFor
			total.pointsAgainst += division.pointsAgainst
		}
	}
	return [...divisions.values()].sort((a, b) => a.id - b.id)
}

export function aggregateDivisionPairs(history: DivisionHistory): DivisionPair[] {
	const byId = new Map(aggregateDivisionHistory(history).map((division) => [division.id, division]))
	const pairs = new Map<string, DivisionPair>()
	for (const season of history.seasons) {
		for (const pair of season.matchups) {
			const key = `${pair.first.id}:${pair.second.id}`
			let total = pairs.get(key)
			if (!total) {
				const empty = (division: DivisionRecord): DivisionRecord => ({...division, name: byId.get(division.id)?.name || division.name, rosters: 0, games: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0})
				total = {first: empty(pair.first), second: empty(pair.second)}
				pairs.set(key, total)
			}
			for (const side of ['first', 'second'] as const) {
				total[side].games += pair[side].games
				total[side].wins += pair[side].wins
				total[side].losses += pair[side].losses
				total[side].ties += pair[side].ties
				total[side].pointsFor += pair[side].pointsFor
				total[side].pointsAgainst += pair[side].pointsAgainst
			}
		}
	}
	return [...pairs.values()].sort((a, b) => a.first.id - b.first.id || a.second.id - b.second.id)
}

export function calculateDivisionHistory(seasons: HistorySeason[], memberIds?: ReadonlySet<string>): DivisionHistory {
	const result: DivisionSeason[] = []
	let seasonsWithoutDivisions = 0
	for (const season of seasons) {
		if (!Number.isInteger(season.divisionCount) || (season.divisionCount || 0) < 2) {
			seasonsWithoutDivisions++
			continue
		}
		const divisionCount = season.divisionCount!
		const divisions = new Map<number, DivisionRecord>()
		const rosterDivisions = new Map<number, number>()
		const rosterOwners = new Map(season.rosters.map((roster) => [roster.roster_id, roster.owner_id]))
		const includedRosters = new Set(season.rosters.filter((roster) => !memberIds || (roster.owner_id !== null && memberIds.has(roster.owner_id))).map((roster) => roster.roster_id))
		for (let id = 1; id <= divisionCount; id++) {
			divisions.set(id, {id, name: season.divisionNames?.[id] || `Division ${id}`, rosters: 0, games: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0})
		}
		let missingDivisionRosters = 0
		for (const roster of season.rosters) {
			if (!includedRosters.has(roster.roster_id)) continue
			const id = roster.settings?.division
			if (typeof id !== 'number' || !divisions.has(id)) {
				missingDivisionRosters++
				continue
			}
			rosterDivisions.set(roster.roster_id, id)
			divisions.get(id)!.rosters++
		}
		let excludedGames = 0
		const pairs = new Map<string, DivisionPair>()
		for (const {matchups} of season.weeks) {
			const groups = new Map<number, typeof matchups>()
			for (const matchup of matchups) {
				if (matchup.matchup_id == null) continue
				const group = groups.get(matchup.matchup_id) || []
				group.push(matchup)
				groups.set(matchup.matchup_id, group)
			}
			for (const group of groups.values()) {
				if (memberIds && !group.some((matchup) => includedRosters.has(matchup.roster_id))) continue
				if (group.length !== 2 || group.some((matchup) => !rosterOwners.has(matchup.roster_id)) || group[0].roster_id === group[1].roster_id ||
					(rosterOwners.get(group[0].roster_id) != null && rosterOwners.get(group[0].roster_id) === rosterOwners.get(group[1].roster_id))) {
					excludedGames++
					continue
				}
				const [a, b] = group
				const aDivision = rosterDivisions.get(a.roster_id)
				const bDivision = rosterDivisions.get(b.roster_id)
				const aPoints = a.custom_points ?? a.points
				const bPoints = b.custom_points ?? b.points
				if (typeof aPoints !== 'number' || !Number.isFinite(aPoints) || typeof bPoints !== 'number' || !Number.isFinite(bPoints)) {
					excludedGames++
					continue
				}
				for (const [id, own, opponent] of [[aDivision, aPoints, bPoints], [bDivision, bPoints, aPoints]] as [number | undefined, number, number][]) {
					if (id === undefined) continue
					const record = divisions.get(id)!
					record.games++
					record.pointsFor += own
					record.pointsAgainst += opponent
					if (own > opponent) record.wins++
					else if (own < opponent) record.losses++
					else record.ties++
				}
				if (aDivision === undefined || bDivision === undefined) continue
				if (aDivision === bDivision) continue
				const firstId = Math.min(aDivision, bDivision)
				const secondId = Math.max(aDivision, bDivision)
				const key = `${firstId}:${secondId}`
				let pair = pairs.get(key)
				if (!pair) {
					const empty = (id: number): DivisionRecord => ({...divisions.get(id)!, rosters: 0, games: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0})
					pair = {first: empty(firstId), second: empty(secondId)}
					pairs.set(key, pair)
				}
				const aPair = aDivision === firstId ? pair.first : pair.second
				const bPair = bDivision === firstId ? pair.first : pair.second
				for (const [record, own, opponent] of [[aPair, aPoints, bPoints], [bPair, bPoints, aPoints]] as [DivisionRecord, number, number][]) {
					record.games++
					record.pointsFor += own
					record.pointsAgainst += opponent
					if (own > opponent) record.wins++
					else if (own < opponent) record.losses++
					else record.ties++
				}
			}
		}
		const championDivision = season.rosters.find((roster) => roster.roster_id === season.championRosterId)?.settings?.division
		const championDivisionId = typeof championDivision === 'number' && divisions.has(championDivision) ? championDivision : null
		result.push({leagueId: season.leagueId, season: season.season, divisions: [...divisions.values()], matchups: [...pairs.values()].sort((a, b) => a.first.id - b.first.id || a.second.id - b.second.id), missingDivisionRosters, excludedGames, championDivisionId})
	}
	result.sort((a, b) => a.season.localeCompare(b.season) || a.leagueId.localeCompare(b.leagueId))
	return {seasons: result, seasonsWithoutDivisions}
}
