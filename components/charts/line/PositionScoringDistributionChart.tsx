import {Avatar, Box, Heading, HStack, Radio, RadioGroup, SimpleGrid, Skeleton, Stack, Text, VStack} from '@chakra-ui/react'
import {LineSeries, ResponsiveLine} from '@nivo/line'
import {useMemo, useState} from 'react'
import League from '../../../classes/custom/League'
import LeagueMember from '../../../classes/custom/LeagueMember'
import {DatabasePlayer, PlayerScores} from '../../../classes/custom/Player'
import {Week} from '../../../classes/custom/Week'
import {POSITION} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'
import {getPlayerAvatarSrc} from '../../../utility/statCardHelpers'

interface DistributionPoint {
	x: number
	y: number
}

export interface PositionScoringDistribution {
	position: POSITION
	sampleCount: number
	mean: number
	minimum: number
	maximum: number
	standardDeviation: number
	curve: DistributionPoint[]
}

const curvePoints = 49
const format = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

function densityAtScore(distribution: Pick<PositionScoringDistribution, 'mean' | 'standardDeviation'>, score: number) {
	const z = (score - distribution.mean) / distribution.standardDeviation
	return Math.exp(-0.5 * z ** 2) / (distribution.standardDeviation * Math.sqrt(2 * Math.PI))
}

interface PlayerGame {
	playerId: string
	name: string
	position: POSITION
	week: number
	score: number
}

interface PlayerHighlights {
	highestGames: PlayerGame[]
	topAverages: {playerId: string; name: string; average: number; games: number}[]
}

export function positionPlayerHighlights(
	weeks: Iterable<Week>,
	playerScores: Map<string, PlayerScores>,
	playerDetails: Map<string, DatabasePlayer>
): Map<POSITION, PlayerHighlights> {
	const positions = Object.values(POSITION)
	const gamesByPlayer = new Map<string, Map<number, PlayerGame>>()
	for (const week of weeks) {
		for (const team of week.getAllTeams()) {
			for (const player of [...team.starters, ...team.bench]) {
				const id = player.playerId
				if (!id || id === '0') continue
				const details = playerDetails.get(id)?.details
				const score = playerScores.get(id)?.stats.get(week.weekNumber)
				if (!details || score === undefined || !Number.isFinite(score)) continue
				const position = positions.find((candidate) => candidate === details.position)
					?? positions.find((candidate) => player.eligiblePositions.includes(candidate))
				if (!position) continue
				const name = [details.first_name, details.last_name].filter(Boolean).join(' ')
					|| details.full_name || `Player ${id}`
				const games = gamesByPlayer.get(id) ?? new Map<number, PlayerGame>()
				games.set(week.weekNumber, {playerId: id, name, position, week: week.weekNumber, score})
				gamesByPlayer.set(id, games)
			}
		}
	}

	const result = new Map<POSITION, PlayerHighlights>()
	for (const position of positions) {
		const playerGames = Array.from(gamesByPlayer.values()).map((games) =>
			Array.from(games.values()).filter((game) => game.position === position)).filter((games) => games.length > 0)
		const games = playerGames.flat()
		if (!games.length) continue
		const highestScore = Math.max(...games.map((game) => game.score))
		const highestGames = games.filter((game) => game.score === highestScore)
			.sort((a, b) => a.name.localeCompare(b.name) || a.week - b.week || a.playerId.localeCompare(b.playerId))
		const averages = playerGames.filter((player) => player.length >= 3).map((player) => ({
			playerId: player[0].playerId,
			name: player[0].name,
			average: player.reduce((sum, game) => sum + game.score, 0) / player.length,
			games: player.length,
		}))
		const highestAverage = Math.max(...averages.map((player) => player.average))
		const topAverages = averages.filter((player) => player.average === highestAverage)
			.sort((a, b) => a.name.localeCompare(b.name) || a.playerId.localeCompare(b.playerId))
		result.set(position, {highestGames, topAverages})
	}
	return result
}

