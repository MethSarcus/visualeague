import {LeagueSettings} from '../classes/sleeper/LeagueSettings'
import {calculateCurrentMembersHistory, calculateLeagueHistory, HistoryMatchup, HistoryRoster, HistorySeason, HistoryUser} from './leagueHistory'

interface BracketMatch {
	p?: number | null
	w?: number | null
	t1?: number | null
	t2?: number | null
}

async function sleeper<T>(path: string): Promise<T> {
	const response = await fetch(`https://api.sleeper.app/v1/${path}`)
	if (!response.ok) throw new Error(`Sleeper request failed (${response.status}): ${path}`)
	return response.json() as Promise<T>
}

export async function fetchLeagueHistory(leagueId: string) {
	const seasons: HistorySeason[] = []
	const visited = new Set<string>()
	let id: string | null = leagueId
	while (id) {
		if (visited.has(id)) throw new Error(`Cycle in Sleeper league history at ${id}`)
		visited.add(id)
		const settings: LeagueSettings = await sleeper<LeagueSettings>(`league/${id}`)
		if (!settings || settings.league_id !== id || !settings.settings || !settings.season) {
			throw new Error(`Invalid Sleeper league data for ${id}`)
		}
		const start = settings.settings.start_week
		const end = settings.settings.last_scored_leg
		if (!Number.isInteger(start) || start < 1 || !Number.isInteger(end) || end < 0 || end > 18) {
			throw new Error(`Invalid matchup week range for league ${id}`)
		}
		const league = id
		const weekNumbers = Array.from({length: Math.max(0, end - start + 1)}, (_, index) => start + index)
		const [users, rosters, bracket, ...weeks] = await Promise.all([
			sleeper<HistoryUser[]>(`league/${league}/users`),
			sleeper<HistoryRoster[]>(`league/${league}/rosters`),
			settings.status === 'complete' && settings.settings.divisions >= 2
				? sleeper<BracketMatch[]>(`league/${league}/winners_bracket`) : Promise.resolve([] as BracketMatch[]),
			...weekNumbers.map((week) => sleeper<HistoryMatchup[]>(`league/${league}/matchups/${week}`)),
		])
		if (!Array.isArray(users) || !Array.isArray(rosters) || !Array.isArray(bracket) || weeks.some((week) => !Array.isArray(week))) {
			throw new Error(`Invalid Sleeper history data for ${id}`)
		}
		const finals = bracket.filter((match) => match?.p === 1)
		if (finals.length > 1) throw new Error(`Multiple championship matches for league ${id}`)
		const final = finals[0]
		const championRosterId = final && Number.isInteger(final.w) && (final.w === final.t1 || final.w === final.t2) &&
			rosters.some((roster) => roster.roster_id === final.w) ? final.w : null
		const divisionNames: Record<string, string> = {}
		for (const [key, value] of Object.entries(settings.metadata || {})) {
			const match = /^division_(\d+)$/.exec(key)
			if (match && typeof value === 'string' && value.trim()) divisionNames[match[1]] = value.trim()
		}
		seasons.push({
			leagueId: league, season: settings.season, users, rosters,
			divisionCount: settings.settings.divisions, divisionNames, championRosterId,
			weeks: weekNumbers.map((week, index) => ({week, matchups: weeks[index]})),
		})
		id = settings.previous_league_id || null
	}
	const currentMemberIds = new Set(seasons[0].rosters.flatMap((roster) => roster.owner_id ? [roster.owner_id] : []))
	const currentMembers = calculateCurrentMembersHistory(seasons, currentMemberIds)
	return {...calculateLeagueHistory(seasons), currentMemberIds: [...currentMemberIds], currentMembers}
}
