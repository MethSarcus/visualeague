import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import React from 'react'
import useSWR from 'swr'
import HistoryPage from '../app/league/[slug]/history/page'
import {calculateLeagueHistory, HistorySeason} from '../lib/leagueHistory'
import theme from '../theme'

jest.mock('swr')

afterEach(() => jest.restoreAllMocks())

it('defaults to current members and switches all history sections without fetching again', async () => {
	const recent: HistorySeason = {
		leagueId: '2', season: '2024', divisionCount: 2,
		users: [{user_id: 'a', display_name: 'Current'}, {user_id: 'b', display_name: 'Former'}],
		rosters: [{roster_id: 1, owner_id: 'a', settings: {division: 1}}],
		weeks: [],
	}
	const older: HistorySeason = {...recent, leagueId: '1', season: '2023',
		rosters: [{roster_id: 1, owner_id: 'a', settings: {division: 1}}, {roster_id: 2, owner_id: 'b', settings: {division: 2}}],
		weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 150}]}],
	}
	const seasons = [recent, older]
	const response = {...calculateLeagueHistory(seasons), currentMemberIds: ['a'], currentMembers: calculateLeagueHistory(seasons, new Set(['a']))}
	jest.mocked(useSWR).mockReturnValue({data: response, error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false})
	const useParams = jest.spyOn(React, 'use').mockReturnValue({slug: '2'})
	render(<ChakraProvider theme={theme}><HistoryPage params={Promise.resolve({slug: '2'})} /></ChakraProvider>)
	const toggle = await screen.findByRole('checkbox', {name: 'Current league members only'})
	expect(toggle).toBeChecked()
	expect(toggle).toHaveAccessibleDescription("Current members' games and nemeses can still include former opponents.")
	expect(within(screen.getByRole('table', {name: 'History standings'})).queryByText('Former')).not.toBeInTheDocument()
	expect(screen.queryByRole('table', {name: 'All-time head-to-head records'})).not.toBeInTheDocument()
	expect(screen.getByRole('img', {name: /Points by season for Current/})).toBeInTheDocument()
	expect(screen.getByRole('img', {name: /Points by season for Current: 2023: 90.00 points, 90.00 PF per head-to-head game, league average 120.00 PF per head-to-head game/})).toBeInTheDocument()
	fireEvent.click(toggle)
	expect(toggle).not.toBeChecked()
	expect(within(screen.getByRole('table', {name: 'History standings'})).getAllByText('Former')).not.toHaveLength(0)
	expect(within(screen.getByRole('table', {name: 'All-time head-to-head records'})).getByRole('button', {name: 'Current vs Former: 0 wins, 1 losses'})).toBeInTheDocument()
	expect(screen.getByRole('button', {name: /W-L ↕|W-L ↓|W-L ↑/})).toBeInTheDocument()
	expect(screen.queryByText('LEFT W–L')).not.toBeInTheDocument()
	expect(screen.getByText('100.0% win rate')).toBeInTheDocument()
	expect(screen.getAllByText('150.00', {selector: 'p'}).length).toBeGreaterThan(0)
	expect(screen.getByRole('img', {name: /Points by season for Former/})).toBeInTheDocument()
	fireEvent.click(toggle)
	expect(toggle).toBeChecked()
	expect(within(screen.getByRole('table', {name: 'History standings'})).queryByText('Former')).not.toBeInTheDocument()
	expect(screen.queryByRole('table', {name: 'All-time head-to-head records'})).not.toBeInTheDocument()
	expect(screen.getAllByText('90.00', {selector: 'p'}).length).toBeGreaterThan(0)
	expect(screen.getByRole('img', {name: /Points by season for Current/})).toBeInTheDocument()
	expect(screen.getByRole('img', {name: /Wins by season for Current/})).toBeInTheDocument()
	expect(screen.getByText('No interdivision games are available for this comparison.')).toBeInTheDocument()
	expect(screen.getAllByText(/Former over Current/)).toHaveLength(2)
	fireEvent.click(toggle)
	expect(within(screen.getByRole('table', {name: 'History standings'})).getAllByText('Former')).not.toHaveLength(0)
	useParams.mockRestore()
})

it('does not award the points lead to an unscored team when scores are negative', () => {
	const season: HistorySeason = {
		leagueId: '1', season: '2024',
		users: [{user_id: 'a', display_name: 'Scored'}, {user_id: 'b', display_name: 'Unscored'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}],
		weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: null, points: -5}]}],
	}
	const history = calculateLeagueHistory([season])
	jest.mocked(useSWR).mockReturnValue({data: {...history, currentMemberIds: ['a', 'b'], currentMembers: history}, error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false})
	jest.spyOn(React, 'use').mockReturnValue({slug: '1'})
	render(<ChakraProvider theme={theme}><HistoryPage params={Promise.resolve({slug: '1'})} /></ChakraProvider>)
	const leader = screen.getByText('ALL-TIME POINTS').parentElement!
	expect(within(leader).getByText('-5.00', {selector: 'p'})).toBeInTheDocument()
	expect(within(leader).getByText('Scored')).toBeInTheDocument()
	expect(within(leader).getByText('No head-to-head scoring average')).toBeInTheDocument()
	const chart = within(leader).getByRole('img', {name: 'Points by season for Scored: 2024: -5.00 points, no head-to-head games, league average unavailable'})
	expect(within(chart).getByText('2024')).toBeInTheDocument()
	expect(chart.querySelectorAll('circle')).toHaveLength(0)
	expect(within(leader).getByRole('button', {name: '2024: -5.00 points, no head-to-head games, league average unavailable'})).toBeInTheDocument()
})

