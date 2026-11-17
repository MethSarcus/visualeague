import {HistoryRoster, HistoryUser} from './leagueHistory'

export const spendingPositions = ['QB', 'RB', 'WR', 'TE', 'K/DEF', 'Other'] as const
export type SpendingPosition = typeof spendingPositions[number]

export interface DraftSpendingMember {
	rosterId: number
	ownerId: string | null
	name: string
	manager: string
	avatar: string | null
	total: number
	amounts: Record<SpendingPosition, number>
}

export interface DraftSpendingRow {
	draftId: string
	season: string
	name: string
	status: string
	members: DraftSpendingMember[]
}

export interface DraftSpendingResponse {
	hasAuctionDrafts: boolean
	drafts: DraftSpendingRow[]
}

export interface AverageDraftSpendingMember {
	ownerId: string
	name: string
	manager: string
	avatar: string | null
	seasons: number
	total: number
	amounts: Record<SpendingPosition, number>
	percentages: Record<SpendingPosition, number>
}

function emptyAmounts(): Record<SpendingPosition, number> {
	return {QB: 0, RB: 0, WR: 0, TE: 0, 'K/DEF': 0, Other: 0}
}

export function averageDraftSpending(drafts: DraftSpendingRow[]): AverageDraftSpendingMember[] {
	const members = new Map<string, {
		member: DraftSpendingMember
		seasons: Map<string, {total: number; amounts: Record<SpendingPosition, number>}>
	}>()
	for (const draft of drafts.slice().sort((a, b) => b.season.localeCompare(a.season))) {
		if (draft.status !== 'complete') continue
		for (const member of draft.members) {
			if (!member.ownerId) continue
			let entry = members.get(member.ownerId)
			if (!entry) {
				entry = {member, seasons: new Map()}
				members.set(member.ownerId, entry)
			}
			let season = entry.seasons.get(draft.season)
			if (!season) {
				season = {total: 0, amounts: emptyAmounts()}
				entry.seasons.set(draft.season, season)
			}
			season.total += member.total
			for (const position of spendingPositions) season.amounts[position] += member.amounts[position]
		}
	}
	return Array.from(members.values()).flatMap(({member, seasons}) => {
		const recorded = Array.from(seasons.values()).filter((season) => season.total > 0)
		if (!recorded.length || !member.ownerId) return []
		const amounts = emptyAmounts()
		const percentages = emptyAmounts()
		let total = 0
		for (const season of recorded) {
			total += season.total / recorded.length
			for (const position of spendingPositions) {
				amounts[position] += season.amounts[position] / recorded.length
				percentages[position] += (season.amounts[position] / season.total * 100) / recorded.length
			}
		}
		return [{ownerId: member.ownerId, name: member.name, manager: member.manager, avatar: member.avatar,
			seasons: recorded.length, total, amounts, percentages}]
	}).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name) || a.ownerId.localeCompare(b.ownerId))
}

interface AuctionPick {
	roster_id: number
	metadata: {position?: unknown; amount?: unknown}
}

export function calculateDraftSpending(
	draft: {draft_id: string; season: string; status: string; metadata?: {name?: string}},
	picks: AuctionPick[],
	rosters: HistoryRoster[],
	users: HistoryUser[]
): DraftSpendingRow | null {
	const usersById = new Map(users.map((user) => [user.user_id, user]))
	const members = new Map<number, DraftSpendingMember>()
	for (const roster of rosters) {
		if (!Number.isInteger(roster.roster_id) || members.has(roster.roster_id)) throw new Error(`Invalid roster in draft ${draft.draft_id}`)
		const user = roster.owner_id ? usersById.get(roster.owner_id) : undefined
		const manager = user?.display_name || (roster.owner_id ? `Manager ${roster.owner_id}` : `Unowned roster ${roster.roster_id}`)
		members.set(roster.roster_id, {
			rosterId: roster.roster_id, ownerId: roster.owner_id, name: user?.metadata?.team_name || manager, manager,
			avatar: user?.metadata?.avatar || (user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null),
			total: 0, amounts: emptyAmounts(),
		})
	}
	for (const pick of picks) {
		const member = members.get(pick?.roster_id)
		if (!member) throw new Error(`Unknown roster for pick in draft ${draft.draft_id}`)
		const rawAmount = pick?.metadata?.amount
		if ((typeof rawAmount !== 'string' && typeof rawAmount !== 'number') ||
			(typeof rawAmount === 'string' && !rawAmount.trim())) {
			throw new Error(`Missing auction amount in draft ${draft.draft_id}`)
		}
		const amount = Number(rawAmount)
		if (!Number.isFinite(amount) || amount < 0) throw new Error(`Invalid auction amount in draft ${draft.draft_id}`)
		const position = pick.metadata.position
		if (typeof position !== 'string' || !position.trim()) throw new Error(`Missing position in draft ${draft.draft_id}`)
		const key: SpendingPosition = position === 'K' || position === 'DEF' ? 'K/DEF'
			: position === 'QB' || position === 'RB' || position === 'WR' || position === 'TE' ? position : 'Other'
		member.amounts[key] += amount
		member.total += amount
	}
	if (!Array.from(members.values()).some((member) => member.total > 0)) return null
	return {draftId: draft.draft_id, season: draft.season, name: draft.metadata?.name || '', status: draft.status,
		members: Array.from(members.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name) || a.rosterId - b.rosterId)}
}
