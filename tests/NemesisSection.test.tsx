import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import NemesisSection from '../components/groups/NemesisSection'
import {calculateLeagueHistory, HistoryRival, HistorySeason} from '../lib/leagueHistory'
import theme from '../theme'

it('switches rival cards and their matchup history between losses and opponent points', async () => {
	const season: HistorySeason = {
		leagueId: '1', season: '2024',
		users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}, {user_id: 'c', display_name: 'Gamma'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}, {roster_id: 3, owner_id: 'c'}],
		weeks: [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 100}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 100}]},
			{week: 3, matchups: [{roster_id: 1, matchup_id: 1, points: 200}, {roster_id: 3, matchup_id: 1, points: 250}]},
		],
	}
	const alpha = calculateLeagueHistory([season]).teams.find((team) => team.id === 'a')!
	render(<ChakraProvider theme={theme}><NemesisSection teams={[alpha]} /></ChakraProvider>)
	expect(screen.getByText('Beta')).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: /view rivalry details between Alpha and Beta/i}))
	expect(await screen.findByRole('img', {name: /Beta: 200.00 points, 100.00 per game/})).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Close'}))
	fireEvent.click(screen.getByRole('radio', {name: 'Points differential'}))
	expect(screen.getByText('Gamma')).toBeInTheDocument()
	expect(screen.queryByText('Beta')).not.toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: /view rivalry details between Alpha and Gamma/i}))
	expect(await screen.findByRole('img', {name: /Gamma: 250.00 points, 250.00 per game/})).toBeInTheDocument()
	expect(screen.getByText('2024 · Week 3')).toBeInTheDocument()
	expect(screen.queryByText('2024 · Week 1')).not.toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Close'}))
	expect(within(screen.getByRole('radiogroup', {name: 'Choose nemesis metric'})).getByRole('radio', {name: 'Points differential'})).toBeChecked()
})

it('combines mutual nemeses into one card and retains other tied rivals', async () => {
	const season: HistorySeason = {
		leagueId: '1', season: '2024',
		users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}, {user_id: 'c', display_name: 'Gamma'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}, {roster_id: 3, owner_id: 'c'}],
		weeks: [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 70}, {roster_id: 2, matchup_id: 1, points: 80}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: 1, points: 50}, {roster_id: 2, matchup_id: 1, points: 40}]},
			{week: 3, matchups: [{roster_id: 1, matchup_id: 1, points: 80}, {roster_id: 3, matchup_id: 1, points: 120}]},
		],
	}
	render(<ChakraProvider theme={theme}><NemesisSection teams={calculateLeagueHistory([season]).teams} /></ChakraProvider>)
	const carousel = screen.getByRole('region', {name: 'Nemesis cards'})
	expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
	expect(carousel.querySelectorAll('[data-carousel-card]')).toHaveLength(3)
	const cardFaces = Array.from(carousel.querySelectorAll('[data-carousel-card]'), (card) => card.firstElementChild!.firstElementChild)
	expect(screen.getByText('1 / 3')).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Next nemesis card'}))
	expect(screen.getByText('2 / 3')).toBeInTheDocument()
	carousel.querySelectorAll('[data-carousel-card]').forEach((card, index) => {
		expect(card.firstElementChild!.firstElementChild).toBe(cardFaces[index])
	})
	fireEvent.click(screen.getByRole('button', {name: 'Previous nemesis card'}))
	expect(screen.getByText('1 / 3')).toBeInTheDocument()
	for (let i = 0; i < 3 && !screen.queryByRole('button', {name: /view rivalry details between (Alpha and Beta|Beta and Alpha)/i}); i++) {
		fireEvent.click(screen.getByRole('button', {name: 'Next nemesis card'}))
	}
	expect(screen.getAllByRole('button', {name: /view rivalry details between/i})).toHaveLength(1)
	fireEvent.click(screen.getByRole('button', {name: /view rivalry details between (Alpha and Beta|Beta and Alpha)/i}))
	expect(await screen.findByRole('img', {name: /Alpha: 1 wins; Beta: 1 wins|Beta: 1 wins; Alpha: 1 wins/})).toBeInTheDocument()
	expect(screen.queryByText('0 ties')).not.toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Close'}))
	fireEvent.click(screen.getByRole('radio', {name: 'Points differential'}))
	expect(screen.queryByText('MUTUAL NEMESES')).not.toBeInTheDocument()
	expect(screen.getByText('1 / 3')).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Next nemesis card'}))
	expect(screen.getByText('2 / 3')).toBeInTheDocument()
	fireEvent.keyDown(carousel, {key: 'ArrowRight'})
	expect(screen.getByText('3 / 3')).toBeInTheDocument()
	fireEvent.keyDown(carousel, {key: 'ArrowRight'})
	expect(screen.getByText('1 / 3')).toBeInTheDocument()
	fireEvent.touchStart(carousel, {touches: [{clientX: 200, clientY: 100}]})
	fireEvent.touchEnd(carousel, {changedTouches: [{clientX: 100, clientY: 100}]})
	expect(screen.getByText('2 / 3')).toBeInTheDocument()
})

