import {Box, Flex, Heading, Select, SimpleGrid, Skeleton, Text, VStack} from '@chakra-ui/react'
import {useMemo, useState} from 'react'
import League from '../../classes/custom/League'
import {DatabasePlayer, PlayerScores} from '../../classes/custom/Player'
import {experimentalTeams, ExperimentalTeam, scoreTwins, starterBenchAverages, teamFunFacts} from '../../utility/experimentalLeague'
import MatchupExperiments from './MatchupExperiments'
import SurfacePanel from '../SurfacePanel'

const points = (value: number) => value.toFixed(2)

function StarterMosaic({team}: {team: ExperimentalTeam}) {
	const appearances = new Map<string, {name: string; count: number}>()
	for (const week of team.weeks) for (const player of week.starters) {
		const entry = appearances.get(player.id) ?? {name: player.name, count: 0}
		entry.count++
		appearances.set(player.id, entry)
	}
	const players = Array.from(appearances, ([id, entry]) => ({id, ...entry}))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name) || a.id.localeCompare(b.id)).slice(0, 15)
	if (!players.length) return <Text color='surface.8' fontWeight='normal'>No recorded starter scores yet.</Text>
	return <Box overflowX='auto' tabIndex={0} role='region' aria-label='Scrollable starter score mosaic'>
		<Box as='table' width='100%' minW={`${150 + team.weeks.length * 64}px`} fontSize='xs' color='white'
			sx={{borderSpacing: '4px', borderCollapse: 'separate', 'th:first-of-type': {position: 'sticky', left: 0, zIndex: 1, background: '#182021'}}}>
			<thead><tr><th scope='col' style={{textAlign: 'left'}}>Player</th>{team.weeks.map(({week}) => <th scope='col' key={week}>W{week}</th>)}</tr></thead>
			<tbody>{players.map((player) => <tr key={player.id}>
				<th scope='row' style={{textAlign: 'left'}}><Text maxW='145px' overflowWrap='anywhere'>{player.name}</Text></th>
				{team.weeks.map(({week, starters}) => {
					const score = starters.find((starter) => starter.id === player.id)?.score
					const color = score === undefined ? 'whiteAlpha.100' : score < 0 ? 'orange.800' : score >= 20 ? 'purple.700' : score >= 10 ? 'teal.700' : 'surface.3'
					return <td key={week} style={{textAlign: 'center'}}>
						<Box py={2} borderRadius='md' bg={color} title={`${player.name}, Week ${week}: ${score === undefined ? 'not a recorded start' : `${points(score)} points`}`}>
							{score === undefined ? '—' : points(score)}
						</Box>
					</td>
				})}
			</tr>)}</tbody>
		</Box>
	</Box>
}

function ScoreTwins({team}: {team: ExperimentalTeam}) {
	const twins = scoreTwins(team)
	if (!twins.length) return <Text color='surface.8' fontWeight='normal'>No weeks with two recorded starters yet.</Text>
	const allScores = twins.flatMap(({first, second}) => [first.score, second.score])
	const min = Math.min(0, ...allScores)
	const max = Math.max(0, ...allScores)
	const position = (score: number) => max === min ? 50 : 5 + 90 * (score - min) / (max - min)
	return <VStack align='stretch' spacing={3}>
		{twins.map(({week, first, second, difference}) => <Box key={week} bg='surface.2' borderRadius='md' p={3}>
			<Flex justify='space-between' gap={2} wrap='wrap' color='white' fontSize='sm'>
				<Text>Week {week}</Text><Text color='surface.9' fontWeight='normal'>{points(difference)} points apart</Text>
			</Flex>
			<Box position='relative' h='16px' my={2} aria-hidden='true'>
				<Box position='absolute' top='7px' left='5%' right='5%' h='2px' bg='surface.5' />
				{[first, second].map((player, index) => <Box key={player.id} position='absolute' left={`${position(player.score)}%`}
					top={index === 0 ? '0' : '6px'} transform='translateX(-50%)' boxSize='10px' borderRadius='full'
					bg={index === 0 ? 'teal.300' : 'orange.300'} border='1px solid' borderColor='surface.1' />)}
			</Box>
			<Text color='surface.9' fontWeight='normal' fontSize='xs'>
				{first.name}: {points(first.score)} · {second.name}: {points(second.score)} points
			</Text>
		</Box>)}
	</VStack>
}

function BenchSplit({team}: {team: ExperimentalTeam}) {
	const players = starterBenchAverages(team).slice(0, 10)
	if (!players.length) return <Text color='surface.8' fontWeight='normal'>No players with recorded scores both started and benched yet.</Text>
	const max = Math.max(1, ...players.flatMap((player) => [Math.abs(player.startAverage), Math.abs(player.benchAverage)]))
	return <VStack align='stretch' spacing={3}>
		{players.map((player) => <Box key={player.id}>
			<Text color='white' fontSize='sm'>{player.name}</Text>
			{([
				['Started', player.startAverage, player.startCount, 'teal.300'],
				['Benched', player.benchAverage, player.benchCount, 'orange.300'],
			] as const).map(([label, average, count, color]) => <Flex key={label} align='center' gap={2} fontSize='xs' fontWeight='normal' color='surface.9'>
				<Text w='52px' flexShrink={0}>{label}</Text>
				<Flex flex={1} align='center' h='12px' minW='40px' aria-hidden='true'>
					<Flex w='50%' justify='flex-end' borderRight='1px solid' borderColor='surface.8' h='100%' align='center'>
						<Box h='6px' bg={color} w={`${average < 0 ? Math.abs(average) / max * 100 : 0}%`} />
					</Flex>
					<Box w='50%'><Box h='6px' bg={color} w={`${average > 0 ? average / max * 100 : 0}%`} /></Box>
				</Flex>
				<Text textAlign='right' flexShrink={0}>{points(average)} ({count} {count === 1 ? 'week' : 'weeks'})</Text>
			</Flex>)}
		</Box>)}
	</VStack>
}

