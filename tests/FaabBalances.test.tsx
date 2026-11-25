import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import useSWR from 'swr'
import League from '../classes/custom/League'
import LeagueMember from '../classes/custom/LeagueMember'
import {LeagueSettings} from '../classes/sleeper/LeagueSettings'
import {SleeperRoster} from '../classes/sleeper/SleeperRoster'
import FaabBalances from '../components/groups/FaabBalances'
import theme from '../theme'

jest.mock('swr')
beforeEach(() => {
	jest.mocked(useSWR).mockReturnValue({data: [], error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false})
})

function makeLeague(waiverType: number, budget: number, members: {name: string; used?: number; owned?: boolean}[]): League {
	const league: League = Object.create(League.prototype)
	league.settings = {settings: {waiver_type: waiverType, waiver_budget: budget}} as LeagueSettings
	league.members = new Map(members.map(({name, used, owned}, index) => {
		const member: LeagueMember = Object.create(LeagueMember.prototype)
		member.name = name
		member.avatar = ''
		member.roster = {roster_id: index + 1, owner_id: owned === false ? '' : name, settings: {waiver_budget_used: used}} as SleeperRoster
		return [index + 1, member]
	}))
	return league
}

it('sorts remaining balances, includes transfers and handles missing roster data', () => {
	const league = makeLeague(2, 100, [
		{name: 'Spent', used: 100}, {name: 'Transferred', used: -20},
		{name: 'Half', used: 50}, {name: 'Unknown'}, {name: 'Missing Member', used: 0, owned: false},
	])
	render(<ChakraProvider theme={theme}><FaabBalances league={league} /></ChakraProvider>)
	const bars = screen.getAllByRole('group').filter((bar) => bar.getAttribute('aria-label')?.includes('FAAB'))
	expect(bars.map((bar) => bar.getAttribute('aria-label'))).toEqual([
		'Transferred: $120 FAAB remaining', 'Unowned roster 5: $100 FAAB remaining',
		'Half: $50 FAAB remaining', 'Spent: $0 FAAB remaining', 'Unknown: FAAB balance unavailable',
	])
	expect(bars[0].firstElementChild).toHaveStyle({width: '100%'})
	expect(bars[2].firstElementChild).toHaveStyle({width: '41.66666666666667%'})
	expect(within(bars[4]).queryByText('$100')).not.toBeInTheDocument()
	expect(screen.getByText('N/A')).toBeInTheDocument()
})

it('handles non-FAAB leagues, continuous FAAB and missing settings', () => {
	const league = makeLeague(1, 100, [{name: 'Alpha', used: 0}])
	const {rerender} = render(<ChakraProvider theme={theme}><FaabBalances league={league} /></ChakraProvider>)
	expect(screen.queryByRole('heading', {name: 'FAAB remaining'})).not.toBeInTheDocument()
	expect(jest.mocked(useSWR).mock.calls.at(-1)?.[0]).toBeNull()
	league.settings.settings.waiver_type = 3
	rerender(<ChakraProvider theme={theme}><FaabBalances league={league} /></ChakraProvider>)
	expect(screen.getByRole('group', {name: 'Alpha: $100 FAAB remaining'})).toBeInTheDocument()
	league.settings.settings.waiver_budget = Number.NaN
	rerender(<ChakraProvider theme={theme}><FaabBalances league={league} /></ChakraProvider>)
	expect(screen.getByText('The league FAAB budget is unavailable.')).toBeInTheDocument()
})

it('shows accessible purchase segments and reports purchase loading failures separately', async () => {
	const mutate = jest.fn()
	jest.mocked(useSWR).mockReturnValue({data: [
		{id: '1', rosterId: 1, playerIds: ['p'], playerNames: ['Player One'], amount: 25, week: 2},
		{id: '2', rosterId: 1, playerIds: ['q'], playerNames: ['Player Two'], amount: 5, week: 4},
	], error: undefined, mutate, isLoading: false, isValidating: false})
	const league = makeLeague(2, 100, [{name: 'Alpha', used: 30}])
	const {rerender} = render(<ChakraProvider theme={theme}><FaabBalances league={league} /></ChakraProvider>)
	const bar = screen.getByRole('group', {name: 'Alpha: $70 FAAB remaining'})
	const first = within(bar).getByRole('button', {name: 'Alpha: Player One · $25 · Week 2'})
	const second = within(bar).getByRole('button', {name: 'Alpha: Player Two · $5 · Week 4'})
	expect(first).toHaveStyle({width: '25%'})
	expect(second).toHaveStyle({width: '5%'})
	expect(bar).toHaveStyle({overflow: 'hidden', borderRadius: 'var(--chakra-radii-full)'})
	expect(bar.firstElementChild).not.toHaveStyle({borderRadius: 'var(--chakra-radii-full)'})
	expect(first).not.toHaveStyle({borderTopLeftRadius: 'var(--chakra-radii-full)'})
	expect(second).not.toHaveStyle({borderTopRightRadius: 'var(--chakra-radii-full)'})
	fireEvent.focus(first)
	expect(await screen.findByRole('tooltip')).toHaveTextContent('Player One · $25 · Week 2')
	expect(screen.getByRole('tooltip')).not.toHaveTextContent('Alpha')
	fireEvent.click(screen.getByLabelText('View Alpha waiver purchases'))
	const dialog = await screen.findByRole('dialog')
	expect(within(dialog).getByText('Player One')).toBeInTheDocument()
	expect(within(dialog).getByText('$25')).toBeInTheDocument()
	expect(within(dialog).getByText('Player Two')).toBeInTheDocument()
	fireEvent.click(within(dialog).getByRole('button', {name: 'Close'}))
	jest.mocked(useSWR).mockReturnValue({data: undefined, error: new Error('network'), mutate, isLoading: false, isValidating: false})
	rerender(<ChakraProvider theme={theme}><FaabBalances league={league} /></ChakraProvider>)
	expect(screen.getByText('Unable to load waiver purchases.')).toBeInTheDocument()
	expect(screen.getByRole('group', {name: 'Alpha: $70 FAAB remaining'})).toBeInTheDocument()
	fireEvent.click(screen.getByRole('button', {name: 'Try again'}))
	expect(mutate).toHaveBeenCalledTimes(1)
})
