import { ScoringSettings } from "../interfaces/sleeper_api/LeagueSettings"

export class MatchupPlayer {
    playerId?: string
    position?: string
    score: number = 0
    projectedScore: number = 0
    stats?: ScoringSettings
    projectedStats?: ScoringSettings
    eligiblePositions?: string[] = []

    constructor(playerId?: string, position?: string, stats?: ScoringSettings, projectedStats?: ScoringSettings, eligiblePositions?: string[], leagueSettings?: ScoringSettings) {
        this.playerId = playerId
        this.position = position
        this.stats = stats
        this.projectedStats = projectedStats
        this.eligiblePositions = eligiblePositions
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