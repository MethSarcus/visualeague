import {POSITION} from '../../utility/rosterFunctions'
import {WEEK_RESULT} from './League'

export default class MemberScores {
	public pf: number = 0
	public pa: number = 0
	public pp: number = 0
	public stdDev: number = 0
	public opslap: number = 0
	public custom_points: number = 0
	public gp: number = 0
	public gutPlays = 0
	public winnableLosses: number = 0
	public timesUnderdog: number = 0
	public upsets: number = 0
	public wasUpset: number = 0
	public wins: number = 0
	public losses: number = 0
	public weekResults: WEEK_RESULT[] = []
	public ties: number = 0
	public win_pct: number = 0
	public overall_rank: number = 0
	public trajectory: number = 0
	public allPlayWinMap: Map<number, number> = new Map()
	public allPlayLossMap: Map<number, number> = new Map()
	public allPlayTieMap: Map<number, number> = new Map()
	public power_wins: number = 0
	public power_losses: number = 0
	public power_ties: number = 0
	public position_scores: Map<POSITION, number> = new Map()
	public projected_position_scores: Map<POSITION, number> = new Map()
	public position_starts: Map<POSITION, number> = new Map()
	public divisionWins: number = 0
	public divisionLosses: number = 0
	public divisionTies: number = 0
	public draftValue: number = 0
	public currentStreak: number = 0
	//Percent of total draft value member drafted
	public draftPercentage: number = 0

	addDraftValue(value: number) {
		if (!isNaN(+value)) this.draftValue += value
	}

	resetStats() {
		this.pf = 0
		this.pa = 0
		this.pp = 0
		this.stdDev = 0
		this.opslap = 0
		this.custom_points = 0
		this.gp = 0
		this.gutPlays = 0
		this.winnableLosses = 0
		this.timesUnderdog = 0
		this.upsets = 0
		this.wasUpset = 0
		this.wins = 0
		this.losses = 0
		this.trajectory = 0
		this.ties = 0
		this.win_pct = 0
		this.overall_rank = 0
		this.power_wins = 0
		this.power_losses = 0
		this.power_ties = 0
		this.position_scores = new Map<POSITION, number>()
		this.projected_position_scores = new Map<POSITION, number>()
		this.position_starts = new Map<POSITION, number>()
		this.divisionWins = 0
		this.divisionLosses = 0
		this.divisionTies = 0
		this.draftValue = 0
		this.allPlayWinMap = new Map()
		this.allPlayLossMap = new Map()
		this.allPlayTieMap = new Map()
		this.weekResults = []
	}
}
