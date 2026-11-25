'use client'

import {
	Alert, AlertIcon, Avatar, Badge, Box, Button, Flex, Heading, HStack, SimpleGrid, Skeleton,
	Stack, Switch, Text, Tooltip,
} from '@chakra-ui/react'
import axios from 'axios'
import React from 'react'
import useSWR from 'swr'
import NemesisSection from '../../../../components/groups/NemesisSection'
import HistoryStandings from '../../../../components/groups/HistoryStandings'
import DivisionHistory from '../../../../components/groups/DivisionHistory'
import HeadToHeadMatrix from '../../../../components/groups/HeadToHeadMatrix'
import SurfacePanel from '../../../../components/SurfacePanel'
import {HistoryTeam, LeagueHistory, LeagueHistoryResponse} from '../../../../lib/leagueHistory'

const points = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

export default function HistoryPage({params}: {params: Promise<{slug: string}>}) {
	const {slug} = React.use(params)
	const [currentOnly, setCurrentOnly] = React.useState(true)
	const {data: response, error, mutate} = useSWR<LeagueHistoryResponse>(
		`/api/league/${slug}/history`,
		(url: string) => axios.get<LeagueHistoryResponse>(url).then((response) => response.data),
		{revalidateOnFocus: false}
	)

	if (error) {
		return <Box maxW='container.xl' mx='auto' p={6}>
			<Alert status='error' borderRadius='lg'><AlertIcon />Unable to load league history from Sleeper.</Alert>
			<Button mt={4} onClick={() => mutate()}>Try again</Button>
		</Box>
	}
	if (!response) {
		return <Stack maxW='container.xl' mx='auto' p={[4, 8]} spacing={6} aria-label='Loading league history'>
			<Skeleton height='150px' borderRadius='xl' />
			<SimpleGrid columns={[1, 3]} spacing={4}>{[0, 1, 2].map((item) => <Skeleton key={item} height='100px' borderRadius='xl' />)}</SimpleGrid>
			<Skeleton height='320px' borderRadius='xl' />
			<Skeleton height='320px' borderRadius='xl' />
		</Stack>
	}

	const currentMemberIds = new Set(response.currentMemberIds)
	const data: LeagueHistory = currentOnly
		? {...response.currentMembers, teams: response.teams.filter((team) => currentMemberIds.has(team.id))}
		: response
	const showTies = response.teams.some((team) => team.ties > 0)
	const pointsLeader = data.teams.reduce<LeagueHistory['teams'][number] | undefined>((leader, team) =>
		team.scoredWeeks && (!leader || team.points > leader.points) ? team : leader, undefined)
	const winLeader = data.teams.find((team) => team.headToHead.games > 0)
	const hasScores = data.highScores.length > 0

	return (
		<Box maxW='container.xl' mx='auto' px={[4, 6]} py={[5, 8]} color='textTheme.highEmphasis'>
			<SurfacePanel p={[5, 8]} bgGradient='linear(to-br, surface.2, surface.0)' position='relative' overflow='hidden'>
				<Heading color='white' size={['xl', '2xl']}>League history</Heading>
				<Text mt={2} fontSize='sm' color='surface.8' fontWeight='normal'>{data.seasons.join(' · ')}</Text>
				<Flex mt={5} justify='space-between' align={{base: 'stretch', md: 'end'}} direction={{base: 'column', md: 'row'}} gap={4}>
					<Box maxW={{md: '500px'}}>
						<Switch isChecked={currentOnly} onChange={(event) => setCurrentOnly(event.target.checked)} colorScheme='teal'
							aria-describedby='history-filter-description'>
							Current league members only
						</Switch>
						<Text id='history-filter-description' mt={2} fontSize='sm' color='surface.8' fontWeight='normal'>
							Current members&apos; games and nemeses can still include former opponents.
						</Text>
					</Box>
					<Flex gap={3} flexWrap='wrap' justify='flex-end' align='center'>
						<Badge colorScheme='purple'>{data.seasons.length} {data.seasons.length === 1 ? 'season' : 'seasons'}</Badge>
						<Badge colorScheme='teal'>{data.games} head-to-head games</Badge>
					</Flex>
				</Flex>
			</SurfacePanel>

			{!hasScores ? (
				<Alert status='info' mt={6} borderRadius='lg'><AlertIcon />{currentOnly ? 'No scored weeks are available for current league members.' : "No scored weeks are available in this league's history yet."}</Alert>
			) : (
				<>
					<SimpleGrid columns={{base: 1, md: 3}} spacing={4} mt={6}>
						<LeaderHighlight label='ALL-TIME WINS' team={winLeader} metric='wins' showTies={showTies} />
						<LeaderHighlight label='ALL-TIME POINTS' team={pointsLeader} metric='points' showTies={showTies}
							leagueAverages={seasonLeagueAverages(response.teams)} />
						<Highlight label='HIGHEST WEEK' value={points(data.highScores[0].points)} detail={`${data.highScores[0].team} · ${data.highScores[0].season}, Week ${data.highScores[0].week}`} />
					</SimpleGrid>

					<NemesisSection teams={data.teams} showTies={showTies} />

					<HeadToHeadMatrix key={currentOnly ? 'current' : 'all'} teams={data.teams} showTies={showTies} />
					<HistoryStandings teams={data.teams} showTies={showTies} />
					<DivisionHistory history={data.divisionHistory} showTies={showTies} />
					<SurfacePanel p={[4, 6]} mt={6}>
						<SectionHeading title='Highest weekly scores' subtitle='The top 10 individual team performances.' />
						<Stack spacing={0} mt={4}>
							{data.highScores.map((score, index) => <Flex key={`${score.season}-${score.week}-${index}`} py={3} align='center' borderBottom='1px solid' borderColor='whiteAlpha.100' gap={3}>
								<Text color='secondary.300' w='24px'>{String(index + 1).padStart(2, '0')}</Text>
								<Box flex='1' minW={0}><Text color='white' noOfLines={1}>{score.team}</Text><Text fontSize='xs' color='surface.8' fontWeight='normal'>{score.season} · Week {score.week}</Text></Box>
								<Text color='white'>{points(score.points)}</Text>
							</Flex>)}
						</Stack>
					</SurfacePanel>
					<SimpleGrid columns={{base: 1, md: 2}} spacing={4} mt={6}>
						<GameHighlight label='CLOSEST WIN' game={data.closestGame} />
						<GameHighlight label='BIGGEST BLOWOUT' game={data.biggestWin} />
					</SimpleGrid>
				</>
			)}
			<Text mt={6} fontSize='sm' color='surface.8' fontWeight='normal'>
				Includes scored regular season and playoff weeks, including consolation games, from the linked Sleeper seasons. Points include bye weeks; records only include paired head-to-head matchups, not league-median games. Teams are grouped by season roster owner, so ownership changes within a season cannot be reconstructed.
				{data.unpairedGroups > 0 && ` ${data.unpairedGroups} incomplete or non-head-to-head matchup groups were excluded from records.`}
			</Text>
		</Box>
	)
}

