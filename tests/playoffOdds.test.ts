import {buildBracket, simulatePlayoffOdds, OddsTeam} from '../utility/playoffOdds'

const team = (id: number, wins: number, mean: number): OddsTeam => ({
	id,
	wins,
	losses: 0,
	ties: 0,
	pf: 0,
	mean,
	stdDev: 10,
})

describe('simulatePlayoffOdds', () => {
	it('is deterministic for a given seed', () => {
		const input = {
			teams: [team(1, 2, 120), team(2, 1, 100), team(3, 0, 80)],
			remaining: [[1, 2]] as [number, number][],
			playoffTeams: 2,
			simulations: 500,
		}
		expect(simulatePlayoffOdds(input)).toEqual(simulatePlayoffOdds(input))
	})

	it('gives a clinched team 100% and a locked-out team 0%', () => {
		const odds = simulatePlayoffOdds({
			teams: [team(1, 10, 100), team(2, 0, 100)],
			remaining: [],
			playoffTeams: 1,
			simulations: 100,
		})
		expect(odds.find((o) => o.id === 1)?.playoffPct).toBe(1)
		expect(odds.find((o) => o.id === 2)?.playoffPct).toBe(0)
	})

	it('favors the stronger team in an equal-record matchup', () => {
		const odds = simulatePlayoffOdds({
			teams: [team(1, 0, 130), team(2, 0, 70)],
			remaining: [[1, 2]],
			playoffTeams: 1,
			simulations: 1000,
		})
		expect(odds.find((o) => o.id === 1)!.playoffPct).toBeGreaterThan(0.95)
	})

	it('seed percentages sum to 1 per team', () => {
		const odds = simulatePlayoffOdds({
			teams: [team(1, 1, 100), team(2, 1, 100), team(3, 1, 100)],
			remaining: [[1, 2]],
			playoffTeams: 2,
			simulations: 300,
		})
		odds.forEach((o) => expect(o.seedPct.reduce((a, b) => a + b, 0)).toBeCloseTo(1))
	})

	it('gives division leaders a spot over a better record in another division', () => {
		const withDivision = (id: number, wins: number, divisionId: number): OddsTeam => ({
			...team(id, wins, 100),
			divisionId,
		})
		const odds = simulatePlayoffOdds({
			teams: [withDivision(1, 9, 1), withDivision(2, 8, 1), withDivision(3, 1, 2), withDivision(4, 0, 2)],
			remaining: [],
			playoffTeams: 3,
			divisionSpots: 1,
			simulations: 50,
		})
		// Division 2 leader (team 3) gets in ahead of team 2 despite the worse record
		expect(odds.find((o) => o.id === 3)?.playoffPct).toBe(1)
		expect(odds.find((o) => o.id === 2)?.playoffPct).toBe(1)
		expect(odds.find((o) => o.id === 4)?.playoffPct).toBe(0)
	})

	it('seeds division winners ahead of wild cards when enabled', () => {
		const withDivision = (id: number, wins: number, divisionId: number): OddsTeam => ({
			...team(id, wins, 100),
			divisionId,
		})
		const input = {
			teams: [withDivision(1, 9, 1), withDivision(2, 8, 1), withDivision(3, 1, 2), withDivision(4, 0, 2)],
			remaining: [] as [number, number][],
			playoffTeams: 3,
			simulations: 20,
		}
		const seedOf = (odds: ReturnType<typeof simulatePlayoffOdds>, id: number) =>
			odds.find((o) => o.id === id)!.seedPct.findIndex((p) => p === 1) + 1

		const byRecord = simulatePlayoffOdds({...input, divisionSpots: 1})
		expect(seedOf(byRecord, 2)).toBe(2)
		expect(seedOf(byRecord, 3)).toBe(3)

		const winnersFirst = simulatePlayoffOdds({...input, divisionWinnersFirst: true})
		expect(seedOf(winnersFirst, 1)).toBe(1)
		expect(seedOf(winnersFirst, 3)).toBe(2)
		expect(seedOf(winnersFirst, 2)).toBe(3)
	})

	it('builds a bracket with byes for the top seeds', () => {
		const rounds = buildBracket(6)
		expect(rounds[0]).toEqual([
			{top: 1, bottom: null},
			{top: 4, bottom: 5},
			{top: 2, bottom: null},
			{top: 3, bottom: 6},
		])
		expect(rounds[1]).toEqual([
			{top: 1, bottom: null},
			{top: 2, bottom: null},
		])
		expect(rounds).toHaveLength(3)
	})
})
