'use client'
import {Box, Heading, Text} from '@chakra-ui/react'
import {useContext} from 'react'
import ExperimentalDashboard from '../../../../components/experimental/ExperimentalDashboard'
import {LeagueContext} from '../../../../contexts/LeagueContext'
import {PlayerDetailsContext} from '../../../../contexts/PlayerDetailsContext'
import {PlayerScoresContext} from '../../../../contexts/PlayerScoresContext'

export default function ExperimentalPage() {
	const [league] = useContext(LeagueContext)
	const [playerDetails] = useContext(PlayerDetailsContext)
	const [playerScores] = useContext(PlayerScoresContext)

	return <Box w='full' maxW='min(1200px, 100vw)' minW={0} overflowX='hidden' mx='auto' px={[2, 4]} py={3}>
		<Heading textAlign='center' size='lg' color='white'>Experimental</Heading>
		<Text textAlign='center' mt={2} mb={4} color='surface.8' fontWeight='normal'>
			A playground for unusual ways to look at your league. All views use the selected season portion.
		</Text>
		<ExperimentalDashboard league={league} playerDetails={playerDetails} playerScores={playerScores} />
	</Box>
}
