import League from '../../../classes/custom/League'
import {getPositionColor, POSITION} from '../../../utility/rosterFunctions'
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
	league?: League
}

const LeagueStackedPfBarChart = (props: MyProps) => {
	if (props.league == undefined || props.league?.settings == null) return <></>
	const sortedIds = [...(props.league?.members.keys() ?? [])]

	sortedIds.sort((a, b) => {
		let aPf = props.league?.members.get(a)?.stats.pf ?? 0
		let bPf = props.league?.members.get(b)?.stats.pf ?? 0
		if (aPf < bPf) {
			return 1
		}

		if (aPf > bPf) {
			return -1
		}

		return 0
	})
	const labels = sortedIds.map((member) => props.league?.members.get(member)?.name)
	const positions = (props.league?.getPositions() ?? []) as POSITION[]
	const datasets: {label: POSITION; data: number[]; backgroundColor: string}[] = []
	positions.map((pos) => {
		let posData: number[] = []
		sortedIds.forEach((memberId) => {
			posData.push(props.league?.members.get(memberId)?.stats.position_scores.get(pos) ?? 0)
		})
		datasets.push({
			label: pos,
			data: posData,
			backgroundColor: getPositionColor(pos),
		})
	})

	const data = {
		labels: labels,
		datasets: datasets,
	}
	const config = {
		type: 'bar',
		data: data,
		options: {
			plugins: {
				title: {
					display: true,
					text: 'Team PF By Position',
				},
			},
			responsive: true,
			scales: {
				x: {
					stacked: true,
				},
				y: {
					stacked: true,
				},
			},
		},
	}

	ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
	ChartJS.defaults.color = project_colors.textTheme.highEmphasis

	return <Bar options={config.options} data={data} />
}

export default LeagueStackedPfBarChart
