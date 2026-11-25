import {Box, Button, Flex, Heading, HStack, Skeleton, Text, useMediaQuery} from '@chakra-ui/react'
import {ResponsiveRadar} from '@nivo/radar'
import {useMemo} from 'react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import {POSITION} from '../../utility/rosterFunctions'

interface MyProps {
	league: League | undefined
	hiddenPositions: POSITION[]
	hiddenRosterIds: number[]
	onToggleRoster: (rosterId: number) => void
}

const teamColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

const TeamRadarChart = ({league, hiddenPositions, hiddenRosterIds, onToggleRoster}: MyProps) => {
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)', {ssr: true, fallback: false})
	const data = useMemo(() => {
		if (!league?.settings) return undefined
		return formatScoresForRadarChart(Array.from(league.members.values()), league.getPositions())
	}, [league])

	if (data == undefined) return <Skeleton h='100%' minH='350px' borderRadius='xl' aria-label='Loading positional scoring breakdown' />

	const visiblePositions = data.positions.filter((position) => !hiddenPositions.includes(position))
	const visibleMembers = data.members.filter((member) => !hiddenRosterIds.includes(member.roster.roster_id))
	const chartData = data.chartData.filter((row) => visiblePositions.includes(row.position as POSITION))
	const chartKeys = visibleMembers.map((member) => String(member.roster.roster_id))
	const colorByRosterId = new Map(data.members.map((member, index) => [
		String(member.roster.roster_id), teamColors[index % teamColors.length],
	]))
	const nameCounts = new Map<string, number>()
	data.members.forEach((member) => nameCounts.set(member.name, (nameCounts.get(member.name) ?? 0) + 1))

	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={[4, 5]}
		h='100%' minW={0} display='flex' flexDirection='column'>
		<Heading size='sm' color='white'>Average points per game by position</Heading>
		<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>
			Compare teams&apos; average starter scoring across positions.
		</Text>
		{!!data.members.length && <Flex mt={3} wrap='wrap' gap={1} role='group' aria-label='Toggle teams on radar chart'>
			{data.members.map((member, index) => {
				const rosterId = member.roster.roster_id
				const visible = !hiddenRosterIds.includes(rosterId)
				const name = (nameCounts.get(member.name) ?? 0) > 1 ? `${member.name} (Roster ${rosterId})` : member.name
				return <Button key={rosterId} size='xs' variant='ghost' h={7} px={2} aria-pressed={visible}
					aria-label={`${visible ? 'Hide' : 'Show'} ${name} on radar chart`}
					color={visible ? 'surface.9' : 'surface.7'} opacity={visible ? 1 : 0.55}
					_hover={{bg: 'whiteAlpha.100', color: 'white'}}
					onClick={() => onToggleRoster(rosterId)}>
					<HStack spacing={1.5}>
						<Box boxSize='8px' borderRadius='full' bg={teamColors[index % teamColors.length]} />
						<Text>{name}</Text>
					</HStack>
				</Button>
			})}
		</Flex>}
		<Box flex='1' minH='260px' mt={3} bg='surface.0' borderRadius='lg' p={2}>
			{chartKeys.length === 0 || visiblePositions.length === 0
				? <Flex h='full' minH='260px' align='center' justify='center' px={4}>
					<Text color='surface.8' textAlign='center' fontSize='sm'>
						{chartKeys.length === 0 ? 'Select at least one team to show the radar chart.' : 'Select at least one position to show the radar chart.'}
					</Text>
				</Flex>
				: <ResponsiveRadar
					data={chartData}
					keys={chartKeys}
					theme={{
						background: 'transparent',
						text: {fill: '#d0d0d0'},
						grid: {line: {stroke: '#3a4849', strokeWidth: 1}},
						axis: {ticks: {text: {fill: '#a0a0a0', fontSize: 11}}},
					}}
					indexBy='position'
					valueFormat='>-.2f'
					margin={isLargerThan800 ? {top: 26, right: 26, bottom: 26, left: 26} : {top: 20, right: 20, bottom: 20, left: 20}}
					borderColor={{from: 'color'}}
					borderWidth={2}
					gridLabelOffset={16}
					gridLevels={5}
					dotSize={5}
					dotColor={{theme: 'background'}}
					dotBorderWidth={2}
					colors={({key}) => colorByRosterId.get(key) ?? teamColors[0]}
					fillOpacity={0.08}
					blendMode='normal'
					motionConfig='gentle'
					role='img'
					ariaLabel='Average points per game by position and team'
				/>}
		</Box>
	</Box>
}

function formatScoresForRadarChart(members: LeagueMember[], positions: POSITION[]) {
	const chartData = positions.map((position) => {
		const row: Record<string, string | number> = {position}
		for (const member of members) {
			const starts = member.stats.position_starts.get(position) ?? 0
			const score = member.stats.position_scores.get(position) ?? 0
			row[String(member.roster.roster_id)] = starts > 0 ? parseFloat((score / starts).toFixed(2)) : 0
		}
		return row
	})
	return {
		chartData,
		positions,
		members,
	}
}

export default TeamRadarChart
