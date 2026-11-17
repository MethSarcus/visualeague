import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import DivisionHistory from '../components/groups/DivisionHistory'
import {DivisionHistory as Data} from '../lib/divisionHistory'
import theme from '../theme'

const data: Data = {
	seasonsWithoutDivisions: 1,
	seasons: [{leagueId: '1', season: '2024', missingDivisionRosters: 1, excludedGames: 1, championDivisionId: 2, divisions: [
		{id: 1, name: 'North', rosters: 2, games: 5, wins: 3, losses: 1, ties: 1, pointsFor: 500, pointsAgainst: 450},
		{id: 2, name: 'South', rosters: 2, games: 2, wins: 0, losses: 1, ties: 1, pointsFor: 180, pointsAgainst: 190},
	], matchups: [{
		first: {id: 1, name: 'North', rosters: 0, games: 2, wins: 1, losses: 0, ties: 1, pointsFor: 190, pointsAgainst: 180},
		second: {id: 2, name: 'South', rosters: 0, games: 2, wins: 0, losses: 1, ties: 1, pointsFor: 180, pointsAgainst: 190},
	}]}],
}

it('compares interdivision records and scoring in both tabs', () => {
	render(<ChakraProvider theme={theme}><DivisionHistory history={data} /></ChakraProvider>)
	expect(screen.getByRole('tab', {name: 'All time'})).toHaveAttribute('aria-selected', 'true')
	const wins = screen.getByRole('img', {name: 'North (Division 1): 75.0% win rate; South (Division 2): 25.0% win rate'})
	const points = screen.getByRole('img', {name: 'North (Division 1): 95.00 points scored per team-game; South (Division 2): 90.00 points scored per team-game'})
	expect(parseFloat(getComputedStyle(wins.children[0]).width)).toBeCloseTo(75 / 100 * 100)
	expect(parseFloat(getComputedStyle(points.children[0]).width)).toBeCloseTo(95 / 185 * 100)
	expect(screen.getByText('1-0-1 · 2 games')).toBeInTheDocument()
	expect(screen.getByText('POINTS SCORED / GAME')).toBeInTheDocument()
	expect(screen.getByText('95.00')).toBeInTheDocument()
	expect(screen.getByText('90.00')).toBeInTheDocument()
	expect(screen.queryByText(/allowed \/ game/)).not.toBeInTheDocument()
	expect(screen.getByText(/1 season roster assignment\(s\) missing/)).toBeInTheDocument()
	expect(screen.getByText(/1 season\(s\) without configured divisions/)).toBeInTheDocument()
	fireEvent.click(screen.getByRole('tab', {name: 'By season'}))
	expect(screen.getByText('2024')).toBeInTheDocument()
	expect(screen.getByText('League champion came from this division.')).toBeInTheDocument()
	expect(screen.getByText('1–0–1')).toBeInTheDocument()
	expect(screen.getByText('0–1–1')).toBeInTheDocument()
	expect(screen.getByRole('img', {name: 'South · D2: league champion'})).toBeInTheDocument()
	const graphs = screen.getByText('View graphs')
	expect(graphs.parentElement).not.toHaveAttribute('open')
	fireEvent.click(graphs)
	expect(graphs.parentElement).toHaveAttribute('open')
	expect(within(graphs.parentElement!).getByRole('img', {name: 'North (Division 1): 75.0% win rate; South (Division 2): 25.0% win rate'})).toBeInTheDocument()
	expect(within(graphs.parentElement!).getByRole('img', {name: 'North (Division 1): 95.00 points scored per team-game; South (Division 2): 90.00 points scored per team-game'})).toBeInTheDocument()
	expect(within(graphs.parentElement!).getByText('POINTS SCORED / GAME')).toBeInTheDocument()
	expect(screen.getByText(/1 roster\(s\) missing/)).toBeInTheDocument()
})

it('explains when divisions or games are unavailable', () => {
	const {rerender} = render(<ChakraProvider theme={theme}><DivisionHistory history={{seasons: [], seasonsWithoutDivisions: 2}} /></ChakraProvider>)
	expect(screen.getByText('No linked seasons have divisions configured.')).toBeInTheDocument()
	const empty = {...data, seasons: [{...data.seasons[0], divisions: data.seasons[0].divisions.map((division) => ({...division, games: 0})), matchups: []}]}
	rerender(<ChakraProvider theme={theme}><DivisionHistory history={empty} /></ChakraProvider>)
	expect(screen.getByText('No interdivision games are available for this comparison.')).toBeInTheDocument()
})

it('distinguishes divisions with the same name and handles zero and negative scoring', () => {
	const season = data.seasons[0]
	const duplicateNames: Data = {...data, seasons: [{...season,
		divisions: season.divisions.map((division) => ({...division, name: 'North'})),
		matchups: [{first: {...season.matchups[0].first, pointsFor: -10}, second: {...season.matchups[0].second, pointsFor: 0}}]}]}
	render(<ChakraProvider theme={theme}><DivisionHistory history={duplicateNames} /></ChakraProvider>)
	const points = screen.getByRole('img', {name: /North \(Division 1\): -5.00 points scored.*North \(Division 2\): 0.00 points scored/})
	expect(points.children).toHaveLength(0)
	expect(screen.getByText(/Relative shares unavailable/)).toBeInTheDocument()
})

