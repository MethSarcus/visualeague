import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import {ResponsiveBar} from '@nivo/bar'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import LeagueStackedPfBarChart, {formatScoresForBarChart} from '../components/charts/bar/LeaguePFBarChart'
import {POSITION} from '../utility/rosterFunctions'
import theme from '../theme'

jest.mock('@nivo/bar', () => ({ResponsiveBar: jest.fn(() => <div data-testid='bar-chart' />)}))

function member(id: number, name: string, pf: number, scores: [POSITION, number][]): LeagueMember {
	const result: LeagueMember = Object.create(LeagueMember.prototype)
	result.roster = {roster_id: id} as LeagueMember['roster']
	result.name = name
	result.stats = {pf, position_scores: new Map(scores)} as LeagueMember['stats']
	return result
}

function leagueWithScores(): League {
	const league: League = Object.create(League.prototype)
	league.settings = {roster_positions: ['QB']} as League['settings']
	league.members = new Map([
		[1, member(1, 'Same name', 90, [[POSITION.QB, 90]])],
		[2, member(2, 'Same name', 100, [[POSITION.QB, 80], [POSITION.RB, 20]])],
	])
	return league
}

it('sorts teams by points and keeps distinct roster IDs and flex-position scores', () => {
	const chart = formatScoresForBarChart(leagueWithScores())
	expect(chart.positions).toEqual([POSITION.QB, POSITION.RB])
	expect(chart.data).toEqual([
		{rosterId: '2', member: 'Same name', QB: 80, RB: 20},
		{rosterId: '1', member: 'Same name', QB: 90, RB: 0},
	])
})

it('provides positional scores in an accessible table', () => {
	render(<ChakraProvider theme={theme}><LeagueStackedPfBarChart league={leagueWithScores()} /></ChakraProvider>)
	const barProps = jest.mocked(ResponsiveBar).mock.calls[0][0]
	expect(barProps.data.map((row) => row.rosterId)).toEqual(['1', '2'])
	fireEvent.click(screen.getByText('View positional scores'))
	const rows = within(screen.getByRole('table', {name: 'Team points by position'})).getAllByRole('row')
	expect(rows[1]).toHaveTextContent('Same name80.0020.00')
	expect(rows[2]).toHaveTextContent('Same name90.000.00')
})
