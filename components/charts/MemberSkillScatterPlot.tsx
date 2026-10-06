import {Box, Spinner, useMediaQuery} from '@chakra-ui/react'
import {
	ResponsiveScatterPlot,
	ScatterPlotDatum,
	ScatterPlotLayerProps,
	ScatterPlotNodeData,
	ScatterPlotNodeProps,
} from '@nivo/scatterplot'
import {createContext, useContext, useMemo, useState} from 'react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import {project_colors} from '../../utility/project_colors'

interface ScatterSeries {
	id: string
	data: {x: number; y: number}[]
}

interface MyProps {
	league: League | undefined
	// Team name of the clicked point, highlighted until another is picked
	selectedName?: string | null
	onHoverMember?: (name: string | null) => void
	onSelectMember?: (name: string) => void
}

interface NodeRenderContextValue {
	radius: number
	selectedName?: string | null
	getAvatar: (name: string | number) => string
}

const NodeRenderContext = createContext<NodeRenderContextValue>({radius: 16, getAvatar: () => ''})

const AvatarShape = ({node, active}: {node: ScatterPlotNodeData<ScatterPlotDatum>; active: boolean}) => {
	const {radius, selectedName, getAvatar} = useContext(NodeRenderContext)
	const selected = node.serieId === selectedName
	const r = active ? radius * 1.4 : selected ? radius * 1.2 : radius
	const clipId = `clipCircle-${node.id}${active ? '-active' : ''}`
	return (
		<g transform={`translate(${node.x}, ${node.y})`} style={{pointerEvents: 'none'}}>
			<defs>
				<clipPath id={clipId}>
					<circle r={r} />
				</clipPath>
			</defs>
			<image clipPath={`url(#${clipId})`} x={-r} y={-r} width={r * 2} height={r * 2} href={getAvatar(node.serieId)} />
			<circle
				r={r}
				fill='none'
				stroke={active ? 'white' : selected ? project_colors.statColor.good : 'rgba(255, 255, 255, 0.5)'}
				strokeWidth={active || selected ? 2 : 1.5}
			/>
		</g>
	)
}

// Module-level so its identity is stable and hovering never remounts the element under the cursor
const PlotNode = <RawDatum extends ScatterPlotDatum>({
	node,
	onMouseEnter,
	onMouseMove,
	onMouseLeave,
	onClick,
}: ScatterPlotNodeProps<RawDatum>) => {
	const {radius} = useContext(NodeRenderContext)
	return (
		<g>
			<AvatarShape node={node as ScatterPlotNodeData<ScatterPlotDatum>} active={false} />
			<circle
				cx={node.x}
				cy={node.y}
				r={radius * 1.2}
				fill='transparent'
				style={{cursor: 'pointer'}}
				onMouseEnter={(event) => onMouseEnter?.(node, event)}
				onMouseMove={(event) => onMouseMove?.(node, event)}
				onMouseLeave={(event) => onMouseLeave?.(node, event)}
				onClick={(event) => onClick?.(node, event)}
			/>
		</g>
	)
}

