import {Box, Spinner, Text} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import {useMemo} from 'react'
import {DatabasePlayer} from '../../../classes/custom/Player'
import {createRangeArray} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'

interface MyProps {
	playerDetails?: DatabasePlayer[]
}

const theme = {
	background: 'none',
	text: {fill: project_colors.textTheme.highEmphasis, fontSize: 9},
}

const AgeBarChart = (props: MyProps) => {
	const chartData = useMemo(
		() => formatScoresForBarChart(props.playerDetails ?? []),
		[props.playerDetails]
	)

	if (props.playerDetails == undefined) return <Spinner />
	if (chartData.length <= 0) return <Spinner />

	return (
		<Box>
			<Text textAlign='center' fontSize='xs' color={project_colors.textTheme.highEmphasis}>
				Player Age Dist
			</Text>
			<Box height='180px'>
				<ResponsiveBar
					data={chartData}
					keys={['count']}
					indexBy='age'
					margin={{top: 5, right: 5, bottom: 25, left: 25}}
					padding={0.3}
					valueScale={{type: 'linear'}}
					indexScale={{type: 'band', round: true}}
					colors={project_colors.secondary[600]}
					theme={theme}
					borderColor={{from: 'color', modifiers: [['darker', 1.6]]}}
					axisTop={null}
					axisRight={null}
					enableLabel={false}
					enableGridY={false}
					role='application'
					ariaLabel='Distribution of player ages on roster'
				/>
			</Box>
		</Box>
	)
}

function formatScoresForBarChart(playerDetails: DatabasePlayer[]): BarDatum[] {
	let ageMap = new Map<number, number>()
	let highAge = 0
	let lowAge = 100
	playerDetails.forEach((player) => {
		let details = player?.details
		if (details?.age != undefined) {
			ageMap.set(details.age, (ageMap.get(details.age) ?? 0) + 1)
			if (details.age < lowAge) {
				lowAge = details.age
			}

			if (details.age > highAge) {
				highAge = details.age
			}
		}
	})

	if (ageMap.size === 0) {
		return []
	}

	return createRangeArray(lowAge, highAge).map((age) => ({
		age,
		count: ageMap.get(age) ?? 0,
	}))
}

export default AgeBarChart