it('navigates two cards in both directions and handles an empty list', () => {
	const season: HistorySeason = {
		leagueId: '1', season: '2024',
		users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}], weeks: [],
	}
	const teams = calculateLeagueHistory([season]).teams
	const {rerender} = render(<ChakraProvider theme={theme}><NemesisSection teams={teams} /></ChakraProvider>)
	expect(screen.getByText('1 / 2')).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Previous nemesis card'}))
	expect(screen.getByText('2 / 2')).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Next nemesis card'}))
	expect(screen.getByText('1 / 2')).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Next nemesis card'}))
	expect(screen.getByText('2 / 2')).toBeInTheDocument()
	rerender(<ChakraProvider theme={theme}><NemesisSection teams={[]} /></ChakraProvider>)
	expect(screen.getByText('No teams available.')).toBeInTheDocument()
	expect(screen.queryByRole('button', {name: 'Next nemesis card'})).not.toBeInTheDocument()
})

it('navigates team chips to the nearest matching card and highlights mutual nemeses', () => {
	const season: HistorySeason = {
		leagueId: '1', season: '2024',
		users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'},
			{user_id: 'c', display_name: 'Gamma'}, {user_id: 'd', display_name: 'Delta'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'},
			{roster_id: 3, owner_id: 'c'}, {roster_id: 4, owner_id: 'd'}], weeks: [],
	}
	const teams = calculateLeagueHistory([season]).teams
	const find = (id: string) => teams.find((team) => team.id === id)!
	const rival = (id: string): HistoryRival => ({
		id, name: find(id).name, avatar: null, wins: 0, losses: 1, ties: 0,
		pointsFor: 90, pointsAgainst: 100, matchups: [],
	})
	find('a').nemeses.losses = [rival('b'), rival('c')]
	find('b').nemeses.losses = [rival('a')]
	find('c').nemeses.losses = [rival('d')]
	const orderedTeams = ['a', 'b', 'c', 'd'].map(find)
	const {rerender} = render(<ChakraProvider theme={theme}><NemesisSection teams={orderedTeams} /></ChakraProvider>)
	const chips = screen.getByRole('group', {name: 'Choose a team nemesis'})
	const alpha = within(chips).getByRole('button', {name: 'Alpha'})
	const beta = within(chips).getByRole('button', {name: 'Beta'})
	const gamma = within(chips).getByRole('button', {name: 'Gamma'})
	const delta = within(chips).getByRole('button', {name: 'Delta'})
	expect(alpha).toHaveAttribute('aria-pressed', 'true')
	expect(beta).toHaveAttribute('aria-pressed', 'true')
	expect(gamma).toHaveAttribute('aria-pressed', 'false')
	fireEvent.click(gamma)
	expect(screen.getByText('3 / 4')).toBeInTheDocument()
	expect(gamma).toHaveAttribute('aria-pressed', 'true')
	expect(delta).toHaveAttribute('aria-pressed', 'false')
	fireEvent.click(alpha)
	expect(screen.getByText('2 / 4')).toBeInTheDocument()
	expect(alpha).toHaveAttribute('aria-pressed', 'true')
	expect(gamma).toHaveAttribute('aria-pressed', 'false')
	fireEvent.click(beta)
	expect(screen.getByText('1 / 4')).toBeInTheDocument()
	expect(beta).toHaveAttribute('aria-pressed', 'true')
	fireEvent.click(screen.getByRole('button', {name: 'Previous nemesis card'}))
	expect(screen.getByText('4 / 4')).toBeInTheDocument()
	expect(delta).toHaveAttribute('aria-pressed', 'true')
	fireEvent.click(screen.getByRole('radio', {name: 'Points differential'}))
	expect(screen.getByText('1 / 4')).toBeInTheDocument()
	expect(alpha).toHaveAttribute('aria-pressed', 'true')
	expect(beta).toHaveAttribute('aria-pressed', 'false')
	rerender(<ChakraProvider theme={theme}><NemesisSection teams={[find('c')]} /></ChakraProvider>)
	expect(within(chips).queryByRole('button', {name: 'Alpha'})).not.toBeInTheDocument()
	expect(within(chips).getByRole('button', {name: 'Gamma'})).toHaveAttribute('aria-pressed', 'true')
})
