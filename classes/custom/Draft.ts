import {AuctionMetadata, DraftPick, SnakeMetadata} from '../sleeper/DraftPick'
import {DraftSettings} from '../sleeper/DraftSettings'

export class Draft {
	picks: Map<string, DraftPlayer> = new Map()
	settings: DraftSettings
	constructor(picks: DraftPick[], draftSettings: DraftSettings) {
		this.settings = draftSettings
		if (draftSettings.type == DRAFT_TYPE.AUCTION) {
			picks.forEach((draftPick) => {
				this.picks.set(
					draftPick.player_id,
					new AuctionDraftPlayer(draftPick, draftSettings.settings.budget!)
				)
			})
		} else {
			picks.forEach((draftPick) => {
				this.picks.set(draftPick.player_id, new SnakeDraftPlayer(draftPick))
			})
		}
	}

	calculatePlayerDraftValue(): void {
		this.picks.forEach((pick) => {
			pick.setDraftValue()
		})
	}

	resetAllDraftPlayers() {
		this.picks.forEach(pick => {
			pick.reset()
		})
	}
}

export enum DRAFT_TYPE {
	SNAKE = 'snake',
	AUCTION = 'auction',
	LINEAR = 'linear'
}

export interface DraftPlayer extends DraftPick {
	gamesPlayed: number
	pointsScored: number
	draftValue: number
	amount?: number
	ppg: number
	name: string
	setDraftValue(): void
	addGame(points: number): void
	reset(): void
}

class SnakeDraftPlayer implements DraftPlayer {
	gamesPlayed: number = 0
	pointsScored: number = 0
	draftValue: number = 0
	ppg: number = 0
	round: number
	roster_id: number
	player_id: string
	picked_by: string
	pick_no: number
	name: string
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
		this.name =
			(pick.metadata.first_name ?? '') + ' ' + (pick.metadata.last_name ?? '')
	}

	addGame(points: number): void {
		this.pointsScored += points
		this.gamesPlayed += 1
	}

	setDraftValue(): void {
		this.pointsScored = parseFloat(this.pointsScored.toFixed(2))
		this.ppg = parseFloat((this.pointsScored / this.gamesPlayed).toFixed(2))
		this.draftValue = parseFloat(
			(this.pointsScored * this.ppg * Math.log(this.pick_no)).toFixed(2)
		)
		this.pointsScored = parseFloat(this.pointsScored.toFixed(2))
	}

	reset(): void {
		this.gamesPlayed = 0
		this.pointsScored = 0
		this.draftValue = 0
		this.ppg = 0
	}
}

class AuctionDraftPlayer implements DraftPlayer {
	gamesPlayed: number = 0
	pointsScored: number = 0
	draftValue: number = 0
	ppg: number = 0
	round: number
	name: string
	roster_id: number
	player_id: string
	picked_by: string
	pick_no: number
	metadata: AuctionMetadata
	is_keeper?: null | undefined
	draft_slot: number
	draft_id: string
	amount?: number
	budget: number

	constructor(pick: DraftPick, budget: number) {
		this.pick_no = pick.pick_no
		this.round = pick.round
		this.roster_id = pick.roster_id
		this.player_id = pick.player_id
		this.picked_by = pick.picked_by
		this.metadata = pick.metadata
		this.is_keeper = pick.is_keeper
		this.draft_slot = pick.draft_slot
		this.draft_id = pick.draft_id
		this.budget = budget
		this.amount = parseInt(pick.metadata.amount)
		this.name =
			(pick.metadata.first_name ?? '') + ' ' + (pick.metadata.last_name ?? '')
	}
	setDraftValue(): void {
		this.pointsScored = parseFloat(this.pointsScored.toFixed(2))
		this.ppg = parseFloat((this.pointsScored / this.gamesPlayed).toFixed(2))
		this.draftValue = parseFloat(
			(
				this.pointsScored *
				this.ppg *
				Math.log10(this.budget / parseInt(this.metadata.amount))
			).toFixed(2)
		)
	}
	addGame(points: number): void {
		this.pointsScored += points
		this.gamesPlayed += 1
	}

	reset(): void {
		this.gamesPlayed = 0
		this.pointsScored = 0
		this.draftValue = 0
		this.ppg = 0
	}
}
