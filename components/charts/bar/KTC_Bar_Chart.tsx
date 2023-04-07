import {Spinner, useMediaQuery} from '@chakra-ui/react'
import {BarDatum, ResponsiveBar} from '@nivo/bar'
import League from '../../../classes/custom/League'
import LeagueMember from '../../../classes/custom/LeagueMember'
import {getPositionColor} from '../../../utility/rosterFunctions'

interface MyProps {
	league?: League
}

const theme = {
	background: 'none',
	textColor: 'white',
}

const KTC_Bar_Chart = (props: MyProps) => {
	const [isOnMobile] = useMediaQuery('(max-width: 768px)')
	if (props.league?.settings == undefined) return <Spinner />
	let formattedData = formatScoresForBarChart(props.league)
	let keys = formattedData.chartKeys
	let data = formattedData.chartData as BarDatum[]
	if (data.length <= 0) return <Spinner />
	const getColor = (bar: BarDatum) => {
		return getPositionColor(
			props.league?.playerDetails.get(bar.id as any)?.position as any
		)
	}
	return (
		<ResponsiveBar
			data={data}
			keys={keys}
			tooltip={({id, value, color}) => {
				let playerDets = props.league?.playerDetails.get(id as any)
				return (
					<div
						style={{
							padding: 12,
							color,
							background: '#222222',
						}}
					>
						<strong>
							{`${playerDets?.first_name} ${playerDets?.last_name}`} KTC Value: {value}
						</strong>
					</div>
				)
			}}
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
			axisTop={{
				legend: 'Dynasty Roster Value',
				legendPosition: 'start',
				legendOffset: isOnMobile ? 0 : 0,
				format: () => '',
				tickSize: 0,
			}}
			axisRight={null}
			axisLeft={{
				tickSize: 0,
				tickPadding: 2,
				tickRotation: -30,
				format: (v) => `${v.slice(0, 4)}`,
				legendPosition: 'middle',
				legendOffset: 0,
			}}
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
			ariaLabel='Roster value for each member'
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
		let memberRosterValue = 0
		member.roster.players.sort((a: string, b: string) => {
			let aVal = league.playerDetails.get(a)?.ktc?.oneQBValue ?? 0
			let bVal = league.playerDetails.get(b)?.ktc?.oneQBValue ?? 0
			if (aVal < bVal) {
				return 1
			} else if (aVal > bVal) {
				return -1
			} else {
				return 0
			}
		}).forEach((player_id) => {
			
			if (league.playerDetails.get(player_id)?.ktc?.oneQBValue != undefined) {
				memberData[player_id] = league.playerDetails.get(player_id)?.ktc?.oneQBValue ?? 0
				memberRosterValue += league.playerDetails.get(player_id)?.ktc?.oneQBValue ?? 0
				
				keys.add(player_id)
			}
		})
		memberData.member = league.members.get(key)?.name
		memberData.rosterValue = memberRosterValue
		memberDataObjects.set(key, memberData)
	})

	let formattedData = {
		chartKeys: Array.from(keys),
		chartData: Array.from(memberDataObjects.values()).sort(
			(a: MemberDataObj, b: MemberDataObj) => {
				if (a.rosterValue > b.rosterValue) {
					return 1
				} else if (a.rosterValue < b.rosterValue) {
					return -1
				} else {
					return 0
				}
			}
		),
	}

	return formattedData
}

export default KTC_Bar_Chart