export default function MemberSkillScatterPlot(props: MyProps) {
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)')
	const [hoveredId, setHoveredId] = useState<string | null>(null)
	const league = props.league
	const data = useMemo(() => formatScoresForScatterPlot(league), [league])
	const bounds = useMemo(() => {
		let gpBounds = 0
		let maxPfBounds = 0
		let minPfBounds = 9999999
		league?.members?.forEach((mem) => {
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
	const avgPp = league.stats?.avg_pp ?? 0
	// Symmetric around 0 so the crosshair stays centered; padding scales with the data range
	const xLimit = Math.max(5, Math.ceil(bounds.gpBounds * 1.15 + 2))
	const baseRadius = isLargerThan800 ? 16 : 9

	const getAvatar = (name: string | number) => {
		const member = league.getMemberByName(String(name))
		return member?.avatar
			? `https://sleepercdn.com/avatars/thumbs/${member.avatar}`
			: 'https://sleepercdn.com/images/v2/avatars/avatar_default_blue.webp'
	}

	const HoverLayer = ({nodes}: ScatterPlotLayerProps<ScatterPlotDatum>) => {
		const hovered = nodes.find((n) => n.id === hoveredId)
		return hovered ? <AvatarShape node={hovered} active={true} /> : null
	}

	const QuadrantLayer = ({xScale, yScale, innerWidth, innerHeight}: ScatterPlotLayerProps<ScatterPlotDatum>) => {
		const toX = xScale as unknown as (v: number) => number
		const toY = yScale as unknown as (v: number) => number
		const x0 = Math.min(Math.max(toX(0), 0), innerWidth)
		const y0 = Math.min(Math.max(toY(avgPp), 0), innerHeight)
		const labelStyle = {fontSize: 11, fill: 'rgba(255, 255, 255, 0.35)', letterSpacing: 0.5, pointerEvents: 'none' as const}
		return (
			<g>
				<rect x={x0} y={0} width={innerWidth - x0} height={y0} fill={project_colors.statColor.good} fillOpacity={0.07} />
				<rect x={0} y={y0} width={x0} height={innerHeight - y0} fill={project_colors.statColor.bad} fillOpacity={0.07} />
				<line x1={x0} x2={x0} y1={0} y2={innerHeight} stroke='white' strokeOpacity={0.3} strokeDasharray='4 4' />
				<line x1={0} x2={innerWidth} y1={y0} y2={y0} stroke='white' strokeOpacity={0.3} strokeDasharray='4 4' />
				<text x={innerWidth - 8} y={16} textAnchor='end' style={labelStyle}>GOOD MANAGER / GOOD ROSTER</text>
				<text x={8} y={16} textAnchor='start' style={labelStyle}>BAD MANAGER / GOOD ROSTER</text>
				<text x={innerWidth - 8} y={innerHeight - 8} textAnchor='end' style={labelStyle}>GOOD MANAGER / BAD ROSTER</text>
				<text x={8} y={innerHeight - 8} textAnchor='start' style={labelStyle}>BAD MANAGER / BAD ROSTER</text>
			</g>
		)
	}

	const theme = {
		background: 'transparent',
		text: {fill: project_colors.textTheme.highEmphasis, fontSize: 11},
		axis: {
			domain: {line: {stroke: 'transparent'}},
			ticks: {text: {fill: 'rgba(255, 255, 255, 0.6)'}},
			legend: {text: {fill: project_colors.textTheme.highEmphasis, fontSize: 12}},
		},
		grid: {line: {stroke: 'rgba(255, 255, 255, 0.06)'}},
	}

	return (
		<Box h='100%' w='100%' bg='surface.1' borderRadius='md' overflow='hidden'>
		<NodeRenderContext.Provider value={{radius: baseRadius, selectedName: props.selectedName, getAvatar}}>
		<ResponsiveScatterPlot
			data={data}
			theme={theme}
			margin={isLargerThan800 ? marginDesktop : marginMobile}
			xScale={{type: 'linear', min: -xLimit, max: xLimit}}
			xFormat=' >-.2f'
			yScale={{type: 'linear', min: bounds.minPfBounds - 100, max: bounds.maxPfBounds + 100}}
			yFormat='>-.2f'
			nodeSize={baseRadius * 2}
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 0,
				tickPadding: 10,
				tickRotation: 0,
				tickValues: 6,
				legend: 'Owner Skill (Gut Points)',
				legendPosition: 'middle',
				legendOffset: 44,
			}}
			axisLeft={{
				tickSize: 0,
				tickPadding: 10,
				tickRotation: 0,
				tickValues: 6,
				legend: 'Roster Strength (MaxPF)',
				legendPosition: 'middle',
				legendOffset: -60,
			}}
			layers={[QuadrantLayer, 'grid', 'axes', 'nodes', HoverLayer]}
			useMesh={false}
			nodeComponent={PlotNode}
			onMouseEnter={(node) => {
				setHoveredId(node.id)
				props.onHoverMember?.(String(node.serieId))
			}}
			onMouseLeave={() => {
				setHoveredId(null)
				props.onHoverMember?.(null)
			}}
			onClick={(node) => props.onSelectMember?.(String(node.serieId))}
			tooltip={({node}) => {
				const goodSkill = node.xValue > 0
				const goodRoster = node.yValue > avgPp
				return (
					<div
						style={{
							color: 'white',
							background: project_colors.surface[0],
							padding: '10px 14px',
							borderRadius: 6,
							minWidth: 180,
						}}
					>
						<div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
							<img src={getAvatar(node.serieId)} alt='' width={24} height={24} style={{borderRadius: '50%'}} />
							<b>{node.serieId}</b>
						</div>
						<div style={{display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12}}>
							<span style={{opacity: 0.7}}>Gut Points</span>
							<span style={{color: goodSkill ? project_colors.statColor.good : project_colors.statColor.bad}}>
								{node.formattedX} pts
							</span>
						</div>
						<div style={{display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12}}>
							<span style={{opacity: 0.7}}>Roster</span>
							<span style={{color: goodRoster ? project_colors.statColor.good : project_colors.statColor.bad}}>
								{node.formattedY} MaxPF
							</span>
						</div>
					</div>
				)
			}}
			role='application'
			ariaLabel='Member skill vs roster strength scatterplot'
		/>
		</NodeRenderContext.Provider>
		</Box>
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
