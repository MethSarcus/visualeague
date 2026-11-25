import {Box, Flex, HStack, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useMediaQuery} from '@chakra-ui/react'
import {LineCustomSvgLayerProps, LineSeries, ResponsiveLine} from '@nivo/line'
import {useMemo} from 'react'
import League from '../../../classes/custom/League'
import {Week} from '../../../classes/custom/Week'
import ChartTooltip from '../ChartTooltip'
import SurfacePanel from '../../SurfacePanel'

const colors: Record<string, string> = {High: '#00c7ab', Average: '#bb86fc', Low: '#f6c64f'}
const format = (score: number) => score.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

function LineHalos({series, lineGenerator}: LineCustomSvgLayerProps<LineSeries>) {
	return <g pointerEvents='none' aria-hidden='true'>
		{series.map((line) => <path key={line.id} d={lineGenerator(line.data.map((point) => point.position)) ?? undefined}
			fill='none' stroke={line.color} strokeWidth={10} strokeOpacity={0.14} strokeLinecap='round' strokeLinejoin='round' />)}
	</g>
}

export function weeklyScoringRanges(weeks: Iterable<Week>) {
	return Array.from(weeks).flatMap((week) => {
		const scores = week.getAllTeams().map((team) => team.pf).filter((score) => Number.isFinite(score))
		if (!scores.length) return []
		return [{
			week: week.weekNumber,
			high: Math.max(...scores),
			average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
			low: Math.min(...scores),
		}]
	}).sort((a, b) => a.week - b.week)
}

export default function WeekRangeChart({league}: {league: League | undefined}) {
	const [isMobile] = useMediaQuery('(max-width: 768px)')
	const rows = useMemo(() => league?.settings ? weeklyScoringRanges(league.weeks.values()) : undefined, [league])
	const data: LineSeries[] = useMemo(() => rows ? [
		{id: 'High', data: rows.map((row) => ({x: row.week, y: row.high}))},
		{id: 'Average', data: rows.map((row) => ({x: row.week, y: row.average}))},
		{id: 'Low', data: rows.map((row) => ({x: row.week, y: row.low}))},
	] : [], [rows])
	if (!rows) return <Skeleton h='350px' borderRadius='xl' aria-label='Loading weekly scoring range' />

	const tickValues = isMobile && rows.length > 9
		? rows.filter((_, index) => index % 2 === 0 || index === rows.length - 1).map((row) => row.week)
		: rows.map((row) => row.week)
	return <SurfacePanel title='Weekly scoring range' titleSize='sm'
		description='Highest, average and lowest team score each week. The vertical scale is zoomed to the scores.'
		descriptionProps={{mt: 1}}>
		{rows.length === 0 ? <Text mt={4} color='surface.8' fontWeight='normal'>No weekly scores available.</Text> : <>
			<HStack spacing={4} mt={4} flexWrap='wrap' rowGap={2}>
				{['High', 'Average', 'Low'].map((label) => <HStack key={label} spacing={2}>
					<Box boxSize='10px' borderRadius='full' bg={colors[label]} />
					<Text fontSize='xs' color='surface.9'>{label}</Text>
				</HStack>)}
			</HStack>
			<Box h={['245px', '270px']} mt={2} aria-hidden='true'>
				<ResponsiveLine data={data} colors={(series) => colors[String(series.id)]}
					theme={{text: {fill: '#c5cccc', fontSize: 11}, grid: {line: {stroke: '#3a4849', strokeWidth: 1}},
						axis: {ticks: {line: {stroke: '#526162'}}, domain: {line: {stroke: '#526162'}}}}}
					margin={{top: 12, right: 12, bottom: 40, left: 45}}
					xScale={{type: 'point'}} yScale={{type: 'linear', min: 'auto', max: 'auto', stacked: false}}
					curve='monotoneX' lineWidth={2.5} enableGridX={false} gridYValues={5} axisTop={null} axisRight={null}
					layers={['grid', 'markers', 'axes', LineHalos, 'lines', 'points', 'slices', 'legends']}
					axisBottom={{tickValues, tickSize: 0, tickPadding: 8, legend: 'Week', legendOffset: 32, legendPosition: 'middle'}}
					axisLeft={{tickValues: 5, tickSize: 0, tickPadding: 8}} pointSize={5}
					pointColor={{from: 'series.color'}} pointBorderWidth={1} pointBorderColor='#182021'
					enableSlices='x' sliceTooltip={({slice}) => <ChartTooltip
						title={`Week ${slice.points[0]?.data.xFormatted}`}
						rows={slice.points.slice().sort((a, b) => Number(b.data.y) - Number(a.data.y)).map((point) => ({
							key: String(point.id), label: String(point.seriesId), value: format(Number(point.data.y)), color: point.seriesColor,
						}))}
					/>} />
			</Box>
			<Box as='details' mt={2}>
				<Box as='summary' color='secondary.200' fontSize='sm' cursor='pointer'>View weekly scores</Box>
				<TableContainer mt={3} overflowX='auto'><Table size='sm' aria-label='Weekly scoring ranges' color='surface.9'
					sx={{'th, td': {px: 2, borderColor: 'whiteAlpha.200'}, th: {color: 'surface.8'}, td: {color: 'surface.9', fontWeight: 'normal'}}}>
					<Thead><Tr><Th>Week</Th><Th isNumeric>High</Th><Th isNumeric>Average</Th><Th isNumeric>Low</Th></Tr></Thead>
					<Tbody>{rows.map((row) => <Tr key={row.week}><Td>{row.week}</Td><Td isNumeric>{format(row.high)}</Td>
						<Td isNumeric>{format(row.average)}</Td><Td isNumeric>{format(row.low)}</Td></Tr>)}</Tbody>
				</Table></TableContainer>
			</Box>
		</>}
	</SurfacePanel>
}
