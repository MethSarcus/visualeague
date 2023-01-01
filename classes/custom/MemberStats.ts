import { POSITION } from "../../utility/rosterFunctions"

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
    public ties: number = 0
    public win_pct: number = 0
    public overall_rank: number = 0
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

    addDraftValue(value: number) {
      if (!isNaN(+value))
      this.draftValue += value
    }
  }
  