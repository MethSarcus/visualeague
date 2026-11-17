import '@testing-library/jest-dom'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import NemesisCard from '../components/cards/NemesisCard'
import {HistoryRival, HistoryTeam} from '../lib/leagueHistory'
import theme from '../theme'

const rival: HistoryRival = {
	id: 'b', name: 'Team B', avatar: 'https://example.com/b.png', wins: 0, losses: 1, ties: 1, pointsFor: 210, pointsAgainst: 220,
	matchups: [
		{leagueId: '2', season: '2024', week: 2, teamPoints: 100, opponentPoints: 100},
		{leagueId: '1', season: '2023', week: 1, teamPoints: 110, opponentPoints: 120},
	],
}
const team: HistoryTeam = {
	id: 'a', name: 'Team A', manager: 'Alice', avatar: 'https://example.com/a.png',
	seasons: 2, points: 100, scoredWeeks: 3, wins: 1, losses: 1, ties: 1,
	headToHead: {games: 3, wins: 1, losses: 1, ties: 1, pointsFor: 100, pointsAgainst: 100},
	seasonRecords: [],
	opponents: [rival], nemeses: {losses: [rival], points: [rival]},
}

describe('NemesisCard', () => {
	it('shows dated head-to-head scores in a separate dialog', async () => {
		render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='losses' /></ChakraProvider>)
		expect(screen.getByText('Team A')).toBeInTheDocument()
		expect(screen.getByText('Team B')).toBeInTheDocument()
		expect(screen.queryByText('TEAM')).not.toBeInTheDocument()
		expect(screen.getByText('Nemesis')).toBeInTheDocument()
		expect(screen.getByText('Team B').parentElement!.querySelector('svg')).toBeNull()
		expect(screen.getByText('Team A').parentElement!.querySelector('svg')).toBeNull()
		expect(screen.getByText('Team A').parentElement!.parentElement).toBe(screen.getByText('Team B').parentElement!.parentElement)
		expect(screen.getByLabelText('Team A: 0 wins against Team B')).toHaveTextContent('0 WINS')
		expect(screen.getByLabelText('Team B: 1 win against Team A')).toHaveTextContent('1 WIN')
		const chips = [
			screen.getByLabelText('Team A: 0 wins against Team B'),
			screen.getByLabelText('Team B: 1 win against Team A'),
		]
		chips.forEach(chip => expect(chip).toHaveStyle({background: 'rgba(15, 20, 21, 0.92)', boxShadow: '0 0 10px 3px rgba(15, 20, 21, 0.3)'}))
		expect(chips[0]).toHaveStyle({color: '#feb2b2'})
		expect(chips[1]).toHaveStyle({color: '#9ae6b4'})
		expect(chips.map(chip => chip.getAttribute('data-comparison'))).toEqual(['bad', 'good'])
		expect(screen.queryByText(/^PF /)).not.toBeInTheDocument()
		expect(screen.getByText('VS').parentElement).toHaveStyle({top: '50%', left: '50%', transform: 'translate(-50%, -50%)'})
		expect(screen.queryByText('0–1–1')).not.toBeInTheDocument()
		expect(screen.queryByText('HEAD TO HEAD')).not.toBeInTheDocument()
		expect(screen.queryByText('2 GAMES')).not.toBeInTheDocument()
		expect(screen.queryByText(/LEFT W/)).not.toBeInTheDocument()
		expect(screen.queryByRole('img', {name: 'Team A: 0 wins; Team B: 1 wins; 1 ties'})).not.toBeInTheDocument()
		const button = screen.getByRole('button', {name: /view rivalry details between Team A and Team B/i})
		expect(button).toHaveAttribute('aria-expanded', 'false')
		fireEvent.click(button)
		expect(button).toHaveAttribute('aria-expanded', 'true')
		expect(await screen.findByRole('img', {name: 'Team A: 0 wins; Team B: 1 wins; 1 ties'})).toBeInTheDocument()
		expect(screen.getByRole('img', {name: 'Team A: 210.00 points, 105.00 per game; Team B: 220.00 points, 110.00 per game'})).toBeInTheDocument()
		expect(screen.getByText('2024 · Week 2')).toBeInTheDocument()
		expect(screen.getByText('2023 · Week 1')).toBeInTheDocument()
		expect(screen.getByText('110.00 – 120.00')).toBeInTheDocument()
		expect(screen.getByText('T')).toBeInTheDocument()
		expect(screen.getByText('L')).toBeInTheDocument()
		fireEvent.click(screen.getByRole('button', {name: 'Close'}))
		expect(button).toHaveAttribute('aria-expanded', 'false')
		await waitFor(() => expect(screen.queryByRole('img', {name: 'Team A: 0 wins; Team B: 1 wins; 1 ties'})).not.toBeInTheDocument())
	})

	it('handles teams without a nemesis or image', () => {
		const {container} = render(<ChakraProvider theme={theme}><NemesisCard team={{...team, avatar: null}} rival={null} mode='losses' /></ChakraProvider>)
		expect(screen.getByText('No head-to-head losses yet')).toBeInTheDocument()
		expect(container.querySelectorAll('img')).toHaveLength(0)
		expect(screen.queryByText(/^\d+ WINS?$/)).not.toBeInTheDocument()
		expect(screen.queryByText(/^PF /)).not.toBeInTheDocument()
		expect(screen.queryByRole('button', {name: /rivalry details/i})).not.toBeInTheDocument()
	})

	it('uses each image as a decorative half-card background and labels mutual nemeses', () => {
		const {container} = render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='losses' mutual tied opponentTied /></ChakraProvider>)
		const images = container.querySelectorAll('img')
		expect(images).toHaveLength(2)
		expect(images[0]).toHaveAttribute('src', team.avatar)
		expect(images[1]).toHaveAttribute('src', rival.avatar)
		expect(images[0]).toHaveAttribute('alt', '')
		expect(images[0]).toHaveStyle({height: '100%'})
		expect(images[1]).toHaveStyle({height: '100%'})
		expect(screen.getAllByText('Tied nemesis')).toHaveLength(2)
		expect(screen.getByText('Team A').parentElement!.querySelector('svg')).toBeNull()
		expect(screen.getByText('Team B').parentElement!.querySelector('svg')).toBeNull()
		expect(screen.getByText('Mutual nemeses')).toBeInTheDocument()
		expect(images[0].parentElement!.children).toHaveLength(1)
		expect(images[1].parentElement!.children).toHaveLength(1)
	})

	it('keeps both team images untinted and positions names at the top', () => {
		const {container, rerender} = render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='losses' /></ChakraProvider>)
		const images = container.querySelectorAll('img')
		expect(images[0].parentElement!.children).toHaveLength(1)
		expect(images[1].parentElement!.children).toHaveLength(1)
		expect(images[0].parentElement!.parentElement).toHaveStyle({top: '0px'})
		rerender(<ChakraProvider theme={theme}><NemesisCard team={team} rival={null} mode='losses' /></ChakraProvider>)
		expect(container.querySelector('img')!.parentElement!.children).toHaveLength(1)
	})

	it('shrinks long names to fit two lines and restores the size when the name changes', () => {
		const width = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(80)
		const height = jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
			const size = parseFloat(this.style.fontSize) || 12
			return Math.ceil(size * 1.2 * (this.textContent?.startsWith('A very long') && size > 9 ? 3 : 2))
		})
		try {
			const longTeam = {...team, name: 'A very long fantasy football team name'}
			const {rerender} = render(<ChakraProvider theme={theme}><NemesisCard team={longTeam} rival={rival} mode='losses' /></ChakraProvider>)
			const label = screen.getByText(longTeam.name)
			expect(label).toHaveStyle({fontSize: '9px'})
			rerender(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='losses' /></ChakraProvider>)
			expect(screen.getByText(team.name)).toHaveStyle({fontSize: '12px'})
		} finally {
			width.mockRestore()
			height.mockRestore()
		}
	})

	it('shows only wins when ties are hidden', () => {
		render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='losses' showTies={false} /></ChakraProvider>)
		expect(screen.getByLabelText('Team A: 0 wins against Team B')).toHaveTextContent('0')
		expect(screen.getByLabelText('Team B: 1 win against Team A')).toHaveTextContent('1')
		expect(screen.queryByText('0–1')).not.toBeInTheDocument()
	})

	it('shows head-to-head PPG for each team on hover, focus and click, including ties', async () => {
		render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='points' /></ChakraProvider>)
		const left = screen.getByRole('button', {name: 'Team A'})
		const right = screen.getByRole('button', {name: 'Team B'})
		expect(screen.queryByText(/^PF /)).not.toBeInTheDocument()
		fireEvent.pointerEnter(left, {pointerType: 'mouse'})
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Team A: 105.00 PPG against Team B')
		fireEvent.pointerLeave(left, {pointerType: 'mouse'})
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
		fireEvent.focus(right)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Team B: 110.00 PPG against Team A')
		fireEvent.blur(right)
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
		fireEvent.click(left)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Team A: 105.00 PPG against Team B')
	})

	it('uses neutral chips when wins are tied', () => {
		render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={{...rival, wins: 1, losses: 1, pointsFor: 220, pointsAgainst: 220}} mode='points' /></ChakraProvider>)
		expect(screen.getByLabelText('Team A: 1 win against Team B')).toHaveAttribute('data-comparison', 'neutral')
		expect(screen.getByLabelText('Team B: 1 win against Team A')).toHaveAttribute('data-comparison', 'neutral')
	})

	it('handles zero games and disables tooltips for preview cards', async () => {
		const empty = {...rival, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, matchups: []}
		const {rerender} = render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={empty} mode='points' /></ChakraProvider>)
		fireEvent.click(screen.getByRole('button', {name: 'Team A'}))
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Team A: PPG unavailable against Team B (no games)')
		rerender(<ChakraProvider theme={theme}><NemesisCard team={team} rival={empty} mode='points' preview /></ChakraProvider>)
		expect(screen.getByRole('button', {name: 'Team A'})).not.toHaveAttribute('tabindex', '0')
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
	})

	it('shows numerical scores when a point share cannot be drawn', async () => {
		const negative = {...rival, pointsFor: -10, pointsAgainst: 0}
		render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={negative} mode='losses' /></ChakraProvider>)
		fireEvent.click(screen.getByRole('button', {name: /view rivalry details/i}))
		expect(screen.getByText('Point shares unavailable for zero or negative totals.')).toBeInTheDocument()
		expect(await screen.findByRole('img', {name: /Team A: -10.00 points/})).toBeInTheDocument()
	})

	it('keeps collapsed, preview, and no-nemesis card sections the same height', () => {
		const {container, rerender} = render(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='losses' /></ChakraProvider>)
		const heights = () => Array.from(container.firstElementChild!.children, (child) => getComputedStyle(child).height)
		const fullHeight = heights()[0]
		expect(fullHeight).toBe('184px')
		fireEvent.click(screen.getByRole('button', {name: /view rivalry details/i}))
		expect(heights()).toEqual([fullHeight, '40px'])
		fireEvent.click(screen.getByRole('button', {name: 'Close'}))
		rerender(<ChakraProvider theme={theme}><NemesisCard team={team} rival={rival} mode='losses' preview /></ChakraProvider>)
		expect(heights()).toEqual([fullHeight, '40px'])
		rerender(<ChakraProvider theme={theme}><NemesisCard team={team} rival={null} mode='losses' /></ChakraProvider>)
		expect(heights()).toEqual([fullHeight, '40px'])
	})
})
