import {aggregateDivisionHistory, aggregateDivisionPairs, calculateDivisionHistory} from '../lib/divisionHistory'
import {fetchLeagueHistory} from '../lib/fetchLeagueHistory'
import {HistorySeason} from '../lib/leagueHistory'

const season: HistorySeason = {
	leagueId: '2', season: '2024', divisionCount: 2, divisionNames: {'1': 'North', '2': 'South'},
	users: [],
	rosters: [
		{roster_id: 1, owner_id: 'a', settings: {division: 1}},
		{roster_id: 2, owner_id: 'b', settings: {division: 2}},
		{roster_id: 3, owner_id: 'c', settings: {division: 1}},
		{roster_id: 4, owner_id: 'd', settings: {division: 0}},
	],
	weeks: [
		{week: 1, matchups: [
			{roster_id: 1, matchup_id: 1, points: 90, custom_points: 110},
			{roster_id: 2, matchup_id: 1, points: 100},
			{roster_id: 3, matchup_id: 2, points: 50},
			{roster_id: 4, matchup_id: 2, points: 60},
		]},
		{week: 2, matchups: [
			{roster_id: 1, matchup_id: 1, points: 80},
			{roster_id: 2, matchup_id: 1, points: 80},
			{roster_id: 3, matchup_id: null, points: 200},
		]},
		{week: 3, matchups: [
			{roster_id: 1, matchup_id: 1, points: 100},
			{roster_id: 3, matchup_id: 1, points: 110},
			{roster_id: 2, matchup_id: 2, points: 100},
		]},
	],
}

it('computes division team records against all opponents, including their own division', () => {
	const history = calculateDivisionHistory([season])
	expect(history.seasons[0]).toMatchObject({
		missingDivisionRosters: 1, excludedGames: 1,
		divisions: [
			{id: 1, name: 'North', rosters: 2, games: 5, wins: 2, losses: 2, ties: 1, pointsFor: 450, pointsAgainst: 450},
			{id: 2, name: 'South', rosters: 1, games: 2, wins: 0, losses: 1, ties: 1, pointsFor: 180, pointsAgainst: 190},
		],
		matchups: [{first: {id: 1, games: 2, wins: 1, pointsFor: 190}, second: {id: 2, games: 2, losses: 1, pointsFor: 180}}],
	})
})

it('keeps seasonal division names and changing memberships separate', () => {
	const older: HistorySeason = {
		...season, leagueId: '1', season: '2023', divisionNames: {'1': 'Former North'},
		rosters: season.rosters.map((roster) => roster.roster_id === 2 ? {...roster, settings: {division: 1}} : roster),
	}
	const noDivisions: HistorySeason = {...season, leagueId: '0', season: '2022', divisionCount: 0}
	const history = calculateDivisionHistory([season, older, noDivisions])
	expect(history.seasonsWithoutDivisions).toBe(1)
	expect(history.seasons.map((item) => item.season)).toEqual(['2023', '2024'])
	expect(history.seasons[0].divisions[0]).toMatchObject({name: 'Former North', games: 7})
	expect(history.seasons[0].divisions[1].name).toBe('Division 2')
	expect(history.seasons[1].divisions[0].games).toBe(5)
})

it('retains Sleeper division metadata and roster settings in the history fetch', async () => {
	const originalFetch = global.fetch
	try {
		global.fetch = jest.fn(async (url: string) => {
			const path = url.replace('https://api.sleeper.app/v1/', '')
			const replies: Record<string, unknown> = {
				'league/2': {league_id: '2', season: '2024', status: 'complete', previous_league_id: null, settings: {start_week: 1, last_scored_leg: 1, divisions: 2}, metadata: {division_1: 'North', division_2: 'South'}},
				'league/2/users': [], 'league/2/rosters': season.rosters, 'league/2/matchups/1': season.weeks[0].matchups,
				'league/2/winners_bracket': [{p: 1, w: 2, t1: 1, t2: 2}],
			}
			if (!(path in replies)) throw new Error(`Unexpected request: ${path}`)
			return {ok: true, json: async () => replies[path]} as Response
		}) as typeof fetch
		const history = await fetchLeagueHistory('2')
		expect(history.divisionHistory.seasons[0].divisions[0]).toMatchObject({name: 'North', wins: 1, pointsFor: 160})
		expect(history.divisionHistory.seasons[0].championDivisionId).toBe(2)
		expect(history.currentMemberIds).toEqual(['a', 'b', 'c', 'd'])
		expect(history.currentMembers).not.toHaveProperty('teams')
		expect(history.currentMembers.divisionHistory.seasons[0].championDivisionId).toBe(2)
	} finally {
		global.fetch = originalFetch
	}
})

