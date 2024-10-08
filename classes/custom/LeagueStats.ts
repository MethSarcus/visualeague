import {POSITION} from '../../utility/rosterFunctions'
import Matchup from './Matchup'
import {MatchupSide} from './MatchupSide'
import {Week} from './Week'

export default class LeagueStats {
	public avg_pf: number = 0
	public avg_pa: number = 0
	public avg_pp: number = 0
	public avg_opslap: number = 0
	public avg_gp: number = 0
	public best_team?: MatchupSide = undefined
	public worst_team?: MatchupSide = undefined
	public highest_scoring_matchup?: Matchup = undefined
	public biggest_upset?: Matchup = undefined
	public ageRange: [number, number] = [0, 0]

	//Maps a week to a map of member power rankings that are cumulative that week
	public powerWinsMap: Map<number, Map<number, number>> = new Map()
	public powerRankMap: Map<number, Map<number, number>> = new Map()

	public position_scores: Map<POSITION, number> = new Map()
	public position_starts: Map<POSITION, number> = new Map()

	getPositionAvgPPG(position: POSITION) {
		return (
			(this.position_scores.get(position) ?? 0) /
			(this.position_starts.get(position) ?? 0)
		)
	}

	getPositionAvgTotalPointsMap(numLeagueMembers: number) {
		let pointsMap = new Map()
		Array.from(this.position_scores.keys()).forEach((position) => {
			if (this.position_scores.get(position) != undefined) {
				pointsMap.set(position, (this.position_scores.get(position)! / numLeagueMembers).toFixed(2))
			}
			
		})
		return pointsMap
	}

	reset() {
		this.avg_pf = 0
		this.avg_pa = 0
		this.avg_pp = 0
		this.avg_opslap = 0
		this.avg_gp = 0
		this.best_team = undefined
		this.worst_team = undefined
		this.highest_scoring_matchup = undefined
		this.biggest_upset = undefined
		this.position_scores = new Map()
		this.position_starts = new Map()
		this.powerRankMap = new Map()
		this.powerWinsMap = new Map()
	}
}
