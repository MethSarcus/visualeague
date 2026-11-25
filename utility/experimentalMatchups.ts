import League from '../classes/custom/League'
import {MatchupPlayer} from '../classes/custom/MatchupPlayer'
import {MatchupSide} from '../classes/custom/MatchupSide'
import {DatabasePlayer, PlayerScores} from '../classes/custom/Player'
import {getRosterSlotPositions, POSITION} from './rosterFunctions'

interface PlayerScore {
	id: string
	name: string
	score: number
}

interface Game {
	week: number
	team: MatchupSide
	opponent: MatchupSide
}

const rounded = (score: number) => Number(score.toFixed(2))
const outcome = (team: number, opponent: number) => team > opponent ? 'win' : team < opponent ? 'loss' : 'tie'

function playerScore(player: MatchupPlayer, week: number, details: Map<string, DatabasePlayer>, scores: Map<string, PlayerScores>): PlayerScore | undefined {
	const id = player.playerId
	if (!id || id === '0' || !Number.isFinite(player.score) || !scores.get(id)?.stats.has(week)) return
	const info = details.get(id)?.details
	return {id, name: info?.full_name || [info?.first_name, info?.last_name].filter(Boolean).join(' ') || `Player ${id}`, score: player.score}
}

function gamesFor(league: League, teamId: number): Game[] {
	return Array.from(league.weeks.values()).sort((a, b) => a.weekNumber - b.weekNumber).flatMap((week) =>
		Array.from(week.matchups.values()).flatMap((matchup) => {
			const home = matchup.homeTeam
			const away = matchup.awayTeam
			if (!away) return []
			if (home.roster_id === teamId) return [{week: week.weekNumber, team: home, opponent: away}]
			if (away.roster_id === teamId) return [{week: week.weekNumber, team: away, opponent: home}]
			return []
		}))
}

function usableGame(game: Game, scores: Map<string, PlayerScores>) {
	const hasStats = (side: MatchupSide) => side.starters.some((player) =>
		player.playerId && player.playerId !== '0' && scores.get(player.playerId)?.stats.has(game.week))
	return Number.isFinite(game.team.pf) && Number.isFinite(game.opponent.pf)
		&& !game.team.custom_points && !game.opponent.custom_points
		&& Boolean(hasStats(game.team)) && Boolean(hasStats(game.opponent))
}

export function butterflyEffect(league: League, teamId: number, details: Map<string, DatabasePlayer>, scores: Map<string, PlayerScores>) {
	const games = gamesFor(league, teamId).filter((game) => usableGame(game, scores))
	const results = games.map((game) => {
		const teamScore = rounded(game.team.pf)
		const opponentScore = rounded(game.opponent.pf)
		const original = outcome(teamScore, opponentScore)
		const swaps = game.team.starters.flatMap((starter, index) => {
			const slot = league.settings.roster_positions?.[index]
			if (!slot) return []
			const originalPlayer = starter.playerId === '0'
				? {id: '0', name: 'Empty slot', score: 0}
				: playerScore(starter, game.week, details, scores)
			if (!originalPlayer) return []
			const positions = getRosterSlotPositions(slot)
			return game.team.bench.flatMap((bench) => {
				const replacement = playerScore(bench, game.week, details, scores)
				if (!replacement) return []
				const info = details.get(replacement.id)?.details
				const eligible = [...(info?.fantasy_positions ?? []), ...(info?.position ? [info.position] : [])]
				if (!positions.some((position) => eligible.includes(position))) return []
				const newScore = rounded(teamScore - originalPlayer.score + replacement.score)
				const changed = outcome(newScore, opponentScore)
				return changed === original ? [] : [{starter: originalPlayer, bench: replacement, newScore, changed}]
			})
		}).sort((a, b) => (b.newScore - a.newScore) || a.bench.name.localeCompare(b.bench.name) || a.starter.name.localeCompare(b.starter.name))
		return {week: game.week, original, teamScore, opponentScore, swaps}
	})
	return {games: results, adjustedGames: gamesFor(league, teamId).length - games.length}
}

