import {Spinner, useMediaQuery} from '@chakra-ui/react'
import {
	ResponsiveScatterPlot,
	ScatterPlotDatum,
	ScatterPlotNodeProps,
} from '@nivo/scatterplot'
import {useMemo} from 'react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import {project_colors} from '../../utility/project_colors'

interface ScatterSeries {
	id: string
	data: {x: number; y: number}[]
}

interface MyProps {
	league: League | undefined
}

export default function MemberSkillScatterPlot(props: MyProps) {
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)')
	const league = props.league
	const data = useMemo(() => formatScoresForScatterPlot(league), [league])
	const bounds = useMemo(() => {
		let gpBounds = 0
		let maxPfBounds = 0
		let minPfBounds = 9999999
		league?.members.forEach((mem) => {
			if (Math.abs(mem.stats.gp) > gpBounds) {
				gpBounds = Math.abs(mem.stats.gp)
			}

			if (Math.abs(mem.stats.pp) > maxPfBounds) {
				maxPfBounds = Math.abs(mem.stats.pp)
			}

			if (Math.abs(mem.stats.pp) < minPfBounds) {
				minPfBounds = Math.abs(mem.stats.pp)
			}
		})

		return {gpBounds, maxPfBounds, minPfBounds}
	}, [league])

	if (league?.members == undefined) return <Spinner />
	if (data.length <= 0) return <Spinner />

	const marginDesktop = {top: 60, right: 90, bottom: 60, left: 90}
	const marginMobile = {top: 60, right: 10, bottom: 60, left: 50}
	const gridYValues = league.stats?.avg_pp != undefined ? [league.stats.avg_pp] : []
	const gridXValues = [0]

	const CustomNode = <RawDatum extends ScatterPlotDatum>({
		node,
	}: ScatterPlotNodeProps<RawDatum>) => {
		const member = league.getMemberByName(node.serieId)
		const avatar = member?.avatar
			? `https://sleepercdn.com/avatars/thumbs/${member.avatar}`
			: 'https://sleepercdn.com/images/v2/avatars/avatar_default_blue.webp'
		const mobileMultiplyer = [.5, 1]
		const desktopMultiplyer = [1, 2]
		const scaleFactor = isLargerThan800 ? desktopMultiplyer : mobileMultiplyer
		const clipId = `clipCircle-${node.serieId}-${node.index}`
		return (
			<g
				transform={`translate(${node.x}, ${node.y})`}
				style={{pointerEvents: 'none'}}
			>
				<defs>
					<clipPath id={clipId}>
						<circle
							r={node.size * scaleFactor[0]}
							x={node.size * -1 * scaleFactor[0]}
							y={node.size * -1 * scaleFactor[0]}
						/>
					</clipPath>
				</defs>
				<image
					clipPath={`url(#${clipId})`}
					x={node.size * -1 * scaleFactor[0]}
					y={node.size * -1 * scaleFactor[0]}
					width={node.size * scaleFactor[1]}
					height={node.size * scaleFactor[1]}
					href={avatar}
				></image>
			</g>
		)
	}

	const theme = {
		background: isLargerThan800 ? project_colors.surface[1] : "",
		text: {fill: project_colors.textTheme.highEmphasis},
	}

	return (
		<ResponsiveScatterPlot
			data={data}
			theme={theme}
			margin={isLargerThan800 ? marginDesktop : marginMobile}
			xScale={{type: 'linear', min: bounds.gpBounds * -1 - 30, max: bounds.gpBounds + 30}}
			xFormat=' >-.2f'
			yScale={{type: 'linear', min: bounds.minPfBounds - 100, max: bounds.maxPfBounds + 100}}
			gridXValues={gridXValues}
			gridYValues={gridYValues}
			yFormat='>-.2f'
			blendMode='multiply'
			nodeSize={24}
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: '\u2190 \t Owner Skill (Gut Points) \t \u2192',
				legendPosition: 'middle',
				legendOffset: 46,
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: '\u2190 \tRoster Strength (MaxPF) \t \u2192',
				legendPosition: 'middle',
				legendOffset: -60,
			}}
			nodeComponent={CustomNode}
			tooltip={({node}) => (
				<div
					style={{
						color: "white",
						background: project_colors.surface[0],
						padding: '12px 16px',
					}}
				>
					<b>{node.serieId}</b>
					<br />
					<small style={{
						color: node.xValue > 0 ? project_colors.statColor.good : project_colors.statColor.bad,
					}}>
						{`${node.xValue > 0 ? 'Good Manager' : 'Bad Manager'} ${
							node.formattedX
						} Gut Points`}
						</small>
						<br />
						<small style={{
						color: node.yValue > (league.stats.avg_pp ?? 0) ? project_colors.statColor.good : project_colors.statColor.bad,
					}}>
						{`${
							node.yValue > (league.stats.avg_pp ?? 0)
								? 'Good Roster'
								: 'Bad Roster'
						} ${node.formattedY} MaxPF`}
					</small>
				</div>
			)}
			role='application'
			ariaLabel='Member skill vs roster strength scatterplot'
		/>
	)
}

function formatScoresForScatterPlot(league: League | undefined): ScatterSeries[] {
	const data: ScatterSeries[] = []

	league?.members?.forEach((member: LeagueMember) => {
		if (league.memberIdToRosterId.has(member.userId)) {
			data.push({
				id: member.name,
				data: [{x: member.stats.gp, y: member.stats.pp}],
			})
		}
	})
	return data
}
