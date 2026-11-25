import {averageDraftSpending, calculateDraftSpending} from '../lib/draftSpending'
import {fetchDraftSpending} from '../lib/fetchDraftSpending'

const draft = {draft_id: '10', season: '2024', status: 'complete'}
const pick = (position: string, amount: string, roster_id = 1) => ({roster_id, metadata: {position, amount}})
const rosters = [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}, {roster_id: 3, owner_id: null}]
const users = [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}]

it('sums auction dollars by position, including keepers and other positions', () => {
	const result = calculateDraftSpending(draft, [
		pick('QB', '10'), pick('RB', '40'), pick('RB', '5'), pick('WR', '30'),
		pick('TE', '10'), pick('K', '2'), pick('DEF', '2'), pick('DL', '1'), pick('WR', '20', 2),
	], rosters, users)
	expect(result?.members).toMatchObject([
		{name: 'Alpha', total: 100, amounts: {QB: 10, RB: 45, WR: 30, TE: 10, 'K/DEF': 4, Other: 1}},
		{name: 'Beta', total: 20, amounts: {WR: 20}},
		{name: 'Unowned roster 3', total: 0},
	])
	expect(calculateDraftSpending(draft, [], rosters, users)).toBeNull()
	expect(calculateDraftSpending(draft, [pick('QB', '0')], rosters, users)).toBeNull()
	expect(() => calculateDraftSpending(draft, [pick('RB', '')], rosters, users)).toThrow('Missing auction amount')
	expect(() => calculateDraftSpending(draft, [pick('RB', '-1')], rosters, users)).toThrow('Invalid auction amount')
	expect(() => calculateDraftSpending(draft, [pick('', '10')], rosters, users)).toThrow('Missing position')
	expect(() => calculateDraftSpending(draft, [pick('QB', '10', 99)], rosters, users)).toThrow('Unknown roster')
})

it('follows linked seasons, includes each auction and excludes snake drafts', async () => {
	const responses: Record<string, unknown> = {
		'league/2': {league_id: '2', previous_league_id: '1'},
		'league/2/drafts': [
			{...draft, draft_id: '20', season: '2025', type: 'auction'},
			{...draft, draft_id: '21', season: '2025', type: 'snake'},
			{...draft, draft_id: '22', season: '2025', type: 'auction', status: 'drafting'},
		],
		'league/1': {league_id: '1', previous_league_id: '0'},
		'league/1/drafts': [{...draft, type: 'auction'}],
		'league/2/rosters': rosters,
		'league/2/users': users,
		'league/1/rosters': [{roster_id: 1, owner_id: 'old'}],
		'league/1/users': [{user_id: 'old', display_name: 'Former owner'}],
		'draft/20/picks': [pick('RB', '60')],
		'draft/22/picks': [pick('TE', '5')],
		'draft/10/picks': [pick('QB', '10')],
	}
	const fetchMock = jest.fn(async (url: string) => ({
		ok: url.replace('https://api.sleeper.app/v1/', '') in responses,
		status: 404,
		json: async () => responses[url.replace('https://api.sleeper.app/v1/', '')],
	}))
	const originalFetch = global.fetch
	global.fetch = fetchMock as unknown as typeof fetch
	try {
		const {drafts: rows, hasAuctionDrafts, hasUncompletedAuctions} = await fetchDraftSpending('2')
		expect(hasAuctionDrafts).toBe(true)
		expect(hasUncompletedAuctions).toBe(true)
		expect(rows.map((row) => row.draftId)).toEqual(['20', '22', '10'])
		expect(rows[1].status).toBe('drafting')
		expect(rows[1].members[0]).toMatchObject({name: 'Alpha', total: 5, amounts: {TE: 5}})
		expect(rows[2].members[0].name).toBe('Former owner')
		expect(fetchMock).not.toHaveBeenCalledWith('https://api.sleeper.app/v1/league/0')
		expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('draft/21/picks'))
		responses['league/1'] = {league_id: '1', previous_league_id: '2'}
		await expect(fetchDraftSpending('2')).rejects.toThrow('Cycle in Sleeper league history')
	} finally {
		global.fetch = originalFetch
	}
})

it('averages manager shares by completed season using owner IDs, combining same-season auctions', () => {
	const draftRow = (id: string, season: string, status: string, picks: ReturnType<typeof pick>[], seasonRosters = rosters) =>
		calculateDraftSpending({draft_id: id, season, status}, picks, seasonRosters, users)!
	const rows = [
		draftRow('new', '2024', 'complete', [pick('QB', '100')]),
		draftRow('extra', '2024', 'complete', [pick('RB', '100')]),
		draftRow('old', '2023', 'complete', [pick('RB', '100', 3), pick('QB', '50', 2)],
			[{roster_id: 3, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}]),
		draftRow('active', '2025', 'drafting', [pick('WR', '100')]),
	]
	const averages = averageDraftSpending(rows)
	expect(averages).toHaveLength(2)
	expect(averages[0]).toMatchObject({
		ownerId: 'a', seasons: 2, total: 150,
		amounts: {QB: 50, RB: 100, WR: 0}, percentages: {QB: 25, RB: 75, WR: 0},
	})
	expect(averages[1]).toMatchObject({ownerId: 'b', seasons: 1, total: 50, percentages: {QB: 100}})
})

it('distinguishes leagues without auctions from auctions without recorded spending', async () => {
	const originalFetch = global.fetch
	const drafts = [{...draft, type: 'snake'}]
	global.fetch = jest.fn(async (url: string) => ({
		ok: true,
		json: async () => url.endsWith('/drafts') ? drafts
			: url.endsWith('/rosters') ? rosters : url.endsWith('/users') ? users
				: url.endsWith('/picks') ? [] : {league_id: '1', previous_league_id: null},
	})) as unknown as typeof fetch
	try {
		expect(await fetchDraftSpending('1')).toEqual({
			hasAuctionDrafts: false, hasUncompletedAuctions: false, drafts: [],
		})
		drafts.push({...draft, type: 'auction'})
		expect(await fetchDraftSpending('1')).toEqual({
			hasAuctionDrafts: true, hasUncompletedAuctions: false, drafts: [],
		})
	} finally {
		global.fetch = originalFetch
	}
})
