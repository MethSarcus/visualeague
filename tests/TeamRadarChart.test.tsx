import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import {useState} from 'react'
import {ResponsiveRadar} from '@nivo/radar'
import {ResponsiveBar} from '@nivo/bar'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import TeamRadarChart from '../components/charts/TeamRadarChart'
import LeagueStackedPfBarChart from '../components/charts/bar/LeaguePFBarChart'
import {POSITION} from '../utility/rosterFunctions'
import theme from '../theme'

jest.mock('@nivo/radar', () => ({ResponsiveRadar: jest.fn(() => <div data-testid='radar-chart' />)}))
jest.mock('@nivo/bar', () => ({ResponsiveBar: jest.fn(() => <div data-testid='bar-chart' />)}))

function Charts({league, initialHidden = []}: {league: League; initialHidden?: number[]}) {
	const [hiddenRosterIds, setHiddenRosterIds] = useState(initialHidden)
	const onToggleRoster = (rosterId: number) => setHiddenRosterIds((hidden) =>
		hidden.includes(rosterId) ? hidden.filter((id) => id !== rosterId) : [...hidden, rosterId])
	return <>
		<TeamRadarChart league={league} hiddenPositions={[POSITION.RB]} hiddenRosterIds={hiddenRosterIds} />
		<LeagueStackedPfBarChart league={league} hiddenPositions={[POSITION.RB]} hiddenRosterIds={hiddenRosterIds}
			onTogglePosition={jest.fn()} onToggleRoster={onToggleRoster} />
	</>
}

function makeLeague(): League {
	const league: League = Object.create(League.prototype)
	league.settings = {roster_positions: ['QB', 'RB']} as League['settings']
	league.members = new Map([
		[1, makeMember(1, 'Same name')],
		[2, makeMember(2, 'Same name')],
	])
	return league
}

function makeMember(id: number, name: string): LeagueMember {
	const member: LeagueMember = Object.create(LeagueMember.prototype)
	member.name = name
	member.teamName = `Team ${id}`
	member.avatar = `avatar-${id}`
	member.roster = {roster_id: id} as LeagueMember['roster']
	member.stats = {
		pf: id * 20,
		position_scores: new Map([[POSITION.QB, id * 20], [POSITION.RB, id * 10]]),
		position_starts: new Map([[POSITION.QB, 2], [POSITION.RB, 2]]),
	} as LeagueMember['stats']
	return member
}

it('filters both charts when a team chip in the bar panel is toggled', () => {
	render(<ChakraProvider theme={theme}><Charts league={makeLeague()} initialHidden={[2]} /></ChakraProvider>)

	let radarProps = jest.mocked(ResponsiveRadar).mock.calls.at(-1)?.[0]
	expect(radarProps?.data.map((row) => row.position)).toEqual([POSITION.QB])
	expect(radarProps?.keys).toEqual(['1'])
	const card = screen.getByRole('heading', {name: 'Team points by position'}).parentElement!
	const chip = within(card).getByRole('button', {name: 'Show Same name (Team 2) on positional charts'})
	expect(chip).toHaveAttribute('aria-pressed', 'false')
	expect(screen.getByRole('heading', {name: 'Average points per game by position'}).parentElement)
		.not.toContainElement(chip)
	fireEvent.click(chip)
	radarProps = jest.mocked(ResponsiveRadar).mock.calls.at(-1)?.[0]
	expect(radarProps?.keys).toEqual(['1', '2'])
	expect(jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0].data.map((row) => row.rosterId)).toEqual(['1', '2'])
	fireEvent.click(within(card).getByRole('button', {name: 'Hide Same name (Team 1) on positional charts'}))
	expect(jest.mocked(ResponsiveRadar).mock.calls.at(-1)?.[0].keys).toEqual(['2'])
	expect(jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0].data.map((row) => row.rosterId)).toEqual(['2'])
	fireEvent.click(within(card).getByRole('button', {name: 'Hide Same name (Team 2) on positional charts'}))
	expect(screen.getByText('Select at least one team to show the radar chart.')).toBeInTheDocument()
	expect(screen.getByText('Select at least one team to show the chart.')).toBeInTheDocument()
	fireEvent.click(within(card).getByRole('button', {name: 'Show Same name (Team 1) on positional charts'}))
	expect(jest.mocked(ResponsiveRadar).mock.calls.at(-1)?.[0].keys).toEqual(['1'])
	expect(jest.mocked(ResponsiveBar).mock.calls.at(-1)?.[0].data.map((row) => row.rosterId)).toEqual(['1'])
})

it('shows manager names instead of roster IDs in the radar tooltip', async () => {
	render(<ChakraProvider theme={theme}><TeamRadarChart
		league={makeLeague()}
		hiddenPositions={[]}
		hiddenRosterIds={[]}
	/></ChakraProvider>)

	const radarProps = jest.mocked(ResponsiveRadar).mock.calls.at(-1)?.[0]
	const tooltip = await radarProps?.sliceTooltip?.({
		index: POSITION.QB,
		data: [
			{color: 'red', id: '1', value: 10, formattedValue: '10.00'},
			{color: 'blue', id: '2', value: 20, formattedValue: '20.00'},
		],
	})
	const tooltipView = render(<ChakraProvider theme={theme}>{tooltip}</ChakraProvider>)
	expect(within(tooltipView.container).getByText('Same name (Team 1)')).toBeInTheDocument()
	expect(within(tooltipView.container).getByText('Same name (Team 2)')).toBeInTheDocument()
	expect(within(tooltipView.container).queryByText('1')).not.toBeInTheDocument()
	expect(within(tooltipView.container).queryByText('2')).not.toBeInTheDocument()
})

it('uses team images and falls back to profile images', () => {
	const league = makeLeague()
	const first = league.members.get(1)!
	first.teamAvatar = 'https://example.com/team.png'
	const images: HTMLImageElement[] = []
	const OriginalImage = window.Image
	const imageSpy = jest.spyOn(window, 'Image').mockImplementation(() => {
		const image = new OriginalImage()
		images.push(image)
		return image
	})
	try {
		render(<ChakraProvider theme={theme}><Charts league={league} initialHidden={[2]} /></ChakraProvider>)
		images.forEach((image) => fireEvent.load(image))
		const firstButton = screen.getByRole('button', {name: 'Hide Same name (Team 1) on positional charts'})
		const secondButton = screen.getByRole('button', {name: 'Show Same name (Team 2) on positional charts'})
		expect(firstButton.querySelector('img')).toHaveAttribute('src', 'https://example.com/team.png')
		expect(secondButton.querySelector('img')).toHaveAttribute('src', 'https://sleepercdn.com/avatars/thumbs/avatar-2')
		expect(firstButton.querySelector('.chakra-avatar')).toHaveAttribute('aria-hidden', 'true')
		expect(secondButton.querySelector('.chakra-avatar')).toHaveAttribute('aria-hidden', 'true')
		expect(firstButton).toHaveAttribute('aria-pressed', 'true')
		expect(secondButton).toHaveAttribute('aria-pressed', 'false')
	} finally {
		imageSpy.mockRestore()
	}
})

it('uses an avatar fallback when a member has no image', () => {
	const league = makeLeague()
	league.members.get(1)!.avatar = ''
	render(<ChakraProvider theme={theme}><Charts league={league} /></ChakraProvider>)
	const button = screen.getByRole('button', {name: 'Hide Same name (Team 1) on positional charts'})
	expect(button.querySelector('.chakra-avatar')).toBeInTheDocument()
	expect(button.querySelector('img')).not.toBeInTheDocument()
})
