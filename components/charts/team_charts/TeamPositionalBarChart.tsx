import {Spinner} from '@chakra-ui/react'
import {ResponsiveBar} from '@nivo/bar'
import { useMemo } from 'react'
import League from '../../../classes/custom/League'
import LeagueMember from '../../../classes/custom/LeagueMember'
import {POSITION} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'
import {PositionColors} from '../ChartColors'

interface MyProps {
	league?: League
	memberId: number
}

const TeamPositionalBarChart = (props: MyProps) => {
	const league = props.league
	const memberId = props.memberId

	const result = useMemo(() => {
		if (league?.settings == undefined) return undefined
		const member = league.members.get(memberId)
		if (!member) return undefined

		const data = formatScoresForBarChart(member, league.getPositions())

		const maxValue = Math.max(
			0,
			...Array.from(league.members.values()).flatMap((mem) =>
				Array.from(mem.stats.position_scores.values())
			)
		)

		return {...data, maxValue}
	}, [league, memberId])

	if (result == undefined || result.chartData.length <= 0) return <Spinner />

	const {chartData, keys, maxValue} = result

	return (
		<ResponsiveBar
			data={chartData}
			keys={keys}
			indexBy='user'
			margin={{top: 0, right: 0, bottom: 0, left: 0}}
			groupMode='grouped'
			valueScale={{type: 'linear', min: 0, max: maxValue}}
			indexScale={{type: 'band', round: true}}
			borderWidth={.2}
            borderColor={project_colors.surface[0]}
            colors={Object.keys(PositionColors).filter(colKey => keys.includes(colKey)).map(colKey => PositionColors[colKey])}
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
	const keys: string[] = positions
    const posObj: Record<string, string | number> = {user: member.getDisplayName()}
	positions.forEach((rosterPos) => {
		posObj[rosterPos.toString()] = parseFloat(member.stats.position_scores.get(rosterPos)?.toFixed(2) ?? "0")
        posObj[rosterPos.toString() + "Color"] = PositionColors[rosterPos]
	})
	const data = [posObj]
	return {chartData: data, keys: keys}
}

export default TeamPositionalBarChart
