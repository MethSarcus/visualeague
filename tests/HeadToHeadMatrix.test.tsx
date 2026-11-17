import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import HeadToHeadMatrix from '../components/groups/HeadToHeadMatrix'
import {calculateLeagueHistory, HistorySeason} from '../lib/leagueHistory'
import theme from '../theme'

const season: HistorySeason = {
	leagueId: '1', season: '2024',
	users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}, {user_id: 'c', display_name: 'Gamma'}, {user_id: 'd', display_name: 'Delta'}],
	rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}, {roster_id: 3, owner_id: 'c'}, {roster_id: 4, owner_id: 'd'}],
	weeks: [
		{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 100}]},
		{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 110}, {roster_id: 2, matchup_id: 1, points: 110}]},
		{week: 3, matchups: [{roster_id: 1, matchup_id: 1, points: 130}, {roster_id: 3, matchup_id: 1, points: 100}]},
	],
}

it('shows directional records including non-nemeses and opens their neutral matchup details', async () => {
	render(<ChakraProvider theme={theme}><HeadToHeadMatrix teams={calculateLeagueHistory([season]).teams} /></ChakraProvider>)
	const matrix = screen.getByRole('table', {name: 'All-time head-to-head records'})
	expect(within(matrix).getByRole('button', {name: 'Alpha vs Beta: 0 wins, 1 losses, 1 ties'})).toHaveTextContent('0–1–1')
	expect(within(matrix).getByRole('button', {name: 'Beta vs Alpha: 1 wins, 0 losses, 1 ties'})).toHaveTextContent('1–0–1')
	fireEvent.click(within(matrix).getByRole('button', {name: 'Alpha vs Gamma: 1 wins, 0 losses, 0 ties'}))
	const dialog = await screen.findByRole('dialog')
	expect(within(dialog).getByText('Head-to-head matchup')).toBeInTheDocument()
	expect(within(dialog).getByRole('img', {name: 'Alpha: 130.00 points, 130.00 per game; Gamma: 100.00 points, 100.00 per game'})).toBeInTheDocument()
	expect(within(dialog).getByText('2024 · Week 3')).toBeInTheDocument()
	expect(within(dialog).queryByText(/nemesis/i)).not.toBeInTheDocument()
	fireEvent.click(within(dialog).getByRole('button', {name: 'Close'}))
})

it('opens an empty matchup without fabricating a record or averages', async () => {
	render(<ChakraProvider theme={theme}><HeadToHeadMatrix teams={calculateLeagueHistory([season]).teams} /></ChakraProvider>)
	fireEvent.click(screen.getByRole('button', {name: 'Alpha vs Delta: no games'}))
	const dialog = await screen.findByRole('dialog')
	expect(within(dialog).getByText('No paired head-to-head games between these teams yet.')).toBeInTheDocument()
	expect(within(dialog).queryByText(/NaN|Infinity/)).not.toBeInTheDocument()
})

it('limits both axes to the filtered teams', () => {
	const history = calculateLeagueHistory([season], new Set(['a', 'b']))
	render(<ChakraProvider theme={theme}><HeadToHeadMatrix teams={history.teams} /></ChakraProvider>)
	const matrix = screen.getByRole('table', {name: 'All-time head-to-head records'})
	expect(within(matrix).getByRole('button', {name: 'Alpha vs Beta: 0 wins, 1 losses, 1 ties'})).toBeInTheDocument()
	expect(within(matrix).queryByText('Gamma')).not.toBeInTheDocument()
})

it('omits ties from records and details when there are no league ties', async () => {
	const withoutTies = {...season, weeks: [season.weeks[0]]}
	render(<ChakraProvider theme={theme}><HeadToHeadMatrix teams={calculateLeagueHistory([withoutTies]).teams} /></ChakraProvider>)
	const cell = screen.getByRole('button', {name: 'Alpha vs Beta: 0 wins, 1 losses'})
	expect(cell).toHaveTextContent('0–1')
	fireEvent.click(cell)
	const dialog = await screen.findByRole('dialog')
	expect(within(dialog).queryByText(/ROW TEAM/)).not.toBeInTheDocument()
	expect(within(dialog).getByLabelText('Alpha: 0 wins, 1 losses against Beta')).toHaveTextContent('0–1')
	expect(within(dialog).getByRole('img', {name: 'Alpha: 0 wins; Beta: 1 wins'})).toBeInTheDocument()
	expect(within(dialog).queryByText('0 ties')).not.toBeInTheDocument()
})
