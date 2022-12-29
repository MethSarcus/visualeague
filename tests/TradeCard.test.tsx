import {cleanup, render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import TeamStatCard from '../components/cards/statcards/TeamStatCard'
import WorstTradeCard from '../components/cards/WorstTradeCard'
import Trade from '../classes/custom/Trade'
import TradeCard from '../components/cards/TradeCard'

describe('TradeCard', () => {

	const sleeperTransaction = '{"waiver_budget":[],"type":"trade","transaction_id":"872668502723604480","status_updated":1662430571032,"status":"complete","settings":{"is_counter":1},"roster_ids":[8,3],"metadata":null,"leg":1,"drops":{"4098":8,"5850":8,"5892":3,"7567":3},"draft_picks":[],"creator":"467724374804262912","created":1662422893747,"consenter_ids":[8,3],"adds":{"4098":3,"5850":3,"5892":8,"7567":8}}'

	test('TradeObjectInits', () => {
		let trade = new Trade(JSON.parse(sleeperTransaction))
		expect(trade.consenter_ids).toEqual([ 8, 3 ])
	})

	// test('TradeCardInits', () => {
	// 	let trade = new Trade(JSON.parse(sleeperTransaction))
	// 	render(<TradeCard trade={trade}/>)
	// })
	test('Renders Tradecard', () => {
		let tradeCard = <WorstTradeCard trade={undefined} title={'worst trade'} />
		render(tradeCard)
		let card = screen.getByTestId('card_title')
		expect(card).toHaveTextContent('worst trade')
	})
})
