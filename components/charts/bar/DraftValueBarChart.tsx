import {Spinner, useMediaQuery} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import League from '../../../classes/custom/League'
import LeagueMember from '../../../classes/custom/LeagueMember'
import {getPositionColor, POSITION} from '../../../utility/rosterFunctions'
import {project_colors} from '../../../utility/project_colors'
import {PositionColors} from '../ChartColors'
import {AxisTickProps} from '@nivo/axes'
import { DraftPick } from '../../../classes/sleeper/DraftPick'
import { DraftPlayer } from '../../../classes/custom/Draft'

interface MyProps {
	league?: League
}

const theme = {
	background: 'none',
	textColor: 'white',
}

const DraftValueBarChart = (props: MyProps) => {
	const [isOnMobile] = useMediaQuery('(max-width: 768px)')
	if (props.league?.settings == undefined) return <Spinner />
	let formattedData = formatScoresForBarChart(props.league)
	let keys = formattedData.chartKeys
	let data = formattedData.chartData as BarDatum[]
	if (data.length <= 0) return <Spinner />
	const getColor = (bar: BarDatum) => {
		return getPositionColor(
			props.league?.draft.picks.get(bar.id as any)
				?.metadata.position as any
		)
	}
	return (
		<ResponsiveBar
			data={data}
			keys={keys}
      tooltip={({ id, value, color }) => (
            <div
                style={{
                    padding: 12,
                    color,
                    background: '#222222',
                }}
            >
                <strong>
                {props.league?.draft.picks.get(id as string)?.name}: {value}
            </strong>
            </div>
        )}
			indexBy='member'
			layout='horizontal'
			innerPadding={2}
			borderRadius={1}
			enableGridY={false}
			margin={{top: 15, right: 0, bottom: 0, left: 30}}
			padding={0.3}
			indexScale={{type: 'band', round: true}}
			theme={theme}
			borderColor={{
				from: 'color',
				modifiers: [['darker', 1.6]],
			}}
			axisTop={{legend: "Draft Value Found", legendPosition: "start", legendOffset: isOnMobile ? 0 : 0, format: () => '', tickSize: 0}}
			axisRight={null}
			axisLeft={
				{tickSize: 0,
				tickPadding: 2,
				tickRotation: -30,
				format: v => `${v.slice(0,4)}` ,
				legendPosition: 'middle',
				legendOffset: 0}}
      		enableLabel={false}
			colors={getColor as any}

			legends={[
				{
					dataFrom: 'keys',
					anchor: 'bottom',
					direction: 'row',
					justify: false,
					itemTextColor: 'white',
					itemWidth: 50,
					itemHeight: -100,
					itemDirection: 'left-to-right',
					itemOpacity: 1,
					symbolSize: 20,
					effects: [
						{
							on: 'hover',
							style: {
								itemOpacity: 1,
							},
						},
					],
				},
			]}
			role='application'
			ariaLabel='Draft value for each member'
		/>
	)
}

interface MemberDataObj {
	[key: string]: any
}

function formatScoresForBarChart(league: League) {
	let keys: Set<string> = new Set<string>()
	let data: object[] = []
	let memberDataObjects = new Map<number, MemberDataObj>()

	league.members.forEach((member: LeagueMember, key: number) => {
		let memberData: {[k: string]: any} = {}
		memberDataObjects.set(key, memberData)
	})
	Array.from(league.draft.picks.values()).sort(
    (a: DraftPlayer, b: DraftPlayer) => {
      if (a.draftValue < b.draftValue) {
        return 1
      } else if (a.draftValue > b.draftValue) {
        return -1
      } else {
        return 0
      }
    }
  ).forEach((pick) => {
		keys.add(pick.player_id)
		let memberDataObj = memberDataObjects.get(pick.roster_id)
		if (memberDataObj && !isNaN(+pick.draftValue)) {
			memberDataObj[pick.player_id] = pick.draftValue
		}
	})

	memberDataObjects.forEach((memberDataObj, key: number) => {
		memberDataObj.member = league.members.get(key)?.name
		memberDataObj.draftValue = league.members.get(key)?.stats.draftValue
	})

	memberDataObjects

	let formattedData = {
		chartKeys: Array.from(keys),
		chartData: Array.from(memberDataObjects.values()).sort(
			(a: MemberDataObj, b: MemberDataObj) => {
				if (a.draftValue > b.draftValue) {
					return 1
				} else if (a.draftValue < b.draftValue) {
					return -1
				} else {
					return 0
				}
			}
		),
	}
	return formattedData
}

export default DraftValueBarChart
