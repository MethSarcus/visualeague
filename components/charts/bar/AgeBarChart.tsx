import {Spinner} from '@chakra-ui/react'
import {DatabasePlayer, SleeperPlayerDetails} from '../../../classes/custom/Player'
import {createRangeArray} from '../../../utility/rosterFunctions'
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
	Title,
} from 'chart.js'
import {Bar} from 'react-chartjs-2'
import {project_colors} from '../../../utility/project_colors'

interface MyProps {
	playerDetails?: DatabasePlayer[]
}

const theme = {
	background: 'none',
	textColor: 'white',
}

const AgeBarChart = (props: MyProps) => {
	if (props.playerDetails == undefined) return <Spinner />
	ChartJS.register(ArcElement, Tooltip, Legend)
	let formattedData = formatScoresForBarChart(props.playerDetails ?? [])

	if (formattedData.chartKeys.length <= 0) return <Spinner />

	ChartJS.register(
		CategoryScale,
		LinearScale,
		BarElement,
		Title,
		Tooltip,
		Legend
	)

  ChartJS.defaults.color = project_colors.textTheme.highEmphasis;

	const options = {
		layout: {
			// padding: {
			// 	left: 5,
			// 	right: 5,
			//   top: 5,
			//   bottom: 5
			// },
		},

		responsive: true,
		plugins: {
			legend: {
				display: false,
				position: 'top' as const,
				labels: {
					// This more specific font property overrides the global property
					font: {
						size: 7,
					},
				},
			},
			title: {
				display: true,
				text: 'Player Age Dist',
        font: {
          size: 9
        },
			},
		},
	}

	let chartData = {
		labels: formattedData.chartKeys,
		datasets: [
			{
				label: 'Num Players',
				data: formattedData.chartData,
				backgroundColor: project_colors.secondary[600],
			},
		],
	}

	return <Bar options={options} data={chartData} />
}

function formatScoresForBarChart(playerDetails: DatabasePlayer[]) {
	let data: number[] = []
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

	let keys = createRangeArray(lowAge, highAge)
		.sort()
		.map((key) => {
			return key
		})

	keys.forEach((key) => {
		data.push(ageMap.get(key) ?? 0)
	})

	let formattedData = {
		chartKeys: keys,
		chartData: data,
	}
	return formattedData
}

export default AgeBarChart
