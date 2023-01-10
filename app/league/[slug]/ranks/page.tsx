'use client'
import {Box, Grid, GridItem, Heading, Skeleton} from '@chakra-ui/react'
import {useContext} from 'react'
import WeeklyRankingBumpChart from '../../../../components/charts/BumpChart'
import PowerRankingBumpChart from '../../../../components/charts/PowerRankingBumpChart'
import AllPlayRankGroup from '../../../../components/groups/AllPlayRankGroup'
import {Context} from '../../../../contexts/Context'

export default function RankPage() {
	const [context, setContext] = useContext(Context)
	const desktopTemplate = `  
	"header header"
	"allplay_table cumulative_ranks"
	"bump_chart bump_chart"`

	const mobileTemplate = `  
	"header"
	"cumulative_ranks"
	"allplay_table"
	"bump_chart"`
	return (
		<Box overflowX={'hidden'} w={'full'} height={'full'}>
			<Grid
				gap={3}
				mx={4}
				my={2}
				templateAreas={[mobileTemplate, desktopTemplate]}
				gridTemplateColumns={['1fr', '1fr 1fr']}
				gridTemplateRows={'60px 1fr 1fr'}
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
							Power Ranks
						</Heading>
					</Skeleton>
				</GridItem>
				<GridItem
					area={'allplay_table'}
					overflowX={'auto'}
					overflowY={'hidden'}
				>
					<AllPlayRankGroup league={context} />
				</GridItem>
				<GridItem area={'cumulative_ranks'}>
					<PowerRankingBumpChart league={context} />
				</GridItem>
				<GridItem area={'bump_chart'} height={'500px'}>
					<WeeklyRankingBumpChart league={context} />
				</GridItem>
			</Grid>
		</Box>
	)
}
