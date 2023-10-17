import { ScoringAct, ScoringSettings } from "../sleeper/LeagueSettings"
import { PlayerScores } from "./Player"

export class MatchupPlayer {
    playerId?: string
    position?: string
    score: number = 0
    projectedScore: number = 0
    eligiblePositions: string[] = ["QB",
    "RB",
    "WR",
    "TE",
    "DEF",
    "K",
    "DL",
    "LB",
    "DB"]

    constructor(playerId: string,  score: number, projectedScore: number, position?: string, eligiblePositions?: string[]) {
        this.playerId = playerId
        this.position = position
        this.score = score
        this.projectedScore = projectedScore
        if (eligiblePositions) {
            this.eligiblePositions = eligiblePositions
        }
        
    }

    // calculatePoints(leagueSettings: ScoringSettings) {
    //     if (this.stats != undefined) {
    //       for (const [key, value] of Object.entries(this.stats)) {
    //         let points = value * (leagueSettings[key as keyof ScoringSettings] as number)
    //         if (!isNaN(points)) {
    //             this.score += points
    //         }
    //       }
    //     }
    
    //     if (this.projectedStats != undefined) {
    //         for (const [key, value] of Object.entries(this.projectedStats)) {
    //             let points = value * (leagueSettings[key as keyof ScoringSettings] as number)
    //             if (!isNaN(points)) {
    //                 this.projectedScore += points
    //             }
    //         }
    //       }
    //   }
      
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
    constructor() {
        super("0", 0, 0)
    }
    
    // calculatePoints(leagueSettings: ScoringSettings): void {
    //     return;
    // }
    
}