export interface KTCPlayer {
    playerName: string
    playerID: number
    slug: string
    position: string
    positionID: number
    team: string
    rookie: boolean
    age: number
    heightFeet: number
    heightInches: number
    weight: number
    seasonsExperience: number
    pickRound: number
    pickNum: number
    isFeatured: boolean
    isTrending: boolean
    isDevyReturningToSchool: boolean
    isDevyYearDecrement: boolean
    oneQBValues: OneQbvalues
    superflexValues: SuperflexValues
    number: number
    teamLongName: string
    birthday?: string
    draftYear: number
    college?: string
    byeWeek?: number
    nflSchedule?: NflSchedule
    injury: Injury
  }
  
  export interface OneQbvalues {
    value: number
    startSitValue: number
    rank: number
    overallTrend: number
    positionalTrend?: number
    rookieTrend?: number
    rookiePositionalTrend?: number
    positionalRank?: number
    rookieRank?: number
    rookiePositionalRank?: number
    history: KTCHistory[]
    kept: number
    traded: number
    cut: number
    diff: number
    overallTier: number
    positionalTier?: number
    rookieTier?: number
    rookiePositionalTier?: number
    overall7DayTrend: number
    positional7DayTrend?: number
    startSitOverallRank?: number
    startSitPositionalRank?: number
    startSitOverallTier: any
    startSitPositionalTier: any
    startSitOneQBFlexTier: any
    startSitSuperflexFlexTier: any
    isOutThisWeek: boolean
  }
  
  export interface KTCHistory {
    d: string
    v: number
  }
  
  export interface SuperflexValues {
    value: number
    startSitValue: number
    rank: number
    overallTrend: number
    positionalTrend?: number
    rookieTrend?: number
    rookiePositionalTrend?: number
    positionalRank?: number
    rookieRank?: number
    rookiePositionalRank?: number
    history: KTCHistory[]
    kept: number
    traded: number
    cut: number
    diff: number
    overallTier: number
    positionalTier?: number
    rookieTier?: number
    rookiePositionalTier?: number
    overall7DayTrend: number
    positional7DayTrend?: number
    startSitOverallRank?: number
    startSitPositionalRank?: number
    startSitOverallTier: any
    startSitPositionalTier: any
    startSitOneQBFlexTier: any
    startSitSuperflexFlexTier: any
    isOutThisWeek: boolean
  }
  
  export interface NflSchedule {
    kickoff: string
    gameSecondsRemaining: string
    team: KTCTeam[]
  }
  
  export interface KTCTeam {
    inRedZone: string
    score: string
    hasPossession: string
    passOffenseRank: string
    rushOffenseRank: string
    passDefenseRank: string
    spread: string
    isHome: string
    id: string
    rushDefenseRank: string
  }
  
  export interface Injury {
    injuryName?: string
    injuryCode: number
    injuryArea?: string
    injuryReturn?: string
  }