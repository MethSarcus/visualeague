/**
 * Shared "is this stat good/bad/neutral" border color used across the
 * various stat card components (TeamStatCard, MatchupStatCard,
 * TeamPersonalStatCard, TeamPlayerStatCard, etc).
 */
export function getGoodBadBorderColor(isGoodThing: boolean | null | undefined) {
	if (isGoodThing == null) {
		return 'grey'
	}
	return isGoodThing ? 'rgb(151,245,143, .8)' : '#B00020'
}

/**
 * Builds the sleeper CDN avatar/image src for a player id. Defense teams
 * (DEF) use team logo images instead of player headshots, and are keyed
 * by team abbreviation rather than a numeric sleeper player id.
 */
export function getPlayerAvatarSrc(playerId: string | undefined) {
	if (!playerId) {
		return 'https://sleepercdn.com/images/v2/icons/player_default.webp'
	}
	return isNaN(+playerId)
		? `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`
		: `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`
}
