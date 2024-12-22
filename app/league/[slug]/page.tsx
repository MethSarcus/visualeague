'use client'
import {
	Box, Grid,
	GridItem,
	Heading, Skeleton, useMediaQuery
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import LeagueStackedPfBarChart from '../../../components/charts/bar/LeaguePFBarChart'
import LeagueWeeklyPointsLineChart from '../../../components/charts/line/LineChart'
import WeekRangeChart from '../../../components/charts/line/WeekRangeChart'
import TeamRadarChart from '../../../components/charts/TeamRadarChart'
import HomeStatGroup from '../../../components/groups/stats/HomeStatGroup'
import LeagueNotableWeeksStatGroup from '../../../components/groups/stats/LeagueWeekGroup'
import SuperStatsGroup from '../../../components/groups/stats/SuperStatsGroup'
import LeagueOverviewDataTable from '../../../components/tables/LeagueOverviewDatatable'
import { LeagueContext } from '../../../contexts/LeagueContext'

const LeaguePage = () => {
	const [show, setShow] = useState(false)
	const handleToggle = () => setShow(!show)
	const [context, setContext] = useContext(LeagueContext)
	const isMobile = useMediaQuery('(max-width: 768px)')

	const desktopGrid = `"header header header"
                      "leagueTable weekStats weekStats"
					  "super_stats super_stats super_stats"
                      "pfTable pfLineChart pfLineChart"
                      "radarChart pfBarChart pfBarChart"`

	const mobileGrid = `"header"
                      "leagueTable"
                      "weekStats"
					  "super_stats"
                      "pfTable"
                      "pfBarChart"
					  "pfLineChart"
					  "radarChart"`

	return (
		<Box overflowX={'hidden'}>
			<Grid
				gap={3}
				mx={4}
				my={2}
				templateAreas={[mobileGrid, desktopGrid]}
				gridTemplateColumns={['1fr', '1fr 1fr 1fr']}
			>
				<GridItem area={'header'}>
					<Skeleton
						fontWeight='black'
						mx={10}
						isLoaded={context.settings != undefined}
					>
						<Heading
							textAlign={'center'}
							py={2}
							size={'md'}
							m={2}
							color={'white'}
						>
							{context?.settings?.name + ` (${context?.settings?.season})`}
						</Heading>
					</Skeleton>
				</GridItem>
				<GridItem area={'leagueTable'}>
					<HomeStatGroup league={context} />
				</GridItem>
				<GridItem area={'super_stats'}>
					<SuperStatsGroup league={context} />
				</GridItem>
				<GridItem overflowX={'hidden'} area={'pfTable'} borderRadius={4}>
					<LeagueOverviewDataTable league={context} />
				</GridItem>
				<GridItem area={'weekStats'} overflowX={'auto'}>
					<LeagueNotableWeeksStatGroup league={context} />
				</GridItem>
				<GridItem area={'pfLineChart'}>
					<Box height={'350px'} textColor='black'>
						{isMobile ? <WeekRangeChart league={context} /> : <LeagueWeeklyPointsLineChart league={context} />}
					</Box>
				</GridItem>


				<GridItem area={'radarChart'}>
					<Box height={'500px'} textColor='black'>
						<TeamRadarChart league={context} />
					</Box>
				</GridItem>				
				<GridItem area={'pfBarChart'} minHeight={"350px"}>
					<LeagueStackedPfBarChart league={context} />
				</GridItem>
			</Grid>
		</Box>
	)
}

export default LeaguePage
