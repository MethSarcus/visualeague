export interface DraftPick {
	round: number
	roster_id: number
	player_id: string
	picked_by: string
	pick_no: number
	metadata: SnakeMetadata | AuctionMetadata
	is_keeper?: null
	draft_slot: number
	draft_id: string
}

export interface TradedPick {
	season: string
	round: number
	roster_id: number
	previous_owner_id: number
	owner_id: number
	league_id?: string
}

export interface CombinedDraftPick {
	combined_pick_no: number
	draft_history: DraftPick[]
}

export interface SnakeMetadata {
	years_exp: string
	team: string
	status: string
	sport: string
	slot: string
	position: string
	player_id: string
	number: string
	news_updated: string
	last_name: string
	injury_status: string
	first_name: string
	amount: string
}

export interface AuctionMetadata extends SnakeMetadata {
	slot: string
	amount: string
}
