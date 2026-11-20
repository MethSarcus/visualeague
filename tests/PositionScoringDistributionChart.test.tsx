import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import {ResponsiveLine} from '@nivo/line'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import {MatchupPlayer} from '../classes/custom/MatchupPlayer'
import {DatabasePlayer, PlayerScores} from '../classes/custom/Player'
import {Week} from '../classes/custom/Week'
import {SleeperRoster} from '../classes/sleeper/SleeperRoster'
import PositionScoringDistributionChart, {positionPlayerHighlights, positionScoringDistributions} from '../components/charts/line/PositionScoringDistributionChart'
import {POSITION} from '../utility/rosterFunctions'
import theme from '../theme'

jest.mock('@nivo/line', () => ({ResponsiveLine: jest.fn(() => <div data-testid='line-chart' />)}))

function makeWeek(weekNumber: number, starters: MatchupPlayer[], bench: MatchupPlayer[] = []): Week {
	const week: Week = Object.create(Week.prototype)
	week.weekNumber = weekNumber
	week.getAllTeams = jest.fn().mockReturnValue([{starters, bench}])
	return week
}

function makePlayer(id: string, score: number, position: POSITION) {
	return new MatchupPlayer(id, score, 0, position, [position])
}

function details(id: string, name: string, position: POSITION): DatabasePlayer {
	return {
		_id: id,
		details: {first_name: name, last_name: '', full_name: name, position} as DatabasePlayer['details'],
		stats: {},
		projections: {},
	}
}

function scores(entries: [number, number][]): PlayerScores {
	const playerScores = new PlayerScores(details('test', 'Test', POSITION.QB), {}, 1, 0)
	playerScores.stats = new Map(entries)
	return playerScores
}

function member(teamName: string, players: string[], reserve: string[] = [], taxi: string[] = []): LeagueMember {
	const member: LeagueMember = Object.create(LeagueMember.prototype)
	member.teamName = teamName
	member.avatar = 'manager-avatar'
	member.roster = {players, reserve, taxi} as SleeperRoster
	return member
}

it('groups starter scores by position and calculates normal-curve statistics', () => {
	const distributions = positionScoringDistributions([
		makeWeek(1, [
			makePlayer('qb-1', 10, POSITION.QB),
			makePlayer('qb-2', 20, POSITION.QB),
			makePlayer('rb-1', 4, POSITION.RB),
			makePlayer('0', 0, POSITION.QB),
			makePlayer('bad', NaN, POSITION.QB),
		], [makePlayer('bench', 50, POSITION.QB)]),
	])
	expect(distributions).toHaveLength(2)
	expect(distributions[0]).toMatchObject({position: POSITION.QB, sampleCount: 2, mean: 15, minimum: 10, maximum: 20, standardDeviation: 5})
	expect(distributions[0].curve).toHaveLength(49)
	expect(distributions[0].curve[24].x).toBe(15)
	expect(distributions[1]).toMatchObject({position: POSITION.RB, sampleCount: 1, mean: 4, minimum: 4, maximum: 4, standardDeviation: 0, curve: []})
})

it('finds leaders across rostered starts and bench weeks, counting recorded games once and respecting ties', () => {
	const alpha = makePlayer('a', 0, POSITION.QB)
	const beta = makePlayer('b', 0, POSITION.QB)
	const rookie = makePlayer('c', 0, POSITION.QB)
	const weeks = [
		makeWeek(1, [alpha], [beta, rookie]),
		makeWeek(2, [beta], [alpha, rookie]),
		makeWeek(3, [alpha, beta], [alpha]),
		makeWeek(4, [alpha], [beta]),
	]
	const playerScores = new Map([
		['a', scores([[1, 10], [2, 20], [3, 0], [4, 30], [5, 1000]])],
		['b', scores([[1, 20], [2, 10], [3, 30]])],
		['c', scores([[1, 30], [2, 100]])],
	])
	const playerDetails = new Map([
		['a', details('a', 'Alpha', POSITION.QB)],
		['b', details('b', 'Beta', POSITION.QB)],
		['c', details('c', 'Rookie', POSITION.QB)],
	])
	const qb = positionPlayerHighlights(weeks, playerScores, playerDetails).get(POSITION.QB)
	expect(qb?.highestGames.map(({name, week, score}) => ({name, week, score}))).toEqual([
		{name: 'Rookie', week: 2, score: 100},
	])
	expect(qb?.topAverages).toEqual([{playerId: 'b', name: 'Beta', average: 20, games: 3}])

	playerScores.set('c', scores([[1, 30], [2, 30]]))
	const tied = positionPlayerHighlights(weeks, playerScores, playerDetails).get(POSITION.QB)
	expect(tied?.highestGames.map(({name, week}) => ({name, week}))).toEqual([
		{name: 'Alpha', week: 4}, {name: 'Beta', week: 3}, {name: 'Rookie', week: 1}, {name: 'Rookie', week: 2},
	])
})

