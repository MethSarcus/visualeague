'use client'
import {Box, Grid, GridItem, Heading, Skeleton} from '@chakra-ui/react'
import React from 'react'
import {useContext, useState} from 'react'
import WeeklyRankingBumpChart from '../../../../components/charts/BumpChart'
import MemberSkillScatterPlot from '../../../../components/charts/MemberSkillScatterPlot'
import PowerRankingBumpChart from '../../../../components/charts/PowerRankingBumpChart'
import AllPlayRankGroup from '../../../../components/groups/AllPlayRankGroup'
import {LeagueContext} from '../../../../contexts/LeagueContext'

const RankPage = () => {
	const [context, setContext] = useContext(LeagueContext)
	const [filteredIds, setFilteredIds] = useState([] as number[])


	const onHover: (rosterIds: number[]) => void = (rosterIds: number[]) => {
		setFilteredIds(rosterIds)
	}
	const desktopTemplate = `  
	"header header"
	"allplay_table cumulative_ranks"
	"owner_skill owner_skill"`

	const mobileTemplate = `  
	"header"
	"cumulative_ranks"
	"allplay_table"
	"owner_skill"`
	return (
		<Box overflowX={'hidden'} w={'full'} height={'full'}>
			<Grid
				gap={3}
				mx={4}
				my={2}
				templateAreas={[mobileTemplate, desktopTemplate]}
				gridTemplateColumns={['1fr', '1fr 1fr']}
				gridTemplateRows={'60px 1fr 1fr 1fr'}
			>
				<GridItem area={'header'}>
					<Skeleton
						fontWeight='black'
						mx={10}
						isLoaded={context.settings != undefined}
					>
						<Heading
							textAlign={'center'}
							size={'lg'}
							m={2}
							color={'white'}
						>
							League Power Ranks
						</Heading>
					</Skeleton>
				</GridItem>
				<GridItem
					area={'allplay_table'}
					overflowX={'auto'}
					overflowY={'hidden'}
				>
					<AllPlayRankGroup league={context} onHover={onHover} />
				</GridItem>
				<GridItem area={'cumulative_ranks'}>
					<PowerRankingBumpChart league={context} displayIds={filteredIds} />
				</GridItem>

				<GridItem area={'owner_skill'}>
					<MemberSkillScatterPlot league={context} />
				</GridItem>
			</Grid>
		</Box>
	)
}

export default RankPage
