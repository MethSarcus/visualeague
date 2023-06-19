'use client'
import {
	Box,
	Flex,
	Grid,
	GridItem,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	useMediaQuery,
} from '@chakra-ui/react'
import {usePathname} from 'next/navigation'
import {useContext} from 'react'
import League from '../../../../../classes/custom/League'
import LeagueMember from '../../../../../classes/custom/LeagueMember'
import MatchupInterface from '../../../../../classes/custom/MatchupInterface'
import {Week} from '../../../../../classes/custom/Week'
import MatchupPreview from '../../../../../components/cards/MatchupPreview'
import TeamCardWithTrendingGraph from '../../../../../components/cards/TeamCardWithTrendingGraph'
import TeamPagePointsChart from '../../../../../components/charts/bar/TeamPagePointsChart'
import TeamPagePointsChartMobile from '../../../../../components/charts/bar/TeamPagePointsChartMobile'
import TeamPageRadarChart from '../../../../../components/charts/team_charts/TeamPageRadarChart'
import TeamPlayerStatGroup from '../../../../../components/groups/stats/TeamPlayerStatGroup'
import TeamStatGroup from '../../../../../components/groups/stats/TeamStatGroup'
import WeeklyTeamStatGroup from '../../../../../components/groups/stats/WeeklyTeamStatGroup'
import MemberTradeGroup from '../../../../../components/groups/transactions/MemberTradeGroup'
import {LeagueContext} from '../../../../../contexts/LeagueContext'

const TeamPage = () => {
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)', {
		ssr: true,
		fallback: false, // return false on the server, and re-evaluate on the client side
	})
	const [context, setContext] = useContext(LeagueContext)
	const memberId = usePathname()?.split('/').at(-1)
	let member: undefined | LeagueMember
	let matchups: MatchupInterface[] = []

	if (context.settings) {
		member = context.members.get(parseInt(memberId!))
		matchups = []
		;(context as League).weeks.forEach((week: Week) => {
			matchups.push(week.getMemberMatchup(member?.roster.roster_id!))
		})
	}

	const desktopTemplate = `"TeamSum TeamSum TeamSum"
  "schedule schedule schedule"
  "stats stats stats"
  "playerStats playerStats playerStats"
  "weekStats weekStats weekStats"
  "radar radar radar"`

	const mobileTemplate = `"TeamSum"
  "schedule"
  "stats"
  "playerStats"
  "weekStats"
  "radar"`
	console.debug('isLargerThan800', isLargerThan800)
	return (
		<Box overflowX={'hidden'}>
			<Grid gap={5} mx={4} my={2} templateAreas={[mobileTemplate, desktopTemplate]}>
				<GridItem area={'TeamSum'} mt={3}>
					<TeamCardWithTrendingGraph member={member} league={context} variant={''} size={'md'} />
				</GridItem>
				<GridItem overflowX={'auto'} area={'schedule'}>
					<Flex>
						{matchups.map((matchup: MatchupInterface) => {
							return (
								<MatchupPreview
									key={`week_${matchup.weekNumber}_preview`}
									matchup={matchup}
									member={member}
								/>
							)
						})}
					</Flex>
				</GridItem>
				<GridItem area={'stats'}>
					{/* <Text color={"white"}>Division Record: {member?.stats?.divisionWins} - {member?.stats?.divisionLosses}</Text> */}
					<TeamStatGroup league={context} memberId={parseInt(memberId!)} />
				</GridItem>

				<GridItem area={'playerStats'} overflowX={'clip'}>
					<Text mb={2} textColor={'textTheme.mediumEmphasis'}>
						Player Stats
					</Text>
					<Box overflowX={'auto'}>
						<TeamPlayerStatGroup league={context} memberId={parseInt(memberId!)} />
					</Box>
				</GridItem>
				<GridItem area={'weekStats'} overflowX={'clip'}>
					<Text mb={2} textColor={'textTheme.mediumEmphasis'}>
						Matchup Stats
					</Text>
					<Box overflowX={'auto'}>
						<WeeklyTeamStatGroup league={context} memberId={parseInt(memberId!)} />
					</Box>
				</GridItem>
				<GridItem minH='300px' area={'radar'}>
					<Tabs variant='soft-rounded' colorScheme={'secondary'}>
						<TabList>
							<Tab>Positional Point Chart</Tab>
							<Tab>Pos Avg</Tab>

							<Tab>Trades</Tab>
						</TabList>

						<TabPanels>
							<TabPanel>
								{member &&
									(isLargerThan800 ? (
										<Flex bg={'surface.0'} borderRadius={'md'} minH='600px'>
											<TeamPagePointsChart
												isMobile={!isLargerThan800}
												memberName={member.name}
												homePointMap={member.stats.position_scores}
												awayPointMap={(context as League).getOpponentPositionalScores(
													member.roster.roster_id
												)}
												avgPointMap={(context as League).stats.getPositionAvgTotalPointsMap(
													(context as League).members.size
												)}
											/>
										</Flex>
									) : 
										<Flex bg={'surface.0'} borderRadius={'md'} minH='600px'>
											<TeamPagePointsChartMobile
												isMobile={!isLargerThan800}
												memberName={member.name}
												homePointMap={member.stats.position_scores}
												awayPointMap={(context as League).getOpponentPositionalScores(
													member.roster.roster_id
												)}
												avgPointMap={(context as League).stats.getPositionAvgTotalPointsMap(
													(context as League).members.size
												)}
											/>
										</Flex>
									)}
							</TabPanel>
							<TabPanel maxH={'600px'} minH='300px' h={'1px'}>
								<TeamPageRadarChart league={context} memberId={parseInt(memberId!)} />
							</TabPanel>
							<TabPanel>
								<MemberTradeGroup league={context} memberId={memberId} />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</GridItem>
			</Grid>
		</Box>
	)
}

export default TeamPage