it('keeps tied average leaders, ignores missing scores and uses the player position', () => {
	const one = new MatchupPlayer('a', 0, 0)
	const two = makePlayer('b', 0, POSITION.RB)
	const absent = makePlayer('c', 0, POSITION.RB)
	const weeks = [1, 2, 3].map((week) => makeWeek(week, [one], [two, absent]))
	const playerScores = new Map([
		['a', scores([[1, 0], [2, 10], [3, 20]])],
		['b', scores([[1, 10], [2, 10], [3, 10]])],
		['c', scores([[1, 50], [2, 50]])],
	])
	const playerDetails = new Map([
		['a', details('a', 'Alpha', POSITION.RB)],
		['b', details('b', 'Beta', POSITION.RB)],
		['c', details('c', 'Absent', POSITION.RB)],
	])
	const highlights = positionPlayerHighlights(weeks, playerScores, playerDetails)
	expect(highlights.has(POSITION.QB)).toBe(false)
	expect(highlights.get(POSITION.RB)?.topAverages).toEqual([
		{playerId: 'a', name: 'Alpha', average: 10, games: 3},
		{playerId: 'b', name: 'Beta', average: 10, games: 3},
	])
	expect(highlights.get(POSITION.RB)?.highestGames).toHaveLength(2)
})

it('keeps loading until player data is available', () => {
	const league: League = Object.create(League.prototype)
	league.settings = {} as League['settings']
	league.weeks = new Map()
	render(<ChakraProvider theme={theme}>
		<PositionScoringDistributionChart league={league} playerScores={null} playerDetails={null} />
	</ChakraProvider>)
	expect(screen.getByLabelText('Loading position scoring distributions')).toBeInTheDocument()
})

