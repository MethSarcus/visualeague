import {SleeperTransaction} from '../classes/sleeper/SleeperTransaction'

export interface FaabPurchase {
	id: string
	rosterId: number
	playerIds: string[]
	amount: number
	week: number
}

export interface FaabPurchaseDetails extends FaabPurchase {
	playerNames: string[]
}

export function getFaabPurchases(transactions: SleeperTransaction[]): FaabPurchase[] {
	const purchases: FaabPurchase[] = []
	for (const transaction of transactions) {
		if (transaction.type !== 'waiver' || transaction.status !== 'complete') continue
		const amount = transaction.settings?.waiver_bid
		if (amount === 0) continue
		if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) throw new Error('Invalid waiver bid')
		const adds = Object.entries(transaction.adds || {})
		const rosterIds = new Set(adds.map(([, rosterId]) => rosterId))
		if (!transaction.transaction_id || adds.length === 0 || rosterIds.size !== 1 ||
			!Number.isInteger(adds[0][1]) || !Number.isInteger(transaction.leg)) throw new Error('Invalid waiver transaction')
		purchases.push({id: transaction.transaction_id, rosterId: adds[0][1], playerIds: adds.map(([id]) => id), amount, week: transaction.leg})
	}
	return purchases.sort((a, b) => a.week - b.week || a.id.localeCompare(b.id))
}