export function carryJobs(league: League, teamId: number, details: Map<string, DatabasePlayer>, scores: Map<string, PlayerScores>) {
	return Array.from(league.weeks.values()).sort((a, b) => a.weekNumber - b.weekNumber).flatMap((week) => {
		const side = week.getAllTeams().find((candidate) => candidate.roster_id === teamId)
		if (!side) return []
		if (side.starters.some((player) => !player.playerId)) return []
		const actualStarters = side.starters.filter((player) => player.playerId !== '0')
		const starters = actualStarters.map((player) => playerScore(player, week.weekNumber, details, scores))
		if (!starters.length || starters.some((player) => !player)) return []
		const recorded = starters.filter((player): player is PlayerScore => player !== undefined)
		const total = recorded.reduce((sum, player) => sum + player.score, 0)
		if (total <= 0) return []
		const leader = recorded.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))[0]
		return [{week: week.weekNumber, player: leader, total, share: leader.score / total * 100}]
	})
}

export function opponentTax(league: League, teamId: number, details: Map<string, DatabasePlayer>, scores: Map<string, PlayerScores>) {
	const groups = new Map<POSITION, {against: number[]; others: number[]}>()
	for (const week of league.weeks.values()) for (const matchup of week.matchups.values()) {
		if (!matchup.awayTeam) continue
		for (const [offense, defense] of [[matchup.homeTeam, matchup.awayTeam], [matchup.awayTeam, matchup.homeTeam]] as const) {
			for (const starter of offense.starters) {
				const player = playerScore(starter, week.weekNumber, details, scores)
				if (!player) continue
				const position = details.get(player.id)?.details.position
				if (!Object.values(POSITION).some((candidate) => candidate === position)) continue
				const key = Object.values(POSITION).find((candidate) => candidate === position)!
				const group = groups.get(key) ?? {against: [], others: []}
				group[defense.roster_id === teamId ? 'against' : 'others'].push(player.score)
				groups.set(key, group)
			}
		}
	}
	const avg = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
	return Array.from(groups, ([position, group]) => ({
		position, against: group.against.length ? avg(group.against) : undefined,
		baseline: group.others.length ? avg(group.others) : undefined,
		againstCount: group.against.length, baselineCount: group.others.length,
	})).filter((group) => group.againstCount > 0)
		.sort((a, b) => a.position.localeCompare(b.position))
}

export function revengeTour(league: League, teamId: number, details: Map<string, DatabasePlayer>, scores: Map<string, PlayerScores>) {
	const results: {week: number; player: PlayerScore; opponent: string; lastRostered: number}[] = []
	for (const game of gamesFor(league, teamId)) {
		for (const starter of game.opponent.starters) {
			const player = playerScore(starter, game.week, details, scores)
			if (!player) continue
			let lastRostered: number | undefined
			for (let index = 0; index < game.week - 1; index++) {
				const roster = league.allMatchups[index]?.find((side) => side.roster_id === teamId)
				if (roster && (roster.players?.includes(player.id) || roster.starters?.includes(player.id))) lastRostered = index + 1
			}
			if (lastRostered !== undefined) results.push({
				week: game.week, player, lastRostered,
				opponent: league.members.get(game.opponent.roster_id)?.teamName ?? `Team ${game.opponent.roster_id}`,
			})
		}
	}
	return results.sort((a, b) => b.player.score - a.player.score || a.week - b.week || a.player.name.localeCompare(b.player.name))
}

export function pointsGraveyard(league: League, teamId: number, details: Map<string, DatabasePlayer>, scores: Map<string, PlayerScores>) {
	return gamesFor(league, teamId).filter((game) => usableGame(game, scores)).flatMap((game) => {
		if (rounded(game.team.pf) >= rounded(game.opponent.pf)) return []
		return game.team.starters.flatMap((starter) => {
			const player = playerScore(starter, game.week, details, scores)
			return player ? [{week: game.week, player, teamScore: game.team.pf, opponentScore: game.opponent.pf}] : []
		})
	}).sort((a, b) => b.player.score - a.player.score || a.week - b.week || a.player.name.localeCompare(b.player.name))
}

export function teamDNA(league: League, teamId: number, details: Map<string, DatabasePlayer>, scores: Map<string, PlayerScores>) {
	const carries = carryJobs(league, teamId, details, scores)
	const games = gamesFor(league, teamId).filter((game) => usableGame(game, scores))
	const close = games.filter(({team, opponent}) => Math.abs(rounded(team.pf) - rounded(opponent.pf)) <= 10)
	const blowouts = games.filter(({team, opponent}) => Math.abs(rounded(team.pf) - rounded(opponent.pf)) >= 30)
	const closeWins = close.filter(({team, opponent}) => rounded(team.pf) > rounded(opponent.pf)).length
	const bigWins = blowouts.filter(({team, opponent}) => rounded(team.pf) > rounded(opponent.pf)).length
	return {carries, games, close, blowouts, closeWins, bigWins}
}
