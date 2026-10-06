'use client'
import {Avatar, Box, Button, Flex, Grid, GridItem, Heading, NumberInput, NumberInputField, Spinner, Switch, Text, Tooltip} from '@chakra-ui/react'
import axios from 'axios'
import {useMemo, useState} from 'react'
import useSWR from 'swr'
import League from '../../classes/custom/League'
import {SleeperMatchup} from '../../classes/sleeper/SleeperMatchup'
import {OddsTeam, ScheduleEntry, simulatePlayoffOdds, winProbability} from '../../utility/playoffOdds'
import PlayoffPicture from './PlayoffPicture'
import {standardDeviation, TIE_CONST} from '../../utility/rosterFunctions'

interface MyProps {
	league: League | undefined
}

// Recent weeks count more since rosters change during the season
const RECENCY_DECAY = 0.9
const MIN_STD_DEV = 10
const FALLBACK_MEAN = 100
const FALLBACK_STD_DEV = 20

const fetchSchedule = async (leagueId: string, firstWeek: number, lastWeek: number) => {
	const requests = []
	for (let week = firstWeek; week <= lastWeek; week++) {
		requests.push(
			axios
				.get<SleeperMatchup[]>(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`)
				.then((res) => res.data)
		)
	}
	return Promise.all(requests)
}

const PlayoffOdds = ({league}: MyProps) => {
	const playoffStart = league?.settings?.settings?.playoff_week_start ?? 0
	const settingsPlayoffTeams = league?.settings?.settings?.playoff_teams ?? 0
	const numDivisions = league?.settings?.settings?.divisions ?? 0
	const numMembers = league?.members?.size ?? 0
	// Inputs are edited as text and only take effect when Apply is pressed
	const [teamsText, setTeamsText] = useState<string | undefined>()
	const [spotsText, setSpotsText] = useState('0')
	const [winnersFirstDraft, setWinnersFirstDraft] = useState(false)
	const [applied, setApplied] = useState<{teams?: number; spots: number; winnersFirst: boolean}>({
		spots: 0,
		winnersFirst: false,
	})
	const playoffTeams = applied.teams ?? settingsPlayoffTeams
	const divisionSpots = applied.spots
	const divisionWinnersFirst = applied.winnersFirst
	const lastScored = league?.settings?.settings?.last_scored_leg ?? 0
	const firstUnplayed = Math.min(lastScored, playoffStart - 1) + 1
	const lastRegularWeek = playoffStart - 1
	const hasRemaining = playoffStart > 0 && firstUnplayed <= lastRegularWeek

	const {data: schedule, error} = useSWR(
		league?.settings?.league_id && hasRemaining
			? `schedule-${league.settings.league_id}-${firstUnplayed}-${lastRegularWeek}`
			: null,
		() => fetchSchedule(league!.settings.league_id, firstUnplayed, lastRegularWeek),
		{revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false}
	)

	const results = useMemo(() => {
		if (!league?.members?.size || playoffStart <= 0 || playoffTeams <= 0) return undefined
		if (hasRemaining && schedule == undefined) return undefined

		const teams = new Map<number, OddsTeam & {scores: number[]}>()
		const schedules = new Map<number, ScheduleEntry[]>()
		league.members.forEach((member) => {
			const id = member.roster.roster_id
			schedules.set(id, [])
			teams.set(id, {id, wins: 0, losses: 0, ties: 0, pf: 0, mean: 0, stdDev: 0, scores: [], divisionId: member.division_id})
		})

		const weekNumbers = Array.from(league.weeks.keys())
			.filter((weekNum) => weekNum < playoffStart)
			.sort((a, b) => a - b)
		weekNumbers.forEach((weekNum) => {
			const week = league.weeks.get(weekNum)!
			week.matchups.forEach((matchup) => {
				if (!matchup.awayTeam) return
				const home = teams.get(matchup.homeTeam.roster_id)
				const away = teams.get(matchup.awayTeam.roster_id)
				if (!home || !away) return
				const homeScore = matchup.homeTeam.pf
				const awayScore = matchup.awayTeam.pf
				const resultFor = (id: number) =>
					matchup.winnerRosterId === TIE_CONST ? 'T' : matchup.winnerRosterId === id ? 'W' : 'L'
				schedules.get(home.id)?.push({
					week: weekNum,
					opponentId: away.id,
					played: true,
					teamScore: homeScore,
					opponentScore: awayScore,
					result: resultFor(home.id),
				})
				schedules.get(away.id)?.push({
					week: weekNum,
					opponentId: home.id,
					played: true,
					teamScore: awayScore,
					opponentScore: homeScore,
					result: resultFor(away.id),
				})
				if (matchup.winnerRosterId === TIE_CONST) {
					home.ties += 1
					away.ties += 1
				} else if (matchup.winnerRosterId === home.id) {
					home.wins += 1
					away.losses += 1
				} else if (matchup.winnerRosterId === away.id) {
					away.wins += 1
					home.losses += 1
				}
			})
			week.getAllTeams().forEach((side) => {
				const team = teams.get(side.roster_id)
				if (!team) return
				team.pf += side.pf
				team.scores.push(side.pf)
			})
		})

		const oddsTeams: OddsTeam[] = Array.from(teams.values()).map((team) => {
			const count = team.scores.length
			if (count === 0) return {...team, mean: FALLBACK_MEAN, stdDev: FALLBACK_STD_DEV}
			let weightSum = 0
			let weighted = 0
			team.scores.forEach((score, i) => {
				const weight = Math.pow(RECENCY_DECAY, count - 1 - i)
				weightSum += weight
				weighted += weight * score
			})
			const stdDev = count > 1 ? standardDeviation(team.scores) : FALLBACK_STD_DEV
			return {...team, mean: weighted / weightSum, stdDev: Math.max(stdDev, MIN_STD_DEV)}
		})

		const remaining: [number, number][] = []
		const futureGames: {week: number; a: number; b: number}[] = []
		schedule?.forEach((weekMatchups, weekIndex) => {
			const byMatchup = new Map<number, number[]>()
			weekMatchups.forEach((m) => {
				if (m.matchup_id == undefined) return
				byMatchup.set(m.matchup_id, [...(byMatchup.get(m.matchup_id) ?? []), m.roster_id])
			})
			byMatchup.forEach((ids) => {
				if (ids.length === 2) {
					remaining.push([ids[0], ids[1]])
					futureGames.push({week: firstUnplayed + weekIndex, a: ids[0], b: ids[1]})
				}
			})
		})

		const oddsById = new Map(oddsTeams.map((team) => [team.id, team]))
		futureGames.forEach(({week, a, b}) => {
			const teamA = oddsById.get(a)
			const teamB = oddsById.get(b)
			if (!teamA || !teamB) return
			const probA = winProbability(teamA, teamB)
			schedules.get(a)?.push({week, opponentId: b, played: false, winProb: probA})
			schedules.get(b)?.push({week, opponentId: a, played: false, winProb: 1 - probA})
		})
		schedules.forEach((entries) => entries.sort((x, y) => x.week - y.week))

		const odds = simulatePlayoffOdds({teams: oddsTeams, remaining, playoffTeams, divisionSpots, divisionWinnersFirst})
		return {
			rows: odds
				.map((odd) => ({odd, team: teams.get(odd.id)!}))
				.sort((a, b) => b.odd.playoffPct - a.odd.playoffPct || b.odd.expectedWins - a.odd.expectedWins),
			teams: oddsTeams.map((team) => {
				const projected = odds.find((odd) => odd.id === team.id)!.projected
				return {...team, ...projected}
			}),
			schedules,
		}
	}, [league, schedule, hasRemaining, playoffStart, playoffTeams, divisionSpots, divisionWinnersFirst, firstUnplayed])

	if (league?.members == undefined) return <Spinner />
	if (playoffStart <= 0 || playoffTeams <= 0) return null
	if (error) {
		return (
			<Text color='textTheme.highEmphasis' textAlign='center'>
				Could not load the remaining schedule
			</Text>
		)
	}
	if (results == undefined) return <Spinner />

	const seedCount = results.rows.length
	const clampInt = (text: string | undefined, fallback: number, min: number, max: number) => {
		const parsed = parseInt(text ?? '', 10)
		return Number.isNaN(parsed) ? fallback : Math.min(Math.max(parsed, min), max)
	}
	const draftTeams = clampInt(teamsText, settingsPlayoffTeams, 1, numMembers)
	const draftSpots = clampInt(spotsText, 0, 0, numMembers)
	const canApply =
		draftTeams !== playoffTeams || draftSpots !== divisionSpots || winnersFirstDraft !== divisionWinnersFirst
	const columns = `minmax(130px, 1.4fr) 60px minmax(90px, 1fr) 55px repeat(${seedCount}, minmax(26px, 1fr))`

	return (
		<Flex direction='column' gap={3}>
		<Box bg='surface.1' borderRadius='md' p={4} overflowX='auto'>
			<Heading size='md' color='white' textAlign='center' mb={1}>
				Playoff Odds
			</Heading>
			<Text fontSize='xs' color='textTheme.mediumEmphasis' textAlign='center' mb={3}>
				{hasRemaining
					? `Simulated 5,000 times from each team's recent scoring. ${
						divisionSpots > 0 || divisionWinnersFirst
							? `${playoffTeams} make the playoffs: top ${Math.max(divisionSpots, divisionWinnersFirst ? 1 : 0)} per division, then best records${divisionWinnersFirst ? '. Division winners seeded first' : ''}.`
							: `Top ${playoffTeams} make the playoffs.`
					}`
					: 'Regular season complete. Final standings.'}
			</Text>
			<Flex justify='center' align='center' gap={6} mb={3} wrap='wrap' fontSize='xs' color='textTheme.mediumEmphasis'>
				<Flex align='center' gap={2}>
					<Text>Playoff teams</Text>
					<NumberInput
						size='xs'
						w='60px'
						min={1}
						max={numMembers}
						value={teamsText ?? String(settingsPlayoffTeams)}
						onChange={setTeamsText}
					>
						<NumberInputField color='white' />
					</NumberInput>
				</Flex>
				{numDivisions > 1 && (
					<>
						<Tooltip
							hasArrow
							label='Top N teams in each division get an automatic spot. Remaining spots go to the best records.'
						>
							<Flex align='center' gap={2}>
								<Text>Auto spots per division</Text>
								<NumberInput
									size='xs'
									w='60px'
									min={0}
									max={numMembers}
									value={spotsText}
									onChange={setSpotsText}
								>
									<NumberInputField color='white' />
								</NumberInput>
							</Flex>
						</Tooltip>
						<Tooltip hasArrow label='Division leaders get the top seeds ahead of wild cards, even with a worse record.'>
							<Flex align='center' gap={2}>
								<Text>Division winners seeded first</Text>
								<Switch
									size='sm'
									isChecked={winnersFirstDraft}
									onChange={(e) => setWinnersFirstDraft(e.target.checked)}
								/>
							</Flex>
						</Tooltip>
					</>
				)}
				<Button
					size='xs'
					colorScheme='teal'
					isDisabled={!canApply}
					onClick={() => {
						setApplied({teams: draftTeams, spots: draftSpots, winnersFirst: winnersFirstDraft})
						setTeamsText(String(draftTeams))
						setSpotsText(String(draftSpots))
					}}
				>
					Apply
				</Button>
			</Flex>
			<Grid templateColumns={columns} gap='4px' alignItems='center' minW='640px'>
				<Header>Team</Header>
				<Header>Record</Header>
				<Header>Playoffs</Header>
				<Header>Exp W</Header>
				{Array.from({length: seedCount}, (_, i) => (
					<Header key={i}>{i + 1}</Header>
				))}
				{results.rows.map(({odd, team}) => {
					const member = league.members.get(odd.id)
					const percent = Math.round(odd.playoffPct * 100)
					// Avoid showing a certainty the simulation can't guarantee
					const percentLabel =
						odd.playoffPct < 1 && percent === 100 ? '>99%' : odd.playoffPct > 0 && percent === 0 ? '<1%' : `${percent}%`
					return (
						<Row key={odd.id}>
							<GridItem>
								<Flex align='center' gap={2} minW={0}>
									<Avatar size='xs' src={member?.getTeamAvatar()} name={member?.name} />
									<Text fontSize='sm' color='white' noOfLines={1}>
										{member?.name}
									</Text>
								</Flex>
							</GridItem>
							<GridItem textAlign='center' fontSize='sm' color='white'>
								{team.wins}-{team.losses}
								{team.ties > 0 ? `-${team.ties}` : ''}
							</GridItem>
							<GridItem>
								<Flex align='center' gap={2}>
									<Box flex={1} h='8px' bg='whiteAlpha.100' borderRadius='full' overflow='hidden'>
										<Box h='100%' w={`${percent}%`} bg='secondary.300' />
									</Box>
									<Text fontSize='xs' color='white' w='42px' textAlign='right' whiteSpace='nowrap'>
										{percentLabel}
									</Text>
								</Flex>
							</GridItem>
							<GridItem textAlign='center' fontSize='sm' color='white'>
								{odd.expectedWins.toFixed(1)}
							</GridItem>
							{odd.seedPct.map((pct, i) => (
								<Tooltip
									key={i}
									label={`${member?.name}: seed ${i + 1} in ${(pct * 100).toFixed(1)}% of simulations`}
									hasArrow
								>
									<GridItem
										h='26px'
										borderRadius='sm'
										display='flex'
										alignItems='center'
										justifyContent='center'
										fontSize='10px'
										color='white'
										bg={`rgba(${i < playoffTeams ? '94, 234, 212' : '248, 113, 113'}, ${Math.min(pct * 1.2, 1) * 0.85})`}
									>
										{pct >= 0.05 ? Math.round(pct * 100) : ''}
									</GridItem>
								</Tooltip>
							))}
						</Row>
					)
				})}
			</Grid>
		</Box>
		<PlayoffPicture
			league={league}
			teams={results.teams}
			schedules={results.schedules}
			playoffTeams={playoffTeams}
			divisionSpots={divisionSpots}
			divisionWinnersFirst={divisionWinnersFirst}
		/>
		</Flex>
	)
}

const Header = ({children}: {children: React.ReactNode}) => (
	<GridItem textAlign='center' fontSize='xs' color='textTheme.mediumEmphasis' fontWeight='bold'>
		{children}
	</GridItem>
)

// Rows are fragments of grid items so columns stay aligned
const Row = ({children}: {children: React.ReactNode}) => <>{children}</>

export default PlayoffOdds
