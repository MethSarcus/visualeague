import '@testing-library/jest-dom'
import {fireEvent, render, screen} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import {ResponsiveRadar} from '@nivo/radar'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import TeamRadarChart from '../components/charts/TeamRadarChart'
import {POSITION} from '../utility/rosterFunctions'
import theme from '../theme'

jest.mock('@nivo/radar', () => ({ResponsiveRadar: jest.fn(() => <div data-testid='radar-chart' />)}))

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
	member.roster = {roster_id: id} as LeagueMember['roster']
	member.stats = {
		position_scores: new Map([[POSITION.QB, id * 20], [POSITION.RB, id * 10]]),
		position_starts: new Map([[POSITION.QB, 2], [POSITION.RB, 2]]),
	} as LeagueMember['stats']
	return member
}

it('shares hidden positions and supports toggling individual league members', () => {
	const onToggleRoster = jest.fn()
	render(<ChakraProvider theme={theme}><TeamRadarChart
		league={makeLeague()}
		hiddenPositions={[POSITION.RB]}
		hiddenRosterIds={[2]}
		onToggleRoster={onToggleRoster}
	/></ChakraProvider>)

	const radarProps = jest.mocked(ResponsiveRadar).mock.calls.at(-1)?.[0]
	expect(radarProps?.data.map((row) => row.position)).toEqual([POSITION.QB])
	expect(radarProps?.keys).toEqual(['1'])
	expect(screen.getByRole('button', {name: 'Show Same name (Roster 2) on radar chart'})).toHaveAttribute('aria-pressed', 'false')
	fireEvent.click(screen.getByRole('button', {name: 'Hide Same name (Roster 1) on radar chart'}))
	expect(onToggleRoster).toHaveBeenCalledWith(1)
})
