import {Spinner} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import League from '../../../classes/custom/League'
import LeagueMember from '../../../classes/custom/LeagueMember'
import {getPositionColor, POSITION} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'
import {PositionColors} from '../ChartColors'
import {AxisTickProps} from '@nivo/axes'
import {useTheme} from '@nivo/core'

interface MyProps {
	league?: League
	memberId: number
}

const theme = {
	background: 'none',
	textColor: 'white',
}

const getColor = (bar: BarDatum) => PositionColors[bar.id]

const TeamPositionalBarChart = (props: MyProps) => {
	if (props.league?.settings == undefined) return <Spinner />
	let data = formatScoresForBarChart(
		props.league.members.get(props.memberId)!,
		props.league.getPositions() as POSITION[]
	) as any
    let maxValue = 0
    props.league.members.forEach(mem => {
        mem.stats.position_scores.forEach(score => {
            if (score > maxValue) {
                maxValue = score
            }
        })
    })
	if (data.length <= 0) return <Spinner />
	return (
		<ResponsiveBar
			data={data.chartData}
			keys={data.keys}
			indexBy='user'
			margin={{top: 5, right: 0, bottom: 0, left: 0}}
			groupMode='grouped'
			valueScale={{type: 'linear'}}
			indexScale={{type: 'band', round: true}}
			borderWidth={.2}
            borderColor={project_colors.surface[0]}
            maxValue={maxValue}
            colors={Object.keys(PositionColors).filter(colKey => data.keys.includes(colKey)).map(colKey => PositionColors[colKey])}
			axisTop={null}
			axisRight={null}
			axisLeft={null}
			enableGridY={false}
			enableLabel={false}
			labelSkipWidth={5}
			labelSkipHeight={12}
			labelTextColor={{
				from: 'color',
				modifiers: [['darker', 1.6]],
			}}
			legends={[]}
			role='application'
		/>
	)
}

function formatScoresForBarChart(member: LeagueMember, positions: POSITION[]) {
	let data: object[] = []
	let keys: string[] = positions
    let posObj = {user: member.userDetails.display_name} as any
	positions.forEach((rosterPos) => {
		posObj[rosterPos.toString()] = parseFloat(member.stats.position_scores.get(rosterPos)?.toFixed(2) ?? "0")
        posObj[rosterPos.toString() + "Color"] = PositionColors[rosterPos]
	})
    data.push(posObj)
	return {chartData: data, keys: keys}
}

export default TeamPositionalBarChart