it('retains the champion division independently of the current member filter and leaves unknown champions unmarked', () => {
	const championSeason = {...season, championRosterId: 2}
	expect(calculateDivisionHistory([championSeason], new Set(['a'])).seasons[0].championDivisionId).toBe(2)
	expect(calculateDivisionHistory([{...season, championRosterId: 4}]).seasons[0].championDivisionId).toBeNull()
	expect(calculateDivisionHistory([{...season, championRosterId: 999}]).seasons[0].championDivisionId).toBeNull()
})

it('does not infer a champion from an unresolved or invalid final', async () => {
	const originalFetch = global.fetch
	try {
		let status = 'complete'
		let bracket: unknown[] = [{p: 1, w: 4, t1: 1, t2: 2}]
		const fetchMock = jest.fn(async (url: string) => {
			const path = url.replace('https://api.sleeper.app/v1/', '')
			const replies: Record<string, unknown> = {
				'league/2': {league_id: '2', season: '2024', status, previous_league_id: null, settings: {start_week: 1, last_scored_leg: 0, divisions: 2}},
				'league/2/users': [], 'league/2/rosters': season.rosters, 'league/2/winners_bracket': bracket,
			}
			if (!(path in replies)) throw new Error(`Unexpected request: ${path}`)
			return {ok: true, json: async () => replies[path]} as Response
		})
		global.fetch = fetchMock as typeof fetch
		expect((await fetchLeagueHistory('2')).divisionHistory.seasons[0].championDivisionId).toBeNull()
		bracket = [{p: 1, w: null, t1: 1, t2: 2}]
		expect((await fetchLeagueHistory('2')).divisionHistory.seasons[0].championDivisionId).toBeNull()
		status = 'in_season'
		fetchMock.mockClear()
		expect((await fetchLeagueHistory('2')).divisionHistory.seasons[0].championDivisionId).toBeNull()
		expect(fetchMock.mock.calls.map(([url]) => url)).not.toContain('https://api.sleeper.app/v1/league/2/winners_bracket')
	} finally {
		global.fetch = originalFetch
	}
})

it('aggregates division slots by games and preserves historical names', () => {
	const older: HistorySeason = {
		...season, leagueId: '1', season: '2023', divisionNames: {'1': 'Old North', '2': 'South'},
		weeks: [season.weeks[0]],
	}
	const history = calculateDivisionHistory([season, older])
	const divisions = aggregateDivisionHistory(history)
	expect(divisions[0]).toMatchObject({
		id: 1, name: 'North', names: ['Old North', 'North'], seasons: 2,
		games: 7, wins: 3, losses: 3, ties: 1, pointsFor: 610, pointsAgainst: 610,
	})
	expect(divisions[1]).toMatchObject({games: 3, wins: 0, losses: 2, ties: 1})
	expect(aggregateDivisionPairs(history)).toMatchObject([{
		first: {name: 'North', games: 3, wins: 2, ties: 1, pointsFor: 300},
		second: {name: 'South', games: 3, losses: 2, ties: 1, pointsFor: 280},
	}])
})

it('keeps individual pairs separate when there are more than two divisions', () => {
	const extra: HistorySeason = {...season, divisionCount: 3, divisionNames: {'1': 'North', '2': 'South', '3': 'West'},
		rosters: [...season.rosters.slice(0, 3), {roster_id: 4, owner_id: 'd', settings: {division: 3}}],
		weeks: [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 100}, {roster_id: 2, matchup_id: 1, points: 90}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 80}, {roster_id: 4, matchup_id: 1, points: 120}]},
		]}
	const pairs = calculateDivisionHistory([extra]).seasons[0].matchups
	expect(pairs).toHaveLength(2)
	expect(pairs[0]).toMatchObject({first: {id: 1, games: 1, wins: 1, pointsFor: 100}, second: {id: 2, losses: 1}})
	expect(pairs[1]).toMatchObject({first: {id: 1, games: 1, losses: 1, pointsFor: 80}, second: {id: 3, wins: 1}})
})

it('excludes games between rosters with the same owner, consistently with league records', () => {
	const duplicateOwner: HistorySeason = {...season,
		rosters: [{roster_id: 1, owner_id: 'a', settings: {division: 1}}, {roster_id: 2, owner_id: 'a', settings: {division: 2}}],
		weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 100}, {roster_id: 2, matchup_id: 1, points: 90}]}]}
	const result = calculateDivisionHistory([duplicateOwner]).seasons[0]
	expect(result.excludedGames).toBe(1)
	expect(result.divisions.every((division) => division.games === 0)).toBe(true)
})
