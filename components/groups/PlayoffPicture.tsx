'use client'
import {Avatar, Badge, Box, Flex, Grid, Heading, Text, Tooltip, useMediaQuery} from '@chakra-ui/react'
import {useMemo} from 'react'
import League from '../../classes/custom/League'
import {buildBracket, OddsTeam, ScheduleEntry, seedTeams} from '../../utility/playoffOdds'

interface MyProps {
	league: League
	teams: OddsTeam[]
	schedules: Map<number, ScheduleEntry[]>
	playoffTeams: number
	divisionSpots: number
	divisionWinnersFirst: boolean
}

const roundLabel = (roundIndex: number, totalRounds: number) => {
	const fromEnd = totalRounds - 1 - roundIndex
	if (fromEnd === 0) return 'Final'
	if (fromEnd === 1) return 'Semifinals'
	if (fromEnd === 2) return 'Quarterfinals'
	return `Round ${roundIndex + 1}`
}

const record = (team: OddsTeam) => `${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`

const RESULT_COLOR = {W: 'green.300', L: 'red.300', T: 'yellow.300'}
const ROW_COLUMNS = '44px 56px 1fr auto'

// Matchup difficulty for a projected game, from the team's win chance
const difficulty = (winProb: number) => {
	if (winProb >= 0.6) return {label: 'Easy', color: 'green.300'}
	if (winProb <= 0.4) return {label: 'Tough', color: 'red.300'}
	return {label: 'Toss-up', color: 'yellow.300'}
}

const ScheduleTip = ({league, name, entries}: {league: League; name?: string; entries: ScheduleEntry[]}) => {
	const firstProjected = entries.findIndex((entry) => !entry.played)
	return (
		<Box minW='280px' p={2}>
			<Text fontWeight='bold' fontSize='sm' mb={2}>
				{name}
			</Text>
			{entries.length === 0 && <Text fontSize='xs'>No games found</Text>}
			{entries.map((entry, index) => {
				const opponent = league.members.get(entry.opponentId)?.name ?? 'Unknown'
				const badge = entry.played
					? {label: entry.result ?? 'T', color: RESULT_COLOR[entry.result ?? 'T']}
					: difficulty(entry.winProb ?? 0.5)
				return (
					<Box key={entry.week}>
						{index === firstProjected && (
							<Flex align='center' gap={2} my={2}>
								<Box flex={1} h='1px' bg='whiteAlpha.400' />
								<Text fontSize='10px' textTransform='uppercase' letterSpacing='wider' color='textTheme.mediumEmphasis'>
									Projected
								</Text>
								<Box flex={1} h='1px' bg='whiteAlpha.400' />
							</Flex>
						)}
						<Grid templateColumns={ROW_COLUMNS} columnGap={2} alignItems='center' fontSize='xs' py='3px' whiteSpace='nowrap'>
							<Text color='textTheme.mediumEmphasis'>Wk {entry.week}</Text>
							<Text
								fontWeight='bold'
								textAlign='center'
								borderRadius='sm'
								bg='whiteAlpha.100'
								color={badge.color}
								px={1}
							>
								{badge.label}
							</Text>
							<Text overflow='hidden' textOverflow='ellipsis'>
								{opponent}
							</Text>
							<Text color='textTheme.mediumEmphasis' textAlign='right'>
								{entry.played ? `${entry.teamScore?.toFixed(1)} - ${entry.opponentScore?.toFixed(1)}` : ''}
							</Text>
						</Grid>
					</Box>
				)
			})}
		</Box>
	)
}

