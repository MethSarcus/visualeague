import { DRAFT_TYPE } from "../custom/Draft"

export interface DraftSettings {
	type: DRAFT_TYPE
	status: string
	start_time: number
	sport: string
	slot_to_roster_id: SlotToRosterId
	settings: SnakeSettings | AuctionSettings
	season_type: string
	season: string
	metadata: SnakeMetadata | AuctionMetadata
	league_id: string
	last_picked: number
	last_message_time: number
	last_message_id: string
	draft_order: DraftOrder
	draft_id: string
	creators?: string[] | null
	created: number
	budget?: number
}
export interface SlotToRosterId {
	1: number
	2: number
	3: number
	4: number
	5: number
	6: number
	7: number
	8: number
	9: number
	10: number
	11: number
	12: number
}
export interface SnakeSettings {
	teams: number
	slots_wr: number
	slots_te: number
	slots_super_flex: number
	slots_rb: number
	slots_qb: number
	slots_flex: number
	slots_bn: number
	rounds: number
	reversal_round: number
	player_type: number
	pick_timer: number
	nomination_timer: number
	enforce_position_limits: number
	cpu_autopick: number
	alpha_sort: number
	budget?: number
}

export interface AuctionSettings {
	teams: number
	slots_wr: number
	slots_te: number
	slots_super_flex: number
	slots_rb: number
	slots_qb: number
	slots_flex: number
	slots_bn: number
	rounds: number
	reversal_round: number
	player_type: number
	pick_timer: number
	nomination_timer: number
	budget: number
	enforce_position_limits: number
	cpu_autopick: number
	alpha_sort: number
}

export interface SnakeMetadata {
	scoring_type: string
	name: string
	description: string
}

export interface AuctionMetadata {
	scoring_type: string
	paused_pick_timer: string
	offering_user_id: string
	offering_slot: string
	nominating_user_id: string
	nominating_slot: string
	nominated_player_id: string
	name: string
  slot: string
	highest_offer: string
	description: string
}

export interface DraftOrder {
	418508842045816832: number
	395027646271983616: number
	385185964898762752: number
	384828695832965120: number
	376234176501932032: number
	376111571866267648: number
	367147189694337024: number
	361024227874512896: number
	343873165421764608: number
	334560424026464256: number
	237079471004315648: number
	206902201266733056: number
}
