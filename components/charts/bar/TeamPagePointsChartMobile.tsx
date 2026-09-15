'use client'
import {Spinner} from '@chakra-ui/react'
import {ResponsiveBar} from '@nivo/bar'
import {useMemo} from 'react'
import {POSITION} from '../../../utility/rosterFunctions'
import {alterRGBAOpacity, project_colors} from '../../../utility/project_colors'
import {formatTeamPagePointsData, LEAGUE_AVG_KEY, OPPONENT_KEY} from './teamPagePointsChartData'

interface MyProps {
	memberName: string
	homePointMap: Map<POSITION, number>
	awayPointMap: Map<POSITION, number>
	avgPointMap: Map<POSITION, number>
	isMobile: boolean
}

const theme = {
	background: 'none',
	text: {fill: project_colors.textTheme.highEmphasis},
	grid: {line: {stroke: project_colors.surface[1]}},
}

const TeamPagePointsChartMobile = (props: MyProps) => {
	const {memberName, homePointMap, awayPointMap, avgPointMap} = props
	const chartData = useMemo(
		() => formatTeamPagePointsData(memberName, homePointMap, awayPointMap, avgPointMap),
		[memberName, homePointMap, awayPointMap, avgPointMap]
	)

	if (chartData.data.length <= 0) return <Spinner />

	const getColor = (bar: {id: string | number; indexValue: string | number}) => {
		const baseColor = project_colors.position[bar.indexValue as POSITION]
		if (bar.id === memberName) return baseColor
		if (bar.id === LEAGUE_AVG_KEY) return alterRGBAOpacity(baseColor, 0.3)
		return alterRGBAOpacity(baseColor, 0.1)
	}

	const getBorderColor = (bar: {data: {id: string | number; indexValue: string | number}}) => {
		const baseColor = project_colors.position[bar.data.indexValue as POSITION]
		if (bar.data.id === LEAGUE_AVG_KEY) return alterRGBAOpacity(baseColor, 0.8)
		return alterRGBAOpacity(baseColor, 1)
	}

	return (
		<ResponsiveBar
			data={chartData.data}
			keys={chartData.keys}
			indexBy='position'
			groupMode='grouped'
			layout='horizontal'
			margin={{top: 30, right: 10, bottom: 60, left: 40}}
			padding={0.3}
			valueScale={{type: 'linear'}}
			indexScale={{type: 'band', round: true}}
			colors={getColor}
			borderWidth={2}
			borderColor={getBorderColor}
			theme={theme}
			enableGridX={true}
			axisTop={{
				legend: 'Total points vs league',
				legendPosition: 'middle',
				legendOffset: -20,
				tickSize: 0,
				format: () => '',
			}}
			axisRight={null}
			axisBottom={{tickSize: 5, tickPadding: 5}}
			enableLabel={false}
			legends={[
				{
					dataFrom: 'keys',
					anchor: 'bottom',
					direction: 'row',
					translateY: 55,
					itemWidth: 90,
					itemHeight: 20,
					itemTextColor: project_colors.textTheme.highEmphasis,
					symbolSize: 12,
				},
			]}
			role='application'
			ariaLabel={`Positional points comparison for ${memberName}`}
		/>
	)
}

export default TeamPagePointsChartMobile
