import { Spinner, useMediaQuery } from '@chakra-ui/react'
import { BumpDatum, BumpSerie, ResponsiveBump } from '@nivo/bump'
import { useMemo } from 'react'
import League from '../../classes/custom/League'

interface MyProps {
	league: League | undefined
	displayIds?: number[] | undefined
}

interface PowerRankExtraProps {
	roster_id: number
	totalWins: number
	totalLosses: number
	finalRank: number
	[key: string]: unknown
}

type PowerRankSerie = BumpSerie<BumpDatum, PowerRankExtraProps>

const PowerRankingBumpChart = (props: MyProps) => {
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)')
	const league = props.league
	const displayIds = props.displayIds
	const chartIsFiltered = (displayIds?.length ?? 0) > 0

	const data = useMemo(() => {
		if (league?.settings == undefined) return undefined
		return formatScoresForBumpChart(league)
	}, [league])

	const theme = {
		textColor: 'white',
		grid: {line: {stroke: 'grey', strokeWidth: 1, opacity: 0.2}},
		axis: {ticks: {text: {fill: 'rgba(255, 255, 255, 0.7)'}}, legend: {text: {fill: 'white'}}},
	}
	const margins = isLargerThan800
		? {top: 10, right: 170, bottom: 50, left: 50}
		: {top: 20, right: 80, bottom: 50, left: 30}

	if (data == undefined || data.length <= 0) return <Spinner />

	const getColor = (serie: PowerRankSerie) => {
		const hue = (serie.roster_id * 137.5) % 360
		const isDimmed = chartIsFiltered && !displayIds?.includes(serie.roster_id)
		return `hsla(${hue}, 70%, 60%, ${isDimmed ? 0.15 : 1})`
	}

	return (
		<ResponsiveBump<BumpDatum, PowerRankExtraProps>
			data={data}
			theme={theme}
			margin={margins}
			colors={getColor}
			lineWidth={3}
			activeLineWidth={6}
			inactiveLineWidth={2}
			inactiveOpacity={0.2}
			pointSize={10}
			activePointSize={16}
			inactivePointSize={0}
			pointColor={{theme: 'background'}}
			pointBorderWidth={3}
			activePointBorderWidth={3}
			pointBorderColor={{from: 'serie.color'}}
			interpolation='smooth'
			startLabel={false}
			endLabel={(serie) => {
				const label = `${(serie as PowerRankSerie).finalRank}. ${serie.id}`
				return isLargerThan800 ? label : label.slice(0, 10)
			}}
			endLabelPadding={14}
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 0,
				tickPadding: 10,
				legend: 'Week',
				legendPosition: 'middle',
				legendOffset: 38,
			}}
			axisLeft={{
				tickSize: 0,
				tickPadding: 10,
				legend: 'Rank',
				legendPosition: 'middle',
				legendOffset: -36,
			}}
			lineTooltip={({serie}) => {
				const {totalWins, totalLosses} = serie.data as unknown as PowerRankExtraProps
				const games = totalWins + totalLosses
				const winPercent = games === 0 ? 0 : Math.round((totalWins / games) * 100)
				return (
					<div style={{padding: 12, background: '#222222', color: 'white'}}>
						<strong>
							{serie.id}: {totalWins}-{totalLosses}
						</strong>
						<br />
						<small>{winPercent}% Power Win Rate</small>
					</div>
				)
			}}
			role='application'
		/>
	)
}

function formatScoresForBumpChart(league: League): PowerRankSerie[] {
	const rosterIds = Array.from(league.members.values()).map((m) => m.roster.roster_id)
	const totals = new Map<number, {wins: number; losses: number; pf: number}>()
	const ranksByRoster = new Map<number, {x: number; y: number}[]>()
	rosterIds.forEach((id) => {
		totals.set(id, {wins: 0, losses: 0, pf: 0})
		ranksByRoster.set(id, [])
	})

	league.weeks.forEach((week) => {
		const teams = [...week.getAllTeams()].sort((a, b) => b.pf - a.pf)
		teams.forEach((team, index) => {
			const total = totals.get(team.roster_id)
			if (total == undefined) return
			total.wins += teams.length - index - 1
			total.losses += index
			total.pf += team.pf
		})

		// Rank by cumulative power wins, PF breaks ties
		const ranked = [...rosterIds].sort((a, b) => {
			const ta = totals.get(a)!
			const tb = totals.get(b)!
			return tb.wins - ta.wins || tb.pf - ta.pf
		})
		ranked.forEach((id, index) => {
			ranksByRoster.get(id)?.push({x: week.weekNumber, y: index + 1})
		})
	})

	const data: PowerRankSerie[] = []
	league.members.forEach((member) => {
		const id = member.roster.roster_id
		const total = totals.get(id)!
		const points = ranksByRoster.get(id) ?? []
		data.push({
			id: member.name,
			roster_id: id,
			totalWins: total.wins,
			totalLosses: total.losses,
			finalRank: points[points.length - 1]?.y ?? 0,
			data: points,
		})
	})

	return data
}

export default PowerRankingBumpChart
