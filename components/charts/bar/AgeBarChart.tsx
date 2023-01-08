import { Spinner } from '@chakra-ui/react'
import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { SleeperPlayerDetails } from '../../../classes/custom/Player'
import { createRangeArray } from '../../../utility/rosterFunctions'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Title } from "chart.js";
import { Bar } from "react-chartjs-2";

interface MyProps {
	playerDetails?: SleeperPlayerDetails[]
}

const theme = {
	background: 'none',
	textColor: 'white',
}

const AgeBarChart = (props: MyProps) => {
	if (props.playerDetails == undefined) return <Spinner />
    ChartJS.register(ArcElement, Tooltip, Legend);
	let formattedData = formatScoresForBarChart(props.playerDetails ?? [])

	if (formattedData.chartKeys.length <= 0) return <Spinner />

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
      );
      
      const options = {
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: 'top' as const,
          },
          title: {
            display: false,
            text: 'Chart.js Bar Chart',
          },
        },
      }

      let chartData = {
        labels: formattedData.chartKeys,
        datasets: [{
        label: 'Num Players',
        data: formattedData.chartData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }]
    }
      
	return (
        <Bar options={options} data={chartData} />
	)
}

function formatScoresForBarChart(playerDetails: SleeperPlayerDetails[]) {
	let data: number[] = []
	let ageMap = new Map<number, number>()
    let highAge = 0
    let lowAge = 100
	playerDetails.forEach(details => {
        if (details.age != undefined) {
            ageMap.set(details.age, (ageMap.get(details.age) ?? 0) + 1)
            if (details.age < lowAge) {
                lowAge = details.age
            }
    
            if (details.age > highAge) {
                highAge = details.age
            }
        }
    })

    let keys = createRangeArray(lowAge, highAge).sort().map(key => {return key})

    keys.forEach(key => {
        data.push(ageMap.get(key) ?? 0)
    })


	let formattedData = {
		chartKeys: keys,
		chartData: data,
	}
	return formattedData
}


export default AgeBarChart
