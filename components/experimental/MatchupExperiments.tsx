import {Box, Flex, Heading, SimpleGrid, Text, VStack} from '@chakra-ui/react'
import {useMemo} from 'react'
import League from '../../classes/custom/League'
import {DatabasePlayer, PlayerScores} from '../../classes/custom/Player'
import {butterflyEffect, carryJobs, opponentTax, pointsGraveyard, revengeTour, teamDNA} from '../../utility/experimentalMatchups'
import SurfacePanel from '../SurfacePanel'

const points = (value: number) => value.toFixed(2)
const signed = (value: number) => `${value > 0 ? '+' : ''}${points(value)}`

function Empty({children}: {children: React.ReactNode}) {
	return <Text fontSize='sm' color='surface.8' fontWeight='normal'>{children}</Text>
}

function DivergingBar({value, scale, color}: {value: number; scale: number; color: string}) {
	return <Flex align='center' h='10px' aria-hidden='true'>
		<Flex w='50%' h='100%' align='center' justify='flex-end' borderRight='1px solid' borderColor='surface.8'>
			<Box h='6px' bg={color} w={`${value < 0 ? Math.abs(value) / scale * 100 : 0}%`} />
		</Flex>
		<Box w='50%'><Box h='6px' bg={color} w={`${value > 0 ? value / scale * 100 : 0}%`} /></Box>
	</Flex>
}

