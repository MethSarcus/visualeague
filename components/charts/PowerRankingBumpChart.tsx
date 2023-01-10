import {Spinner} from '@chakra-ui/react'
import {AreaBumpSerieExtraProps, ResponsiveAreaBump} from '@nivo/bump'
import League from '../../classes/custom/League'
import {MatchupSide} from '../../classes/custom/MatchupSide'
import {project_colors} from '../../utility/project_colors'

interface MyProps {
	league: League | undefined
}

const PowerRankingBumpChart = (props: MyProps) => {
	let data

	if (props.league?.settings != undefined) {
		data = formatScoresForBumpChart(props.league) as any
	}
	const theme = {
		textColor: 'white',
	}

	if (data == undefined || data.length <= 0) return <Spinner />

	return (
		<ResponsiveAreaBump
			data={data}
			theme={theme}
			margin={{top: 10, right: 120, bottom: 50, left: 120}}
			spacing={10}
			colors={{scheme: 'nivo'}}
			startLabel={'id' as any}
			endLabel={'id' as any}
			// interpolation='linear'
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Cumulative Power Rankings',
				legendPosition: 'middle',
				legendOffset: 35,
			}}
			tooltip={(dataObj: AreaBumpSerieExtraProps) => {
				let serie = dataObj.serie
				let wins = (serie as any).data.totalWins
				let losses = (serie as any).data.totalLosses
				let winPercent
				if (losses == 0 || wins == 0) {
					if (losses == 0) {
						winPercent = 1.0
					} else {
						winPercent = 0.0
					}
				} else {
					winPercent = (wins / (wins + losses)).toFixed(2)
				}
				return (
					<div
						style={{
							padding: 12,
							background: '#222222',
							color: 'white',
						}}
					>
						<strong>
							{(serie as any).id as string}: {wins}-{losses}
						</strong><br/>
						<small>{winPercent}% Power Win Rate</small>
					</div>
				)
			}}
		/>
	)
}

function formatScoresForBumpChart(league: League) {
	let data: object[] = []

	//Roster ID to array of power wins each week
	let memberPowerWins: Map<number, []> = new Map()
	league.members.forEach((member) => {
		memberPowerWins.set(member.roster.roster_id, [])
	})

	let weeks: any[] = []

	league.weeks.forEach((week) => {
		weeks.push(week.weekNumber)
		let teams = week.getAllTeams().sort((a: MatchupSide, b: MatchupSide) => {
			if (a.pf < b.pf) {
				return 1
			} else if (a.pf > b.pf) {
				return -1
			} else {
				return 0
			}
		})
		teams.forEach((team, index) => {
			if (memberPowerWins.get(team.roster_id) != undefined) {
				;(memberPowerWins.get(team.roster_id) as number[]).push(
					teams.length - index - 1
				)
			}
		})
	})

	memberPowerWins.forEach((value, key) => {
		let leagueMember = league.members.get(key)
		if (leagueMember != undefined) {
			let memberWins: number[] = []
			let totalWins = 0
			let totalLosses = 0
			value.forEach((wins) => {
				totalWins += wins
				totalLosses += league.members.size - wins - 1
				memberWins.push(totalWins)
			})
			data.push({
				id: leagueMember.name,
				totalWins: totalWins,
				totalLosses: totalLosses,
				data: memberWins.map((wins, index) => {
					return {
						x: weeks[index],
						y: wins,
					}
				}),
			})
		}
	})

	return data
}

export default PowerRankingBumpChart
