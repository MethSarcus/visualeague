import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import {ResponsiveBar} from '@nivo/bar'
import {AuctionDraftPlayer, Draft, DraftPlayer, DRAFT_TYPE} from '../classes/custom/Draft'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import DraftValueBarChart, {formatDraftValueChart} from '../components/charts/bar/DraftValueBarChart'
import DraftValueTable from '../components/tables/DraftValueTable'
import theme from '../theme'

jest.mock('@nivo/bar', () => ({ResponsiveBar: jest.fn(() => <div data-testid='draft-chart' />)}))

function player(id: string, rosterId: number, name: string, value: number, position: string): DraftPlayer {
	const result: AuctionDraftPlayer = Object.create(AuctionDraftPlayer.prototype)
	Object.assign(result, {player_id: id, roster_id: rosterId, name, draftValue: value, metadata: {position},
		ppg: 10, pointsScored: 100, amount: 5, pick_no: 1})
	return result
}

function fixture() {
	const draft: Draft = Object.create(Draft.prototype)
	draft.settings = {type: DRAFT_TYPE.AUCTION} as Draft['settings']
	draft.picks = new Map([
		['1', player('1', 1, 'First Player', 20, 'QB')],
		['2', player('2', 2, 'Second Player', -5, 'RB')],
		['3', player('3', 1, 'Third Player', 10, 'RB')],
	])
	const league: League = Object.create(League.prototype)
	league.settings = {} as League['settings']
	league.draft = draft
	const member = (id: number, value: number): LeagueMember => {
		const result: LeagueMember = Object.create(LeagueMember.prototype)
		result.roster = {roster_id: id} as LeagueMember['roster']
		result.name = 'Same name'
		result.stats = {draftValue: value} as LeagueMember['stats']
		return result
	}
	league.members = new Map([[1, member(1, 30)], [2, member(2, -5)]])
	return {league, draft}
}

it('preserves individual and negative player values and distinguishes teams with the same name', () => {
	const {league} = fixture()
	const chart = formatDraftValueChart(league)
	expect(chart.keys).toEqual(['1', '3', '2'])
	expect(chart.data).toEqual([
		{rosterId: '2', member: 'Same name', '2': -5},
		{rosterId: '1', member: 'Same name', '1': 20, '3': 10},
	])
	render(<ChakraProvider theme={theme}><DraftValueBarChart league={league} /></ChakraProvider>)
	expect(screen.getByRole('heading', {name: 'Draft value by team'})).toBeInTheDocument()
	expect(screen.getByText('QB')).toBeInTheDocument()
	expect(screen.getByText('RB')).toBeInTheDocument()
	expect(jest.mocked(ResponsiveBar).mock.calls[0][0].indexBy).toBe('rosterId')
	expect(jest.mocked(ResponsiveBar).mock.calls[0][0].valueScale).toEqual({type: 'linear', min: 'auto', max: 'auto'})
})

it('shows auction statistics and keeps columns sortable', () => {
	const {draft} = fixture()
	render(<ChakraProvider theme={theme}><DraftValueTable draft={draft} /></ChakraProvider>)
	expect(screen.getByRole('heading', {name: 'Drafted players'})).toBeInTheDocument()
	expect(screen.getByRole('button', {name: /PF \/ \$/})).toBeInTheDocument()
	expect(screen.getAllByText('$5')).toHaveLength(3)
	fireEvent.click(screen.getByRole('button', {name: /Value/}))
	const rows = within(screen.getByRole('table', {name: 'Drafted player statistics'})).getAllByRole('row').slice(1)
	expect(rows[0]).toHaveTextContent('First Player')
	expect(rows[2]).toHaveTextContent('Second Player')
})

it('shows pick numbers instead of auction columns for snake drafts', () => {
	const {draft} = fixture()
	draft.settings.type = DRAFT_TYPE.SNAKE
	render(<ChakraProvider theme={theme}><DraftValueTable draft={draft} /></ChakraProvider>)
	expect(screen.getByRole('button', {name: /Pick/})).toBeInTheDocument()
	expect(screen.queryByRole('button', {name: /PF \/ \$/})).not.toBeInTheDocument()
})
