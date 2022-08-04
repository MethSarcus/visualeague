export interface SleeperUser {
    user_id: string;
    settings?: null;
    metadata: Metadata;
    league_id: string;
    is_owner: boolean;
    is_bot?: boolean | null;
    display_name: string;
    avatar: string;
  }
  export interface Metadata {
    user_message_pn?: string | null;
    transaction_waiver?: string | null;
    transaction_trade?: string | null;
    transaction_free_agent?: string | null;
    transaction_commissioner?: string | null;
    trade_block_pn?: string | null;
    team_name_update?: string | null;
    player_nickname_update?: string | null;
    player_like_pn?: string | null;
    mention_pn: string;
    mascot_message_emotion_leg_9?: string | null;
    mascot_message?: string | null;
    mascot_item_type_id_leg_9?: string | null;
    mascot_item_type_id_leg_18?: string | null;
    mascot_item_type_id_leg_17?: string | null;
    mascot_item_type_id_leg_16?: string | null;
    mascot_item_type_id_leg_15?: string | null;
    mascot_item_type_id_leg_14?: string | null;
    mascot_item_type_id_leg_13?: string | null;
    mascot_item_type_id_leg_12?: string | null;
    mascot_item_type_id_leg_11?: string | null;
    mascot_item_type_id_leg_10?: string | null;
    join_voice_pn?: string | null;
    archived?: string | null;
    allow_pn: string;
    team_name?: string | null;
    mascot_message_leg_3?: string | null;
    mascot_message_emotion_leg_3?: string | null;
    mascot_item_type_id_leg_8?: string | null;
    mascot_item_type_id_leg_7?: string | null;
    mascot_item_type_id_leg_6?: string | null;
    mascot_item_type_id_leg_5?: string | null;
    mascot_item_type_id_leg_4?: string | null;
    mascot_item_type_id_leg_3?: string | null;
    avatar?: string | null;
    allow_sms?: string | null;
    mascot_message_emotion_leg_6?: string | null;
    mascot_message_emotion_leg_1?: string | null;
    mascot_item_type_id_leg_1?: string | null;
    mascot_item_type_id_leg_2?: string | null;
    show_mascots?: string | null;
  }
  