export function positionScoringDistributions(weeks: Iterable<Week>): PositionScoringDistribution[] {
	const scoresByPosition = new Map<POSITION, number[]>()
	const knownPositions = Object.values(POSITION) as POSITION[]

	for (const week of weeks) {
		for (const team of week.getAllTeams()) {
			for (const starter of team.starters) {
				if (!starter.playerId || starter.playerId === '0' || !Number.isFinite(starter.score)) continue
				const position = starter.eligiblePositions.find((eligiblePosition) =>
					knownPositions.includes(eligiblePosition as POSITION))
				if (!position) continue

				const scores = scoresByPosition.get(position as POSITION) ?? []
				scores.push(starter.score)
				scoresByPosition.set(position as POSITION, scores)
			}
		}
	}

	return knownPositions.flatMap((position) => {
		const scores = scoresByPosition.get(position)
		if (!scores?.length) return []

		const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
		const variance = scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / scores.length
		const standardDeviation = Math.sqrt(variance)
		const curve = standardDeviation === 0 ? [] : Array.from({length: curvePoints}, (_, index) => {
			const x = mean - 3 * standardDeviation + (6 * standardDeviation * index) / (curvePoints - 1)
			return {x, y: densityAtScore({mean, standardDeviation}, x)}
		})

		return [{position, sampleCount: scores.length, mean, minimum: Math.min(...scores),
			maximum: Math.max(...scores), standardDeviation, curve}]
	})
}

function DistributionGraph({distributions, showScoreLabels = false}: {
	distributions: PositionScoringDistribution[]
	showScoreLabels?: boolean
}) {
	const data: LineSeries[] = distributions.filter((distribution) => distribution.curve.length > 0)
		.map((distribution) => ({id: distribution.position, data: distribution.curve}))

	const xValues = data.flatMap((series) => series.data.map((point) => Number(point.x)))
	const individual = showScoreLabels ? distributions[0] : undefined
	const xMin = Math.min(...xValues, ...(individual ? [individual.minimum] : []))
	const xMax = Math.max(...xValues, ...(individual ? [individual.maximum] : []))
	return <Box h={['270px', '330px']} mt={3}>
		{data.length > 0 ? <Box h='100%' aria-hidden='true'><ResponsiveLine
			data={data}
			colors={(series) => project_colors.position[series.id as POSITION]}
			theme={{text: {fill: '#c5cccc', fontSize: 11}, grid: {line: {stroke: '#3a4849', strokeWidth: 1}},
				axis: {ticks: {line: {stroke: '#526162'}}, domain: {line: {stroke: '#526162'}}}}}
			margin={{top: 12, right: 12, bottom: 52, left: 55}}
			xScale={{type: 'linear', min: xMin, max: xMax}}
			yScale={{type: 'linear', min: 0, max: 'auto', stacked: false}}
			curve='monotoneX' lineWidth={2.5} enablePoints={false} enableGridX={false} gridYValues={4}
			axisTop={null} axisRight={null}
			axisBottom={{tickValues: 5, tickSize: 0, tickPadding: 8, legend: 'Points scored', legendOffset: 38, legendPosition: 'middle'}}
			axisLeft={null}
			layers={['grid', 'axes', 'lines', 'slices', 'legends']}
			enableSlices='x'
			sliceTooltip={({slice}) => <Box bg='surface.2' color='white' p={3} borderRadius='md' boxShadow='lg' fontSize='sm' whiteSpace='nowrap'>
				<Text mb={1}>{format(Number(slice.points[0]?.data.x ?? 0))} points</Text>
				<VStack align='stretch' spacing={1}>
					{slice.points.map((point) => <Text key={point.id} color={point.seriesColor}>{point.seriesId}</Text>)}
				</VStack>
			</Box>}
		/></Box> : <Text pt={8} textAlign='center' color='surface.8' fontWeight='normal'>
			All starter scores are the same, so there is no curve to show.
		</Text>}
	</Box>
}

function DistributionSummary({distribution, showPosition = true}: {
	distribution: PositionScoringDistribution
	showPosition?: boolean
}) {
	return <VStack align='stretch' spacing={0}>
		{showPosition && <HStack spacing={2}>
			<Box boxSize='10px' borderRadius='full' bg={project_colors.position[distribution.position]} />
			<Text fontSize='sm' color='white' fontWeight='semibold'>{distribution.position}</Text>
		</HStack>}
		{distribution.curve.length > 0 ? <Text fontSize='xs' color='surface.8'>
			Estimated common range: {format(distribution.mean - distribution.standardDeviation)} to {format(distribution.mean + distribution.standardDeviation)} points
		</Text> : showPosition && <Text fontSize='xs' color='surface.8'>All starter scores are the same; no curve is shown.</Text>}
		<SimpleGrid columns={3} spacing={1} mt={2} aria-label={`${distribution.position} starter score range in points`}>
			{[
				{label: 'Min', value: distribution.minimum},
				{label: 'Average', value: distribution.mean},
				{label: 'Max', value: distribution.maximum},
			].map(({label, value}) => <Text key={label} fontSize='xs' color='surface.8' textAlign='center' overflowWrap='anywhere'>
				{label}:<Box as='span' display={{base: 'block', sm: 'inline'}}> {format(value)}</Box>
			</Text>)}
		</SimpleGrid>
	</VStack>
}