it('shows leader portraits, paired-game rates and season details on focus', async () => {
	const recent: HistorySeason = {
		leagueId: '2', season: '2024',
		users: [{user_id: 'a', display_name: 'Alpha', avatar: 'alpha'}, {user_id: 'b', display_name: 'Beta'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}],
		weeks: [
			{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 90}]},
			{week: 2, matchups: [{roster_id: 1, matchup_id: null, points: 200}]},
		],
	}
	const older: HistorySeason = {...recent, leagueId: '1', season: '2023', weeks: [
		{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 100}, {roster_id: 2, matchup_id: 1, points: 50}]},
	]}
	const history = calculateLeagueHistory([recent, older])
	jest.mocked(useSWR).mockReturnValue({data: {...history, currentMemberIds: ['a', 'b'], currentMembers: history}, error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false})
	jest.spyOn(React, 'use').mockReturnValue({slug: '2'})
	render(<ChakraProvider theme={theme}><HistoryPage params={Promise.resolve({slug: '2'})} /></ChakraProvider>)
	const wins = screen.getByText('ALL-TIME WINS').parentElement!
	const pointsCard = screen.getByText('ALL-TIME POINTS').parentElement!
	expect(within(wins).getByText('75.0% win rate · ties count half')).toBeInTheDocument()
	expect(within(pointsCard).getByText('95.00 PF / head-to-head game')).toBeInTheDocument()
	expect(within(pointsCard).getByText('390.00')).toBeInTheDocument()
	const winsChart = within(wins).getByRole('img', {name: 'Wins by season for Alpha: 2023: 1 wins; 2024: 0 wins'})
	const pointsChart = within(pointsCard).getByRole('img', {name: 'Points by season for Alpha: 2023: 100.00 points, 100.00 PF per head-to-head game, league average 75.00 PF per head-to-head game; 2024: 290.00 points, 90.00 PF per head-to-head game, league average 90.00 PF per head-to-head game'})
	expect(Array.from(winsChart.querySelectorAll('text'), (text) => text.textContent)).toEqual(['1', '2023', '0', '2024'])
	expect(Array.from(pointsChart.querySelectorAll('text'), (text) => text.textContent)).toEqual(['75.00', '90.00', '100.00', '2023', '100.00', '90.00', '2024', '290.00'])
	const leagueSeries = pointsChart.querySelector('g[opacity="0.5"]')!
	expect(leagueSeries).toHaveAttribute('stroke', '#a0aaaa')
	expect(leagueSeries.querySelectorAll('circle')).toHaveLength(2)
	const markers = pointsChart.querySelectorAll(':scope > g > circle')
	expect(markers).toHaveLength(2)
	expect(Number(markers[0].getAttribute('cy'))).toBeCloseTo(28)
	expect(Number(markers[1].getAttribute('cy'))).toBeCloseTo(32.2)
	expect(pointsChart.querySelectorAll('line')).toHaveLength(2)
	const season = within(pointsCard).getByRole('button', {name: '2024: 290.00 points, 90.00 PF per head-to-head game, league average 90.00 PF per head-to-head game'})
	fireEvent.focus(season)
	const tooltip = await screen.findByRole('tooltip')
	expect(within(tooltip).getByText('2024')).toBeInTheDocument()
	expect(within(tooltip).getByText('Season points').parentElement).toHaveTextContent('Season points290.00')
	expect(within(tooltip).getByText('PF / head-to-head game').parentElement).toHaveTextContent('PF / head-to-head game90.00')
	expect(within(tooltip).getByText('League average PF / game').parentElement).toHaveTextContent('League average PF / game90.00')
	expect(parseFloat(getComputedStyle(season).top) + 12).toBeCloseTo(Number(markers[1].getAttribute('cy')))
	expect(season).toHaveStyle({height: '24px'})
	expect(pointsCard.querySelector('.chakra-avatar')).toHaveAttribute('aria-hidden', 'true')
})

