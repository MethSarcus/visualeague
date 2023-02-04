'use client'
import {Box, Grid, GridItem, SimpleGrid, Spinner} from '@chakra-ui/react'
import {useContext} from 'react'
import League from '../../../../classes/custom/League'
import GenericStatCard from '../../../../components/cards/statcards/GenericStatCard'
import DraftValueBarChart from '../../../../components/charts/bar/DraftValueBarChart'
import DraftPageStatGroup from '../../../../components/groups/stats/DraftPageStatGroup'
import DraftValueTable from '../../../../components/tables/DraftValueTable'
import {Context} from '../../../../contexts/Context'

export default function Page() {
	const [context, setContext] = useContext(Context)
	const desktopGrid = `
	"draft_cards draft_cards"
	"draft_table draft_chart"`

	const mobileGrid = `"draft_cards"
						"draft_chart"
						"draft_table"`
	if (!context.settings) return <Spinner />

	return (
		<Grid
			templateAreas={[mobileGrid, desktopGrid]}
			gridTemplateColumns={['1fr', '1fr 1fr']}
			mx={5}
		>
			<GridItem area={'draft_cards'}>
				<DraftPageStatGroup league={context}/>
			</GridItem>
			<GridItem area={'draft_table'} overflowY={"auto"}
			maxH={"800px"}>
				<DraftValueTable draft={context.draft} />
			</GridItem>
			<GridItem area={'draft_chart'} minHeight={"300px"} maxH={"800px"}>
					<DraftValueBarChart league={context} />
			</GridItem>
		</Grid>
	)
}