function PlayerHighlightCard({playerId, name, points, detail, owner, rosterDataComplete}: {
	playerId: string
	name: string
	points: string
	detail: string
	owner?: LeagueMember
	rosterDataComplete: boolean
}) {
	return <Box bg='surface.2' border='1px solid' borderColor='whiteAlpha.200' borderRadius='md' p={3}
		minW={0} h='100%' display='flex' flexDirection='column'>
		<HStack spacing={3} align='center'>
			<Avatar size='sm' flexShrink={0} name={name} src={getPlayerAvatarSrc(playerId)} />
			<Box minW={0}>
				<Text color='white' fontSize='sm' fontWeight='semibold' overflowWrap='anywhere'>{name}</Text>
				<Text color='surface.9' fontSize='sm' fontWeight='semibold'>{points}</Text>
				<Text color='surface.8' fontSize='xs' fontWeight='normal'>{detail}</Text>
			</Box>
		</HStack>
		<Box mt='auto' pt={3}>
			<HStack spacing={2} align='center' borderTop='1px solid' borderColor='whiteAlpha.200' pt={2}>
				{owner && <Avatar size='xs' flexShrink={0} name={owner.teamName} src={owner.getTeamAvatar()} aria-hidden='true' />}
				<Box minW={0}>
					<Text color='surface.8' fontSize='xs' lineHeight='short' fontWeight='normal'>Current team</Text>
					<Text color='surface.9' fontSize='xs' lineHeight='short' fontWeight='medium' overflowWrap='anywhere'>
						{owner?.teamName ?? (rosterDataComplete ? 'Not currently rostered' : 'Unavailable')}
					</Text>
				</Box>
			</HStack>
		</Box>
	</Box>
}