export default function MatchupExperiments({league, teamId, details, scores}: {
	league: League
	teamId: number
	details: Map<string, DatabasePlayer>
	scores: Map<string, PlayerScores>
}) {
	const data = useMemo(() => ({
		butterfly: butterflyEffect(league, teamId, details, scores),
		carry: carryJobs(league, teamId, details, scores),
		tax: opponentTax(league, teamId, details, scores),
		revenge: revengeTour(league, teamId, details, scores),
		graveyard: pointsGraveyard(league, teamId, details, scores),
		dna: teamDNA(league, teamId, details, scores),
	}), [league, teamId, details, scores])
	const flips = data.butterfly.games.filter((game) => game.swaps.length)
	const maxShare = Math.max(100, ...data.carry.map((entry) => entry.share))
	const avgCarry = data.dna.carries.length
		? data.dna.carries.reduce((sum, entry) => sum + entry.share, 0) / data.dna.carries.length : undefined
	const persona = data.dna.close.length >= 3 && data.dna.closeWins > data.dna.close.length / 2
		? 'Ice in their veins: won more than half of at least three close games.'
		: data.dna.games.length >= 3 && data.dna.blowouts.length > data.dna.games.length / 2
			? 'The fireworks factory: more than half of their matchups were blowouts.'
			: data.dna.carries.length >= 3 && avgCarry !== undefined
				? avgCarry >= 35 ? 'The headliner: the top starter averaged at least 35% of starter points.'
					: 'The ensemble: the top starter averaged less than 35% of starter points.'
				: 'Still finding an identity: not enough comparable weeks.'
	const taxScale = Math.max(1, ...data.tax.map((entry) => Math.abs((entry.against ?? 0) - (entry.baseline ?? 0))))
	const revengeScale = Math.max(1, ...data.revenge.map((entry) => Math.abs(entry.player.score)))
	const graveScale = Math.max(1, ...data.graveyard.slice(0, 10).map((entry) => Math.abs(entry.player.score)))
	return <VStack align='stretch' spacing={4}>
		<SurfacePanel as='section' minW={0} title='The butterfly effect' description='Could one bench player have changed a matchup? We test direct swaps into the same eligible starting slot, using recorded player scores. A change includes a win, loss, or tie becoming a different result. Adjusted matchups and games without recorded starter stats on both sides are excluded. The league model treats other missing starter scores as zero. Weekly snapshots cannot confirm game-time availability or reserve and taxi eligibility.' contentProps={{mt: 4}}>
			<Text color='white' fontSize='sm' mb={3}>
				{flips.length} of {data.butterfly.games.length} unadjusted matchups had a result-changing swap
				{data.butterfly.adjustedGames > 0 && ` · ${data.butterfly.adjustedGames} unavailable or adjusted matchups excluded`}
			</Text>
			{flips.length ? <VStack align='stretch' spacing={2}>
				{flips.map((game) => <Box key={game.week} bg='surface.2' borderRadius='md' p={3}>
					<Text color='white' fontSize='sm'>Week {game.week}: {game.original} → {game.swaps[0].changed}</Text>
					<Text color='surface.9' fontSize='sm' fontWeight='normal'>
						{game.swaps[0].bench.name} ({points(game.swaps[0].bench.score)}) for {game.swaps[0].starter.name} ({points(game.swaps[0].starter.score)}):
						{' '}{points(game.teamScore)} → {points(game.swaps[0].newScore)} vs {points(game.opponentScore)}.
						{' '}{game.swaps.length} qualifying {game.swaps.length === 1 ? 'swap' : 'swaps'}; highest resulting score shown.
					</Text>
				</Box>)}
			</VStack> : <Empty>No recorded eligible single-player swap changed a result.</Empty>}
		</SurfacePanel>
		<SimpleGrid columns={{base: 1, lg: 2}} spacing={4}>
			<SurfacePanel as='section' minW={0} title='The carry job' description='The top starter’s share of recorded starter points each week. Weeks with missing starter scores or nonpositive totals are omitted. Shares can exceed 100% when teammates score below zero; team adjustments are not included.' contentProps={{mt: 4}}>
				{data.carry.length ? <VStack align='stretch' spacing={3}>{data.carry.map((entry) => <Box key={entry.week}>
					<Flex justify='space-between' gap={2} color='white' fontSize='sm' wrap='wrap'>
						<Text>Week {entry.week} · {entry.player.name}</Text><Text>{entry.share.toFixed(1)}%</Text>
					</Flex>
					<Box bg='whiteAlpha.100' h='8px' borderRadius='full' my={1}>
						<Box bg='purple.300' h='100%' borderRadius='full' w={`${Math.max(0, entry.share) / maxShare * 100}%`} />
					</Box>
					<Text color='surface.8' fontWeight='normal' fontSize='xs'>{points(entry.player.score)} of {points(entry.total)} starter points</Text>
				</Box>)}</VStack> : <Empty>No complete, positive starter totals to compare yet.</Empty>}
			</SurfacePanel>
			<SurfacePanel as='section' minW={0} title='Opponent tax' description='Average points per recorded opposing starter at each position against this team versus against all other teams, using paired games in the selected season portion. This describes the schedule, not a real defensive ability.' contentProps={{mt: 4}}>
				{data.tax.length ? <VStack align='stretch' spacing={3}>{data.tax.map((entry) => <Box key={entry.position} bg='surface.2' borderRadius='md' p={3}>
					<Flex justify='space-between' gap={2} color='white' fontSize='sm'>
						<Text>{entry.position}</Text>
						<Text>{entry.against !== undefined && entry.baseline !== undefined ? `${signed(entry.against - entry.baseline)} pts` : 'No comparison'}</Text>
					</Flex>
					{entry.against !== undefined && entry.baseline !== undefined && <DivergingBar value={entry.against - entry.baseline} scale={taxScale} color='orange.300' />}
					<Text fontSize='xs' color='surface.9' fontWeight='normal'>
						Against team: {entry.against === undefined ? '—' : points(entry.against)} ({entry.againstCount} starts)
						{' · '}Against others: {entry.baseline === undefined ? '—' : points(entry.baseline)} ({entry.baselineCount} starts)
					</Text>
				</Box>)}</VStack> : <Empty>No recorded opposing starter scores with known positions yet.</Empty>}
			</SurfacePanel>
			<SurfacePanel as='section' minW={0} title='The revenge tour' description='Players started against this team who appeared on its roster in an earlier weekly snapshot this season. Earlier weeks outside the selected season portion are included when checking history. Snapshots can miss short stays, reserve, taxi, and midweek moves.' contentProps={{mt: 4}}>
				{data.revenge.length ? <VStack align='stretch' spacing={2}>{data.revenge.map((entry) => <Box key={`${entry.week}-${entry.player.id}`} bg='surface.2' p={3} borderRadius='md'>
					<Text color='white' fontSize='sm'>{entry.player.name} · {points(entry.player.score)} points</Text>
					<DivergingBar value={entry.player.score} scale={revengeScale} color='purple.300' />
					<Text color='surface.9' fontWeight='normal' fontSize='xs'>Week {entry.week} for {entry.opponent} · last seen on this team in Week {entry.lastRostered}</Text>
				</Box>)}</VStack> : <Empty>No recorded former players started against this team in the selected weeks.</Empty>}
			</SurfacePanel>
			<SurfacePanel as='section' minW={0} title='Points graveyard' description='The biggest recorded starter performances in this team’s losses. Only paired matchups without custom adjustments and with recorded starter stats on both sides count; ties and bye weeks are excluded. The league model treats other missing starter scores as zero.' contentProps={{mt: 4}}>
				{data.graveyard.length ? <VStack align='stretch' spacing={2}>{data.graveyard.slice(0, 10).map((entry) => <Box key={`${entry.week}-${entry.player.id}`} bg='surface.2' p={3} borderRadius='md'>
					<Text color='white' fontSize='sm'>{entry.player.name} · {points(entry.player.score)} points</Text>
					<DivergingBar value={entry.player.score} scale={graveScale} color='teal.300' />
					<Text color='surface.9' fontWeight='normal' fontSize='xs'>Week {entry.week} · lost {points(entry.teamScore)}–{points(entry.opponentScore)}</Text>
				</Box>)}</VStack> : <Empty>No recorded starter performances in unadjusted losses yet.</Empty>}
			</SurfacePanel>
		</SimpleGrid>
		<SurfacePanel as='section' minW={0} title='Team DNA' description='A playful snapshot, not a prediction. Close games are decided by 10 points or fewer; blowouts by 30 or more. Matchup numbers exclude custom adjustments, bye weeks, and games without recorded starter stats on both sides. The league model treats other missing starter scores as zero.' contentProps={{mt: 4}}>
			<Text color='white' fontSize='sm' mb={3}>{persona}</Text>
			<SimpleGrid columns={{base: 1, md: 3}} spacing={3}>
				<Box bg='surface.2' p={3} borderRadius='md'><Heading as='h3' size='xs' color='white'>Star power</Heading>
					<Text color='surface.9' fontWeight='normal' fontSize='sm' mt={2}>{avgCarry === undefined ? 'Not enough complete starter scores.' : `${avgCarry.toFixed(1)}% average top-starter share across ${data.dna.carries.length} complete weeks.`}</Text></Box>
				<Box bg='surface.2' p={3} borderRadius='md'><Heading as='h3' size='xs' color='white'>Nail-biters</Heading>
					<Text color='surface.9' fontWeight='normal' fontSize='sm' mt={2}>{data.dna.games.length ? `${data.dna.close.length} close games; ${data.dna.closeWins} wins, ${data.dna.close.filter((game) => roundedTie(game.team.pf, game.opponent.pf)).length} ties.` : 'No unadjusted matchups yet.'}</Text></Box>
				<Box bg='surface.2' p={3} borderRadius='md'><Heading as='h3' size='xs' color='white'>Blowout energy</Heading>
					<Text color='surface.9' fontWeight='normal' fontSize='sm' mt={2}>{data.dna.games.length ? `${data.dna.blowouts.length} blowouts: ${data.dna.bigWins} wins and ${data.dna.blowouts.length - data.dna.bigWins} losses.` : 'No unadjusted matchups yet.'}</Text></Box>
			</SimpleGrid>
		</SurfacePanel>
	</VStack>
}

function roundedTie(a: number, b: number) {
	return Number(a.toFixed(2)) === Number(b.toFixed(2))
}
