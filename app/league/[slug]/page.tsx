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
import FaabBalances from '../../../components/groups/FaabBalances'
import HomeStatGroup from '../../../components/groups/stats/HomeStatGroup'
import LeagueNotableWeeksStatGroup from '../../../components/groups/stats/LeagueWeekGroup'
import SuperStatsGroup from '../../../components/groups/stats/SuperStatsGroup'
import LeagueOverviewDataTable from '../../../components/tables/LeagueOverviewDatatable'
import { LeagueContext } from '../../../contexts/LeagueContext'
import {POSITION} from '../../../utility/rosterFunctions'

const LeaguePage = () => {
	const [show, setShow] = useState(false)
	const handleToggle = () => setShow(!show)
	const [context, setContext] = useContext(LeagueContext)
	const [isMobile] = useMediaQuery('(max-width: 768px)')
	const [hiddenPositions, setHiddenPositions] = useState<POSITION[]>([])
	const [hiddenRosterIds, setHiddenRosterIds] = useState<number[]>([])
	const togglePosition = (position: POSITION) => setHiddenPositions((hidden) =>
		hidden.includes(position) ? hidden.filter((item) => item !== position) : [...hidden, position])
	const toggleRoster = (rosterId: number) => setHiddenRosterIds((hidden) =>
		hidden.includes(rosterId) ? hidden.filter((id) => id !== rosterId) : [...hidden, rosterId])
	const waiverType = context.settings?.settings?.waiver_type
	const showFaab = typeof waiverType !== 'number' || !Number.isFinite(waiverType) || waiverType === 2 || waiverType === 3

	const desktopGrid = `"header header header"
                      "leagueTable weekStats weekStats"
					  "super_stats super_stats super_stats"
                      "pfTable pfLineChart pfLineChart"
                      "radarChart pfBarChart pfBarChart"
					  ${showFaab ? '"faab faab faab"' : ''}`

	const mobileGrid = `"header"
                      "leagueTable"
                      "weekStats"
					  "super_stats"
                      "pfTable"
                      "pfBarChart"
					  "pfLineChart"
					  "radarChart"
					  ${showFaab ? '"faab"' : ''}`

	return (
		<Box overflowX={'hidden'}>
			<Grid
				gap={3}
				mx={4}
				my={2}
				templateAreas={{base: mobileGrid, lg: desktopGrid}}
				gridTemplateColumns={{base: 'minmax(0, 1fr)', lg: 'repeat(3, minmax(0, 1fr))'}}
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
				<GridItem area={'leagueTable'} minW={0}>
					<HomeStatGroup league={context} />
				</GridItem>
				<GridItem area={'super_stats'} minW={0}>
					<SuperStatsGroup league={context} />
				</GridItem>
				{showFaab && <GridItem area={'faab'} minW={0}>
					<FaabBalances league={context} />
				</GridItem>}
				<GridItem overflowX='auto' area={'pfTable'} borderRadius={4} minW={0}>
					<LeagueOverviewDataTable league={context} />
				</GridItem>
				<GridItem area={'weekStats'} overflowX='auto' minW={0}>
					<LeagueNotableWeeksStatGroup league={context} />
				</GridItem>
				<GridItem area={'pfLineChart'} minW={0}>
					{isMobile ? <WeekRangeChart league={context} /> : <Box height='350px' textColor='black'>
						<LeagueWeeklyPointsLineChart league={context} />
					</Box>}
				</GridItem>


				<GridItem area={'radarChart'} minW={0} display='flex'>
					<Box w='full' h='100%' minW={0} textColor='black'>
						<TeamRadarChart
							league={context}
							hiddenPositions={hiddenPositions}
							hiddenRosterIds={hiddenRosterIds}
							onToggleRoster={toggleRoster}
						/>
					</Box>
				</GridItem>				
				<GridItem area={'pfBarChart'} minHeight='350px' minW={0} display='flex'>
					<LeagueStackedPfBarChart
						league={context}
						hiddenPositions={hiddenPositions}
						hiddenRosterIds={hiddenRosterIds}
						onTogglePosition={togglePosition}
					/>
				</GridItem>
			</Grid>
		</Box>
	)
}

export default LeaguePage
