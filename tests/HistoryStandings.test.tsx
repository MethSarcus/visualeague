import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import HistoryStandings from '../components/groups/HistoryStandings'
import {calculateLeagueHistory, HistorySeason} from '../lib/leagueHistory'
import theme from '../theme'

const seasons: HistorySeason[] = [
	{leagueId: '2', season: '2024', users: [{user_id: 'a', display_name: 'Alice', avatar: 'alice', metadata: {team_name: 'Alpha'}}, {user_id: 'b', display_name: 'Bob', metadata: {team_name: 'Beta'}}, {user_id: 'c', display_name: 'Chris', metadata: {team_name: 'Charlie'}}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}, {roster_id: 3, owner_id: 'c'}],
		weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 100}, {roster_id: 2, matchup_id: 1, points: 90}, {roster_id: 3, matchup_id: null, points: 150}]}]},
	{leagueId: '1', season: '2023', users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}],
		weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 60}, {roster_id: 2, matchup_id: 1, points: 80}]}]},
]

describe('HistoryStandings', () => {
	it('sorts numeric averages and switches table and chart to the selected season', () => {
		render(<ChakraProvider theme={theme}><HistoryStandings teams={calculateLeagueHistory(seasons).teams} /></ChakraProvider>)
		const table = screen.getByRole('table')
		const alpha = within(table).getByText('Alpha').closest('tr')!
		expect(within(alpha).getByText('80.00')).toBeInTheDocument()
		expect(within(alpha).getByText('85.00')).toBeInTheDocument()
		const charlie = within(table).getByText('Charlie').closest('tr')!
		expect(within(charlie).getAllByText('—')).toHaveLength(3)
		fireEvent.click(screen.getByRole('button', {name: /PF \/ game/}))
		expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Beta')
		expect(within(table).getAllByRole('row')[3]).toHaveTextContent('Charlie')
		fireEvent.click(screen.getByRole('button', {name: /PF \/ game/}))
		expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Alpha')
		expect(within(table).getAllByRole('row')[3]).toHaveTextContent('Charlie')
		fireEvent.change(screen.getByLabelText('SEASON'), {target: {value: '1'}})
		expect(within(table).queryByText('Charlie')).not.toBeInTheDocument()
		expect(within(table).getByText('Alpha').closest('tr')).toHaveTextContent('60.00')
		const chart = screen.getByRole('img', {name: /connected dot chart/i})
		expect(within(chart).getByText('Alpha').previousElementSibling).toHaveAttribute('aria-hidden', 'true')
		const pfLabel = within(chart).getByText('PF 60.00')
		const paLabel = within(chart).getByText('PA 80.00')
		expect(pfLabel).toBeInTheDocument()
		expect(paLabel).toBeInTheDocument()
		const plot = pfLabel.parentElement!
		expect(paLabel.parentElement).toBe(plot)
		const markers = plot.children
		expect(getComputedStyle(pfLabel).left).toContain('- 10px')
		expect(getComputedStyle(paLabel).left).toContain('+ 10px')
		expect(getComputedStyle(pfLabel).top).toBe('50%')
		expect(getComputedStyle(paLabel).top).toBe('50%')
		expect(getComputedStyle(pfLabel).transform).toBe('translate(-100%, -50%)')
		expect(getComputedStyle(paLabel).transform).toBe('translateY(-50%)')
		expect(parseFloat(getComputedStyle(markers[5]).left.match(/[\d.]+/)![0]))
			.toBeLessThan(parseFloat(getComputedStyle(markers[4]).left.match(/[\d.]+/)![0]))
		expect(getComputedStyle(pfLabel).color).toBe(getComputedStyle(markers[5]).backgroundColor)
		expect(getComputedStyle(paLabel).color).toBe(getComputedStyle(markers[4]).backgroundColor)
		expect(screen.getByText('PF / game (scored)')).toBeInTheDocument()
		expect(screen.getByText('PA / game (allowed)')).toBeInTheDocument()
		expect(screen.queryByText('POINTS PER GAME')).not.toBeInTheDocument()
		fireEvent.change(screen.getByLabelText('SEASON'), {target: {value: 'all'}})
		expect(within(table).getByText('Charlie')).toBeInTheDocument()
	})

	it('falls back to all seasons when the selected season is absent after filtering teams', () => {
		const teams = calculateLeagueHistory(seasons).teams
		const {rerender} = render(<ChakraProvider theme={theme}><HistoryStandings teams={teams} /></ChakraProvider>)
		fireEvent.change(screen.getByLabelText('SEASON'), {target: {value: '1'}})
		rerender(<ChakraProvider theme={theme}><HistoryStandings teams={teams.filter((team) => team.name === 'Charlie')} /></ChakraProvider>)
		expect(screen.getByLabelText('SEASON')).toHaveValue('all')
		expect(within(screen.getByRole('table')).getByText('Charlie')).toBeInTheDocument()
	})

	it('puts values outside their respective dots for both directions and equal scores', () => {
		const season: HistorySeason = {
			leagueId: '1', season: '2024',
			users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'},
				{user_id: 'c', display_name: 'Gamma'}, {user_id: 'd', display_name: 'Delta'}],
			rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'},
				{roster_id: 3, owner_id: 'c'}, {roster_id: 4, owner_id: 'd'}],
			weeks: [{week: 1, matchups: [
				{roster_id: 1, matchup_id: 1, points: 100}, {roster_id: 2, matchup_id: 1, points: 90},
				{roster_id: 3, matchup_id: 2, points: 95}, {roster_id: 4, matchup_id: 2, points: 95},
			]}],
		}
		render(<ChakraProvider theme={theme}><HistoryStandings teams={calculateLeagueHistory([season]).teams} /></ChakraProvider>)
		const chart = screen.getByRole('img', {name: /connected dot chart/i})
		const pf = within(chart).getByText('PF 100.00')
		const pa = within(chart).getByText('PA 90.00')
		expect(getComputedStyle(pf).transform).toBe('translateY(-50%)')
		expect(getComputedStyle(pa).transform).toBe('translate(-100%, -50%)')
		const tied = within(chart).getAllByText('PF 95.00')[0].parentElement!
		expect(getComputedStyle(within(tied).getByText('PF 95.00')).left).toContain('- 14px')
		expect(getComputedStyle(within(tied).getByText('PA 95.00')).left).toContain('+ 14px')
		expect(getComputedStyle(tied.children[4]).left).toContain('+ 4px')
		expect(getComputedStyle(tied.children[5]).left).toContain('- 4px')
	})

	it('sorts wins divided by losses and handles undefeated and undecided teams', () => {
		render(<ChakraProvider theme={theme}><HistoryStandings teams={calculateLeagueHistory(seasons).teams} /></ChakraProvider>)
		const table = screen.getByRole('table')
		const row = (name: string) => within(table).getByText(name).closest('tr')!
		expect(within(row('Alpha')).getByText('1.00')).toBeInTheDocument()
		expect(within(row('Charlie')).getAllByText('—')).toHaveLength(3)
		fireEvent.change(screen.getByLabelText('SEASON'), {target: {value: '2'}})
		expect(within(row('Alpha')).getByText('∞')).toBeInTheDocument()
		expect(within(row('Beta')).getByText('0.00')).toBeInTheDocument()
		const button = screen.getByRole('button', {name: /W\/L ratio/})
		fireEvent.click(button)
		expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Alpha')
		expect(within(table).getAllByRole('row')[3]).toHaveTextContent('Charlie')
		fireEvent.click(button)
		expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Beta')
		expect(within(table).getAllByRole('row')[2]).toHaveTextContent('Alpha')
		expect(within(table).getAllByRole('row')[3]).toHaveTextContent('Charlie')
		fireEvent.change(screen.getByLabelText('SEASON'), {target: {value: '1'}})
		expect(within(row('Beta')).getByText('∞')).toBeInTheDocument()
	})
})
