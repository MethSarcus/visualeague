import {Spinner} from '@chakra-ui/react'
import {LineSeries, ResponsiveLine} from '@nivo/line'
import { useContext, useMemo } from 'react'
import League from '../../../classes/custom/League'
import { PlayerScores, SleeperPlayerDetails } from '../../../classes/custom/Player'
import SeasonPlayer from '../../../classes/custom/SeasonPlayer'
import { PlayerDetailsContext } from '../../../contexts/PlayerDetailsContext'
import { PlayerScoresContext } from '../../../contexts/PlayerScoresContext'
import {project_colors} from '../../../utility/project_colors'

interface MyProps {
	player: SeasonPlayer | undefined
	positionAverage: number
	league: League | undefined
}

const RosterPlayerTrendingLineChart = (props: MyProps) => {
	const [playerScores] = useContext(PlayerScoresContext) as [Map<string, PlayerScores>, unknown];
	const [playerDetails] = useContext(PlayerDetailsContext) as [Map<string, SleeperPlayerDetails>, unknown];
	const {player, league} = props
	const data = useMemo(() => {
		if (!player || !league || !playerScores) return undefined
		return formatScoresForLineChart(player, league, playerScores, playerDetails)
	}, [player, league, playerScores, playerDetails])

	if (!player || !league || !playerScores || data == undefined) return <Spinner />
	const theme = {
		text: {fill: project_colors.textTheme.highEmphasis},
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
			theme={theme}
			enableGridY={false}
			enableGridX={false}
			colors={{scheme: 'dark2'}}
			pointSize={3}
			pointColor={{from: 'series.color', modifiers: [['brighter', 1.1]]}}
			pointBorderWidth={0}
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
						<div>{`${Number(point.data.y).toFixed(2)}`}</div>
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

function formatScoresForLineChart(player: SeasonPlayer, league: League, playerScores: Map<string, PlayerScores>, playerDetails: Map<string, SleeperPlayerDetails>): LineSeries[] {
	const weekScores: {x: string; y: number | null; started: boolean; wasActive: boolean}[] = []
	const allWeekStats = league.getAllWeekScoresForPlayer(player.id, playerScores, playerDetails)
	allWeekStats.scores.forEach((score, weekNum) => {
		const projectedScore = allWeekStats.projectedScores.get(weekNum) ?? 0
		if (player.weeks_played.includes(weekNum) && projectedScore > 0) {
			weekScores.push({
				x: 'Week ' + weekNum,
				y: score != undefined ? Number(score.toFixed(2)) : null,
				started: true,
				wasActive: true
			})
		} else if (projectedScore > 0) {
			weekScores.push({
				x: 'Week ' + weekNum,
				y: score != undefined ? Number(score.toFixed(2)) : null,
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

	return [{
		id: player.id,
		data: weekScores,
	}]
}

export default RosterPlayerTrendingLineChart