function Constellation({team}: {team: ExperimentalTeam}) {
	const players = team.players.slice(0, 12)
	if (!players.length) return <Text color='surface.8' fontWeight='normal'>No positive starter totals to show yet.</Text>
	const max = players[0].score
	return <Flex wrap='wrap' align='center' justify='center' gap={3}>
		{players.map((player) => {
			const size = 72 + 48 * Math.sqrt(player.score / max)
			return <Flex key={player.id} borderRadius='full' bg='teal.800' border='1px solid' borderColor='teal.300'
				w={`${size}px`} h={`${size}px`} align='center' justify='center' direction='column' textAlign='center'
				p={2} color='white' fontSize='xs' title={`${player.name}: ${points(player.score)} starter points`}>
				<Text noOfLines={2} lineHeight='short'>{player.name}</Text>
				<Text fontWeight='normal'>{points(player.score)}</Text>
			</Flex>
		})}
	</Flex>
}

export default function ExperimentalDashboard({league, playerDetails, playerScores}: {
	league?: League
	playerDetails: Map<string, DatabasePlayer> | null
	playerScores: Map<string, PlayerScores> | null
}) {
	const [selectedId, setSelectedId] = useState('')
	const teams = useMemo(() => league?.settings && playerDetails && playerScores
		? experimentalTeams(league, playerDetails, playerScores) : undefined, [league, playerDetails, playerScores])
	if (!teams) return <Skeleton h='400px' borderRadius='xl' aria-label='Loading experimental league data' />
	if (!teams.length || teams.every((team) => !team.weeks.length)) return <Text color='surface.8' textAlign='center'>No team scores available for this season portion yet.</Text>
	const team = teams.find((candidate) => String(candidate.id) === selectedId) ?? teams[0]
	return <VStack align='stretch' spacing={4}>
		<SurfacePanel>
			<Flex align={{base: 'stretch', sm: 'center'}} direction={{base: 'column', sm: 'row'}} gap={3}>
				<Text as='label' htmlFor='experimental-team' color='white'>Explore a team</Text>
				<Select id='experimental-team' value={String(team.id)} onChange={(event) => setSelectedId(event.target.value)}
					maxW={{sm: '350px'}} color='white' bg='surface.2'>
					{teams.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
				</Select>
			</Flex>
		</SurfacePanel>
		<Text color='surface.8' fontSize='sm' fontWeight='normal'>
			Player scores are included only when stats were recorded that week; a missing score does not necessarily mean a player didn&apos;t play.
		</Text>
		{league && playerDetails && playerScores && <MatchupExperiments league={league} teamId={team.id} details={playerDetails} scores={playerScores} />}
		<SurfacePanel as='section' minW={0} title='Starter mosaic'
			description='A week-by-week picture of your most-used starters (up to 15). Purple is 20+ points, teal is 10–19.99, gray is 0–9.99, and orange is below zero. A dash means no recorded start. Scroll sideways for more weeks.'
			contentProps={{mt: 4}}>
			<StarterMosaic team={team} />
		</SurfacePanel>
		<SimpleGrid columns={{base: 1, lg: 2}} spacing={4}>
			<SurfacePanel as='section' minW={0} title='Score twins' description='Each week’s two starters with the closest scores. Dots use the same scale across weeks: teal is the first player listed, orange the second. Actual scores are below; ties are broken by lineup order.' contentProps={{mt: 4}}>
				<ScoreTwins team={team} />
			</SurfacePanel>
			<SurfacePanel as='section' minW={0} title='Starter or bench?' description='For players with recorded scores in both roles, compare their average points when started versus benched by this team. Up to 10 players with the biggest differences are shown. Small samples can be misleading; this is not a prediction.' contentProps={{mt: 4}}>
				<BenchSplit team={team} />
			</SurfacePanel>
			<SurfacePanel as='section' minW={0} title='Starter constellation' description='The top 12 players by total points while starting for this team. Bigger stars earned more points; only positive totals with recorded stats are shown.' contentProps={{mt: 4}}>
				<Constellation team={team} />
			</SurfacePanel>
		</SimpleGrid>
		<SurfacePanel as='section' minW={0} title='Five team fun facts' description={`${team.name} · Selected season portion. Facts use recorded starter and bench scores; ties use the first week and lineup order.`} contentProps={{mt: 4}}>
			<SimpleGrid columns={{base: 1, md: 2, xl: 3}} spacing={3}>
				{teamFunFacts(team).map((fact) => <Box key={fact.title} bg='surface.2' borderRadius='md' p={3}>
					<Heading as='h3' size='xs' color='white'>{fact.title}</Heading>
					<Text mt={2} color='surface.9' fontSize='sm' fontWeight='normal'>{fact.text}</Text>
				</Box>)}
			</SimpleGrid>
		</SurfacePanel>
	</VStack>
}
