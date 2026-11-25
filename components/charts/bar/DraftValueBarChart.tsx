import {Box, Flex, HStack, Skeleton, Text, useMediaQuery} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import {useMemo} from 'react'
import League from '../../../classes/custom/League'
import {getPositionColor, POSITION} from '../../../utility/rosterFunctions'
import ChartTooltip from '../ChartTooltip'
import SurfacePanel from '../../SurfacePanel'

const format = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

export function formatDraftValueChart(league: League) {
	const members = Array.from(league.members.values())
		.sort((a, b) => a.stats.draftValue - b.stats.draftValue || a.name.localeCompare(b.name) || a.roster.roster_id - b.roster.roster_id)
	const dataByRoster = new Map<number, BarDatum>(members.map((member) => [
		member.roster.roster_id, {rosterId: String(member.roster.roster_id), member: member.name},
	]))
	const picks = Array.from(league.draft.picks.values()).sort((a, b) => b.draftValue - a.draftValue)
	const keys: string[] = []
	const positions = new Set<POSITION>()
	for (const pick of picks) {
		const row = dataByRoster.get(pick.roster_id)
		if (!row || !Number.isFinite(pick.draftValue)) continue
		keys.push(pick.player_id)
		row[pick.player_id] = pick.draftValue
		if (Object.values(POSITION).includes(pick.metadata.position as POSITION)) {
			positions.add(pick.metadata.position as POSITION)
		}
	}
	return {members, data: Array.from(dataByRoster.values()), keys, positions: Object.values(POSITION).filter((position) => positions.has(position))}
}

export default function DraftValueBarChart({league}: {league?: League}) {
	const [isMobile] = useMediaQuery('(max-width: 768px)')
	const chart = useMemo(() => league?.settings ? formatDraftValueChart(league) : undefined, [league])
	if (!chart || !league) return <Skeleton h='350px' borderRadius='xl' aria-label='Loading draft value by team' />
	const names = new Map(chart.members.map((member) => [String(member.roster.roster_id), member.name]))
	return <SurfacePanel h='100%' title='Draft value by team' titleSize='sm'
		description='Player draft values by team and position. Hover over a segment for player details.'
		descriptionProps={{mt: 1}}>
		{!chart.members.length || !chart.keys.length ? <Text mt={4} color='surface.8' fontWeight='normal'>No draft value available.</Text> : <>
			<HStack spacing={4} mt={4} flexWrap='wrap' rowGap={2}>
				{chart.positions.map((position) => <HStack key={position} spacing={2}>
					<Box boxSize='10px' borderRadius='full' bg={getPositionColor(position)} />
					<Text fontSize='xs' color='surface.9'>{position}</Text>
				</HStack>)}
			</HStack>
			<Box h={`${Math.max(260, chart.members.length * 40 + 45)}px`} mt={2}>
				<ResponsiveBar data={chart.data} keys={chart.keys} indexBy='rosterId' layout='horizontal' groupMode='stacked'
					margin={{top: 10, right: 20, bottom: 34, left: isMobile ? 95 : 135}} padding={0.3} innerPadding={1}
					valueScale={{type: 'linear', min: 'auto', max: 'auto'}}
					colors={({id}) => getPositionColor(league.draft.picks.get(String(id))?.metadata.position as POSITION)}
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
					tooltip={({id, value, data, color}) => <ChartTooltip title={data.member} rows={[{
						key: String(id), label: league.draft.picks.get(String(id))?.name ?? String(id),
						value: format(Number(value)), color,
					}]} />}
					role='img' ariaLabel='Draft value for each team by player' />
			</Box>
		</>}
	</SurfacePanel>
}
