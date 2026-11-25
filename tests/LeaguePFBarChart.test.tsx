import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {useState} from 'react'
import {ChakraProvider} from '@chakra-ui/react'
import {ResponsiveBar} from '@nivo/bar'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import LeagueStackedPfBarChart, {averageScorePerGame, formatScoresForBarChart} from '../components/charts/bar/LeaguePFBarChart'
import {POSITION} from '../utility/rosterFunctions'
import theme from '../theme'

jest.mock('@nivo/bar', () => ({ResponsiveBar: jest.fn(() => <div data-testid='bar-chart' />)}))

function ChartHarness({league}: {league: League}) {
	const [hiddenPositions, setHiddenPositions] = useState<POSITION[]>([])
	const togglePosition = (position: POSITION) => setHiddenPositions((hidden) =>
		hidden.includes(position) ? hidden.filter((item) => item !== position) : [...hidden, position])
	return <LeagueStackedPfBarChart league={league} hiddenPositions={hiddenPositions} hiddenRosterIds={[]}
		onTogglePosition={togglePosition} />
}

function member(id: number, name: string, pf: number, scores: [POSITION, number][], starts: [POSITION, number][] = []): LeagueMember {
	const result: LeagueMember = Object.create(LeagueMember.prototype)
	result.roster = {roster_id: id} as LeagueMember['roster']
	result.name = name
	result.stats = {pf, position_scores: new Map(scores), position_starts: new Map(starts)} as LeagueMember['stats']
	return result
}

function leagueWithScores(): League {
	const league: League = Object.create(League.prototype)
	league.settings = {roster_positions: ['QB']} as League['settings']
	league.members = new Map([
		[1, member(1, 'Same name', 90, [[POSITION.QB, 90]], [[POSITION.QB, 3]])],
		[2, member(2, 'Same name', 100, [[POSITION.QB, 80], [POSITION.RB, 30]], [[POSITION.QB, 10], [POSITION.RB, 1]])],
	])
	return league
}

it('sorts teams by points and keeps distinct roster IDs and flex-position scores', () => {
	const chart = formatScoresForBarChart(leagueWithScores())
	expect(chart.positions).toEqual([POSITION.QB, POSITION.RB])
	expect(chart.data).toEqual([
		{rosterId: '2', member: 'Same name', QB: 80, RB: 30},
		{rosterId: '1', member: 'Same name', QB: 90, RB: 0},
	])
	expect(formatScoresForBarChart(leagueWithScores(), 'ppg').data).toEqual([
		{rosterId: '2', member: 'Same name', QB: 8, RB: 30},
		{rosterId: '1', member: 'Same name', QB: 30, RB: 0},
	])
})

it('defaults to PPG and switches both the graph and table to total points', () => {
	render(<ChakraProvider theme={theme}><ChartHarness league={leagueWithScores()} /></ChakraProvider>)
	const card = screen.getByRole('heading', {name: 'Team points by position'}).parentElement
	expect(card).toHaveStyle({width: 'var(--chakra-sizes-full)'})
	let barProps = jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0]
	expect(barProps?.data).toEqual([
		{rosterId: '1', member: 'Same name', QB: 30, RB: 0},
		{rosterId: '2', member: 'Same name', QB: 8, RB: 30},
	])
	expect(barProps?.data.map((row) => row.rosterId)).toEqual(['1', '2'])
	fireEvent.click(screen.getByText('View positional table'))
	let table = screen.getByRole('table', {name: 'Team average points per game by position'})
	const headers = within(table).getAllByRole('columnheader')
	expect(headers.map((header) => header.textContent)).toEqual(['Team', 'QB PPG', 'RB PPG'])
	const rows = within(table).getAllByRole('row')
	expect(rows[1]).toHaveTextContent('Same name8.0030.00')
	expect(rows[2]).toHaveTextContent('Same name30.000.00')

	fireEvent.click(screen.getByRole('button', {name: 'Hide RB position'}))
	barProps = jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0]
	expect(barProps?.data.map((row) => row.rosterId)).toEqual(['2', '1'])
	expect(barProps?.keys).toEqual(['QB'])
	expect(screen.getByRole('button', {name: 'Show RB position'})).toHaveAttribute('aria-pressed', 'false')
	table = screen.getByRole('table', {name: 'Team average points per game by position'})
	expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Same name8.0030.00')
	fireEvent.click(screen.getByRole('button', {name: 'Show RB position'}))
	barProps = jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0]
	expect(barProps?.data.map((row) => row.rosterId)).toEqual(['1', '2'])
	expect(barProps?.keys).toEqual(['QB', 'RB'])

	fireEvent.click(screen.getByRole('button', {name: 'Total points'}))
	barProps = jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0]
	expect(barProps?.data).toEqual([
		{rosterId: '1', member: 'Same name', QB: 90, RB: 0},
		{rosterId: '2', member: 'Same name', QB: 80, RB: 30},
	])
	expect(barProps?.data.map((row) => row.rosterId)).toEqual(['1', '2'])
	table = screen.getByRole('table', {name: 'Team total points by position'})
	expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Team', 'QB points', 'RB points'])
	const totalRows = within(table).getAllByRole('row')
	expect(totalRows[1]).toHaveTextContent('Same name80.0030.00')
	expect(totalRows[2]).toHaveTextContent('Same name90.000.00')
})

it('fills its container while loading', () => {
	render(<ChakraProvider theme={theme}><LeagueStackedPfBarChart
		hiddenPositions={[]}
		hiddenRosterIds={[]}
		onTogglePosition={jest.fn()}
	/></ChakraProvider>)
	expect(screen.getByLabelText('Loading points by position')).toHaveStyle({width: 'var(--chakra-sizes-full)'})
})

it('averages positional scores by the number of starts', () => {
	const memberWithScores = member(1, 'Average', 90, [[POSITION.QB, 90]], [[POSITION.QB, 3]])
	expect(averageScorePerGame(memberWithScores, POSITION.QB)).toBe(30)
	expect(averageScorePerGame(memberWithScores, POSITION.RB)).toBe(0)
})

it('omits hidden league members from the graph and table', () => {
	render(<ChakraProvider theme={theme}><LeagueStackedPfBarChart
		league={leagueWithScores()}
		hiddenPositions={[]}
		hiddenRosterIds={[2]}
		onTogglePosition={jest.fn()}
	/></ChakraProvider>)
	const barProps = jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0]
	expect(barProps?.data.map((row) => row.rosterId)).toEqual(['1'])
	fireEvent.click(screen.getByText('View positional table'))
	const rows = within(screen.getByRole('table', {name: 'Team average points per game by position'})).getAllByRole('row')
	expect(rows).toHaveLength(2)
})
