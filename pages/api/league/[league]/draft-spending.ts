import type {NextApiRequest, NextApiResponse} from 'next'
import {fetchDraftSpending} from '../../../../lib/fetchDraftSpending'
import {DraftSpendingResponse} from '../../../../lib/draftSpending'

export default async function handler(req: NextApiRequest, res: NextApiResponse<DraftSpendingResponse | {error: string}>) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET')
		return res.status(405).json({error: 'Method not allowed'})
	}
	const {league} = req.query
	if (typeof league !== 'string' || !/^\d+$/.test(league)) return res.status(400).json({error: 'A valid league ID is required'})
	try {
		const rows = await fetchDraftSpending(league)
		res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300')
		return res.status(200).json(rows)
	} catch (error) {
		console.error('Failed to load auction draft history:', error)
		return res.status(502).json({error: 'Unable to load auction draft history from Sleeper'})
	}
}
