import {
	calcPlayerPoints,
	createRangeArray,
	getLeagueReceptionScoringType,
	getOptimalLineup,
	getPositionColor,
	getPositionRosterSlots,
	getReadableScoringKey,
	getRosterSlotPositions,
	getVariablePPR,
	hasPremiumScoring,
	hasVariablePPR,
	LINEUP_POSITION,
	ordinal_suffix_of,
	POSITION,
	standardDeviation,
} from '../utility/rosterFunctions'
import {MatchupPlayer} from '../classes/custom/MatchupPlayer'
import Player, {PlayerMap, PlayerScores, SleeperPlayerDetails} from '../classes/custom/Player'
import League from '../classes/custom/League'
import MatchupInterface from '../classes/custom/MatchupInterface'

const details = {player_id: 'p1'} as SleeperPlayerDetails

describe('roster and scoring utilities', () => {
	it('maps a quarterback slot to QB', () => {
		expect(getRosterSlotPositions('QB')).toEqual([POSITION.QB])
	})

	it('maps a flex slot to RB, WR, and TE', () => {
		expect(getRosterSlotPositions('FLEX')).toEqual([POSITION.RB, POSITION.WR, POSITION.TE])
	})

	it('maps a receiver to all compatible receiver slots', () => {
		expect(getPositionRosterSlots(POSITION.WR)).toEqual([
			LINEUP_POSITION.WR,
			LINEUP_POSITION.FLEX,
			LINEUP_POSITION.SUPER_FLEX,
			LINEUP_POSITION.WRRB_FLEX,
			LINEUP_POSITION.REC_FLEX,
		])
	})

	it('returns no slots for an unknown position', () => {
		expect(getPositionRosterSlots('UNKNOWN' as POSITION)).toEqual([])
	})

	it('formats fixed PPR scoring', () => {
		expect(getVariablePPR({rec: 1})).toBe('1.0 PPR')
	})

	it('formats variable PPR scoring', () => {
		expect(getVariablePPR({rec_0_4: 0.5, rec_5_9: 1})).toBe('V-PPR')
	})

	it('formats positional reception premiums', () => {
		expect(getVariablePPR({rec: 1, bonus_rec_rb: 0.5})).toBe('V-PPR RB  Prem')
	})

	it('returns zero PPR when reception scoring is absent', () => {
		expect(getVariablePPR({})).toBe('0 PPR')
	})

	it('detects premium reception scoring', () => {
		expect(hasPremiumScoring({bonus_rec_te: 0.5})).toBe(true)
		expect(hasPremiumScoring({bonus_rec_te: 0})).toBe(false)
	})

	it('detects variable reception scoring', () => {
		expect(hasVariablePPR({rec_10_19: 0.5})).toBe(true)
		expect(hasVariablePPR({rec: 1})).toBe(false)
	})

	it('calculates only configured scoring categories', () => {
		expect(calcPlayerPoints({pass_yd: 250, pass_td: 2, unknown: 100} as never, {
			pass_yd: 0.04,
			pass_td: 4,
		})).toBe(18)
	})

	it('returns undefined for missing player stats', () => {
		expect(calcPlayerPoints(undefined, {rec: 1})).toBeUndefined()
	})

	it('ignores non-finite scoring values', () => {
		expect(calcPlayerPoints({rec: Number.NaN}, {rec: 1})).toBe(0)
	})

	it('selects the highest scoring eligible lineup player', () => {
		const players = [
			new MatchupPlayer('low', 5, 0, 'RB', [POSITION.RB]),
			new MatchupPlayer('high', 10, 0, 'RB', [POSITION.RB]),
		]
		expect(getOptimalLineup(players, [LINEUP_POSITION.RB], false)[0].playerId).toBe('high')
	})

	it('uses projected scores when selecting projected lineups', () => {
		const players = [
			new MatchupPlayer('actual-high', 20, 2, 'RB', [POSITION.RB]),
			new MatchupPlayer('projected-high', 2, 20, 'RB', [POSITION.RB]),
		]
		expect(getOptimalLineup(players, [LINEUP_POSITION.RB], true)[0].playerId).toBe('projected-high')
	})

	it('does not select negative scoring players', () => {
		const lineup = getOptimalLineup(
			[new MatchupPlayer('negative', -1, 0, 'RB', [POSITION.RB])],
			[LINEUP_POSITION.RB],
			false
		)
		expect(lineup[0].playerId).toBe('0')
	})

	it('fills unavailable lineup slots with a blank player', () => {
		const lineup = getOptimalLineup([], [LINEUP_POSITION.QB], false)
		expect(lineup[0].playerId).toBe('0')
	})

	it('returns inclusive ranges', () => {
		expect(createRangeArray(1, 3)).toEqual([1, 2, 3])
	})

	it('returns an empty range when start exceeds end', () => {
		expect(createRangeArray(3, 1)).toEqual([])
	})

	it('formats ordinal suffixes including teens', () => {
		expect(ordinal_suffix_of(1)).toBe('1st')
		expect(ordinal_suffix_of(12)).toBe('12th')
		expect(ordinal_suffix_of(23)).toBe('23rd')
	})

	it('calculates sample standard deviation', () => {
		expect(standardDeviation([1, 2, 3])).toBeCloseTo(1)
	})

	it('handles empty and singleton standard deviation inputs', () => {
		expect(standardDeviation([])).toBe(0)
		expect(standardDeviation([1])).toBe(0)
	})

	it('returns position colors', () => {
		expect(getPositionColor(POSITION.QB)).toContain('rgba')
		expect(getPositionColor('unknown' as POSITION)).toBe('#000000')
	})

	it('formats readable scoring keys', () => {
		expect(getReadableScoringKey('pass_td')).toBe('Pass Touchdown:')
	})

	it('describes league reception and type settings', () => {
		const result = getLeagueReceptionScoringType({
			scoring_settings: {rec: 0.5},
			roster_positions: ['QB', 'SUPER_FLEX'],
			settings: {type: 2},
		} as never)
		expect(result).toEqual({pprString: '0.5 PPR', numQbString: '2QB', leagueTypeString: 'Dynasty'})
	})
})

