import {Spinner} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import {useMemo} from 'react'
import League from '../../../classes/custom/League'
import {getPositionColor, POSITION} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'

interface MyProps {
	league?: League
}

const theme = {
	background: 'none',
	text: {fill: project_colors.textTheme.highEmphasis},
}

const LeagueStackedPfBarChart = (props: MyProps) => {
	const league = props.league
	if (league == undefined || league?.settings == null || league.members == undefined) return <Spinner />
	const chartData = useMemo(() => formatScoresForBarChart(league), [league])


	if (chartData.data.length <= 0) return <Spinner />

	const getColor = (bar: {id: string | number}) => getPositionColor(bar.id as POSITION)

	return (
		<ResponsiveBar
			data={chartData.data}
			keys={chartData.positions}
			indexBy='member'
			groupMode='stacked'
			margin={{top: 30, right: 20, bottom: 40, left: 40}}
			padding={0.3}
			valueScale={{type: 'linear'}}
			indexScale={{type: 'band', round: true}}
			colors={getColor}
			theme={theme}
			borderColor={{from: 'color', modifiers: [['darker', 1.6]]}}
			axisTop={{
				legend: 'Team PF By Position',
				legendPosition: 'middle',
				legendOffset: -20,
				tickSize: 0,
				format: () => '',
			}}
			axisRight={null}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: -25,
			}}
			enableLabel={false}
			legends={[
				{
					dataFrom: 'keys',
					anchor: 'bottom-right',
					direction: 'column',
					translateX: 20,
					itemWidth: 40,
					itemHeight: 20,
					itemTextColor: project_colors.textTheme.highEmphasis,
					symbolSize: 12,
				},
			]}
			role='application'
			ariaLabel='Total points for by position for each team'
		/>
	)
}

function formatScoresForBarChart(league?: League) {
	if (league == undefined) {
		return {data: [] as BarDatum[], positions: [] as POSITION[]}
	}

	const sortedIds: number[] = []
	for (const memberId of league.members.keys()) {
		const memberPf = league.members.get(memberId)?.stats.pf ?? 0
		let insertAt = sortedIds.length

		while (insertAt > 0) {
			const previousId = sortedIds[insertAt - 1]
			const previousPf = league.members.get(previousId)?.stats.pf ?? 0
			if (previousPf >= memberPf) break
			insertAt--
		}

		sortedIds.splice(insertAt, 0, memberId)
	}

	const positions = (league.getPositions() ?? []) as POSITION[]

	const data: BarDatum[] = sortedIds.map((memberId) => {
		const member = league.members.get(memberId)
		const row: BarDatum = {member: member?.name ?? ''}
		positions.forEach((pos) => {
			row[pos] = member?.stats.position_scores.get(pos) ?? 0
		})
		return row
	})

	return {data, positions}
}

export default LeagueStackedPfBarChart