it('compares each pair of divisions using overall stats, and reports missing games', () => {
	const season = data.seasons[0]
	const third = {...season.divisions[1], id: 3, name: 'West', games: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0}
	render(<ChakraProvider theme={theme}><DivisionHistory history={{...data, seasons: [{...season, divisions: [...season.divisions, third]}]}} /></ChakraProvider>)
	expect(screen.getAllByText('VS')).toHaveLength(1)
	expect(screen.getByRole('img', {name: 'North (Division 1): 75.0% win rate; South (Division 2): 25.0% win rate'})).toBeInTheDocument()
})

it('omits tie counts from records when the league has no ties', () => {
	render(<ChakraProvider theme={theme}><DivisionHistory history={data} showTies={false} /></ChakraProvider>)
	expect(screen.getByText('1-0 · 2 games')).toBeInTheDocument()
	expect(screen.queryByText('1-0-1 · 2 games')).not.toBeInTheDocument()
	fireEvent.click(screen.getByRole('tab', {name: 'By season'}))
	expect(screen.getByText('1–0')).toBeInTheDocument()
	expect(screen.getByText('0–1')).toBeInTheDocument()
})

it('labels each season comparison directly and preserves coverage without nesting season panels', () => {
	const season = data.seasons[0]
	const third = {...season.divisions[1], id: 3, name: 'West'}
	const seasons = [
		{...season, divisions: [...season.divisions, third]},
		{...season, leagueId: '2', season: '2025', divisions: season.divisions.map((division) => ({...division, games: 0})), matchups: []},
	]
	render(<ChakraProvider theme={theme}><DivisionHistory history={{...data, seasons}} /></ChakraProvider>)
	fireEvent.click(screen.getByRole('tab', {name: 'By season'}))
	const panel = screen.getByRole('tabpanel', {name: 'By season'})
	expect(within(panel).getByText('2024')).toBeInTheDocument()
	expect(within(panel).getByText('2025')).toBeInTheDocument()
	expect(within(panel).getByText('No interdivision games are available for this comparison.')).toBeInTheDocument()
	expect(within(panel).getAllByText(/1 roster\(s\) missing/)).toHaveLength(2)
	expect(within(panel).getAllByText('View graphs')).toHaveLength(1)
})

it('marks each metric independently', () => {
	const season = data.seasons[0]
	const first = {...season.divisions[0], wins: 1, losses: 4, ties: 0, pointsFor: 500}
	const second = {...season.divisions[1], wins: 2, losses: 0, ties: 0, pointsFor: 180}
	const matchups = [{first: {...season.matchups[0].first, games: 5, wins: 1, losses: 4, ties: 0, pointsFor: 500},
		second: {...season.matchups[0].second, games: 5, wins: 2, losses: 3, ties: 0, pointsFor: 180}}]
	render(<ChakraProvider theme={theme}><DivisionHistory history={{...data, seasons: [{...season, divisions: [first, second], matchups}]}} /></ChakraProvider>)
	fireEvent.click(screen.getByRole('tab', {name: 'By season'}))
	const panel = screen.getByRole('tabpanel', {name: 'By season'})
	const labels = within(panel).getAllByText(/(higher|lower) than the other division/)
	expect(labels.map((label) => label.textContent?.trim())).toEqual(['lower than the other division', 'higher than the other division', 'higher than the other division', 'lower than the other division'])
	expect(panel).not.toHaveTextContent('↑')
	expect(panel).not.toHaveTextContent('↓')
	expect(within(panel).getByRole('img', {name: 'South · D2: league champion'})).toBeInTheDocument()
})

it('leaves tied and unavailable metrics neutral', () => {
	const season = data.seasons[0]
	const first = {...season.divisions[0], wins: 3, losses: 2, ties: 0, pointsFor: 500}
	const second = {...season.divisions[1], games: 5, wins: 3, losses: 2, ties: 0, pointsFor: 500}
	const matchups = [{first: {...season.matchups[0].first, games: 5, wins: 3, losses: 2, ties: 0, pointsFor: 500},
		second: {...season.matchups[0].second, games: 5, wins: 3, losses: 2, ties: 0, pointsFor: 500}}]
	const {rerender} = render(<ChakraProvider theme={theme}><DivisionHistory history={{...data, seasons: [{...season, divisions: [first, second], matchups}]}} /></ChakraProvider>)
	fireEvent.click(screen.getByRole('tab', {name: 'By season'}))
	let panel = screen.getByRole('tabpanel', {name: 'By season'})
	expect(within(panel).queryByText(/(higher|lower) than the other division/)).not.toBeInTheDocument()
	rerender(<ChakraProvider theme={theme}><DivisionHistory history={{...data, seasons: [{...season, divisions: [first, {...second, games: 0}], matchups: [{first: matchups[0].first, second: {...matchups[0].second, games: 0}}]}]}} /></ChakraProvider>)
	panel = screen.getByRole('tabpanel', {name: 'By season'})
	expect(within(panel).queryByText(/(higher|lower) than the other division/)).not.toBeInTheDocument()
	expect(within(panel).getAllByText('No games')).toHaveLength(2)
	expect(within(panel).getByText('—')).toBeInTheDocument()
})
