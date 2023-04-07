import { ScoringAct, ScoringSettings } from "../sleeper/LeagueSettings"

export default interface StatsResponse {
    [week: number]: any
}

interface SeasonStatistics {
    projections: PlayerData
    stats: PlayerData
}

interface PlayerData {
    [player_id: string]: ScoringSettings
}