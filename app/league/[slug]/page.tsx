'use client'
import {
	Box, Grid,
	GridItem,
	Heading, Skeleton
} from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useContext, useState } from 'react'
import BarChart from '../../../components/charts/bar/PFBarChart'
import LeagueWeeklyPointsLineChart from '../../../components/charts/line/LineChart'
import TeamRadarChart from '../../../components/charts/TeamRadarChart'
import HomeStatGroup from '../../../components/groups/stats/HomeStatGroup'
import LeagueNotableWeeksStatGroup from '../../../components/groups/stats/LeagueWeekGroup'
import LeagueOverviewDataTable from '../../../components/tables/LeagueOverviewDatatable'
import { LeagueContext } from '../../../contexts/LeagueContext'

const LeaguePage = () => {
	const [show, setShow] = useState(false)
	const handleToggle = () => setShow(!show)
	const [context, setContext] = useContext(LeagueContext)
	const leagueId = usePathname()?.replace('/league/', '')

	const desktopGrid = `"header header header"
                      "leagueTable weekStats weekStats"
                      "pfTable pfBarChart pfBarChart"
                      "radarChart pfLineChart pfLineChart"`

	const mobileGrid = `"header"
                      "leagueTable"
                      "weekStats"
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
				<GridItem overflowX={'hidden'} area={'pfTable'} borderRadius={4}>
					<LeagueOverviewDataTable league={context} />
				</GridItem>
				<GridItem area={'weekStats'} overflowX={'auto'}>
					<LeagueNotableWeeksStatGroup league={context} />
				</GridItem>
				<GridItem area={'pfLineChart'}>
					<Box height={'350px'} textColor='black'>
						<LeagueWeeklyPointsLineChart league={context} />
					</Box>
				</GridItem>
				<GridItem area={'pfBarChart'} minHeight={"350px"}>
						<BarChart league={context} />
				</GridItem>

				<GridItem area={'radarChart'}>
					<Box height={'500px'} textColor='black'>
						<TeamRadarChart league={context} />
					</Box>
				</GridItem>
			</Grid>
		</Box>
	)
}

export default LeaguePage
