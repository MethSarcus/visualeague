export interface OddsTeam {
	id: number
	wins: number
	losses: number
	ties: number
	pf: number
	divisionId?: number
	// Expected weekly score and its spread
	mean: number
	stdDev: number
}

export interface ScheduleEntry {
	week: number
	opponentId: number
	played: boolean
	// Played games only
	teamScore?: number
	opponentScore?: number
	result?: 'W' | 'L' | 'T'
	// Future games only: chance the team wins
	winProb?: number
}

// Normal approximation using each team's mean weekly score and spread
export function winProbability(team: OddsTeam, opponent: OddsTeam): number {
	const z = (team.mean - opponent.mean) / Math.sqrt(team.stdDev ** 2 + opponent.stdDev ** 2)
	const x = Math.abs(z) / Math.SQRT2
	const t = 1 / (1 + 0.3275911 * x)
	const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
	const erf = 1 - poly * Math.exp(-x * x)
	return 0.5 * (1 + Math.sign(z) * erf)
}

export interface TeamOdds {
	id: number
	playoffPct: number
	expectedWins: number
	// Most frequent final record across simulations, with the average final PF for tiebreaks
	projected: {wins: number; losses: number; ties: number; pf: number}
	// seedPct[i] is the share of simulations where the team finished seed i + 1
	seedPct: number[]
}

export interface SimulationInput {
	teams: OddsTeam[]
	// Remaining regular season matchups as [rosterId, rosterId] pairs
	remaining: [number, number][]
	playoffTeams: number
	// Top N teams in each division qualify first; remaining spots go to the best records overall
	divisionSpots?: number
	// Division leaders take the top seeds ahead of wild cards; implies at least one spot per division
	divisionWinnersFirst?: boolean
	simulations?: number
	seed?: number
}

function mulberry32(seed: number) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

export interface SeedingInput {
	wins: number[]
	pf: number[]
	divisionIds: (number | undefined)[]
	playoffTeams: number
	divisionSpots?: number
	divisionWinnersFirst?: boolean
}

// Returns team indices ordered by seed; the first `playoffTeams` entries qualify
export function seedTeams({
	wins,
	pf,
	divisionIds,
	playoffTeams,
	divisionSpots: requestedDivisionSpots = 0,
	divisionWinnersFirst = false,
}: SeedingInput): number[] {
	const divisionSpots = Math.max(requestedDivisionSpots, divisionWinnersFirst ? 1 : 0)
	const byRecord = wins.map((_, i) => i).sort((x, y) => wins[y] - wins[x] || pf[y] - pf[x])
	const qualifiers: number[] = []
	if (divisionSpots > 0) {
		const perDivision = new Map<number | undefined, number>()
		byRecord.forEach((teamIndex) => {
			const division = divisionIds[teamIndex]
			const count = perDivision.get(division) ?? 0
			if (count < divisionSpots && qualifiers.length < playoffTeams) {
				qualifiers.push(teamIndex)
				perDivision.set(division, count + 1)
			}
		})
	}
	byRecord.forEach((teamIndex) => {
		if (qualifiers.length < playoffTeams && !qualifiers.includes(teamIndex)) qualifiers.push(teamIndex)
	})
	// Qualifiers are seeded by record among themselves, then everyone else
	const seededQualifiers = byRecord.filter((i) => qualifiers.includes(i))
	if (divisionWinnersFirst) {
		const seenDivisions = new Set<number | undefined>()
		const winners = seededQualifiers.filter((i) => {
			const division = divisionIds[i]
			if (seenDivisions.has(division)) return false
			seenDivisions.add(division)
			return true
		})
		seededQualifiers.splice(0, seededQualifiers.length, ...winners, ...seededQualifiers.filter((i) => !winners.includes(i)))
	}
	return [...seededQualifiers, ...byRecord.filter((i) => !qualifiers.includes(i))]
}

export interface BracketMatch {
	// Seed numbers (1-based); null means a bye or a team still to be decided
	top: number | null
	bottom: number | null
}

