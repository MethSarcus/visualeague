import {calculateCurrentMembersHistory, calculateLeagueHistory, HistorySeason} from '../lib/leagueHistory'
import {fetchLeagueHistory} from '../lib/fetchLeagueHistory'
import handler from '../pages/api/league/[league]/history'
import type {NextApiRequest, NextApiResponse} from 'next'

const season = (leagueId: string, year: string): HistorySeason => ({
	leagueId,
	season: year,
	users: [
		{user_id: 'a', display_name: 'Alice', metadata: {team_name: year === '2024' ? 'New A' : 'Old A', avatar: `https://example.com/${year}.png`}},
		{user_id: 'b', display_name: 'Bob', avatar: 'bob-avatar'},
		{user_id: 'c', display_name: 'Carol'},
	],
	rosters: [
		{roster_id: 1, owner_id: 'a'},
		{roster_id: 2, owner_id: 'b'},
		{roster_id: 3, owner_id: 'c'},
	],
	weeks: [],
})

describe('league history calculations', () => {
	it('excludes malformed matchup groups without dropping valid individual scores', () => {
		const data = season('2', '2024')
		data.divisionCount = 2
		data.rosters = data.rosters.map((roster, index) => ({...roster, settings: {division: index === 1 ? 2 : 1}}))
		data.weeks = [
			{week: 1, matchups: [
				{roster_id: 1, matchup_id: 1, points: 90},
				{roster_id: 2, matchup_id: 1, points: 100},
				{roster_id: 3, matchup_id: 1, points: null},
			]},
			{week: 2, matchups: [
				{roster_id: 1, matchup_id: 1, points: 80},
				{roster_id: 999, matchup_id: 1, points: 70},
			]},
		]
		const history = calculateLeagueHistory([data])
		expect(history.games).toBe(0)
		expect(history.unpairedGroups).toBe(2)
		expect(history.highScores.map((score) => score.points)).toEqual([100, 90, 80])
		expect(history.teams.find((team) => team.id === 'a')).toMatchObject({points: 170, scoredWeeks: 2, headToHead: {games: 0}})
		expect(history.divisionHistory.seasons[0].divisions.every((division) => division.games === 0)).toBe(true)
	})

	it('recognizes loss tiebreaker totals that differ only by floating-point accumulation', () => {
		const data = season('2', '2024')
		data.weeks = [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 0}, {roster_id: 2, matchup_id: 1, points: 0.1}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 0}, {roster_id: 2, matchup_id: 1, points: 0.2}]},
			{week: 3, matchups: [{roster_id: 1, matchup_id: 1, points: 0}, {roster_id: 3, matchup_id: 1, points: 0.15}]},
			{week: 4, matchups: [{roster_id: 1, matchup_id: 1, points: 0}, {roster_id: 3, matchup_id: 1, points: 0.15}]},
		]
		expect(calculateLeagueHistory([data]).teams.find((team) => team.id === 'a')?.nemeses.losses.map((rival) => rival.id)).toEqual(['b', 'c'])
	})

	it('filters to current owners while retaining their former opponents and excluding former-only highlights', () => {
		const recent = season('2', '2024')
		recent.rosters = [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}, {roster_id: 3, owner_id: null}]
		recent.divisionCount = 2
		const old = season('1', '2023')
		old.divisionCount = 2
		old.rosters = [
			{roster_id: 1, owner_id: 'a', settings: {division: 1}},
			{roster_id: 2, owner_id: 'c', settings: {division: 1}},
			{roster_id: 3, owner_id: 'b', settings: {division: 2}},
			{roster_id: 4, owner_id: 'd', settings: {division: 2}},
			{roster_id: 5, owner_id: null, settings: {division: 2}},
		]
		old.weeks = [
			{week: 1, matchups: [
				{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 100},
				{roster_id: 3, matchup_id: 2, points: 110}, {roster_id: 4, matchup_id: 2, points: 50},
			]},
			{week: 2, matchups: [
				{roster_id: 2, matchup_id: 1, points: 500}, {roster_id: 4, matchup_id: 1, points: 1},
				{roster_id: 1, matchup_id: null, points: 120},
				{roster_id: 5, matchup_id: null, points: 600},
			]},
		]
		const all = calculateLeagueHistory([recent, old])
		const history = calculateLeagueHistory([recent, old], new Set(['a', 'b']))
		const {teams: _teams, ...expectedCurrent} = history
		expect(calculateCurrentMembersHistory([recent, old], new Set(['a', 'b']))).toEqual(expectedCurrent)
		expect(all.highScores[0].points).toBe(600)
		expect(history.teams.map((team) => team.id).sort()).toEqual(['a', 'b'])
		expect(history.teams.find((team) => team.id === 'a')).toMatchObject({
			points: 210, headToHead: {games: 1, losses: 1, pointsFor: 90, pointsAgainst: 100},
			opponents: [{id: 'c', wins: 0, losses: 1, pointsFor: 90, pointsAgainst: 100}],
			nemeses: {losses: [{id: 'c'}]},
		})
		expect(history.highScores.map((score) => score.points)).toEqual([120, 110, 90])
		expect(history.games).toBe(2)
		expect(history.closestGame).toMatchObject({winner: 'Carol', loser: 'New A', margin: 10})
		expect(history.biggestWin).toMatchObject({margin: 60})
		expect(history.divisionHistory.seasons[0].divisions).toMatchObject([
			{id: 1, rosters: 1, games: 1, losses: 1, pointsFor: 90, pointsAgainst: 100},
			{id: 2, rosters: 1, games: 1, wins: 1, pointsFor: 110, pointsAgainst: 50},
		])
		expect(calculateLeagueHistory([recent, old], new Set()).teams).toEqual([])
		expect(calculateLeagueHistory([recent, old], new Set()).highScores).toEqual([])
	})

	it('aggregates owners across seasons, scores byes and custom points, and calculates rivalries and records', () => {
		const recent = season('2', '2024')
		recent.weeks = [
			{week: 1, matchups: [
				{roster_id: 1, matchup_id: 1, points: 90, custom_points: 110},
				{roster_id: 2, matchup_id: 1, points: 115},
				{roster_id: 3, matchup_id: null, points: 130},
			]},
			{week: 2, matchups: [
				{roster_id: 1, matchup_id: 1, points: 100},
				{roster_id: 2, matchup_id: 1, points: 100},
				{roster_id: 3, matchup_id: 2, points: 75},
			]},
		]
		const old = season('1', '2023')
		old.weeks = [{week: 1, matchups: [
			{roster_id: 1, matchup_id: 1, points: 80},
			{roster_id: 2, matchup_id: 1, points: 100},
			{roster_id: 3, matchup_id: null, points: 0},
		]}]
		const history = calculateLeagueHistory([recent, old])
		const alice = history.teams.find((team) => team.id === 'a')!
		expect(alice).toMatchObject({
			name: 'New A', avatar: 'https://example.com/2024.png', seasons: 2, points: 290, wins: 0, losses: 2, ties: 1,
			nemeses: {losses: [{name: 'Bob', avatar: 'https://sleepercdn.com/avatars/thumbs/bob-avatar', wins: 0, losses: 2, ties: 1, pointsAgainst: 315}]},
		})
		expect(alice.nemeses.losses[0].matchups).toEqual([
			{leagueId: '2', season: '2024', week: 2, teamPoints: 100, opponentPoints: 100},
			{leagueId: '2', season: '2024', week: 1, teamPoints: 110, opponentPoints: 115},
			{leagueId: '1', season: '2023', week: 1, teamPoints: 80, opponentPoints: 100},
		])
		expect(history.teams.find((team) => team.id === 'b')?.opponents.find((opponent) => opponent.id === 'a')).toMatchObject({
			wins: 2, losses: 0, ties: 1, pointsFor: 315, pointsAgainst: 290,
		})
		expect(history.teams.find((team) => team.id === 'c')?.opponents).toEqual([])
		expect(alice.headToHead).toEqual({games: 3, wins: 0, losses: 2, ties: 1, pointsFor: 290, pointsAgainst: 315})
		expect(alice.seasonRecords).toEqual([
			{leagueId: '2', season: '2024', points: 210, games: 2, wins: 0, losses: 1, ties: 1, pointsFor: 210, pointsAgainst: 215},
			{leagueId: '1', season: '2023', points: 80, games: 1, wins: 0, losses: 1, ties: 0, pointsFor: 80, pointsAgainst: 100},
		])
		expect(history.teams.find((team) => team.id === 'c')).toMatchObject({
			points: 205, headToHead: {games: 0, pointsFor: 0, pointsAgainst: 0},
			seasonRecords: [{points: 205, games: 0}, {points: 0, games: 0}],
		})
		expect(history.games).toBe(3)
		expect(history.unpairedGroups).toBe(1)
		expect(history.highScores[0]).toEqual({team: 'Carol', points: 130, season: '2024', week: 1})
		expect(history.closestGame).toMatchObject({winner: 'Bob', loser: 'New A', margin: 5})
		expect(history.biggestWin).toMatchObject({margin: 20})
	})

	it('breaks loss ties by opponent points and keeps unowned rosters separate', () => {
		const data = season('2', '2024')
		data.rosters.push({roster_id: 4, owner_id: null})
		data.weeks = [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 1}, {roster_id: 2, matchup_id: 1, points: 2}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 1}, {roster_id: 3, matchup_id: 1, points: 2}]},
			{week: 3, matchups: [{roster_id: 1, matchup_id: 1, points: 1}, {roster_id: 3, matchup_id: 1, points: 1}]},
		]
		const old = season('1', '2023')
		old.rosters.push({roster_id: 4, owner_id: null})
		const history = calculateLeagueHistory([data, old])
		expect(history.teams.find((team) => team.id === 'a')?.nemeses.losses[0].name).toBe('Carol')
		expect(history.teams.filter((team) => team.id.startsWith('unowned:'))).toHaveLength(2)
		expect(history.teams.find((team) => team.id === 'c')?.nemeses.losses).toEqual([])
		expect(history.teams.find((team) => team.id === 'c')?.nemeses.points).toEqual([])
		expect(history.teams.find((team) => team.id.startsWith('unowned:'))?.avatar).toBeNull()
	})

	it('records matchup scores from each team perspective', () => {
		const data = season('2', '2024')
		data.weeks = [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 10}, {roster_id: 2, matchup_id: 1, points: 20}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 30}, {roster_id: 2, matchup_id: 1, points: 15}]},
		]
		const history = calculateLeagueHistory([data])
		expect(history.teams.find((team) => team.id === 'b')?.nemeses.losses[0].matchups).toEqual([
			{leagueId: '2', season: '2024', week: 2, teamPoints: 15, opponentPoints: 30},
			{leagueId: '2', season: '2024', week: 1, teamPoints: 20, opponentPoints: 10},
		])
	})

	it('selects points rivals independently and shares exact ties without using names', () => {
		const data = season('2', '2024')
		data.weeks = [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 10}, {roster_id: 2, matchup_id: 1, points: 20}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 30}, {roster_id: 2, matchup_id: 1, points: 20}]},
			{week: 3, matchups: [{roster_id: 1, matchup_id: 1, points: 10}, {roster_id: 3, matchup_id: 1, points: 25}]},
			{week: 4, matchups: [{roster_id: 1, matchup_id: 1, points: 10}, {roster_id: 3, matchup_id: 1, points: 15}]},
		]
		const alice = calculateLeagueHistory([data]).teams.find((team) => team.id === 'a')!
		expect(alice.nemeses.losses.map((rival) => rival.name)).toEqual(['Carol'])
		expect(alice.nemeses.points.map((rival) => rival.name)).toEqual(['Carol'])
		expect(alice.nemeses.points.map((rival) => [rival.pointsFor, rival.pointsAgainst])).toEqual([[20, 40]])

		data.weeks[3].matchups[1].points = 10
		const tied = calculateLeagueHistory([data]).teams.find((team) => team.id === 'a')!
		expect(tied.nemeses.losses.map((rival) => rival.name)).toEqual(['Bob'])
		expect(tied.nemeses.points.map((rival) => rival.name)).toEqual(['Carol'])

		data.weeks[3].matchups[0].points = 20
		data.weeks[3].matchups[1].points = 15
		const exact = calculateLeagueHistory([data]).teams.find((team) => team.id === 'a')!
		expect(exact.nemeses.losses.map((rival) => rival.name)).toEqual(['Bob', 'Carol'])
		expect(exact.nemeses.points.map((rival) => rival.name)).toEqual(['Carol'])
	})

	it('shares exact differential ties and ignores opponents the team outscored', () => {
		const data = season('2', '2024')
		data.weeks = [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 100}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 190}, {roster_id: 3, matchup_id: 1, points: 200}]},
		]
		const history = calculateLeagueHistory([data])
		expect(history.teams.find((team) => team.id === 'a')?.nemeses.points.map((rival) => rival.name)).toEqual(['Bob', 'Carol'])
		expect(history.teams.find((team) => team.id === 'b')?.nemeses.points).toEqual([])
	})
})