describe('team notable weeks', () => {
	it('selects managed-week extrema by points left across enabled weeks, including bye weeks', () => {
		const makeMatchup = (
			weekNumber: number,
			pf: number,
			opslap: number,
			isByeWeek = false
		) => ({
			weekNumber,
			isByeWeek,
			getMemberSide: () => ({pf, opslap}),
			getMargin: () => 10,
		}) as unknown as MatchupInterface

		const matchups = [
			makeMatchup(1, 100, 125),
			makeMatchup(2, 85, 150, true),
			makeMatchup(3, 110, 120),
			makeMatchup(4, 80, 200),
		]
		const league = {
			getEnabledWeeks: () => [1, 2, 3],
			weeks: new Map(
				matchups.map((matchup) => [matchup.weekNumber, {getMemberMatchup: () => matchup}])
			),
		} as unknown as League

		const notableWeeks = League.prototype.getMemberNotableWeeks.call(league, 42)

		expect(notableWeeks.bestManagedWeek?.weekNumber).toBe(3)
		expect(notableWeeks.worstManagedWeek?.weekNumber).toBe(2)
	})
})

describe('league helper behavior', () => {
	it('selects the rival with the smallest absolute point differential', () => {
		const closeRival = {
			rivalRosterId: 2,
			wins: 1,
			losses: 0,
			ties: 0,
			getPointDifferential: () => 5,
		}
		const distantRival = {
			rivalRosterId: 3,
			wins: 1,
			losses: 0,
			ties: 0,
			getPointDifferential: () => -20,
		}
		const league = {
			rivals: new Map([[1, new Map([[2, closeRival], [3, distantRival]])]]),
		} as unknown as League

		expect(League.prototype.getMemberRival.call(league, 1)?.rivalRosterId).toBe(2)
	})

	it('returns sorted trades without reordering the stored trades', () => {
		const lowerDifferential = {biggestPointDifferential: 2}
		const higherDifferential = {biggestPointDifferential: 8}
		const trades = [lowerDifferential, higherDifferential]
		const league = {trades} as unknown as League

		expect(League.prototype.getSortedTrades.call(league)).toEqual([
			higherDifferential,
			lowerDifferential,
		])
		expect(trades).toEqual([lowerDifferential, higherDifferential])
	})

	it('attributes season players to the roster that fielded them', () => {
		const member = {
			players: new Map<string, {roster_id: number}>(),
			stats: {
				position_starts: new Map(),
				position_scores: new Map(),
				projected_position_scores: new Map(),
			},
		}
		const awayTeam = {
			roster_id: 42,
			starters: [{playerId: 'away-player', position: 'RB', eligiblePositions: ['RB'], score: 12, projectedScore: 8}],
			bench: [],
			position_starts: new Map(),
			position_scores: new Map(),
			position_projected_scores: new Map(),
		}
		const addTeamPlayerStats = (League.prototype as unknown as {
			addTeamPlayerStats: (member: unknown, team: unknown, weekNumber: number) => void
		}).addTeamPlayerStats

		addTeamPlayerStats.call({} as League, member, awayTeam, 1)

		expect(member.players.get('away-player')?.roster_id).toBe(42)
	})

	it('returns empty notable and drafter results for a league with no members', () => {
		const league = {members: new Map()} as unknown as League

		expect(League.prototype.getNotableMembers.call(league)).toBeNull()
		expect(League.prototype.getBestAndWorstDrafter.call(league)).toEqual({
			bestDrafter: null,
			worstDrafter: null,
		})
	})
})

describe('player score models', () => {
	it('stores multiple stat players in one week', () => {
		const map = new PlayerMap()
		map.addPlayerWeekStats(1, 'p1', {rec: 3})
		map.addPlayerWeekStats(1, 'p2', {rec: 4})
		expect(map.weekly_scores.get(1)?.size).toBe(2)
	})

	it('stores projections independently from stats', () => {
		const map = new PlayerMap()
		map.addPlayerWeekProjections(1, 'p1', {rec: 10})
		expect(map.weekly_projections.get(1)?.get('p1')).toEqual({rec: 10})
		expect(map.weekly_scores.has(1)).toBe(false)
	})

	it('calculates actual and projected points from their respective maps', () => {
		const map = new PlayerMap()
		map.addPlayerWeekStats(1, 'p1', {rec: 2})
		map.addPlayerWeekProjections(1, 'p1', {rec: 5})
		const player = new Player(1, 1, details)
		player.calculatePoints(map, {rec: 1})
		expect(player.points_scored).toBe(2)
		expect(player.points_projected).toBe(5)
	})

	it('calculates PlayerScores for every available week', () => {
		const scores = new PlayerScores({
			_id: 'p1',
			details,
			stats: {1: {rec: 2}, 2: {rec: 3}},
			projections: {2: {rec: 4}},
		}, {rec: 1}, 1, 2)
		expect(scores.stats.get(1)).toBe(2)
		expect(scores.stats.get(2)).toBe(3)
		expect(scores.projections.get(2)).toBe(4)
	})

	it('ignores unknown and invalid stats in PlayerScores', () => {
		const scores = new PlayerScores({
			_id: 'p1',
			details,
			stats: {1: {rec: Number.NaN, unknown: 10} as never},
			projections: {},
		}, {rec: 1}, 1, 1)
		expect(scores.stats.get(1)).toBe(0)
	})
})
