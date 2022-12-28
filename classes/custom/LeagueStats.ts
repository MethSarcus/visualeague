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

	public position_scores: Map<POSITION, number> = new Map()
	public position_starts: Map<POSITION, number> = new Map()

	getPositionAvgPPG(position: POSITION) {
		return (
			(this.position_scores.get(position) ?? 0) /
			(this.position_starts.get(position) ?? 0)
		)
	}
}