function SectionHeading({title, subtitle}: {title: string; subtitle: string}) {
	return <Box><Heading size='md' color='white'>{title}</Heading><Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>{subtitle}</Text></Box>
}

function Highlight({label, value, detail}: {label: string; value: string; detail: string}) {
	return <SurfacePanel p={5}><Text fontSize='xs' letterSpacing='wider' color='secondary.300'>{label}</Text><Text fontSize='3xl' color='white' mt={1}>{value}</Text><Text fontSize='sm' color='surface.9' fontWeight='normal' noOfLines={1}>{detail}</Text></SurfacePanel>
}

function seasonLeagueAverages(teams: HistoryTeam[]) {
	const totals = new Map<string, {points: number; games: number}>()
	for (const team of teams) {
		for (const season of team.seasonRecords) {
			const total = totals.get(season.leagueId) || {points: 0, games: 0}
			total.points += season.pointsFor
			total.games += season.games
			totals.set(season.leagueId, total)
		}
	}
	return new Map(Array.from(totals, ([id, total]) => [id, total.games ? total.points / total.games : null]))
}

function LeaderHighlight({label, team, metric, showTies, leagueAverages}: {label: string; team: HistoryTeam | undefined; metric: 'wins' | 'points'; showTies: boolean; leagueAverages?: ReadonlyMap<string, number | null>}) {
	const record = team?.headToHead
	const rate = record?.games
		? metric === 'wins'
			? `${((record.wins + record.ties / 2) / record.games * 100).toFixed(1)}% win rate${showTies ? ' · ties count half' : ''}`
			: `${points(record.pointsFor / record.games)} PF / head-to-head game`
		: metric === 'wins' ? 'No head-to-head games' : 'No head-to-head scoring average'
	return <SurfacePanel p={5} minW={0}>
		<Text fontSize='xs' letterSpacing='wider' color='secondary.300'>{label}</Text>
		<Text fontSize='3xl' color='white' mt={1}>{team ? metric === 'wins' ? team.wins : points(team.points) : '—'}</Text>
		{team ? <>
			<HStack spacing={2} mt={1} minW={0}>
				<Avatar aria-hidden='true' name={team.name} src={team.avatar || undefined} size='sm' />
				<Box minW={0}><Text fontSize='sm' color='surface.9' noOfLines={1}>{team.name}</Text>
					<Text fontSize='xs' color='surface.8' fontWeight='normal'>{rate}</Text></Box>
			</HStack>
			<SeasonTrend team={team} metric={metric} leagueAverages={leagueAverages} />
		</> : <Text fontSize='sm' color='surface.9' fontWeight='normal'>{metric === 'wins' ? 'No games yet' : 'No scores yet'}</Text>}
	</SurfacePanel>
}

