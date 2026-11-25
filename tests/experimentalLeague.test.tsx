import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import {MatchupPlayer} from '../classes/custom/MatchupPlayer'
import {DatabasePlayer, PlayerScores} from '../classes/custom/Player'
import {Week} from '../classes/custom/Week'
import ExperimentalDashboard from '../components/experimental/ExperimentalDashboard'
import {experimentalTeams, scoreTwins, starterBenchAverages, teamFunFacts} from '../utility/experimentalLeague'
import theme from '../theme'

function fixture() {
	const league: League = Object.create(League.prototype)
	league.settings = {} as League['settings']
	league.allMatchups = []
	const member = (name: string) => {
		const result: LeagueMember = Object.create(LeagueMember.prototype)
		result.teamName = name
		return result
	}
	league.members = new Map([[1, member('Alpha')], [2, member('Beta')]])
	const week = (number: number, sides: object[]) => {
		const result: Week = Object.create(Week.prototype)
		result.weekNumber = number
		result.matchups = new Map()
		result.getAllTeams = jest.fn().mockReturnValue(sides)
		return result
	}
	const player = (id: string, value: number) => new MatchupPlayer(id, value, 0)
	league.weeks = new Map([
		[1, week(1, [
			{roster_id: 1, starters: [player('a', 8), player('d', 7)], bench: [player('b', 15), player('missing', 99)]},
			{roster_id: 2, starters: [player('c', 20)], bench: []},
		])],
		[2, week(2, [
			{roster_id: 1, starters: [player('a', 12), player('d', 12)], bench: [player('b', -2)]},
			{roster_id: 2, starters: [player('c', 20)], bench: []},
		])],
		[4, week(4, [{roster_id: 1, starters: [player('a', -1), player('d', 0)], bench: [player('b', 3)]}])],
		[5, week(5, [{roster_id: 1, starters: [player('b', 20), player('d', 10)], bench: [player('a', 4)]}])],
	])
	const details = new Map(['a', 'b', 'c', 'd'].map((id) => [id, {
		_id: id, details: {full_name: `Player ${id}`} as DatabasePlayer['details'], stats: {}, projections: {},
	}]))
	const scores = new Map(['a', 'b', 'c', 'd'].map((id) => {
		const score = new PlayerScores(details.get(id)!, {}, 1, 5)
		score.stats = new Map([[1, 1], [2, 1], [4, 1], [5, 1]])
		return [id, score]
	}))
	return {league, details, scores}
}

it('preserves starter totals and excludes missing stats and empty slots', () => {
	const {league, details, scores} = fixture()
	const [alpha] = experimentalTeams(league, details, scores)
	expect(alpha.players).toEqual([
		{id: 'd', name: 'Player d', score: 29}, {id: 'a', name: 'Player a', score: 19}, {id: 'b', name: 'Player b', score: 20},
	].sort((a, b) => b.score - a.score))
	expect(alpha.weeks[0].bench).toEqual([{id: 'b', name: 'Player b', score: 15}])
})

it('finds closest pairs and compares recorded scores in both roles', () => {
	const {league, details, scores} = fixture()
	const [alpha] = experimentalTeams(league, details, scores)
	expect(scoreTwins(alpha).map(({week, difference}) => ({week, difference}))).toEqual([
		{week: 1, difference: 1}, {week: 2, difference: 0}, {week: 4, difference: 1}, {week: 5, difference: 10},
	])
	const averages = starterBenchAverages(alpha)
	expect(averages[0]).toMatchObject({name: 'Player b', startAverage: 20, benchAverage: 16 / 3, startCount: 1, benchCount: 3})
	expect(averages[1]).toMatchObject({name: 'Player a', startAverage: 19 / 3, benchAverage: 4, startCount: 3, benchCount: 1})
})

it('calculates the five facts, respects week gaps and uses earliest ties', () => {
	const {league, details, scores} = fixture()
	const [alpha] = experimentalTeams(league, details, scores)
	const facts = teamFunFacts(alpha)
	expect(facts).toHaveLength(5)
	expect(facts[0].text).toContain('Player a appeared in the starting lineup 2 consecutive recorded weeks, ending in Week 2')
	expect(facts[1].text).toContain('Player b and Player d combined for 30.00 starter points in Week 5')
	expect(facts[2].text).toContain('2 recorded starters reached 10 points in Week 2')
	expect(facts[3].text).toContain('Player b went from 3.00 points on the bench to 20.00 as a starter in Week 5')
	expect(facts[4].text).toBe('1 recorded starter score was negative across 1 week.')
})

it('does not report zero negative scores when no starter stats are available', () => {
	const {league, details, scores} = fixture()
	const [alpha] = experimentalTeams(league, details, new Map())
	expect(scoreTwins(alpha)).toEqual([])
	expect(starterBenchAverages(alpha)).toEqual([])
	expect(teamFunFacts(alpha)[4].text).toBe('No recorded starter scores yet.')
	expect(teamFunFacts(alpha)[3].text).toMatch(/No consecutive/)
})

it('restricts calculations to the supplied season portion and ignores gaps', () => {
	const {league, details, scores} = fixture()
	league.weeks = new Map([[2, league.weeks.get(2)!], [5, league.weeks.get(5)!]])
	const [alpha] = experimentalTeams(league, details, scores)
	expect(alpha.players.find((player) => player.id === 'a')?.score).toBe(12)
	expect(teamFunFacts(alpha)[3].text).toMatch(/No consecutive/)
	expect(scoreTwins(alpha).map(({week}) => week)).toEqual([2, 5])
})

it('renders all four visualizations and updates the facts when selecting a team', () => {
	const {league, details, scores} = fixture()
	render(<ChakraProvider theme={theme}>
		<ExperimentalDashboard league={league} playerDetails={details} playerScores={scores} />
	</ChakraProvider>)
	for (const name of ['The butterfly effect', 'The carry job', 'Opponent tax', 'The revenge tour', 'Points graveyard', 'Team DNA',
		'Starter mosaic', 'Score twins', 'Starter or bench?', 'Starter constellation', 'Five team fun facts']) {
		expect(screen.getByRole('heading', {name})).toBeInTheDocument()
	}
	expect(screen.getByLabelText('Scrollable starter score mosaic')).toHaveTextContent('Player a')
	expect(screen.getByText('Player a: 12.00 · Player d: 12.00 points')).toBeInTheDocument()
	const facts = screen.getByRole('heading', {name: 'Five team fun facts'}).closest('section')!
	expect(within(facts).getAllByRole('heading', {level: 3})).toHaveLength(5)
	expect(within(facts).getByText(/Player b and Player d combined/)).toBeInTheDocument()
	fireEvent.change(screen.getByLabelText('Explore a team'), {target: {value: '2'}})
	expect(within(facts).getByText(/No week with two recorded starters yet/)).toBeInTheDocument()
	expect(screen.getByText('No players with recorded scores both started and benched yet.')).toBeInTheDocument()
})

it('provides loading and empty states', () => {
	const {league, details, scores} = fixture()
	const {rerender} = render(<ChakraProvider theme={theme}>
		<ExperimentalDashboard league={league} playerDetails={null} playerScores={null} />
	</ChakraProvider>)
	expect(screen.getByLabelText('Loading experimental league data')).toBeInTheDocument()
	league.weeks = new Map()
	rerender(<ChakraProvider theme={theme}>
		<ExperimentalDashboard league={league} playerDetails={details} playerScores={scores} />
	</ChakraProvider>)
	expect(screen.getByText('No team scores available for this season portion yet.')).toBeInTheDocument()
})
