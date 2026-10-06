'use client'
import {Box, Grid, GridItem, Heading, Skeleton} from '@chakra-ui/react'
import React from 'react'
import {useContext, useState} from 'react'
import MemberSkillScatterPlot from '../../../../components/charts/MemberSkillScatterPlot'
import PowerRankingBumpChart from '../../../../components/charts/PowerRankingBumpChart'
import AllPlayRankGroup from '../../../../components/groups/AllPlayRankGroup'
import PlayoffOdds from '../../../../components/groups/PlayoffOdds'
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
	"owner_skill owner_skill"
	"playoff_odds playoff_odds"`

	const mobileTemplate = `  
	"header"
	"cumulative_ranks"
	"allplay_table"
	"owner_skill"
	"playoff_odds"`
	return (
		<Box overflowX={'hidden'} w={'full'} height={'full'}>
			<Grid
				gap={3}
				mx={4}
				my={2}
				templateAreas={[mobileTemplate, desktopTemplate]}
				gridTemplateColumns={['1fr', '1fr 1fr']}
				gridTemplateRows={'60px auto auto auto auto'}
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
				<GridItem area={'cumulative_ranks'} position='relative' minH={['420px', '0']}>
					{/* Absolute so the chart fills the row set by the matrix instead of sizing it */}
					<Box position='absolute' inset={0}>
						<PowerRankingBumpChart league={context} displayIds={filteredIds} />
					</Box>
				</GridItem>

				<GridItem area={'owner_skill'} h={['400px', '600px']}>
					<MemberSkillScatterPlot league={context} />
				</GridItem>

				<GridItem area={'playoff_odds'}>
					<PlayoffOdds league={context} />
				</GridItem>
			</Grid>
		</Box>
	)
}

export default RankPage