function SeasonTrend({team, metric, leagueAverages}: {team: HistoryTeam; metric: 'wins' | 'points'; leagueAverages?: ReadonlyMap<string, number | null>}) {
	const chartRef = React.useRef<HTMLDivElement>(null)
	const [chartWidth, setChartWidth] = React.useState(240)
	React.useEffect(() => {
		const element = chartRef.current
		if (!element) return
		const updateWidth = () => {
			if (element.clientWidth > 0) setChartWidth(element.clientWidth)
		}
		updateWidth()
		if (typeof ResizeObserver === 'undefined') return
		const observer = new ResizeObserver(updateWidth)
		observer.observe(element)
		return () => observer.disconnect()
	}, [team, metric])
	const values = [...team.seasonRecords]
		.sort((a, b) => a.season.localeCompare(b.season) || a.leagueId.localeCompare(b.leagueId))
		.map((season) => ({
			season: season.season,
			value: metric === 'wins' ? season.wins : season.points,
			perGame: season.games ? season.pointsFor / season.games : null,
			leagueAverage: leagueAverages?.get(season.leagueId) ?? null,
		}))
	if (!values.length) return null
	const plottedValues = values.map((entry) => metric === 'wins' ? entry.value : entry.perGame)
	const availableValues = [...plottedValues, ...(metric === 'points' ? values.map((entry) => entry.leagueAverage) : [])]
		.filter((value): value is number => value !== null)
	const min = Math.min(0, ...availableValues)
	const max = Math.max(0, ...availableValues)
	const range = max - min || 1
	const step = chartWidth / values.length
	const textWidth = (text: string) => Math.max(1, Math.min(text.length * 5, step - 2))
	const coordinates = plottedValues.map((value, index) => ({
		x: step * (index + 0.5),
		y: value === null ? null : 70 - (value - min) / range * 42,
	}))
	const leagueCoordinates = values.map((entry, index) => ({
		x: coordinates[index].x,
		y: entry.leagueAverage === null ? null : 70 - (entry.leagueAverage - min) / range * 42,
	}))
	const makeLine = (items: typeof coordinates) => items.map(({x, y}, index) => y === null ? '' :
		`${index === 0 || items[index - 1].y === null ? 'M' : 'L'} ${x} ${y}`).filter(Boolean).join(' ')
	const describe = (value: number) => metric === 'wins' ? String(value) : points(value)
	const describeSeason = (entry: typeof values[number]) => {
		const average = entry.perGame === null ? 'no head-to-head games' : `${points(entry.perGame)} PF per head-to-head game`
		return `${entry.season}: ${describe(entry.value)} ${metric}${metric === 'points' ? `, ${average}, league average ${entry.leagueAverage === null ? 'unavailable' : `${points(entry.leagueAverage)} PF per head-to-head game`}` : ''}`
	}
	const description = values.map(describeSeason).join('; ')
	return <Box mt={4}>
		<Text fontSize='xs' color='surface.8' fontWeight='normal'>{metric === 'wins' ? 'Wins' : 'Points per game'} by season</Text>
		<Text fontSize='xs' color='surface.8' fontWeight='normal'>{metric === 'points' ? 'PF / head-to-head game above · season total below' : 'Hover or focus a season for details'}</Text>
		{metric === 'points' && <Text fontSize='xs' color='surface.8' fontWeight='normal'>
			Grey: league average PF / head-to-head game, including former members
		</Text>}
		<Box ref={chartRef} position='relative' mt={1}>
			<Box as='svg' viewBox={`0 0 ${chartWidth} ${metric === 'points' ? 116 : 100}`} width='100%' height={metric === 'points' ? '116px' : '100px'} display='block' role='img' preserveAspectRatio='none'
				aria-label={`${metric === 'wins' ? 'Wins' : 'Points'} by season for ${team.name}: ${description}`}>
				{metric === 'points' && <g opacity={0.5} fill='#a0aaaa' stroke='#a0aaaa'>
					<path d={makeLine(leagueCoordinates)} fill='none' strokeWidth='2' vectorEffect='non-scaling-stroke' />
					{leagueCoordinates.map(({x, y}, index) => {
						if (y === null) return null
						const value = points(values[index].leagueAverage!)
						const teamY = coordinates[index].y
						const labelY = teamY !== null && Math.abs(teamY - y) < 14
							? y <= 65 ? y + 11 : y - 20 : y - 9
						return <g key={index}>
							<circle cx={x} cy={y} r='3' />
							<text x={x} y={labelY} textAnchor='middle' fontSize='9' stroke='none'
								textLength={textWidth(value)} lengthAdjust='spacingAndGlyphs'>{value}</text>
						</g>
					})}
				</g>}
				<path d={makeLine(coordinates)} fill='none' stroke='var(--chakra-colors-secondary-300)' strokeWidth='2' vectorEffect='non-scaling-stroke' />
				{coordinates.map(({x, y}, index) => {
					const entry = values[index]
					const topLabel = metric === 'wins' ? describe(entry.value) : entry.perGame === null ? '—' : points(entry.perGame)
					const bottomLabel = describe(entry.value)
					return <g key={`${entry.season}-${index}`}>
						{y !== null && <circle cx={x} cy={y} r='3' fill='var(--chakra-colors-secondary-300)' />}
						<text x={x} y={y === null ? 55 : y - 9} textAnchor='middle' fill='var(--chakra-colors-surface-9)' fontSize='9'
							textLength={textWidth(topLabel)} lengthAdjust='spacingAndGlyphs'>{topLabel}</text>
						<line x1={x} x2={x} y1='79' y2='83' stroke='var(--chakra-colors-surface-8)' />
						<text x={x} y='96' textAnchor='middle' fill='var(--chakra-colors-surface-8)' fontSize='10'
							textLength={textWidth(entry.season)} lengthAdjust='spacingAndGlyphs'>{entry.season}</text>
						{metric === 'points' && <text x={x} y='111' textAnchor='middle' fill='var(--chakra-colors-surface-9)' fontSize='9'
							textLength={textWidth(bottomLabel)} lengthAdjust='spacingAndGlyphs'>{bottomLabel}</text>}
					</g>
				})}
			</Box>
			{values.map((entry, index) => <Tooltip key={`${entry.season}-${index}`} placement='bottom' gutter={6} hasArrow
				bg='surface.2' color='white' borderRadius='md' px={3} py={2} maxW='220px'
				label={<Box fontSize='xs' fontWeight='normal'>
					<Text fontWeight='bold' mb={1}>{entry.season}</Text>
					<Flex justify='space-between' gap={4}><Text color='surface.9'>{metric === 'wins' ? 'Wins' : 'Season points'}</Text>
						<Text fontWeight='semibold'>{describe(entry.value)}</Text></Flex>
					{metric === 'points' && <Flex justify='space-between' gap={4} mt={1}>
						<Text color='surface.9'>PF / head-to-head game</Text>
						<Text fontWeight='semibold' whiteSpace='nowrap'>{entry.perGame === null ? 'No games' : points(entry.perGame)}</Text>
					</Flex>}
					{metric === 'points' && <Flex justify='space-between' gap={4} mt={1}>
						<Text color='surface.9'>League average PF / game</Text>
						<Text fontWeight='semibold' whiteSpace='nowrap'>{entry.leagueAverage === null ? 'No games' : points(entry.leagueAverage)}</Text>
					</Flex>}
				</Box>}>
				<Box as='button' type='button' aria-label={describeSeason(entry)} position='absolute'
					top={`${(coordinates[index].y ?? 55) - 12}px`}
					left={`${index * 100 / values.length}%`} width={`${100 / values.length}%`} height='24px'
					_focusVisible={{outline: '2px solid', outlineColor: 'secondary.300', outlineOffset: '-2px', borderRadius: 'md'}} />
			</Tooltip>)}
		</Box>
	</Box>
}

function GameHighlight({label, game}: {label: string; game: LeagueHistory['closestGame']}) {
	return <Highlight label={label} value={game ? `${points(game.margin)} pts` : '—'} detail={game ? `${game.winner} over ${game.loser} · ${game.season}, Week ${game.week}` : 'No decisive games yet'} />
}
