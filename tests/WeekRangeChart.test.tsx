import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import League from '../classes/custom/League'
import {Week} from '../classes/custom/Week'
import WeekRangeChart, {weeklyScoringRanges} from '../components/charts/line/WeekRangeChart'
import theme from '../theme'

jest.mock('@nivo/line', () => ({ResponsiveLine: () => <div data-testid='line-chart' />}))

function makeWeek(weekNumber: number, scores: number[]): Week {
	const week: Week = Object.create(Week.prototype)
	week.weekNumber = weekNumber
	week.getAllTeams = jest.fn().mockReturnValue(scores.map((pf) => ({pf})))
	return week
}

it('calculates and orders score ranges without inventing scores for empty weeks', () => {
	expect(weeklyScoringRanges([makeWeek(3, [0, -10, 40]), makeWeek(2, []), makeWeek(1, [80, 100, 120])]))
		.toEqual([{week: 1, high: 120, average: 100, low: 80}, {week: 3, high: 40, average: 10, low: -10}])
})

it('provides a readable table of weekly high, average and low scores', () => {
	const league: League = Object.create(League.prototype)
	league.settings = {} as League['settings']
	league.weeks = new Map([[2, makeWeek(2, [100, 80])], [1, makeWeek(1, [70, 90])]])
	render(<ChakraProvider theme={theme}><WeekRangeChart league={league} /></ChakraProvider>)
	expect(screen.getByRole('heading', {name: 'Weekly scoring range'})).toBeInTheDocument()
	fireEvent.click(screen.getByText('View weekly scores'))
	const table = screen.getByRole('table', {name: 'Weekly scoring ranges'})
	expect(within(table).getAllByRole('row')[1]).toHaveTextContent('190.0080.0070.00')
	expect(within(table).getAllByRole('row')[2]).toHaveTextContent('2100.0090.0080.00')
})
