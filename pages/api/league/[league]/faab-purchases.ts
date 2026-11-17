import type {NextApiRequest, NextApiResponse} from 'next'
import {SleeperTransaction} from '../../../../classes/sleeper/SleeperTransaction'
import {FaabPurchaseDetails, getFaabPurchases} from '../../../../lib/faabTransactions'
import {connectToDatabase} from '../../../../lib/mongodb'

interface PlayerRecord {
	_id: string
	details?: {first_name?: string; last_name?: string; full_name?: string}
}

async function sleeper<T>(path: string): Promise<T> {
	const response = await fetch(`https://api.sleeper.app/v1/${path}`)
	if (!response.ok) throw new Error(`Sleeper request failed (${response.status}): ${path}`)
	return response.json() as Promise<T>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<FaabPurchaseDetails[] | {error: string}>) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET')
		return res.status(405).json({error: 'Method not allowed'})
	}
	const {league} = req.query
	if (typeof league !== 'string' || !/^\d+$/.test(league)) return res.status(400).json({error: 'A valid league ID is required'})
	try {
		const settings = await sleeper<{season: string; settings: {leg: number}}>(`league/${league}`)
		const leg = settings?.settings?.leg
		if (!/^\d{4}$/.test(settings?.season) || !Number.isInteger(leg) || leg < 0 || leg > 30) throw new Error('Invalid league transaction range')
		const weeks = await Promise.all(Array.from({length: leg + 1}, (_, week) => sleeper<SleeperTransaction[]>(`league/${league}/transactions/${week}`)))
		if (weeks.some((week) => !Array.isArray(week))) throw new Error('Invalid Sleeper transactions')
		const purchases = getFaabPurchases(weeks.flat())
		const playerIds = [...new Set(purchases.flatMap((purchase) => purchase.playerIds))]
		const names = new Map<string, string>()
		if (playerIds.length) {
			const client = await connectToDatabase()
			for (const database of [settings.season, 'players']) {
				const missing = playerIds.filter((id) => !names.has(id))
				if (!missing.length) break
				const records = await client.db(database).collection<PlayerRecord>('player_details')
					.find({_id: {$in: missing}}, {projection: {details: 1}}).toArray()
				for (const record of records) {
					const name = record.details?.full_name || [record.details?.first_name, record.details?.last_name].filter(Boolean).join(' ')
					if (name) names.set(record._id, name)
				}
			}
		}
		res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300')
		return res.status(200).json(purchases.map((purchase) => ({
			...purchase, playerNames: purchase.playerIds.map((id) => names.get(id) || `Player ${id} (name unavailable)`),
		})))
	} catch (error) {
		console.error('Failed to load FAAB purchases:', error)
		return res.status(502).json({error: 'Unable to load FAAB purchases'})
	}
}
