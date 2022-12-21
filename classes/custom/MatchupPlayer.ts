import { ScoringAct, ScoringSettings } from "../sleeper/LeagueSettings"

export class MatchupPlayer {
    playerId?: string
    position?: string
    score: number = 0
    projectedScore: number = 0
    stats?: ScoringAct | undefined
    projectedStats?: ScoringAct
    eligiblePositions: string[] = ["QB",
    "RB",
    "WR",
    "TE",
    "DEF",
    "K",
    "DL",
    "LB",
    "DB"]

    constructor(playerId?: string, position?: string, stats?: ScoringSettings, projectedStats?: ScoringSettings, eligiblePositions?: string[], leagueSettings?: ScoringSettings) {
        this.playerId = playerId
        this.position = position
        this.stats = stats as unknown as ScoringAct
        this.projectedStats = projectedStats as unknown as ScoringAct
        if (eligiblePositions) {
            this.eligiblePositions = eligiblePositions
        }
    
        this.calculatePoints(leagueSettings!)
        
    }

    calculatePoints(leagueSettings: ScoringSettings) {
        if (this.stats != undefined) {
          for (const [key, value] of Object.entries(this.stats)) {
            let points = value * (leagueSettings[key as keyof ScoringSettings] as number)
            if (!isNaN(points)) {
                this.score += points
            }
          }
        }
    
        if (this.projectedStats != undefined) {
            for (const [key, value] of Object.entries(this.projectedStats)) {
                let points = value * (leagueSettings[key as keyof ScoringSettings] as number)
                if (!isNaN(points)) {
                    this.projectedScore += points
                }
            }
          }
      }
      
}

export class BlankPlayer extends MatchupPlayer {
    playerId: string = "0"
    score: number = 0
    projectedScore: number = 0
    stats?: ScoringAct | undefined = undefined
    projectedStats?: ScoringAct = undefined
    eligiblePositions: string[] = ["QB",
    "RB",
    "WR",
    "TE",
    "DEF",
    "K",
    "DL",
    "LB",
    "DB"]
    
    calculatePoints(leagueSettings: ScoringSettings): void {
        return;
    }
    
}