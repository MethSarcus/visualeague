'use client'
import {Box, Grid, GridItem, Heading, Skeleton} from '@chakra-ui/react'
import React from 'react'
import {useContext, useState} from 'react'
import MemberSkillScatterPlot from '../../../../components/charts/MemberSkillScatterPlot'
import PowerRankingBumpChart from '../../../../components/charts/PowerRankingBumpChart'
import AllPlayRankGroup from '../../../../components/groups/AllPlayRankGroup'
import ManagerDetailPanel from '../../../../components/groups/ManagerDetailPanel'
import {LeagueContext} from '../../../../contexts/LeagueContext'

const RankPage = () => {
	const [context, setContext] = useContext(LeagueContext)
	const [filteredIds, setFilteredIds] = useState([] as number[])
	const [selectedMember, setSelectedMember] = useState<string | null>(null)
	const [hoveredMember, setHoveredMember] = useState<string | null>(null)


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
		<Box overflowX={'clip'} w={'full'} height={'full'}>
			<Grid
				gap={3}
				mx={[2, 4]}
				my={2}
				templateAreas={[mobileTemplate, desktopTemplate]}
				gridTemplateColumns={['minmax(0, 1fr)', '1fr 1fr']}
				gridTemplateRows={'60px auto auto auto'}
			>
				<GridItem area={'header'} minW={0}>
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
					minW={0}
					overflowX={'auto'}
					overflowY={'hidden'}
				>
					<AllPlayRankGroup league={context} onHover={onHover} />
				</GridItem>
				<GridItem area={'cumulative_ranks'} minW={0} position='relative' minH={['420px', '0']}>
					{/* Absolute so the chart fills the row set by the matrix instead of sizing it */}
					<Box position='absolute' inset={0}>
						<PowerRankingBumpChart league={context} displayIds={filteredIds} />
					</Box>
				</GridItem>

				<GridItem area={'owner_skill'} minW={0}>
					<Grid templateColumns={['minmax(0, 1fr)', '2fr 1fr']} gap={3} h={['auto', '600px']}>
						<Box h={['400px', '100%']}>
							<MemberSkillScatterPlot
								league={context}
								selectedName={selectedMember}
								onHoverMember={setHoveredMember}
								onSelectMember={setSelectedMember}
							/>
						</Box>
						<ManagerDetailPanel league={context} memberName={hoveredMember ?? selectedMember} />
					</Grid>
				</GridItem>
			</Grid>
		</Box>
	)
}

export default RankPage
