'use client'
import {Box, Grid, GridItem, Spinner} from '@chakra-ui/react'
import {useContext} from 'react'
import DraftValueBarChart from '../../../../components/charts/bar/DraftValueBarChart'
import DraftValueTable from '../../../../components/tables/DraftValueTable'
import {Context} from '../../../../contexts/Context'

export default function Page() {
	const [context, setContext] = useContext(Context)
	const desktopGrid = `"draft_table draft_chart"`

	const mobileGrid = `"draft_chart"
						"draft_table"`
	if (!context.settings) return <Spinner />
	return (
		<Grid
			templateAreas={[mobileGrid, desktopGrid]}
			gridTemplateColumns={['1fr', '1fr 1fr 1fr']}
			mx={5}
		>
			<GridItem area={'draft_table'}>
				<DraftValueTable draft={context.draft} />
			</GridItem>
			<GridItem area={'draft_chart'}>
				<Box width={'500px'} height={'500px'}>
					<DraftValueBarChart league={context} />
				</Box>
			</GridItem>
		</Grid>
	)
}
