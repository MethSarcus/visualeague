'use client'
import {Box, Grid, GridItem, HStack, Spinner} from '@chakra-ui/react'
import {useContext} from 'react'
import DraftValueTable from '../../../../components/tables/DraftValueTable'
import {Context} from '../../../../contexts/Context'

export default function Page() {
	const [context, setContext] = useContext(Context)

	if (!context.settings) return <Spinner />
	const desktopGrid = `"rosters"`

	const mobileGrid = `"rosters"`
	return (
		<Grid
			templateAreas={[mobileGrid, desktopGrid]}
			gridTemplateColumns={['1fr', '1fr 1fr 1fr']}
		>
			<GridItem area={'rosters'}>
				<HStack>
                    
                </HStack>
			</GridItem>
		</Grid>
	)
}