it('leaves a gap for seasons without paired games rather than plotting their total', () => {
	const base: HistorySeason = {
		leagueId: '1', season: '2022',
		users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}],
		weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 100}, {roster_id: 2, matchup_id: 1, points: 50}]}],
	}
	const bye = {...base, leagueId: '2', season: '2023', weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: null, points: 500}]}]}
	const recent = {...base, leagueId: '3', season: '2024', weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 90}, {roster_id: 2, matchup_id: 1, points: 60}]}]}
	const history = calculateLeagueHistory([recent, bye, base])
	jest.mocked(useSWR).mockReturnValue({data: {...history, currentMemberIds: ['a', 'b'], currentMembers: history}, error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false})
	jest.spyOn(React, 'use').mockReturnValue({slug: '3'})
	render(<ChakraProvider theme={theme}><HistoryPage params={Promise.resolve({slug: '3'})} /></ChakraProvider>)
	const chart = screen.getByRole('img', {name: /Points by season for Alpha/})
	expect(chart.querySelectorAll('circle')).toHaveLength(4)
	const paths = chart.querySelectorAll('path')
	expect(paths[0].getAttribute('d')).toMatch(/^M [^M]+ M /)
	expect(paths[1].getAttribute('d')).toMatch(/^M [^M]+ M /)
	expect(within(chart).getByText('—')).toBeInTheDocument()
	expect(within(chart).getByText('500.00')).toBeInTheDocument()
	const noGames = screen.getByRole('button', {name: '2023: 500.00 points, no head-to-head games, league average unavailable'})
	expect(noGames).toHaveStyle({top: '43px'})
})

it('weights league averages by team-games and shows them even when the leader has no paired game', () => {
	const season: HistorySeason = {
		leagueId: '1', season: '2024',
		users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}, {user_id: 'c', display_name: 'Gamma'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}, {roster_id: 3, owner_id: 'c'}],
		weeks: [
			{week: 1, matchups: [{roster_id: 1, matchup_id: null, points: 1000}, {roster_id: 2, matchup_id: 1, points: 50}, {roster_id: 3, matchup_id: 1, points: 100}]},
			{week: 2, matchups: [{roster_id: 2, matchup_id: 1, points: 100}, {roster_id: 3, matchup_id: 1, points: 300}]},
		],
	}
	const history = calculateLeagueHistory([season])
	const currentMembers = calculateLeagueHistory([season], new Set(['a']))
	jest.mocked(useSWR).mockReturnValue({data: {...history, currentMemberIds: ['a'], currentMembers}, error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false})
	jest.spyOn(React, 'use').mockReturnValue({slug: '1'})
	render(<ChakraProvider theme={theme}><HistoryPage params={Promise.resolve({slug: '1'})} /></ChakraProvider>)
	const chart = screen.getByRole('img', {name: 'Points by season for Alpha: 2024: 1,000.00 points, no head-to-head games, league average 137.50 PF per head-to-head game'})
	expect(within(chart).getByText('137.50')).toBeInTheDocument()
	expect(chart.querySelectorAll('circle')).toHaveLength(1)
})

it('retains tie columns when ties only involved former members', () => {
	const recent: HistorySeason = {
		leagueId: '2', season: '2024',
		users: [{user_id: 'a', display_name: 'Alpha'}, {user_id: 'b', display_name: 'Beta'}],
		rosters: [{roster_id: 1, owner_id: 'a'}, {roster_id: 2, owner_id: 'b'}],
		weeks: [{week: 1, matchups: [{roster_id: 1, matchup_id: 1, points: 100}, {roster_id: 2, matchup_id: 1, points: 80}]}],
	}
	const older: HistorySeason = {
		leagueId: '1', season: '2023',
		users: [{user_id: 'c', display_name: 'Former C'}, {user_id: 'd', display_name: 'Former D'}],
		rosters: [{roster_id: 3, owner_id: 'c'}, {roster_id: 4, owner_id: 'd'}],
		weeks: [{week: 1, matchups: [{roster_id: 3, matchup_id: 1, points: 50}, {roster_id: 4, matchup_id: 1, points: 50}]}],
	}
	const seasons = [recent, older]
	const history = calculateLeagueHistory(seasons)
	const currentMembers = calculateLeagueHistory(seasons, new Set(['a', 'b']))
	jest.mocked(useSWR).mockReturnValue({data: {...history, currentMemberIds: ['a', 'b'], currentMembers}, error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false})
	jest.spyOn(React, 'use').mockReturnValue({slug: '2'})
	render(<ChakraProvider theme={theme}><HistoryPage params={Promise.resolve({slug: '2'})} /></ChakraProvider>)
	expect(screen.getByRole('checkbox', {name: 'Current league members only'})).toBeChecked()
	expect(within(screen.getByRole('table', {name: 'All-time head-to-head records'})).getByRole('button', {name: 'Alpha vs Beta: 1 wins, 0 losses, 0 ties'})).toHaveTextContent('1–0–0')
	expect(screen.getByRole('button', {name: /W-L-T/})).toBeInTheDocument()
	expect(screen.getByText('100.0% win rate · ties count half')).toBeInTheDocument()
})
