import {calculateDraftSpending, DraftSpendingRow} from './draftSpending'
import {HistoryRoster, HistoryUser} from './leagueHistory'

interface SleeperDraft {
	draft_id: string
	season: string
	type: string
	status: string
	metadata?: {name?: string}
}

interface SleeperLeagueLink {
	league_id: string
	previous_league_id: string | null
}

async function sleeper<T>(path: string): Promise<T> {
	const response = await fetch(`https://api.sleeper.app/v1/${path}`)
	if (!response.ok) throw new Error(`Sleeper request failed (${response.status}): ${path}`)
	return response.json() as Promise<T>
}

export async function fetchDraftSpending(leagueId: string): Promise<DraftSpendingRow[]> {
	const visited = new Set<string>()
	const seasons: {leagueId: string; drafts: SleeperDraft[]}[] = []
	let id: string | null = leagueId
	while (id) {
		if (visited.has(id)) throw new Error(`Cycle in Sleeper league history at ${id}`)
		visited.add(id)
		const [league, seasonDrafts]: [SleeperLeagueLink, SleeperDraft[]] = await Promise.all([
			sleeper<SleeperLeagueLink>(`league/${id}`),
			sleeper<SleeperDraft[]>(`league/${id}/drafts`),
		])
		if (!league || league.league_id !== id || !Array.isArray(seasonDrafts)) throw new Error(`Invalid Sleeper draft history for ${id}`)
		for (const draft of seasonDrafts) {
			if (!draft || typeof draft.draft_id !== 'string' || typeof draft.season !== 'string' ||
				typeof draft.type !== 'string' || typeof draft.status !== 'string') {
				throw new Error(`Invalid Sleeper draft in league ${id}`)
			}
		}
		const drafts = seasonDrafts.filter((draft) => draft.type === 'auction')
		if (drafts.length) seasons.push({leagueId: id, drafts})
		id = league.previous_league_id || null
	}
	const rows = (await Promise.all(seasons.map(async ({leagueId: seasonId, drafts}) => {
		const [rosters, users, ...picksByDraft] = await Promise.all([
			sleeper<HistoryRoster[]>(`league/${seasonId}/rosters`),
			sleeper<HistoryUser[]>(`league/${seasonId}/users`),
			...drafts.map((draft) => sleeper<Parameters<typeof calculateDraftSpending>[1]>(`draft/${draft.draft_id}/picks`)),
		])
		if (!Array.isArray(rosters) || !Array.isArray(users)) throw new Error(`Invalid Sleeper roster data for league ${seasonId}`)
		return drafts.map((draft, index) => {
			const picks = picksByDraft[index]
			if (!Array.isArray(picks)) throw new Error(`Invalid Sleeper picks for draft ${draft.draft_id}`)
			return calculateDraftSpending(draft, picks, rosters, users)
		})
	}))).flat()
	return rows.filter((row): row is DraftSpendingRow => row !== null)
		.sort((a, b) => b.season.localeCompare(a.season) || a.draftId.localeCompare(b.draftId))
}
