import {HistoryRoster, HistoryUser} from './leagueHistory'

export const spendingPositions = ['QB', 'RB', 'WR', 'TE', 'K/DEF', 'Other'] as const
export type SpendingPosition = typeof spendingPositions[number]

export interface DraftSpendingMember {
	rosterId: number
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
			rosterId: roster.roster_id, name: user?.metadata?.team_name || manager, manager,
			avatar: user?.metadata?.avatar || (user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null),
			total: 0, amounts: {QB: 0, RB: 0, WR: 0, TE: 0, 'K/DEF': 0, Other: 0},
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
