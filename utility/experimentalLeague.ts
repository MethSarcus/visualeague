import League from '../classes/custom/League'
import {DatabasePlayer, PlayerScores} from '../classes/custom/Player'

export interface ExperimentalPlayer {
	id: string
	name: string
	score: number
}

export interface ExperimentalWeek {
	week: number
	starters: ExperimentalPlayer[]
	bench: ExperimentalPlayer[]
}

export interface ExperimentalTeam {
	id: number
	name: string
	weeks: ExperimentalWeek[]
	players: ExperimentalPlayer[]
}

export function experimentalTeams(
	league: League,
	details: Map<string, DatabasePlayer>,
	scores: Map<string, PlayerScores>
): ExperimentalTeam[] {
	const teams: ExperimentalTeam[] = Array.from(league.members, ([id, member]) => ({
		id, name: member.teamName, weeks: [], players: [],
	})).sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id)
	const byId = new Map(teams.map((team) => [team.id, team]))
	const totals = new Map<number, Map<string, ExperimentalPlayer>>()
	const weeks = Array.from(league.weeks.values()).sort((a, b) => a.weekNumber - b.weekNumber)
	for (const week of weeks) {
		for (const side of week.getAllTeams()) {
			const team = byId.get(side.roster_id)
			if (!team) continue
			const playerFor = (player: typeof side.starters[number]): ExperimentalPlayer | undefined => {
				const id = player.playerId
				if (!id || id === '0' || !Number.isFinite(player.score) || !scores.get(id)?.stats.has(week.weekNumber)) return
				const playerDetails = details.get(id)?.details
				const name = playerDetails?.full_name || [playerDetails?.first_name, playerDetails?.last_name].filter(Boolean).join(' ') || `Player ${id}`
				return {id, name, score: player.score}
			}
			const starters = side.starters.map(playerFor).filter((player): player is ExperimentalPlayer => player !== undefined)
			const bench = side.bench.map(playerFor).filter((player): player is ExperimentalPlayer => player !== undefined)
			team.weeks.push({week: week.weekNumber, starters, bench})
			const playerTotals = totals.get(team.id) ?? new Map<string, ExperimentalPlayer>()
			for (const player of starters) {
				const existing = playerTotals.get(player.id)
				if (existing) existing.score += player.score
				else playerTotals.set(player.id, {...player})
			}
			totals.set(team.id, playerTotals)
		}
	}
	for (const team of teams) {
		team.players = Array.from(totals.get(team.id)?.values() ?? [])
			.filter((player) => player.score > 0)
			.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
	}
	return teams
}

export function scoreTwins(team: ExperimentalTeam) {
	return team.weeks.flatMap(({week, starters}) => {
		const pairs = starters.flatMap((first, index) => starters.slice(index + 1)
			.filter((second) => first.id !== second.id)
			.map((second) => ({week, first, second, difference: Math.abs(first.score - second.score)})))
		pairs.sort((a, b) => a.difference - b.difference)
		return pairs.length ? [pairs[0]] : []
	})
}

export function starterBenchAverages(team: ExperimentalTeam) {
	const players = new Map<string, {id: string; name: string; starts: number[]; bench: number[]}>()
	for (const week of team.weeks) {
		for (const [kind, appearances] of [['starts', week.starters], ['bench', week.bench]] as const) {
			for (const player of appearances) {
				const entry = players.get(player.id) ?? {id: player.id, name: player.name, starts: [], bench: []}
				entry[kind].push(player.score)
				players.set(player.id, entry)
			}
		}
	}
	const average = (values: number[]) => values.reduce((sum, score) => sum + score, 0) / values.length
	return Array.from(players.values()).filter((player) => player.starts.length && player.bench.length)
		.map((player) => ({
			id: player.id, name: player.name,
			startAverage: average(player.starts), benchAverage: average(player.bench),
			startCount: player.starts.length, benchCount: player.bench.length,
		})).sort((a, b) => Math.abs(b.startAverage - b.benchAverage) - Math.abs(a.startAverage - a.benchAverage)
			|| a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
}

export function teamFunFacts(team: ExperimentalTeam) {
	const fmt = (value: number) => value.toFixed(2)
	const streaks = new Map<string, {name: string; last: number; current: number}>()
	let longest: {name: string; count: number; end: number} | undefined
	let duo: {first: ExperimentalPlayer; second: ExperimentalPlayer; score: number; week: number} | undefined
	let feast: {count: number; week: number} | undefined
	let promotion: {player: ExperimentalPlayer; previous: number; week: number} | undefined
	let negativePlayers = 0
	const negativeWeeks = new Set<number>()
	let previousWeek: ExperimentalWeek | undefined
	for (const week of team.weeks) {
		const count = week.starters.filter((player) => player.score >= 10).length
		if (week.starters.length && (!feast || count > feast.count)) feast = {count, week: week.week}
		for (const [index, player] of week.starters.entries()) {
			const streak = streaks.get(player.id)
			const current = streak && streak.last === week.week - 1 ? streak.current + 1 : 1
			streaks.set(player.id, {name: player.name, last: week.week, current})
			if (!longest || current > longest.count) longest = {name: player.name, count: current, end: week.week}
			if (player.score < 0) {
				negativePlayers++
				negativeWeeks.add(week.week)
			}
			for (const second of week.starters.slice(index + 1)) {
				const score = player.score + second.score
				if (!duo || score > duo.score) duo = {first: player, second, score, week: week.week}
			}
			if (previousWeek?.week === week.week - 1) {
				const prior = previousWeek.bench.find((benchPlayer) => benchPlayer.id === player.id)
				if (prior && (!promotion || player.score - prior.score > promotion.player.score - promotion.previous)) {
					promotion = {player, previous: prior.score, week: week.week}
				}
			}
		}
		previousWeek = week
	}
	return [
		{title: 'Ride or die', text: longest ? `${longest.name} appeared in the starting lineup ${longest.count} consecutive recorded ${longest.count === 1 ? 'week' : 'weeks'}, ending in Week ${longest.end} — the longest streak.` : 'No recorded starter scores yet.'},
		{title: 'Dynamic duo', text: duo ? `${duo.first.name} and ${duo.second.name} combined for ${fmt(duo.score)} starter points in Week ${duo.week}, the most by any pair.` : 'No week with two recorded starters yet.'},
		{title: 'Everybody eats', text: feast ? `${feast.count} recorded ${feast.count === 1 ? 'starter reached' : 'starters reached'} 10 points in Week ${feast.week}, the most in one week.` : 'No recorded starter scores yet.'},
		{title: 'Bench-to-start change', text: promotion ? `${promotion.player.name} went from ${fmt(promotion.previous)} points on the bench to ${fmt(promotion.player.score)} as a starter in Week ${promotion.week}, the largest increase (or smallest drop) from the previous week.` : 'No consecutive bench-to-start appearances with recorded scores yet.'},
		{title: 'Below zero', text: feast ? `${negativePlayers} recorded starter ${negativePlayers === 1 ? 'score was' : 'scores were'} negative across ${negativeWeeks.size} ${negativeWeeks.size === 1 ? 'week' : 'weeks'}.` : 'No recorded starter scores yet.'},
	]
}
