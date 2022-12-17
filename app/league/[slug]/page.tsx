'use client'
import {
	Box,
	Button,
	Collapse,
	Container,
	Text,
	Flex,
	Grid,
	GridItem,
	Heading,
	IconButton,
	Skeleton,
	SkeletonText,
	Spacer,
} from '@chakra-ui/react'
import axios from 'axios'
import {MdExpandLess, MdExpandMore, MdMore} from 'react-icons/md'
import {usePathname} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import useSWR from 'swr'
import League from '../../../classes/custom/League'
import GenericStatCard from '../../../components/cards/statcards/GenericStatCard'
import HomeStatGroup from '../../../components/groups/stats/HomeStatGroup'
import LeagueOverviewDataTable from '../../../components/tables/LeagueOverviewDatatable'
import {Context} from '../../../contexts/Context'
import BarChart from '../../../components/charts/PFBarChart'
import TeamPlayerStatGroup from '../../../components/groups/stats/TeamPlayerStatGroup'
import LeagueNotableWeeksStatGroup from '../../../components/groups/stats/LeagueWeekGroup'
import TeamRadarChart from '../../../components/charts/TeamRadarChart'
import LineChart from '../../../components/charts/LineChart'

export default function LeaguePage() {
	const [show, setShow] = useState(false)
	const handleToggle = () => setShow(!show)
	const [context, setContext] = useContext(Context)
	const leagueId = usePathname()?.replace('/league/', '')

	const desktopGrid = `"header header header"
                      "pfStats weekStats weekStats"
                      "pfTable pfTable radarChart"
                      "pfChart pfChart pfChart"`

	const mobileGrid = `"header"
                      "pfStats"
                      "weekStats"
                      "pfTable"
                      "pfChart"`

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
							{context?.settings?.name}
						</Heading>
					</Skeleton>
				</GridItem>
				<GridItem area={'pfStats'}>
					<HomeStatGroup league={context} />
				</GridItem>
				<GridItem overflowX={'hidden'} area={'pfTable'} borderRadius={4}>
					<Collapse startingHeight={'10%'} in={show}>
						<LeagueOverviewDataTable league={context} />
					</Collapse>
					<Flex
						dropShadow={'2xl'}
						boxShadow='2xl'
						alignContent={'flex-end'}
						position={'relative'}
					>
						<Spacer />
						<IconButton
							top='-1.7em'
							icon={show ? <MdExpandLess /> : <MdExpandMore />}
							borderRadius={'full'}
							colorScheme='secondary'
							size='sm'
							onClick={handleToggle}
							mt='1rem'
							aria-label={''}
						/>
					</Flex>
					{context.settings != undefined && (
						<Box height={'500px'} textColor='black'>
							<BarChart league={context} />
						</Box>
					)}
				</GridItem>
				<GridItem area={'weekStats'} overflowX={'auto'}>
					<LeagueNotableWeeksStatGroup league={context} />
				</GridItem>
				<GridItem area={'pfChart'}>
					<Box height={'500px'} textColor='black'>
						<LineChart league={context} />
					</Box>
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