// Standard single-elimination bracket: 1 plays the lowest seed, top seeds get byes when the field isn't a power of two
export function buildBracket(teamCount: number): BracketMatch[][] {
	if (teamCount < 2) return []
	let size = 2
	while (size < teamCount) size *= 2
	let order = [1, 2]
	while (order.length < size) {
		const total = order.length * 2 + 1
		order = order.flatMap((seedNumber) => [seedNumber, total - seedNumber])
	}
	const seedOrNull = (seedNumber: number) => (seedNumber <= teamCount ? seedNumber : null)
	const rounds: BracketMatch[][] = []
	rounds.push(
		Array.from({length: size / 2}, (_, i) => ({
			top: seedOrNull(order[i * 2]),
			bottom: seedOrNull(order[i * 2 + 1]),
		}))
	)
	for (let matches = size / 4; matches >= 1; matches /= 2) {
		const previous = rounds[rounds.length - 1]
		// Only first-round byes produce a known advancing team before games are played
		const isFirstRound = rounds.length === 1
		const advancing = (match: BracketMatch) => (isFirstRound && match.bottom == null ? match.top : null)
		rounds.push(
			Array.from({length: matches}, (_, i) => ({
				top: advancing(previous[i * 2]),
				bottom: advancing(previous[i * 2 + 1]),
			}))
		)
	}
	return rounds
}

export function simulatePlayoffOdds({
	teams,
	remaining,
	playoffTeams,
	divisionSpots: requestedDivisionSpots = 0,
	divisionWinnersFirst = false,
	simulations = 5000,
	seed = 20240901,
}: SimulationInput): TeamOdds[] {
	const rand = mulberry32(seed)
	const divisionSpots = Math.max(requestedDivisionSpots, divisionWinnersFirst ? 1 : 0)
	const normal = () => {
		const u = Math.max(rand(), Number.EPSILON)
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
	}

	const n = teams.length
	const indexById = new Map(teams.map((t, i) => [t.id, i]))
	const seedCounts = teams.map(() => new Array<number>(n).fill(0))
	const winTotals = new Array<number>(n).fill(0)
	const pfTotals = new Array<number>(n).fill(0)
	// Final wins in half-win units, so a tie is 1
	const winHistograms = teams.map(() => new Map<number, number>())
	const gamesTotal = teams.map((t) => t.wins + t.losses + t.ties)
	remaining.forEach(([homeId, awayId]) => {
		const h = indexById.get(homeId)
		const a = indexById.get(awayId)
		if (h != undefined && a != undefined) {
			gamesTotal[h] += 1
			gamesTotal[a] += 1
		}
	})

	for (let s = 0; s < simulations; s++) {
		const wins = teams.map((t) => t.wins + t.ties / 2)
		const pf = teams.map((t) => t.pf)

		for (const [homeId, awayId] of remaining) {
			const h = indexById.get(homeId)
			const a = indexById.get(awayId)
			if (h == undefined || a == undefined) continue
			const homeScore = teams[h].mean + teams[h].stdDev * normal()
			const awayScore = teams[a].mean + teams[a].stdDev * normal()
			pf[h] += homeScore
			pf[a] += awayScore
			if (homeScore > awayScore) wins[h] += 1
			else if (awayScore > homeScore) wins[a] += 1
			else {
				wins[h] += 0.5
				wins[a] += 0.5
			}
		}

		const order = seedTeams({
			wins,
			pf,
			divisionIds: teams.map((t) => t.divisionId),
			playoffTeams,
			divisionSpots,
			divisionWinnersFirst,
		})
		order.forEach((teamIndex, seedIndex) => {
			seedCounts[teamIndex][seedIndex] += 1
		})
		wins.forEach((w, i) => {
			winTotals[i] += w
			pfTotals[i] += pf[i]
			const key = Math.round(w * 2)
			winHistograms[i].set(key, (winHistograms[i].get(key) ?? 0) + 1)
		})
	}

	return teams.map((team, i) => {
		const seedPct = seedCounts[i].map((count) => count / simulations)
		let modeKey = 0
		let modeCount = -1
		winHistograms[i].forEach((count, key) => {
			if (count > modeCount || (count === modeCount && key > modeKey)) {
				modeKey = key
				modeCount = count
			}
		})
		const projectedWins = Math.floor(modeKey / 2)
		const projectedTies = modeKey % 2
		return {
			id: team.id,
			playoffPct: seedPct.slice(0, playoffTeams).reduce((sum, p) => sum + p, 0),
			expectedWins: winTotals[i] / simulations,
			projected: {
				wins: projectedWins,
				losses: Math.max(gamesTotal[i] - projectedWins - projectedTies, 0),
				ties: projectedTies,
				pf: pfTotals[i] / simulations,
			},
			seedPct,
		}
	})
}
