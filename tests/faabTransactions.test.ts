import {SleeperTransaction} from '../classes/sleeper/SleeperTransaction'
import {getFaabPurchases} from '../lib/faabTransactions'

const transaction = (overrides: Partial<SleeperTransaction> = {}): SleeperTransaction => ({
	transaction_id: '1', type: 'waiver', status: 'complete', leg: 2,
	settings: {waiver_bid: 15, seq: 1}, adds: {'123': 4}, ...overrides,
} as SleeperTransaction)

it('extracts completed paid waiver claims without misclassifying trades or failed bids', () => {
	expect(getFaabPurchases([
		transaction(), transaction({transaction_id: '2', type: 'trade'}),
		transaction({transaction_id: '3', status: 'failed'}),
		transaction({transaction_id: '4', settings: {waiver_bid: 0, seq: 1}}),
	])).toEqual([{id: '1', rosterId: 4, playerIds: ['123'], amount: 15, week: 2}])
})

it('preserves multiple players in one claim and rejects ambiguous roster allocations', () => {
	expect(getFaabPurchases([transaction({adds: {'123': 4, '456': 4}})])[0].playerIds).toEqual(['123', '456'])
	expect(() => getFaabPurchases([transaction({adds: {'123': 4, '456': 5}})])).toThrow('Invalid waiver transaction')
	expect(() => getFaabPurchases([transaction({settings: {waiver_bid: -1, seq: 1}})])).toThrow('Invalid waiver bid')
})