const PlayoffPicture = ({league, teams, schedules, playoffTeams, divisionSpots, divisionWinnersFirst}: MyProps) => {
	// The bracket is too wide for phones, so only the standings show there
	const [isDesktop] = useMediaQuery('(min-width: 800px)')
	const picture = useMemo(() => {
		const order = seedTeams({
			wins: teams.map((t) => t.wins + t.ties / 2),
			pf: teams.map((t) => t.pf),
			divisionIds: teams.map((t) => t.divisionId),
			playoffTeams,
			divisionSpots,
			divisionWinnersFirst,
		})
		const seedById = new Map<number, number>()
		order.forEach((teamIndex, i) => seedById.set(teams[teamIndex].id, i + 1))
		const teamBySeed = (seedNumber: number | null) =>
			seedNumber == null ? undefined : teams[order[seedNumber - 1]]

		const divisions = new Map<number | undefined, OddsTeam[]>()
		teams.forEach((team) => divisions.set(team.divisionId, [...(divisions.get(team.divisionId) ?? []), team]))
		const divisionList = Array.from(divisions.entries())
			.sort(([a], [b]) => (a ?? 0) - (b ?? 0))
			.map(([id, members]) => ({
				id,
				members: [...members].sort(
					(a, b) => b.wins + b.ties / 2 - (a.wins + a.ties / 2) || b.pf - a.pf
				),
			}))

		return {seedById, teamBySeed, divisionList, bracket: buildBracket(Math.min(playoffTeams, teams.length))}
	}, [teams, playoffTeams, divisionSpots, divisionWinnersFirst])

	const hasDivisions = picture.divisionList.length > 1
	const name = (team: OddsTeam | undefined) => (team ? league.members.get(team.id)?.name : undefined)
	const withSchedule = (team: OddsTeam | undefined, children: React.ReactElement) =>
		team ? (
			<Tooltip
				hasArrow
				placement='right'
				bg='surface.0'
				color='white'
				label={
					<ScheduleTip
						league={league}
						name={name(team)}
						entries={schedules.get(team.id) ?? []}
					/>
				}
			>
				{children}
			</Tooltip>
		) : (
			children
		)

	const TeamRow = ({
		team,
		seedNumber,
		emptyLabel,
	}: {
		team: OddsTeam | undefined
		seedNumber: number | null
		emptyLabel: string
	}) =>
		withSchedule(
			team,
			<Flex align='center' gap={2} px={2} h='28px' minW='150px' cursor={team ? 'default' : undefined}>
			<Text fontSize='xs' color='textTheme.mediumEmphasis' w='14px' textAlign='right'>
				{seedNumber ?? ''}
			</Text>
			{team ? (
				<>
					<Avatar size='2xs' src={league.members.get(team.id)?.getTeamAvatar()} name={name(team)} />
					<Text fontSize='xs' color='white' noOfLines={1}>
						{name(team)}
					</Text>
				</>
			) : (
				<Text fontSize='xs' color='textTheme.disabled'>
					{emptyLabel}
				</Text>
			)}
			</Flex>
		)

	return (
		<Box bg='surface.1' borderRadius='md' p={[2, 4]} overflowX='auto'>
			<Heading size='md' color='white' textAlign='center' mb={1}>
				Playoff Picture
			</Heading>
			<Text fontSize='xs' color='textTheme.mediumEmphasis' textAlign='center' mb={4}>
				Projected final standings (most likely record)
			</Text>
			<Flex gap={8} wrap='wrap' justify='center' align='flex-start'>
				<Flex direction='column' gap={3} minW={['100%', '240px']}>
					{picture.divisionList.map((division) => (
						<Box key={String(division.id)} bg='surface.2' borderRadius='md' p={2}>
							<Text fontSize='xs' fontWeight='bold' color='textTheme.mediumEmphasis' mb={1}>
								{hasDivisions ? `Division ${division.id ?? '-'}` : 'Standings'}
							</Text>
							{division.members.map((team) => {
								const seedNumber = picture.seedById.get(team.id)!
								const inPlayoffs = seedNumber <= playoffTeams
								return (
									<Box key={team.id}>
									{withSchedule(
										team,
									<Flex align='center' gap={2} h='26px' opacity={inPlayoffs ? 1 : 0.5}>
										<Badge
											colorScheme={inPlayoffs ? 'teal' : 'gray'}
											w='22px'
											textAlign='center'
											fontSize='10px'
										>
											{inPlayoffs ? seedNumber : '-'}
										</Badge>
										<Avatar size='2xs' src={league.members.get(team.id)?.getTeamAvatar()} name={name(team)} />
										<Text fontSize='xs' color='white' flex={1} noOfLines={1}>
											{name(team)}
										</Text>
										<Text fontSize='xs' color='textTheme.mediumEmphasis'>
											{record(team)}
										</Text>
									</Flex>
									)}
									</Box>
								)
							})}
						</Box>
					))}
				</Flex>
				{isDesktop && (
				<Flex align='stretch'>
					{picture.bracket.map((round, roundIndex) => {
						const isLastRound = roundIndex === picture.bracket.length - 1
						const lineColor = 'whiteAlpha.400'
						return (
							<Flex key={roundIndex} direction='column'>
								<Text fontSize='xs' fontWeight='bold' color='textTheme.mediumEmphasis' textAlign='center' mb={2}>
									{roundLabel(roundIndex, picture.bracket.length)}
								</Text>
								{/* Equal-height cells keep each match centered between the two feeding it */}
								<Flex direction='column' flex={1}>
									{round.map((match, matchIndex) => {
										const isUpperOfPair = matchIndex % 2 === 0
										return (
											<Flex key={matchIndex} flex={1} align='center'>
												<Box bg='surface.2' borderRadius='md' overflow='hidden' my={1.5} w='200px' flexShrink={0}>
													<TeamRow team={picture.teamBySeed(match.top)} seedNumber={match.top} emptyLabel='TBD' />
													<Box h='1px' bg='whiteAlpha.200' />
													<TeamRow
														team={picture.teamBySeed(match.bottom)}
														seedNumber={match.bottom}
														emptyLabel={roundIndex === 0 ? 'BYE' : 'TBD'}
													/>
												</Box>
												<Box position='relative' w='28px' alignSelf='stretch'>
													{!isLastRound && (
														<>
															<Box position='absolute' top='50%' left={0} w='14px' h='1px' bg={lineColor} />
															<Box
																position='absolute'
																left='14px'
																w='1px'
																bg={lineColor}
																top={isUpperOfPair ? '50%' : 0}
																bottom={isUpperOfPair ? '-1px' : '50%'}
															/>
															<Box
																position='absolute'
																left='14px'
																w='14px'
																h='1px'
																bg={lineColor}
																top={isUpperOfPair ? undefined : 0}
																bottom={isUpperOfPair ? '-1px' : undefined}
															/>
														</>
													)}
												</Box>
											</Flex>
										)
									})}
								</Flex>
							</Flex>
						)
					})}
				</Flex>
				)}
			</Flex>
		</Box>
	)
}

export default PlayoffPicture
