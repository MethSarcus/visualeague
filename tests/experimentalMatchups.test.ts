import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import Matchup from '../classes/custom/Matchup'
import {MatchupPlayer} from '../classes/custom/MatchupPlayer'
import {MatchupSide} from '../classes/custom/MatchupSide'
import {DatabasePlayer, PlayerScores} from '../classes/custom/Player'
import {Week} from '../classes/custom/Week'
import {SleeperMatchup} from '../classes/sleeper/SleeperMatchup'
import {butterflyEffect, carryJobs, opponentTax, pointsGraveyard, revengeTour, teamDNA} from '../utility/experimentalMatchups'

function fixture() {
	const league: League = Object.create(League.prototype)
	league.settings = {roster_positions: ['QB', 'FLEX']} as League['settings']
	const member = (teamName: string) => Object.assign(Object.create(LeagueMember.prototype), {teamName})
	league.members = new Map([[1, member('Alpha')], [2, member('Beta')], [3, member('Gamma')], [4, member('Delta')]])
	const details = new Map(['a', 'b', 'c', 'd', 'e', 'f'].map((id) => [id, {
		_id: id, details: {full_name: id.toUpperCase(), position: id === 'a' || id === 'c' ? 'QB' : 'WR',
			fantasy_positions: [id === 'a' || id === 'c' ? 'QB' : 'WR']} as DatabasePlayer['details'], stats: {}, projections: {},
	}]))
	const scores = new Map(Array.from(details, ([id, player]) => {
		const score = new PlayerScores(player, {}, 1, 0)
		score.stats = new Map([[1, 1], [2, 1], [3, 1]])
		return [id, score]
	}))
	const player = (id: string, score: number) => new MatchupPlayer(id, score, 0)
	const side = (id: number, pf: number, starters: MatchupPlayer[], bench: MatchupPlayer[] = [], custom_points = 0) =>
		Object.assign(Object.create(MatchupSide.prototype), {roster_id: id, pf, starters, bench, custom_points}) as MatchupSide
	const game = (home: MatchupSide, away: MatchupSide) =>
		Object.assign(Object.create(Matchup.prototype), {homeTeam: home, awayTeam: away}) as Matchup
	const week = (number: number, matchups: Matchup[]) => {
		const result: Week = Object.create(Week.prototype)
		result.weekNumber = number
		result.matchups = new Map(matchups.map((match, index) => [index, match]))
		result.getAllTeams = () => matchups.flatMap((match) => [match.homeTeam, match.awayTeam!])
		return result
	}
	const first = week(1, [
		game(side(1, 18, [player('a', 8), player('b', 10)], [player('c', 14), player('d', 30)]), side(2, 22, [player('c', 12), player('e', 10)])),
		game(side(3, 35, [player('a', 20), player('d', 15)]), side(4, 25, [player('c', 10), player('e', 15)])),
	])
	const second = week(2, [
		game(side(1, 25, [player('a', 20), player('b', 5)], [], 1), side(2, 30, [player('c', 25), player('e', 5)])),
	])
	const third = week(3, [
		game(side(1, 20, [player('a', 10), player('b', 10)]), side(2, 20, [player('c', 15), player('e', 5)])),
	])
	league.weeks = new Map([[1, first], [2, second], [3, third]])
	league.allMatchups = [
		[{roster_id: 1, players: ['e'], starters: [], starters_points: [], points: 0, players_points: new Map(), matchup_id: 1}] as SleeperMatchup[],
		[],
		[],
	]
	return {league, details, scores}
}

it('counts outcome-changing direct eligible swaps, ties, and excludes adjustments', () => {
	const {league, details, scores} = fixture()
	const result = butterflyEffect(league, 1, details, scores)
	expect(result.adjustedGames).toBe(1)
	expect(result.games).toHaveLength(2)
	expect(result.games[0].original).toBe('loss')
	expect(result.games[0].swaps.map((swap) => [swap.bench.id, swap.starter.id, swap.changed])).toEqual([
		['d', 'b', 'win'], ['c', 'a', 'win'],
	])
	expect(result.games[1].original).toBe('tie')
	expect(result.games[1].swaps).toHaveLength(0)
})

it('treats a swap to an exact tie as a change and ignores unsupported slots', () => {
	const {league, details, scores} = fixture()
	const matchup = league.weeks.get(1)!.matchups.get(0)!
	matchup.homeTeam.bench = [new MatchupPlayer('c', 12, 0), new MatchupPlayer('d', 30, 0)]
	league.settings.roster_positions = ['QB', 'UNKNOWN']
	const result = butterflyEffect(league, 1, details, scores)
	expect(result.games[0].swaps.map((swap) => [swap.bench.id, swap.starter.id, swap.changed])).toEqual([['c', 'a', 'tie']])
})

it('uses starter points for carry and skips missing or nonpositive totals', () => {
	const {league, details, scores} = fixture()
	expect(carryJobs(league, 1, details, scores)[0]).toMatchObject({week: 1, total: 18, share: 1000 / 18})
	scores.get('a')!.stats.delete(1)
	expect(carryJobs(league, 1, details, scores).map((entry) => entry.week)).toEqual([2, 3])
})

it('allows carry shares above 100% and excludes weeks with no recorded starters', () => {
	const {league, details, scores} = fixture()
	const matchup = league.weeks.get(1)!.matchups.get(0)!
	matchup.homeTeam.starters[0].score = 20
	matchup.homeTeam.starters[1].score = -5
	expect(carryJobs(league, 1, details, scores)[0].share).toBeCloseTo(133.3333, 3)
	scores.get('a')!.stats.delete(1)
	scores.get('b')!.stats.delete(1)
	expect(butterflyEffect(league, 1, details, scores).games.map((entry) => entry.week)).toEqual([3])
	expect(pointsGraveyard(league, 1, details, scores)).toEqual([])
})

it('compares opposing recorded starter positions against other defenses', () => {
	const {league, details, scores} = fixture()
	const tax = opponentTax(league, 1, details, scores)
	expect(tax.find((entry) => entry.position === 'QB')).toMatchObject({
		against: (12 + 25 + 15) / 3, baseline: 68 / 5, againstCount: 3, baselineCount: 5,
	})
	expect(tax.find((entry) => entry.position === 'WR')).toMatchObject({
		against: 20 / 3, baseline: 11, againstCount: 3, baselineCount: 5,
	})
})

it('detects earlier roster snapshots including weeks outside the selected portion', () => {
	const {league, details, scores} = fixture()
	league.weeks.delete(1)
	expect(revengeTour(league, 1, details, scores).map((entry) => [entry.week, entry.player.id, entry.lastRostered]))
		.toEqual([[2, 'e', 1], [3, 'e', 1]])
	league.allMatchups = []
	expect(revengeTour(league, 1, details, scores)).toEqual([])
})

it('shows only losses in graveyard and computes transparent DNA metrics', () => {
	const {league, details, scores} = fixture()
	expect(pointsGraveyard(league, 1, details, scores).map((entry) => [entry.week, entry.player.id]))
		.toEqual([[1, 'b'], [1, 'a']])
	const dna = teamDNA(league, 1, details, scores)
	expect(dna.games).toHaveLength(2)
	expect(dna.close).toHaveLength(2)
	expect(dna.closeWins).toBe(0)
	expect(dna.blowouts).toHaveLength(0)
})
