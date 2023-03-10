import { Spinner, useMediaQuery } from '@chakra-ui/react'
import {
	AreaBumpComputedSerie,
	AreaBumpSerieExtraProps,
	DefaultAreaBumpDatum,
	ResponsiveAreaBump
} from '@nivo/bump'
import { linearGradientDef, SvgFillMatcher } from '@nivo/core'
import League from '../../classes/custom/League'
import { MatchupSide } from '../../classes/custom/MatchupSide'

interface MyProps {
	league: League | undefined
	displayIds?: number[] | undefined
}

const PowerRankingBumpChart = (props: MyProps) => {
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)')
	const chartIsFiltered = (props.displayIds?.length ?? 0) > 0
	let data
	let chartSeriesFill:
		| {
				id: string
				match:
					| Record<string, unknown>
					| '*'
					| SvgFillMatcher<
							AreaBumpComputedSerie<
								DefaultAreaBumpDatum,
								Record<string, unknown>
							>
					  >
		  }[]
		| undefined = []
	if (chartIsFiltered) {
		//Creates an array of numbers the size of the league then removes the filtered roster IDs
		chartSeriesFill = Array.from(
			{length: props.league?.members.size ?? 0},
			(_, i) => i + 1
		)
			.filter((num) => !props.displayIds?.includes(num))
			.map((id) => {
				return {
					match: {
						id: props.league?.members.get(id)?.name,
					},
					id: 'gradientA',
				}
			})
	}

	if (props.league?.settings != undefined) {
		data = formatScoresForBumpChart(props.league, props.displayIds) as any
	}
	const theme = {
		textColor: 'white',
		grid: {
			line: {
				stroke: 'grey',
				strokeWidth: 1,
				opacity: 0.2,
			},
		},
	}
	let margins = isLargerThan800
		? {top: 10, right: 120, bottom: 50, left: 120}
		: {top: 50, right: 30, bottom: 50, left: 30}

	if (data == undefined || data.length <= 0) return <Spinner />

	return (
		<ResponsiveAreaBump
			data={data}
			theme={theme}
			margin={margins}
			spacing={10}
			borderWidth={0}
			colors={{scheme: 'paired'}}
			defs={[
				linearGradientDef('gradientA', [
					{offset: 0, color: 'inherit', opacity: 0.1},
				]),
			]}
			fill={chartSeriesFill}
			startLabel={'id' as any}
			interpolation={'smooth'}
			endLabel={'id' as any}
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
							marginBottom: '3em',
						}}
					>
						<strong>
							{(serie as any).id as string}: {wins}-{losses}
						</strong>
						<br />
						<small>{winPercent}% Power Win Rate</small>
					</div>
				)
			}}
		/>
	)
}

function formatScoresForBumpChart(league: League, filteredIds: number[] = []) {
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
				roster_id: leagueMember.roster.roster_id,
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
