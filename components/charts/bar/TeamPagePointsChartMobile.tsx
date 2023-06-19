'use client'
import {Spinner, useMediaQuery} from '@chakra-ui/react'
import {SleeperPlayerDetails} from '../../../classes/custom/Player'
import {createRangeArray, POSITION} from '../../../utility/rosterFunctions'
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
import {alterRGBAOpacity, project_colors} from '../../../utility/project_colors'
import LeagueMember from '../../../classes/custom/LeagueMember'

interface MyProps {
	memberName: string
	homePointMap: Map<POSITION, number>
	awayPointMap: Map<POSITION, number>
	avgPointMap: Map<POSITION, number>
	isMobile: boolean
}

const TeamPagePointsChartMobile = (props: MyProps) => {
	
	ChartJS.register(ArcElement, Tooltip, Legend)
	let formattedData = createChartData(
		props.memberName,
		props.homePointMap,
		props.awayPointMap,
		props.avgPointMap
	)

	ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
	
	const desktopOptions = {
		layout: {
			padding: {
				left: 10,
				right: 10,
				top: 10,
				bottom: 10,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: project_colors.surface[1],
				}
			}
		},
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: 'bottom' as const,
			},
			title: {
				display: true,
				text: 'Total points vs league',
			},

		},
	}

	const mobileOptions = {
		aspectRatio: .25,
		indexAxis: 'y',
		layout: {
			padding: {
				left: 2,
				right: 2,
				top: 2,
				bottom: 2,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: project_colors.surface[1],
				}
			}
		},
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				display: true,
				position: 'bottom' as const,
			},
			title: {
				display: true,
				text: 'Total points vs league',
			},

		},
	}


	return <Bar options={mobileOptions as any} data={formattedData} />
}

function createChartData(
	homeMemberName: string,
	homePointMap: Map<POSITION, number>,
	awayPointMap: Map<POSITION, number>,
	avgPointMap: Map<POSITION, number>
) {
	let datasets = []
	let positions = Array.from(homePointMap.keys())
	datasets.push({
		label: homeMemberName,
		data: Array.from(homePointMap.values()),
		backgroundColor: positions.map((pos) => {
			return project_colors.position[pos]
		}),
		borderColor: positions.map((pos) => {
			return alterRGBAOpacity(project_colors.position[pos], 1)
		}),
		borderWidth: 2,
	})

	datasets.push({
		label: 'League Avg',
		data: Array.from(avgPointMap.values()),
		backgroundColor: positions.map((pos) => {
			return alterRGBAOpacity(project_colors.position[pos], 0.3)
		}),
		borderColor: positions.map((pos) => {
			return alterRGBAOpacity(project_colors.position[pos], 0.8)
		}),
		borderWidth: 2,
	})

	datasets.push({
		label: 'Opponent Total',
		data: Array.from(awayPointMap.values()),
		backgroundColor: positions.map((pos) => {
			return alterRGBAOpacity(project_colors.position[pos], 0.1)
		}),
		borderColor: positions.map((pos) => {
			return alterRGBAOpacity(project_colors.position[pos], 1)
		}),
		borderWidth: 2,
	})

	let data = {
		labels: positions,
		datasets: datasets,
	}

	return data
}

export default TeamPagePointsChartMobile


// scales: {
// 	yAxes: [
// 		{
// 			ticks: {
// 				beginAtZero: true,
// 				color: '#FFFFFF',
// 				display: true,
// 				tickLength: 8,
// 			},
// 			gridLines: {
// 				color: '#FFFFFF',
// 				thickness: 5,
// 			},
// 		},
// 	],
// 	xAxes: [
// 		{
// 			ticks: {
// 				beginAtZero: true,
// 				color: '#FFFFFF',
// 				display: true,
// 				tickLength: 8,
// 			},
// 			gridLines: {
// 				color: 'red',
// 			},
// 		},
// 	],
// },