describe('history fetching', () => {
	const originalFetch = global.fetch
	afterEach(() => { global.fetch = originalFetch })

	it('follows previous leagues and fetches every scored week without player endpoints', async () => {
		const replies: Record<string, unknown> = {
			'league/2': {league_id: '2', season: '2024', previous_league_id: '1', settings: {start_week: 1, last_scored_leg: 2}},
			'league/1': {league_id: '1', season: '2023', previous_league_id: '0', settings: {start_week: 2, last_scored_leg: 2}},
			'league/2/users': [], 'league/2/rosters': [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: null}], 'league/2/matchups/1': [], 'league/2/matchups/2': [],
			'league/1/users': [], 'league/1/rosters': [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'former'}], 'league/1/matchups/2': [
				{roster_id: 1, matchup_id: 1, points: 10}, {roster_id: 2, matchup_id: 1, points: 20},
			],
		}
		const fetchMock = jest.fn(async (url: string) => {
			const path = url.replace('https://api.sleeper.app/v1/', '')
			if (!(path in replies)) throw new Error(`Unexpected request: ${path}`)
			return {ok: true, json: async () => replies[path]} as Response
		})
		global.fetch = fetchMock as typeof fetch
		const history = await fetchLeagueHistory('2')
		expect(history.teams).toHaveLength(3)
		expect(history.currentMemberIds).toEqual(['a'])
		expect(history.currentMembers).not.toHaveProperty('teams')
		expect(history.teams.find((team) => team.id === 'a')).toMatchObject({losses: 1, points: 10, nemeses: {losses: [{id: 'former'}]}})
		expect(history.seasons).toEqual(['2024', '2023'])
		expect(fetchMock).toHaveBeenCalledTimes(9)
		expect(fetchMock).not.toHaveBeenCalledWith('https://api.sleeper.app/v1/league/0')
		expect(fetchMock.mock.calls.map(([url]) => url)).not.toEqual(expect.arrayContaining([expect.stringContaining('/player')]))
	})

	it('fails explicitly when the season chain has a cycle', async () => {
		global.fetch = jest.fn(async (url: string) => ({
			ok: true,
			json: async () => url.endsWith('/users') || url.endsWith('/rosters') ? [] :
				{league_id: '2', season: '2024', previous_league_id: '2', settings: {start_week: 1, last_scored_leg: 0}},
		} as Response)) as typeof fetch
		await expect(fetchLeagueHistory('2')).rejects.toThrow('Cycle in Sleeper league history')
	})

	it('reports a failed request for a nonzero previous league', async () => {
		global.fetch = jest.fn(async (url: string) => {
			if (url.endsWith('/league/1')) return {ok: false, status: 404} as Response
			return {ok: true, json: async () => url.endsWith('/users') || url.endsWith('/rosters') ? [] :
				{league_id: '2', season: '2024', previous_league_id: '1', settings: {start_week: 1, last_scored_leg: 0}}} as Response
		}) as typeof fetch
		await expect(fetchLeagueHistory('2')).rejects.toThrow('Sleeper request failed (404): league/1')
	})
})

describe('history endpoint validation', () => {
	it('rejects invalid league IDs and unsupported methods', async () => {
		const res = {setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn()} as unknown as NextApiResponse
		await handler({method: 'GET', query: {league: 'bad'}} as unknown as NextApiRequest, res)
		expect(res.status).toHaveBeenCalledWith(400)
		await handler({method: 'POST', query: {league: '123'}} as unknown as NextApiRequest, res)
		expect(res.status).toHaveBeenCalledWith(405)
		expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET')
	})
})
