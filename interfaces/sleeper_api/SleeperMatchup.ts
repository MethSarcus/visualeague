export interface SleeperMatchup {
        starters_points: number[];
        starters: string[];
        roster_id: number;
        points: number;
        players_points: Map<string, number>;
        players: string[];
        matchup_id: number;
        custom_points?: number;
    }