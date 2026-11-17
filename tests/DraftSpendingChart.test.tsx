import '@testing-library/jest-dom'
import {fireEvent, render, screen} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import useSWR from 'swr'
import DraftSpendingChart from '../components/groups/DraftSpendingChart'
import theme from '../theme'

jest.mock('swr')

it('shows seasonal spending, accessible small segments and active auctions', () => {
	jest.mocked(useSWR).mockReturnValue({
		data: [
			{draftId: '1', season: '2024', name: 'Auction', status: 'complete', members: [
				{rosterId: 1, name: 'Alpha', manager: 'Manager A', avatar: null, total: 100, amounts: {QB: 5, RB: 45, WR: 40, TE: 8, 'K/DEF': 2, Other: 0}},
				{rosterId: 2, name: 'No picks', manager: 'No picks', avatar: null, total: 0, amounts: {QB: 0, RB: 0, WR: 0, TE: 0, 'K/DEF': 0, Other: 0}},
			]},
			{draftId: '2', season: '2023', name: 'Auction', status: 'drafting', members: [
				{rosterId: 1, name: 'Former', manager: 'Former', avatar: null, total: 10, amounts: {QB: 0, RB: 0, WR: 0, TE: 0, 'K/DEF': 0, Other: 10}},
			]},
		], error: undefined, mutate: jest.fn(), isLoading: false, isValidating: false,
	})
	render(<ChakraProvider theme={theme}><DraftSpendingChart leagueId='1' /></ChakraProvider>)
	expect(screen.getByText('45%')).toBeInTheDocument()
	expect(screen.getByRole('img', {name: 'Alpha, QB: $5 (5.0%)'})).toHaveAttribute('tabindex', '0')
	expect(screen.getByRole('img', {name: 'Alpha, K/DEF: $2 (2.0%)'})).toBeInTheDocument()
	expect(screen.getByText('No picks')).toBeInTheDocument()
	expect(screen.getByText('Manager A')).toBeInTheDocument()
	expect(screen.getByText('$0')).toBeInTheDocument()
	expect(screen.getByRole('combobox', {name: 'Select auction season'})).toHaveValue('1')
	fireEvent.change(screen.getByRole('combobox', {name: 'Select auction season'}), {target: {value: '2'}})
	expect(screen.getByText('Auction in progress; totals reflect recorded picks so far.')).toBeInTheDocument()
	expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
	expect(screen.getByRole('img', {name: 'Former, Other: $10 (100.0%)'})).toBeInTheDocument()
})

it('shows loading, empty and retryable error states', () => {
	const mutate = jest.fn()
	jest.mocked(useSWR).mockReturnValue({data: undefined, error: undefined, mutate, isLoading: true, isValidating: true})
	const {rerender} = render(<ChakraProvider theme={theme}><DraftSpendingChart leagueId='1' /></ChakraProvider>)
	expect(screen.getByLabelText('Loading auction draft history')).toBeInTheDocument()
	jest.mocked(useSWR).mockReturnValue({data: [], error: undefined, mutate, isLoading: false, isValidating: false})
	rerender(<ChakraProvider theme={theme}><DraftSpendingChart leagueId='1' /></ChakraProvider>)
	expect(screen.getByText('No auction spending is available for these seasons.')).toBeInTheDocument()
	jest.mocked(useSWR).mockReturnValue({data: undefined, error: new Error('network'), mutate, isLoading: false, isValidating: false})
	rerender(<ChakraProvider theme={theme}><DraftSpendingChart leagueId='1' /></ChakraProvider>)
	expect(screen.getByRole('alert')).toHaveTextContent('Unable to load auction draft history.')
	fireEvent.click(screen.getByRole('button', {name: 'Try again'}))
	expect(mutate).toHaveBeenCalledTimes(1)
})