it('shows player highlights in individual view without percentile markers', () => {
	const alpha = makePlayer('a', 10, POSITION.QB)
	const beta = makePlayer('b', 20, POSITION.QB)
	const league: League = Object.create(League.prototype)
	league.settings = {} as League['settings']
	const currentManager = member('Current Manager', ['b'])
	currentManager.teamAvatar = 'https://example.com/team.png'
	league.members = new Map([
		[1, currentManager],
		[2, member('Other Team', [], ['r'])],
	])
	league.weeks = new Map([
		[1, makeWeek(1, [alpha, beta, makePlayer('r', 4, POSITION.RB)])],
		[2, makeWeek(2, [alpha], [beta])],
		[3, makeWeek(3, [alpha], [beta])],
	])
	const playerScores = new Map([
		['a', scores([[1, 10], [2, 10], [3, 10]])],
		['b', scores([[1, 20], [2, 30], [3, 10]])],
		['r', scores([[1, 4]])],
	])
	const playerDetails = new Map([
		['a', details('a', 'Alpha', POSITION.QB)], ['b', details('b', 'Beta', POSITION.QB)],
		['r', details('r', 'Runner', POSITION.RB)],
	])
	const chart = jest.mocked(ResponsiveLine)
	chart.mockClear()
	const getTeamAvatar = jest.spyOn(LeagueMember.prototype, 'getTeamAvatar')
	const {rerender} = render(<ChakraProvider theme={theme}>
		<PositionScoringDistributionChart league={league} playerScores={playerScores} playerDetails={playerDetails} />
	</ChakraProvider>)

	expect(screen.getByRole('radio', {name: 'All positions together'})).toBeChecked()
	expect(screen.getAllByTestId('line-chart')).toHaveLength(1)
	expect(screen.getByText('Estimated common range: 8.17 to 16.83 points')).toBeInTheDocument()
	expect(screen.getByText('All starter scores are the same; no curve is shown.')).toBeInTheDocument()
	expect(screen.queryByText(/^\d+ starts?$/)).not.toBeInTheDocument()
	const combinedQb = screen.getByLabelText('QB starter score range in points')
	expect(within(combinedQb).getByText('Min:')).toHaveTextContent('Min: 10.00')
	expect(within(combinedQb).getByText('Average:')).toHaveTextContent('Average: 12.50')
	expect(within(combinedQb).getByText('Max:')).toHaveTextContent('Max: 20.00')
	expect(combinedQb.compareDocumentPosition(screen.getByTestId('line-chart')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	expect(within(screen.getByLabelText('RB starter score range in points')).getByText('Min:')).toHaveTextContent('Min: 4.00')
	fireEvent.click(screen.getByRole('radio', {name: 'One graph per position'}))
	const qb = screen.getByRole('region', {name: 'QB scoring distribution'})
	const qbRange = within(qb).getByLabelText('QB starter score range in points')
	expect(within(qbRange).getByText('Min:')).toHaveTextContent('Min: 10.00')
	expect(within(qbRange).getByText('Average:')).toHaveTextContent('Average: 12.50')
	expect(within(qbRange).getByText('Max:')).toHaveTextContent('Max: 20.00')
	expect(qbRange.compareDocumentPosition(within(qb).getByTestId('line-chart')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	expect(within(qb).getByText('Estimated common range: 8.17 to 16.83 points').compareDocumentPosition(within(qb).getByTestId('line-chart')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	expect(within(qb).queryByText(/^\d+ starts?$/)).not.toBeInTheDocument()
	expect(within(qb).getAllByText('QB')).toHaveLength(1)
	expect(within(qb).getByRole('heading', {name: 'Best game'})).toBeInTheDocument()
	expect(within(qb).getByRole('heading', {name: 'Best average'})).toBeInTheDocument()
	expect(within(qb).getByText('30.00 points')).toBeInTheDocument()
	expect(within(qb).getByText('Week 2')).toBeInTheDocument()
	expect(within(qb).getByText('20.00 points / game')).toBeInTheDocument()
	expect(within(qb).getByText('3 recorded games')).toBeInTheDocument()
	expect(within(qb).getAllByText('Beta')).toHaveLength(2)
	expect(within(qb).getAllByText('Current Manager')).toHaveLength(2)
	expect(getTeamAvatar).toHaveBeenCalledWith()
	expect(currentManager.getTeamAvatar()).toBe('https://example.com/team.png')
	expect(within(qb).queryByText(/Score benchmarks/)).not.toBeInTheDocument()
	const rb = screen.getByRole('region', {name: 'RB scoring distribution'})
	expect(within(rb).getByText('All starter scores are the same, so there is no curve to show.')).toBeInTheDocument()
	expect(within(rb).queryByText(/Estimated common range:/)).not.toBeInTheDocument()
	expect(within(rb).getByText('Runner')).toBeInTheDocument()
	expect(within(rb).getByText('4.00 points')).toBeInTheDocument()
	expect(within(rb).getByText('Other Team')).toBeInTheDocument()
	expect(league.members.get(2)?.getTeamAvatar()).toBe('https://sleepercdn.com/avatars/thumbs/manager-avatar')
	expect(within(rb).getByText('No players with at least 3 recorded games.')).toBeInTheDocument()
	expect(chart.mock.calls.at(-1)?.[0].layers?.every((layer) => typeof layer === 'string')).toBe(true)

	const nextLeague: League = Object.create(League.prototype)
	nextLeague.settings = league.settings
	nextLeague.weeks = new Map([[1, league.weeks.get(1)!]])
	nextLeague.members = new Map([[1, member('Current Manager', [])]])
	rerender(<ChakraProvider theme={theme}>
		<PositionScoringDistributionChart league={nextLeague} playerScores={playerScores} playerDetails={playerDetails} />
	</ChakraProvider>)
	expect(within(screen.getByRole('region', {name: 'QB scoring distribution'})).getByText('20.00 points')).toBeInTheDocument()
	expect(within(screen.getByRole('region', {name: 'QB scoring distribution'})).getByText('Week 1')).toBeInTheDocument()
	expect(within(screen.getByRole('region', {name: 'QB scoring distribution'})).getByText('Not currently rostered')).toBeInTheDocument()
	expect(within(screen.getByRole('region', {name: 'QB scoring distribution'})).getByText('No players with at least 3 recorded games.')).toBeInTheDocument()

	const incompleteLeague: League = Object.create(League.prototype)
	incompleteLeague.settings = nextLeague.settings
	incompleteLeague.weeks = nextLeague.weeks
	const incompleteMember = member('Unknown', [])
	Object.defineProperty(incompleteMember.roster, 'players', {value: null})
	incompleteLeague.members = new Map([[1, incompleteMember]])
	rerender(<ChakraProvider theme={theme}>
		<PositionScoringDistributionChart league={incompleteLeague} playerScores={playerScores} playerDetails={playerDetails} />
	</ChakraProvider>)
	expect(within(screen.getByRole('region', {name: 'QB scoring distribution'})).getByText('Unavailable')).toBeInTheDocument()
	getTeamAvatar.mockRestore()
})

it('keeps observed outliers within the individual graph score range', () => {
	const league: League = Object.create(League.prototype)
	league.settings = {} as League['settings']
	league.weeks = new Map([[1, makeWeek(1, [
		...Array.from({length: 20}, (_, index) => makePlayer(`qb-${index}`, 0, POSITION.QB)),
		makePlayer('qb-outlier', 100, POSITION.QB),
	])]])
	const chart = jest.mocked(ResponsiveLine)
	chart.mockClear()
	render(<ChakraProvider theme={theme}>
		<PositionScoringDistributionChart league={league} playerScores={new Map()} playerDetails={new Map()} />
	</ChakraProvider>)
	fireEvent.click(screen.getByRole('radio', {name: 'One graph per position'}))
	expect(chart.mock.calls.at(-1)?.[0].xScale).toMatchObject({type: 'linear', max: 100})
	expect(screen.getByText('Min:')).toHaveTextContent('Min: 0.00')
	expect(screen.getByText('Average:')).toHaveTextContent('Average: 4.76')
	expect(screen.getByText('Max:')).toHaveTextContent('Max: 100.00')
})

it('uses independent score ranges for individual position charts', () => {
	const league: League = Object.create(League.prototype)
	league.settings = {} as League['settings']
	league.weeks = new Map([[1, makeWeek(1, [
		makePlayer('qb-1', 10, POSITION.QB), makePlayer('qb-2', 20, POSITION.QB),
		makePlayer('rb-1', 1, POSITION.RB), makePlayer('rb-2', 3, POSITION.RB),
	])]])
	const chart = jest.mocked(ResponsiveLine)
	chart.mockClear()
	render(<ChakraProvider theme={theme}>
		<PositionScoringDistributionChart league={league} playerScores={new Map()} playerDetails={new Map()} />
	</ChakraProvider>)
	fireEvent.click(screen.getByRole('radio', {name: 'One graph per position'}))
	const individualCharts = chart.mock.calls.map(([props]) => props).filter((props) => props.data.length === 1)
	expect(individualCharts.find((props) => props.data[0].id === 'QB')?.xScale).toMatchObject({type: 'linear', min: 0, max: 30})
	expect(individualCharts.find((props) => props.data[0].id === 'RB')?.xScale).toMatchObject({type: 'linear', min: -1, max: 5})
})
