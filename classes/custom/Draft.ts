import {AuctionMetadata, DraftPick, SnakeMetadata} from '../sleeper/DraftPick'
import {DraftSettings} from '../sleeper/DraftSettings'

export class Draft {
	picks: Map<string, DraftPlayer> = new Map()
	settings: DraftSettings
	constructor(picks: DraftPick[], draftSettings: DraftSettings) {
		this.settings = draftSettings
		if (draftSettings.type == DRAFT_TYPE.AUCTION) {
			picks.forEach((draftPick) => {
				this.picks.set(draftPick.player_id, new AuctionDraftPlayer(draftPick))
			})
		} else {
			picks.forEach((draftPick) => {
				this.picks.set(draftPick.player_id, new SnakeDraftPlayer(draftPick))
			})
		}
	}

	calculatePlayerDraftValue(): void {
        this.picks.forEach(pick => {
            pick.setDraftValue()
        })
    }
}

export enum DRAFT_TYPE {
	SNAKE = 'snake',
	AUCTION = 'auction',
}

export interface DraftPlayer extends DraftPick {
	gamesPlayed: number
	pointsScored: number
	draftValue: number
	setDraftValue(): void
	addGame(points: number): void
}

class SnakeDraftPlayer implements DraftPlayer {
	gamesPlayed: number = 0
	pointsScored: number = 0
	draftValue: number = 0
	round: number
	roster_id: number
	player_id: string
	picked_by: string
	pick_no: number
	metadata: SnakeMetadata
	is_keeper?: null | undefined
	draft_slot: number
	draft_id: string

	constructor(pick: DraftPick) {
		this.pick_no = pick.pick_no
		this.round = pick.round
		this.roster_id = pick.roster_id
		this.player_id = pick.player_id
		this.picked_by = pick.picked_by
		this.metadata = pick.metadata
		this.is_keeper = pick.is_keeper
		this.draft_slot = pick.draft_slot
		this.draft_id = pick.draft_id
	}
	setDraftValue(): void {
		this.draftValue =
			this.pointsScored *
			(this.pointsScored / this.gamesPlayed) *
			Math.log(this.pick_no)
	}
	addGame(points: number): void {
		this.pointsScored += points
		this.gamesPlayed += 1
	}
}

class AuctionDraftPlayer implements DraftPlayer {
	gamesPlayed: number = 0
	pointsScored: number = 0
	draftValue: number = 0
	round: number
	roster_id: number
	player_id: string
	picked_by: string
	pick_no: number
	metadata: AuctionMetadata
	is_keeper?: null | undefined
	draft_slot: number
	draft_id: string

	constructor(pick: DraftPick) {
		this.pick_no = pick.pick_no
		this.round = pick.round
		this.roster_id = pick.roster_id
		this.player_id = pick.player_id
		this.picked_by = pick.picked_by
		this.metadata = pick.metadata
		this.is_keeper = pick.is_keeper
		this.draft_slot = pick.draft_slot
		this.draft_id = pick.draft_id
	}
	setDraftValue(): void {
		this.draftValue =
			this.pointsScored *
			(this.pointsScored / this.gamesPlayed) *
			(1 / parseInt(this.metadata.amount))
	}
	addGame(points: number): void {
		this.pointsScored += points
		this.gamesPlayed += 1
	}
}
