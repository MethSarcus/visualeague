import {Box, Flex, Heading, HStack, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useMediaQuery} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import {useMemo} from 'react'
import League from '../../../classes/custom/League'
import {POSITION} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'

const format = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

export function formatScoresForBarChart(league: League) {
	const members = Array.from(league.members.values())
		.sort((a, b) => b.stats.pf - a.stats.pf || a.name.localeCompare(b.name) || a.roster.roster_id - b.roster.roster_id)
	const positions = Object.values(POSITION).filter((position) =>
		league.getPositions().includes(position) || members.some((member) => member.stats.position_scores.has(position)))
	const data: BarDatum[] = members.map((member) => {
		const row: BarDatum = {rosterId: String(member.roster.roster_id), member: member.name}
		for (const position of positions) row[position] = member.stats.position_scores.get(position) ?? 0
		return row
	})
	return {members, positions, data}
}

export default function LeagueStackedPfBarChart({league}: {league?: League}) {
	const [isMobile] = useMediaQuery('(max-width: 768px)')
	const chart = useMemo(() => league?.settings ? formatScoresForBarChart(league) : undefined, [league])
	if (!chart) return <Skeleton h='350px' borderRadius='xl' aria-label='Loading points by position' />
	const names = new Map(chart.members.map((member) => [String(member.roster.roster_id), member.name]))
	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={[4, 5]}>
		<Heading size='sm' color='white'>Team points by position</Heading>
		<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>
			Starter points by position, ranked by team points. Custom score adjustments may not appear in the breakdown.
		</Text>
		{!chart.members.length || !chart.positions.length ? <Text mt={4} color='surface.8' fontWeight='normal'>No positional scoring available.</Text> : <>
			<HStack spacing={4} mt={4} flexWrap='wrap' rowGap={2}>
				{chart.positions.map((position) => <HStack key={position} spacing={2}>
					<Box boxSize='10px' borderRadius='full' bg={project_colors.position[position]} />
					<Text fontSize='xs' color='surface.9'>{position}</Text>
				</HStack>)}
			</HStack>
			<Box h={`${Math.max(240, chart.members.length * 38 + 45)}px`} mt={2} aria-hidden='true'>
				<ResponsiveBar data={chart.data.slice().reverse()} keys={chart.positions} indexBy='rosterId' layout='horizontal' groupMode='stacked'
					margin={{top: 10, right: 25, bottom: 34, left: isMobile ? 95 : 135}} padding={0.3}
					colors={({id}) => project_colors.position[id as POSITION]}
					theme={{text: {fill: '#c5cccc', fontSize: 11}, grid: {line: {stroke: '#3a4849', strokeWidth: 1}},
						axis: {ticks: {line: {stroke: '#526162'}}, domain: {line: {stroke: '#526162'}}}}}
					axisTop={null} axisRight={null} enableGridY={false} gridXValues={5}
					axisBottom={{tickValues: 5, tickSize: 0, tickPadding: 8}}
					axisLeft={{tickSize: 0, tickPadding: 8, format: (value) => {
						const name = names.get(String(value)) || String(value)
						const limit = isMobile ? 11 : 18
						return name.length > limit ? `${name.slice(0, limit - 1)}…` : name
					}}}
					enableLabel={false} borderWidth={1} borderColor='#182021'
					tooltip={({id, value, data}) => <Box bg='surface.2' color='white' p={3} borderRadius='md' boxShadow='lg' fontSize='sm'>
						<Text>{data.member}</Text>
						<Flex justify='space-between' gap={5}><Text color={project_colors.position[id as POSITION]}>{id}</Text>
							<Text>{format(Number(value))} points</Text></Flex>
					</Box>} />
			</Box>
			<Box as='details' mt={2}>
				<Box as='summary' color='secondary.200' fontSize='sm' cursor='pointer'>View positional scores</Box>
				<TableContainer mt={3}><Table size='sm' aria-label='Team points by position' sx={{'th, td': {px: 2}}}>
					<Thead><Tr><Th>Team</Th>{chart.positions.map((position) => <Th key={position} isNumeric>{position}</Th>)}</Tr></Thead>
					<Tbody>{chart.members.map((member) => <Tr key={member.roster.roster_id}><Td>{member.name}</Td>
						{chart.positions.map((position) => <Td key={position} isNumeric>{format(member.stats.position_scores.get(position) ?? 0)}</Td>)}</Tr>)}</Tbody>
				</Table></TableContainer>
			</Box>
		</>}
	</Box>
}
