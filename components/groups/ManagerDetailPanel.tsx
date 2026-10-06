'use client'
import {Avatar, Box, Flex, Grid, Text} from '@chakra-ui/react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import {ordinal_suffix_of} from '../../utility/rosterFunctions'

interface MyProps {
	league: League | undefined
	memberName: string | null | undefined
}

const efficiency = (member: LeagueMember) => (member.stats.pp > 0 ? member.stats.pf / member.stats.pp : 0)

const rankOf = (league: League, member: LeagueMember, value: (m: LeagueMember) => number) => {
	const sorted = Array.from(league.members.values()).sort((a, b) => value(b) - value(a))
	return sorted.findIndex((m) => m.roster.roster_id === member.roster.roster_id) + 1
}

const Stat = ({label, value, sub}: {label: string; value: string; sub?: string}) => (
	<Box bg='surface.2' borderRadius='md' p={2}>
		<Text fontSize='10px' color='textTheme.mediumEmphasis' textTransform='uppercase' letterSpacing='wider'>
			{label}
		</Text>
		<Text fontSize='lg' fontWeight='bold' color='white' lineHeight='short'>
			{value}
		</Text>
		{sub && (
			<Text fontSize='xs' color='textTheme.mediumEmphasis'>
				{sub}
			</Text>
		)}
	</Box>
)

const ManagerDetailPanel = ({league, memberName}: MyProps) => {
	const member = memberName ? league?.getMemberByName(memberName) : undefined
	if (!league || !member) {
		return (
			<Flex bg='surface.1' borderRadius='md' h='100%' minH='200px' align='center' justify='center' p={6}>
				<Text fontSize='sm' color='textTheme.mediumEmphasis' textAlign='center'>
					Hover or click a team on the chart to see their lineup breakdown
				</Text>
			</Flex>
		)
	}

	const {stats} = member
	const rosterId = member.roster.roster_id
	const total = league.members.size

	// Weekly lineup results for best and worst weeks
	const weekly = Array.from(league.weeks.values())
		.map((week) => ({week: week.weekNumber, side: week.getMemberMatchupSide(rosterId)}))
		.filter((entry) => entry.side != undefined)
	const byGutPoints = [...weekly].sort((a, b) => b.side.gp - a.side.gp)
	const bestWeek = byGutPoints[0]
	const worstWeek = byGutPoints[byGutPoints.length - 1]

	const rankLabel = (value: (m: LeagueMember) => number) => `${ordinal_suffix_of(rankOf(league, member, value))} of ${total}`
	const record = `${stats.wins}-${stats.losses}${stats.ties > 0 ? `-${stats.ties}` : ''}`
	const benchPoints = Math.max(stats.pp - stats.pf, 0)

	return (
		<Box bg='surface.1' borderRadius='md' p={4} h='100%' overflowY='auto'>
			<Flex align='center' gap={3} mb={3}>
				<Avatar size='md' src={member.getTeamAvatar()} name={member.name} />
				<Box minW={0}>
					<Text fontWeight='bold' color='white' noOfLines={1}>
						{member.name}
					</Text>
					<Text fontSize='xs' color='textTheme.mediumEmphasis'>
						{record}
					</Text>
				</Box>
			</Flex>
			<Grid templateColumns='1fr 1fr' gap={2}>
				<Stat label='Gut points' value={stats.gp.toFixed(2)} sub={rankLabel((m) => m.stats.gp)} />
				<Stat label='MaxPF' value={stats.pp.toFixed(2)} sub={rankLabel((m) => m.stats.pp)} />
				<Stat label='Lineup efficiency' value={`${(efficiency(member) * 100).toFixed(1)}%`} sub={rankLabel(efficiency)} />
				<Stat label='Points left on bench' value={benchPoints.toFixed(2)} sub={rankLabel((m) => m.stats.pp - m.stats.pf)} />
				<Stat label='Gut plays' value={String(stats.gutPlays)} />
				<Stat label='Winnable losses' value={String(stats.winnableLosses)} />
			</Grid>
			{bestWeek && worstWeek && (
				<Grid templateColumns='1fr 1fr' gap={2} mt={2}>
					<Stat label='Best lineup week' value={`Wk ${bestWeek.week}`} sub={`${bestWeek.side.gp.toFixed(2)} gut points`} />
					<Stat label='Worst lineup week' value={`Wk ${worstWeek.week}`} sub={`${worstWeek.side.gp.toFixed(2)} gut points`} />
				</Grid>
			)}
		</Box>
	)
}

export default ManagerDetailPanel
