import {Spinner, useMediaQuery} from '@chakra-ui/react'
import {LineSeries, ResponsiveLine} from '@nivo/line'
import {useMemo} from 'react'
import League from '../../../classes/custom/League'
import {project_colors} from '../../../utility/project_colors'

interface MyProps {
	league: League | undefined
}

const WeekRangeChart = (props: MyProps) => {
	const [isOnMobile] = useMediaQuery('(max-width: 768px)')
	const league = props.league
	const data = useMemo(
		() => (league?.settings == undefined ? undefined : formatScoresForLineChart(league)),
		[league]
	)
	if (data == undefined) return <Spinner />
	const theme = {
		background: isOnMobile ? undefined : project_colors.surface[1],
		text: {fill: project_colors.textTheme.highEmphasis},
	}

  const desktopMargin = {top: 20, right: 170, bottom: 50, left: 60}

  const mobileMargin = {top: 25, right: 10, bottom: 40, left: 40}

	const deskTopLegend: NonNullable<Parameters<typeof ResponsiveLine>[0]['legends']>[number] = {
		anchor: 'bottom-right',
		direction: 'column',
		justify: false,
		toggleSerie: true,
		translateX: 100,
		translateY: 0,
		itemsSpacing: 0,
		itemDirection: 'left-to-right',
		itemWidth: 80,
		itemHeight: 20,
		itemOpacity: 0.75,
		symbolSize: 12,
		symbolShape: 'circle',
		symbolBorderColor: 'rgba(0, 0, 0, .5)',
		effects: [
			{
				on: 'hover',
				style: {
					itemBackground: 'rgba(0, 0, 0, .03)',
					itemOpacity: 1,
				},
			},
		],
	}

	return (
		<ResponsiveLine
			data={data}
			theme={theme}
			margin={isOnMobile ? mobileMargin : desktopMargin}
			curve={'natural'}
			enableGridX={false}
			enableCrosshair={false}
			xScale={{type: 'point'}}
			yScale={{
				type: 'linear',
				min: 0,
				max: 'auto',
				stacked: false,
				reverse: false,
			}}
			yFormat=' >-.1f'
			axisTop={{legend: "Weekly PF Range", legendPosition: "middle", legendOffset: isOnMobile ? -20 : -40, format: () => '', tickSize: 0}}
			axisRight={null}
			enableSlices={false}
      lineWidth={1}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: isOnMobile ? 'Weeks' : '',
				legendOffset: isOnMobile ? 30 : 36,
				legendPosition: 'middle',
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'PF',
				legendOffset: isOnMobile ? -30 : -40,
				legendPosition: 'middle',
			}}
			pointSize={isOnMobile ? 1 : 10}
			tooltip={({point}) => {
				return (
					<div
						style={{
							background: 'white',
							padding: '9px 12px',
							border: '1px solid #ccc',
							color: 'black',
						}}
					>
						<div>{`${point.seriesId}: ${Number(point.data.y).toFixed(
							2
						)}`}</div>
					</div>
				)
			}}
			pointColor={{from: 'series.color', modifiers: [['brighter', 1.1]]}}
			pointBorderWidth={0}
			pointLabelYOffset={-12}
			useMesh={true}
			debugMesh={false}
			legends={[deskTopLegend]}
		/>
	)
}

function formatScoresForLineChart(league: League): LineSeries[] {
	const data: LineSeries[] = []
	const leagueAverageScores: {x: number; y: number}[] = []
    const weekHighestScores: {x: number; y: number}[] = []
    const weekLowestScores: {x: number; y: number}[] = []

	league.weeks?.forEach((week) => {
		let weekRange = week.getWeekRange()

		leagueAverageScores.push({
			x: week.weekNumber,
			y: weekRange.averageScore,
		})
		weekHighestScores.push({
			x: week.weekNumber,
			y: weekRange.highScore ?? 0,
		})
		weekLowestScores.push({
			x: week.weekNumber,
			y: weekRange.lowScore ?? 0,
		})
	})

	data.push({
		id: 'Average',
		data: leagueAverageScores
	})

	data.push({
		id: 'High Score',
		data: weekHighestScores
	})

	data.push({
		id: 'Low Score',
		data: weekLowestScores
	})
	return data
}

export default WeekRangeChart
