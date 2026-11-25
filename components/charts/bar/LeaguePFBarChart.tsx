import {Box, Button, Flex, Heading, HStack, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useMediaQuery} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import {useMemo, useState} from 'react'
import League from '../../../classes/custom/League'
import {POSITION} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'
import LeagueMember from '../../../classes/custom/LeagueMember'

const format = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
type ScoreMode = 'ppg' | 'total'

export function averageScorePerGame(member: LeagueMember, position: POSITION) {
	const score = member.stats.position_scores.get(position) ?? 0
	const starts = member.stats.position_starts?.get(position) ?? 0
	return starts > 0 ? score / starts : 0
}

export function formatScoresForBarChart(league: League, mode: ScoreMode = 'total') {
	const members = Array.from(league.members.values())
		.sort((a, b) => b.stats.pf - a.stats.pf || a.name.localeCompare(b.name) || a.roster.roster_id - b.roster.roster_id)
	const positions = Object.values(POSITION).filter((position) =>
		league.getPositions().includes(position) || members.some((member) => member.stats.position_scores.has(position)))
	const data: BarDatum[] = members.map((member) => {
		const row: BarDatum = {rosterId: String(member.roster.roster_id), member: member.name}
		for (const position of positions) {
			row[position] = mode === 'ppg'
				? averageScorePerGame(member, position)
				: member.stats.position_scores.get(position) ?? 0
		}
		return row
	})
	return {members, positions, data}
}

function sortBarDataByScore(data: BarDatum[], positions: POSITION[]) {
	const totalScore = (row: BarDatum) => positions.reduce((total, position) => total + Number(row[position] ?? 0), 0)
	return data.slice().sort((a, b) => totalScore(b) - totalScore(a)).reverse()
}

