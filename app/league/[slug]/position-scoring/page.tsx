'use client'
import {Box, Heading, Skeleton, Text} from '@chakra-ui/react'
import {useContext} from 'react'
import {DatabasePlayer, PlayerScores} from '../../../../classes/custom/Player'
import PositionScoringDistributionChart from '../../../../components/charts/line/PositionScoringDistributionChart'
import {LeagueContext} from '../../../../contexts/LeagueContext'
import {PlayerDetailsContext} from '../../../../contexts/PlayerDetailsContext'
import {PlayerScoresContext} from '../../../../contexts/PlayerScoresContext'

export default function PositionScoringPage() {
	const [league] = useContext(LeagueContext)
	const [playerDetails]: [Map<string, DatabasePlayer> | null] = useContext(PlayerDetailsContext)
	const [playerScores]: [Map<string, PlayerScores> | null] = useContext(PlayerScoresContext)

	return <Box maxW='1100px' mx='auto' px={[2, 4]} py={3}>
		<Skeleton isLoaded={league.settings != undefined}>
			<Heading textAlign='center' size='lg' color='white'>Position scoring</Heading>
		</Skeleton>
		<Text textAlign='center' mt={2} mb={4} color='surface.8' fontWeight='normal'>
			See what players at each position typically score when they start.
		</Text>
		<PositionScoringDistributionChart league={league} playerDetails={playerDetails} playerScores={playerScores} />
	</Box>
}
