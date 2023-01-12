import {Spinner} from '@chakra-ui/react'
import {ResponsiveLine} from '@nivo/line'
import League from '../../../classes/custom/League'
import LeagueMember from '../../../classes/custom/LeagueMember'
import SeasonPlayer from '../../../classes/custom/SeasonPlayer'
import {project_colors} from '../../../utility/project_colors'

interface MyProps {
	player: SeasonPlayer | undefined
	positionAverage: number
	league: League | undefined
}

const RosterPlayerTrendingLineChart = (props: MyProps) => {
	if (!props.player || !props.league) return <Spinner />
	let data = formatScoresForLineChart(props.player, props.league) as any
	const theme = {
		background: project_colors.surface[1],
		textColor: 'white',
	}

	if (data.length <= 0) return <Spinner />

	return (
		<ResponsiveLine
			data={data}
			margin={{top: 10, right: 10, bottom: 10, left: 10}}
			yScale={{
				type: 'linear',
				min: 'auto',
				max: 'auto',
				stacked: false,
				reverse: false,
			}}
			curve='cardinal'
			enableCrosshair={false}
			axisLeft={null}
			enableGridY={false}
			enableGridX={false}
			colors={{scheme: 'dark2'}}
			pointSize={3}
			pointColor={{theme: 'background'}}
			pointBorderWidth={1}
			pointBorderColor={{from: 'serieColor'}}
			useMesh={true}
			legends={[]}
			tooltip={({point}) => {
				return (
					<div
						style={{
							padding: '1px',
							color: 'white',
							fontSize: '12px',
						}}
					>
						<div>{`${parseFloat(point.data.y as any).toFixed(2)}`}</div>
					</div>
				)
			}}
			markers={[
				{
					axis: 'y',
					value: parseFloat(props.positionAverage.toFixed(2)),
					lineStyle: {stroke: 'lightgray', strokeWidth: 1},
					legend: 'League Avg',
					legendOrientation: 'vertical',
					legendPosition: 'right',
					textStyle: {fontSize: '.5em', fill: 'gray'},
				},
			]}
		/>
	)
}

function formatScoresForLineChart(player: SeasonPlayer, league: League) {
	let weekScores: {x: string; y: string | undefined | null; started: boolean; wasActive: boolean}[] = []
	let allWeekStats = league.getAllWeekScoresForPlayer(player.id)
	allWeekStats.scores.forEach((score, weekNum) => {
		if (player.weeks_played.includes(weekNum) && allWeekStats.projectedScores.get(weekNum) > 0) {
			weekScores.push({
				x: 'Week ' + weekNum,
				y: score?.toFixed(2),
				started: true,
				wasActive: true
			})
		} else if (allWeekStats.projectedScores.get(weekNum) > 0) {
			weekScores.push({
				x: 'Week ' + weekNum,
				y: score?.toFixed(2),
				started: false,
				wasActive: true
			})
		} else {
			weekScores.push({
				x: 'Week ' + weekNum,
				y: null,
				started: false,
				wasActive: false
			})
		}
	})

	let data = {
		id: player.id,
		data: weekScores,
	}

	return [data]
}

export default RosterPlayerTrendingLineChart