export default function LeagueStackedPfBarChart({
	league,
	hiddenPositions,
	hiddenRosterIds,
	onTogglePosition,
}: {
	league?: League
	hiddenPositions: POSITION[]
	hiddenRosterIds: number[]
	onTogglePosition: (position: POSITION) => void
}) {
	const [isMobile] = useMediaQuery('(max-width: 768px)')
	const [scoreMode, setScoreMode] = useState<ScoreMode>('ppg')
	const chart = useMemo(() => league?.settings ? formatScoresForBarChart(league, scoreMode) : undefined, [league, scoreMode])
	if (!chart) return <Skeleton w='full' h='350px' borderRadius='xl' aria-label='Loading points by position' />
	const names = new Map(chart.members.map((member) => [String(member.roster.roster_id), member.name]))
	const visiblePositions = chart.positions.filter((position) => !hiddenPositions.includes(position))
	const visibleMembers = chart.members.filter((member) => !hiddenRosterIds.includes(member.roster.roster_id))
	const visibleData = chart.data.filter((row) => !hiddenRosterIds.includes(Number(row.rosterId)))
	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={[4, 5]} w='full' h='100%' minW={0}>
		<Heading size='sm' color='white'>Team points by position</Heading>
		{!chart.members.length || !chart.positions.length ? <Text mt={4} color='surface.8' fontWeight='normal'>No positional scoring available.</Text> : <>
			<Flex mt={3} justify='space-between' align={{base: 'stretch', sm: 'center'}} gap={4} wrap='wrap'>
				<HStack role='group' aria-label='Scoring metric' spacing={1} p={1} bg='surface.2' borderRadius='lg' border='1px solid' borderColor='whiteAlpha.100'>
					{([{value: 'ppg', label: 'PPG'}, {value: 'total', label: 'Total points'}] as const).map(({value, label}) =>
						<Button key={value} size='sm' variant='unstyled' px={3} minW={value === 'ppg' ? 'auto' : '110px'}
							h='34px' borderRadius='md' aria-pressed={scoreMode === value}
							bg={scoreMode === value ? 'secondary.300' : 'transparent'}
							color={scoreMode === value ? 'gray.900' : 'surface.8'}
							fontWeight={scoreMode === value ? 'semibold' : 'medium'}
							_hover={{bg: scoreMode === value ? 'secondary.200' : 'whiteAlpha.100', color: scoreMode === value ? 'gray.900' : 'white'}}
							onClick={() => setScoreMode(value)}>{label}</Button>)}
				</HStack>
				<Text fontSize='xs' color='surface.8'>Sorted by selected positional {scoreMode === 'ppg' ? 'PPG' : 'points'}</Text>
			</Flex>
			<Box mt={4}>
				<Text mb={2} fontSize='xs' color='surface.8' fontWeight='medium'>Show positions</Text>
				<HStack spacing={2} flexWrap='wrap' rowGap={2}>
					{chart.positions.map((position) => {
						const visible = !hiddenPositions.includes(position)
						return <Button key={position} size='xs' variant='outline' aria-pressed={visible}
							aria-label={`${visible ? 'Hide' : 'Show'} ${position} position`}
							borderColor={visible ? 'secondary.300' : 'whiteAlpha.200'}
							bg={visible ? 'whiteAlpha.100' : 'transparent'}
							color={visible ? 'white' : 'surface.7'}
							_hover={{bg: visible ? 'whiteAlpha.200' : 'whiteAlpha.100', borderColor: 'secondary.200'}}
							onClick={() => onTogglePosition(position)}>
							<HStack spacing={2}>
								<Box boxSize='8px' borderRadius='full' bg={project_colors.position[position]} opacity={visible ? 1 : 0.45} />
								<Text>{position}</Text>
							</HStack>
						</Button>
					})}
				</HStack>
			</Box>
			<Box h={`${Math.max(260, visibleMembers.length * 40 + 55)}px`} mt={3} bg='surface.0' borderRadius='lg' p={2} aria-hidden='true'>
				{visibleMembers.length === 0
					? <Flex h='full' align='center' justify='center'><Text color='surface.8' fontSize='sm'>Select at least one team to show the chart.</Text></Flex>
					: visiblePositions.length === 0
						? <Flex h='full' align='center' justify='center'><Text color='surface.8' fontSize='sm'>Select at least one position to show the chart.</Text></Flex>
					: <ResponsiveBar data={sortBarDataByScore(visibleData, visiblePositions)}
					keys={visiblePositions} indexBy='rosterId' layout='horizontal' groupMode='stacked'
					margin={{top: 12, right: 16, bottom: 48, left: isMobile ? 95 : 135}} padding={0.28} innerPadding={1}
					colors={({id}) => project_colors.position[id as POSITION]}
					theme={{text: {fill: '#d0d0d0', fontSize: 11}, grid: {line: {stroke: '#3a4849', strokeWidth: 1}},
						axis: {ticks: {line: {stroke: '#526162'}, text: {fill: '#a0a0a0'}}, domain: {line: {stroke: '#526162'}}}}}
					axisTop={null} axisRight={null} enableGridY={false} gridXValues={5}
					axisBottom={{tickValues: 5, tickSize: 0, tickPadding: 8, legend: scoreMode === 'ppg' ? 'Points per game' : 'Total points', legendPosition: 'middle', legendOffset: 38}}
					axisLeft={{tickSize: 0, tickPadding: 8, format: (value) => {
						const name = names.get(String(value)) || String(value)
						const limit = isMobile ? 11 : 18
						return name.length > limit ? `${name.slice(0, limit - 1)}…` : name
					}}}
					enableLabel={false} borderWidth={0} role='img'
					ariaLabel={`Team ${scoreMode === 'ppg' ? 'points per game' : 'total points'} by position`}
					tooltip={({id, value, data}) => <Box bg='surface.2' color='white' p={3} borderRadius='md' boxShadow='lg' fontSize='sm'>
						<Text>{data.member}</Text>
						<Flex justify='space-between' gap={5}><Text color={project_colors.position[id as POSITION]}>{id}</Text>
							<Text>{format(Number(value))} {scoreMode === 'ppg' ? 'PPG' : 'points'}</Text></Flex>
					</Box>} />}
			</Box>
			<Box as='details' mt={2}>
				<Box as='summary' color='secondary.200' fontSize='sm' cursor='pointer'>View positional table</Box>
				<TableContainer mt={3} overflowX='auto'><Table size='sm'
					aria-label={scoreMode === 'ppg' ? 'Team average points per game by position' : 'Team total points by position'} color='surface.9'
					sx={{'th, td': {px: 2, borderColor: 'whiteAlpha.200'}, th: {color: 'surface.8'}, td: {color: 'surface.9', fontWeight: 'normal'}}}>
					<Thead><Tr><Th>Team</Th>{chart.positions.map((position) => <Th key={position} isNumeric>
						{position} {scoreMode === 'ppg' ? 'PPG' : 'points'}
					</Th>)}</Tr></Thead>
					<Tbody>{visibleMembers.map((member) => <Tr key={member.roster.roster_id}><Td>{member.name}</Td>
						{chart.positions.map((position) => <Td key={position} isNumeric>{format(Number(chart.data.find((row) => row.rosterId === String(member.roster.roster_id))?.[position] ?? 0))}</Td>)}</Tr>)}</Tbody>
				</Table></TableContainer>
			</Box>
		</>}
	</Box>
}
