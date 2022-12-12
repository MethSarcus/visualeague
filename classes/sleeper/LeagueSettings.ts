export interface LeagueSettings {
    total_rosters: number;
    status: string;
    sport: string;
    shard: number;
    settings: Settings;
    season_type: string;
    season: string;
    scoring_settings: ScoringSettings;
    roster_positions?: (string)[] | null;
    previous_league_id: string;
    name: string;
    metadata?: DivisionMetadata | null;
    loser_bracket_id?: null;
    league_id: string;
    last_transaction_id: number;
    last_read_id: string;
    last_pinned_message_id?: string | null;
    last_message_time: number;
    last_message_text_map?: null;
    last_message_id: string;
    playoff_week_start?: number | null
    last_message_attachment?: null;
    last_author_is_bot?: boolean | null;
    last_author_id: string;
    last_author_display_name: string;
    last_author_avatar: string;
    group_id?: null;
    draft_id: string;
    display_order: number;
    company_id?: null;
    bracket_id?: null;
    avatar?: string | null;
  }
  export interface Settings {
    last_scored_leg: number;
    max_keepers: number;
    draft_rounds: number;
    trade_review_days: number;
    squads: number;
    reserve_allow_dnr: number;
    capacity_override: number;
    pick_trading: number;
    disable_trades: number;
    taxi_years: number;
    taxi_allow_vets: number;
    best_ball: number;
    last_report: number;
    disable_adds: number;
    waiver_type: number;
    bench_lock: number;
    reserve_allow_sus: number;
    type: number; //0 for redraft 1 for dynasty
    reserve_allow_cov: number;
    waiver_clear_days: number;
    daily_waivers_last_ran: number;
    waiver_day_of_week: number;
    start_week: number;
    playoff_teams: number;
    num_teams: number;
    reserve_slots: number;
    playoff_round_type: number;
    daily_waivers_hour: number;
    waiver_budget: number;
    reserve_allow_out: number;
    offseason_adds: number;
    playoff_seed_type: number;
    daily_waivers: number;
    divisions: number;
    playoff_week_start: number;
    daily_waivers_days: number;
    league_average_match: number;
    leg: number;
    trade_deadline: number;
    reserve_allow_doubtful: number;
    taxi_deadline: number;
    reserve_allow_na: number;
    taxi_slots: number;
    playoff_type: number;
  }
  export interface ScoringSettings {
    yds_allow_400_449?: number | null;
    yds_allow_550p?: number | null;
    yds_allow_100_199?: number | null;
    pass_2pt?: number | null;
    pass_int?: number | null;
    fgmiss?: number | null;
    rec_yd?: number | null;
    xpmiss?: number | null;
    def_pr_td?: number | null;
    fgm_30_39?: number | null;
    yds_allow_450_499?: number | null;
    blk_kick?: number | null;
    pts_allow_7_13?: number | null;
    ff?: number | null;
    fgm_20_29?: number | null;
    fgm_40_49?: number | null;
    pts_allow_1_6?: number | null;
    st_fum_rec?: number | null;
    pass_sack?: number | null;
    yds_allow_500_549?: number | null;
    def_st_ff?: number | null;
    st_ff?: number | null;
    yds_allow_0_100?: number | null | null;
    yds_allow_350_399?: number | null | null;
    pts_allow_28_34?: number | null;
    fgm_50p?: number | null;
    fum_rec?: number | null;
    def_td?: number | null;
    fgm_0_19?: number | null;
    int?: number | null;
    pts_allow_0?: number | null;
    pts_allow_21_27?: number | null;
    rec_2pt?: number | null;
    rec?: number | null;
    xpm?: number | null;
    st_td?: number | null;
    def_st_fum_rec?: number | null;
    def_st_td?: number | null;
    sack?: number | null;
    fum_rec_td?: number | null;
    rush_2pt?: number | null;
    rec_td?: number | null;
    pts_allow_35p?: number | null;
    pts_allow_14_20?: number | null;
    rush_yd?: number | null;
    fgm_yds_over_30?: number | null;
    pass_yd?: number | null;
    pass_td?: number | null;
    rush_td?: number | null;
    def_kr_td?: number | null;
    fum_lost?: number | null;
    yds_allow_200_299?: number | null;
    fum?: number | null;
    safe?: number | null;
    def_pr_yd?: number | null;
    kr_yd?: number | null;
    rec_30_39?: number | null;
    def_kr_yd?: number | null;
    bonus_rec_te?: number | null;
    rec_20_29?: number | null;
    rec_0_4?: number | null;
    pr_td?: number | null;
    kr_td?: number | null;
    rec_5_9?: number | null;
    rec_10_19?: number | null;
    pr_yd?: number | null;
    rec_40p?: number | null;
    fg_ret_yd?: number | null;
    tkl?: number | null;
    tkl_loss?: number | null;
    fgmiss_50p?: number | null;
    fgm_yds?: number | null;
    blk_kick_ret_yd?: number | null;
    pts_allow?: number | null;
    sack_yd?: number | null;
    bonus_rush_yd_100?: number | null;
    bonus_rush_rec_yd_200?: number | null;
    pass_fd?: number | null;
    bonus_rush_rec_yd_100?: number | null;
    yds_allow_300_349?: number | null;
    def_st_tkl_solo?: number | null;
    int_ret_yd?: number | null;
    def_pass_def?: number | null;
    rush_40p?: number | null;
    pass_td_40p?: number | null;
    bonus_rec_rb?: number | null;
    bonus_pass_cmp_25?: number | null;
    pass_cmp?: number | null;
    bonus_rec_yd_200?: number | null;
    qb_hit?: number | null;
    rush_fd?: number | null;
    bonus_pass_yd_300?: number | null;
    st_tkl_solo?: number | null;
    tkl_solo?: number | null;
    pass_att?: number | null;
    bonus_rush_yd_200?: number | null;
    pass_inc?: number | null;
    pass_cmp_40p?: number | null;
    fgmiss_30_39?: number | null;
    tkl_ast?: number | null;
    bonus_rush_att_20?: number | null;
    rush_att?: number | null;
    fgm?: number | null;
    fgmiss_40_49?: number | null;
    rush_td_40p?: number | null;
    rec_td_40p?: number | null;
    bonus_pass_yd_400?: number | null;
    fum_ret_yd?: number | null;
    pass_int_td?: number | null;
    bonus_rec_wr?: number | null;
    fgmiss_0_19?: number | null;
    yds_allow?: number | null;
    bonus_rec_yd_100?: number | null;
    def_2pt?: number | null;
    fgmiss_20_29?: number | null;
    rec_fd?: number | null;
  }
  export interface DivisionMetadata {
    division_2: string;
    division_1: string;
    division_2_avatar?: string | null;
    division_1_avatar?: string | null;
  }


  export enum ScoringAct {
    yds_allow_400_449,
    yds_allow_550p,
    yds_allow_100_199,
    pass_2pt,
    pass_int,
    fgmiss,
    rec_yd,
    xpmiss,
    def_pr_td,
    fgm_30_39,
    yds_allow_450_499,
    blk_kick,
    pts_allow_7_13,
    ff,
    fgm_20_29,
    fgm_40_49,
    pts_allow_1_6,
    st_fum_rec,
    pass_sack,
    yds_allow_500_549,
    def_st_ff,
    st_ff,
    yds_allow_0_100,
    yds_allow_350_399,
    pts_allow_28_34,
    fgm_50p,
    fum_rec,
    def_td,
    fgm_0_19,
    int,
    pts_allow_0,
    pts_allow_21_27,
    rec_2pt,
    rec,
    xpm,
    st_td,
    def_st_fum_rec,
    def_st_td,
    sack,
    fum_rec_td,
    rush_2pt,
    rec_td,
    pts_allow_35p,
    pts_allow_14_20,
    rush_yd,
    fgm_yds_over_30,
    pass_yd,
    pass_td,
    rush_td,
    def_kr_td,
    fum_lost,
    yds_allow_200_299,
    fum,
    safe,
    def_pr_yd,
    kr_yd,
    rec_30_39,
    def_kr_yd,
    bonus_rec_te,
    rec_20_29,
    rec_0_4,
    pr_td,
    kr_td,
    rec_5_9,
    rec_10_19,
    pr_yd,
    rec_40p,
    fg_ret_yd,
    tkl,
    tkl_loss,
    fgmiss_50p,
    fgm_yds,
    blk_kick_ret_yd,
    pts_allow,
    sack_yd,
    bonus_rush_yd_100,
    bonus_rush_rec_yd_200,
    pass_fd,
    bonus_rush_rec_yd_100,
    yds_allow_300_349,
    def_st_tkl_solo,
    int_ret_yd,
    def_pass_def,
    rush_40p,
    pass_td_40p,
    bonus_rec_rb,
    bonus_pass_cmp_25,
    pass_cmp,
    bonus_rec_yd_200,
    qb_hit,
    rush_fd,
    bonus_pass_yd_300,
    st_tkl_solo,
    tkl_solo,
    pass_att,
    bonus_rush_yd_200,
    pass_inc,
    pass_cmp_40p,
    fgmiss_30_39,
    tkl_ast,
    bonus_rush_att_20,
    rush_att,
    fgm,
    fgmiss_40_49,
    rush_td_40p,
    rec_td_40p,
    bonus_pass_yd_400,
    fum_ret_yd,
    pass_int_td,
    bonus_rec_wr,
    fgmiss_0_19,
    yds_allow,
    bonus_rec_yd_100,
    def_2pt,
    fgmiss_20_29,
    rec_fd,
  }
  