export default function PositionScoringDistributionChart({league, playerScores, playerDetails}: {
	league?: League
	playerScores: Map<string, PlayerScores> | null
	playerDetails: Map<string, DatabasePlayer> | null
}) {
	const [view, setView] = useState<'combined' | 'individual'>('combined')
	const distributions = useMemo(
		() => league?.settings ? positionScoringDistributions(league.weeks.values()) : undefined,
		[league]
	)
	const highlights = useMemo(
		() => league?.settings && playerScores && playerDetails
			? positionPlayerHighlights(league.weeks.values(), playerScores, playerDetails)
			: undefined,
		[league, playerScores, playerDetails]
	)
	const ownership = useMemo(() => {
		const owners = new Map<string, LeagueMember>()
		let rosterDataComplete = true
		league?.members?.forEach((member) => {
			if (!Array.isArray(member.roster.players)) rosterDataComplete = false
			for (const playerId of [...(member.roster.players ?? []), ...(member.roster.reserve ?? []), ...(member.roster.taxi ?? [])]) {
				owners.set(playerId, member)
			}
		})
		return {owners, rosterDataComplete: rosterDataComplete && Boolean(league?.members?.size)}
	}, [league])

	if (!distributions || !highlights) return <Skeleton h='350px' borderRadius='xl' aria-label='Loading position scoring distributions' />

	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={[4, 5]}>
		<Heading size='sm' color='white'>Weekly starter points by position</Heading>
		<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>
			Each score is one player&apos;s points in a week they started. Empty lineup spots are left out.
		</Text>
		<Box mt={3} bg='surface.2' borderRadius='md' p={3} fontSize='sm' color='surface.9' fontWeight='normal'>
			<Text><strong>How to read the graph:</strong> Move left to right to see points scored.
				A higher part of a line means scores around that point are estimated to be more common for that position.</Text>
			<Text mt={2}>The smooth lines are simplified estimates based on the average and how much scores vary,
				not exact counts or predictions. They can extend beyond the actual scores.</Text>
			<Text mt={2}>The <strong>estimated common range</strong> is where the curve places about two-thirds of scores.
				Actual scores can fall outside this range.</Text>
		</Box>
		<RadioGroup mt={4} color='white' value={view} onChange={(value) => {
			if (value === 'combined' || value === 'individual') setView(value)
		}} aria-label='Position graph view'>
			<Stack direction={{base: 'column', sm: 'row'}} spacing={3}>
				<Radio value='combined' colorScheme='teal'>All positions together</Radio>
				<Radio value='individual' colorScheme='teal'>One graph per position</Radio>
			</Stack>
		</RadioGroup>
		{distributions.length === 0 ? <Text mt={4} color='surface.8' fontWeight='normal'>No starter scores available.</Text> : <>
			{view === 'combined' ? <>
				<HStack mt={4} spacing={4} flexWrap='wrap' rowGap={3} align='start' aria-label='Position scoring summary'>
					{distributions.map((distribution) => <DistributionSummary key={distribution.position} distribution={distribution} />)}
				</HStack>
				<DistributionGraph distributions={distributions} />
			</> : <>
				<Text mt={4} fontSize='sm' color='surface.8' fontWeight='normal'>
					Each graph uses its own scale, so compare scores using the numbers rather than the height or width of the lines.
				</Text>
				<Text mt={2} fontSize='sm' color='surface.8' fontWeight='normal'>
					Player highlights include starts and bench appearances while rostered during the selected season portion.
					Only weeks with recorded player stats are counted; this may not include every game played.
					The average leader needs at least 3 recorded games. Current teams reflect the latest roster data for this league.
				</Text>
				<SimpleGrid columns={{base: 1, lg: 2}} spacing={4} mt={4}>
					{distributions.map((distribution) => <Box key={distribution.position} as='section'
						aria-label={`${distribution.position} scoring distribution`} border='1px solid' borderColor='whiteAlpha.200' borderRadius='lg' p={4} minW={0}>
						<HStack spacing={2} mb={1}>
							<Box boxSize='10px' borderRadius='full' bg={project_colors.position[distribution.position]} />
							<Heading size='sm' color='white'>{distribution.position}</Heading>
						</HStack>
						<DistributionSummary distribution={distribution} showPosition={false} />
						<DistributionGraph distributions={[distribution]} showScoreLabels />
						<Box mt={3} display='grid' gap={2} gridTemplateColumns='repeat(auto-fit, minmax(min(100%, 230px), 1fr))'>
							<Box minW={0} display='flex' flexDirection='column'>
								<Heading as='h3' fontSize='sm' color='white' lineHeight='1.3' mb={2}>
									Best game
								</Heading>
								<Stack flex={1} spacing={2} align='stretch' sx={{'& > *': {flex: '1 1 0'}}}>
									{highlights.get(distribution.position)?.highestGames.map((game) =>
										<PlayerHighlightCard key={`${game.playerId}-${game.week}`}
											playerId={game.playerId} name={game.name}
											points={`${format(game.score)} points`} detail={`Week ${game.week}`}
											owner={ownership.owners.get(game.playerId)} rosterDataComplete={ownership.rosterDataComplete} />
									) ?? <Text fontSize='sm' color='surface.8' fontWeight='normal'>No recorded player scores available.</Text>}
								</Stack>
							</Box>
							<Box minW={0} display='flex' flexDirection='column'>
								<Heading as='h3' fontSize='sm' color='white' lineHeight='1.3' mb={2}>
									Best average
								</Heading>
								<Stack flex={1} spacing={2} align='stretch' sx={{'& > *': {flex: '1 1 0'}}}>
									{highlights.get(distribution.position)?.topAverages.length ? highlights.get(distribution.position)?.topAverages.map((player) =>
										<PlayerHighlightCard key={player.playerId}
											playerId={player.playerId} name={player.name}
											points={`${format(player.average)} points / game`} detail={`${player.games} recorded games`}
											owner={ownership.owners.get(player.playerId)} rosterDataComplete={ownership.rosterDataComplete} />
									) : <Text fontSize='sm' color='surface.8' fontWeight='normal'>No players with at least 3 recorded games.</Text>}
								</Stack>
							</Box>
						</Box>
					</Box>)}
				</SimpleGrid>
			</>}
		</>}
	</Box>
}
