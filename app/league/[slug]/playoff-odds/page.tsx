'use client'
import {Box, Heading, Skeleton} from '@chakra-ui/react'
import {useContext} from 'react'
import PlayoffOdds from '../../../../components/groups/PlayoffOdds'
import {LeagueContext} from '../../../../contexts/LeagueContext'

const PlayoffOddsPage = () => {
	const [context] = useContext(LeagueContext)

	return (
		<Box overflowX={'clip'} w={'full'} height={'full'}>
			<Box mx={[2, 4]} my={2}>
				<Skeleton fontWeight='black' mx={10} isLoaded={context.settings != undefined}>
					<Heading textAlign={'center'} size={'lg'} m={2} color={'white'}>
						Playoff Odds
					</Heading>
				</Skeleton>
				<PlayoffOdds league={context} />
			</Box>
		</Box>
	)
}

export default PlayoffOddsPage
