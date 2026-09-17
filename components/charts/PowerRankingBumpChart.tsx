import { Spinner, useMediaQuery } from '@chakra-ui/react'
import {
	AreaBumpComputedSerie,
	AreaBumpDatum,
	ResponsiveAreaBump
} from '@nivo/bump'
import { linearGradientDef } from '@nivo/core'
import { useMemo } from 'react'
import League from '../../classes/custom/League'
import { MatchupSide } from '../../classes/custom/MatchupSide'

interface MyProps {
	league: League | undefined
	displayIds?: number[] | undefined
}

interface PowerRankExtraProps {
	roster_id: number
	totalWins: number
	totalLosses: number
	[key: string]: unknown
}

const PowerRankingBumpChart = (props: MyProps) => {
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)')
	const chartIsFiltered = (props.displayIds?.length ?? 0) > 0
	const league = props.league
	const displayIds = props.displayIds

	const data = useMemo(() => {
		if (league?.settings == undefined) return undefined
		return formatScoresForBumpChart(league)
	}, [league])

	const chartSeriesFill = useMemo(() => {
		if (!chartIsFiltered) return []
		//Creates an array of numbers the size of the league then removes the filtered roster IDs
		return Array.from(
			{length: league?.members.size ?? 0},
			(_, i) => i + 1
		)
			.filter((num) => !displayIds?.includes(num))
			.map((id) => {
				return {
					match: {
						id: league?.members.get(id)?.name,
					},
					id: 'gradientA',
				}
			})
	}, [chartIsFiltered, league, displayIds])

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
	const margins = isLargerThan800
		? {top: 10, right: 120, bottom: 50, left: 120}
		: {top: 50, right: 30, bottom: 50, left: 30}

	if (data == undefined || data.length <= 0) return <Spinner />

	return (
		<ResponsiveAreaBump<AreaBumpDatum, PowerRankExtraProps>
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
			startLabel={(serie) => serie.id}
			interpolation="smooth"
			endLabel={(serie) => serie.id}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Cumulative Power Rankings',
				legendPosition: 'middle',
				legendOffset: 35,
			}}
			tooltip={({serie}) => {
				const {wins, losses, winPercent} = getWinPercent(serie)
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
							{serie.id}: {wins}-{losses}
						</strong>
						<br />
						<small>{winPercent}% Power Win Rate</small>
					</div>
				)
			}}
			role="application"
		/>
	)
}

function getWinPercent(serie: AreaBumpComputedSerie<AreaBumpDatum, PowerRankExtraProps>) {
	const wins = serie.data.totalWins
	const losses = serie.data.totalLosses
	let winPercent: number
	if (losses === 0 && wins === 0) {
		winPercent = 0
	} else if (losses === 0) {
		winPercent = 1.0
	} else if (wins === 0) {
		winPercent = 0.0
	} else {
		winPercent = Number((wins / (wins + losses)).toFixed(2))
	}
	return {wins, losses, winPercent}
}

function formatScoresForBumpChart(league: League) {
	//Roster ID to array of {wins, teamsInWeek} for each week played
	const memberPowerWins: Map<number, {wins: number; teamsInWeek: number}[]> = new Map()
	league.members.forEach((member) => {
		memberPowerWins.set(member.roster.roster_id, [])
	})

	const weeks: number[] = []

	league.weeks.forEach((week) => {
		weeks.push(week.weekNumber)
		const teams = week.getAllTeams().sort((a: MatchupSide, b: MatchupSide) => {
			if (a.pf < b.pf) {
				return 1
			} else if (a.pf > b.pf) {
				return -1
			} else {
				return 0
			}
		})
		teams.forEach((team, index) => {
			const weeklyWins = memberPowerWins.get(team.roster_id)
			if (weeklyWins != undefined) {
				weeklyWins.push({
					wins: teams.length - index - 1,
					teamsInWeek: teams.length,
				})
			}
		})
	})

	const data: {id: string; roster_id: number; totalWins: number; totalLosses: number; data: {x: number; y: number}[]}[] = []

	memberPowerWins.forEach((weeklyResults, key) => {
		const leagueMember = league.members.get(key)
		if (leagueMember != undefined) {
			let totalWins = 0
			let totalLosses = 0
			const memberWins: number[] = []
			weeklyResults.forEach(({wins, teamsInWeek}) => {
				totalWins += wins
				totalLosses += teamsInWeek - 1 - wins
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
