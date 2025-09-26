'use client'

import {CacheProvider} from '@chakra-ui/next-js'
import {ChakraProvider} from '@chakra-ui/react'
import {Analytics} from '@vercel/analytics/react'
import {useState} from 'react'
import {PlayerScores, SleeperPlayerDetails} from '../classes/custom/Player'
import {LeagueContext} from '../contexts/LeagueContext'
import {PlayerDetailsContext} from '../contexts/PlayerDetailsContext'
import {PlayerScoresContext} from '../contexts/PlayerScoresContext'
import {SeasonContext} from '../contexts/SeasonContext'
import customTheme from '../theme/index'

const Providers = ({children}: {children: React.ReactNode}) => {
	const [context, setContext] = useState({})
	const [playerScoresContext, setPlayerScoresContext] = useState(null)
	const [playerDetailsContext, setPlayerDetailsContext] = useState(null)
	const [seasonContext, setSeasonContext] = useState(null)
	return (
		<PlayerDetailsContext.Provider value={[playerDetailsContext, setPlayerDetailsContext] as any}>
			<PlayerScoresContext.Provider value={[playerScoresContext, setPlayerScoresContext] as any}>
				<LeagueContext.Provider value={[context, setContext]}>
					<Analytics />
					<ChakraProvider theme={customTheme}>{children}</ChakraProvider>
				</LeagueContext.Provider>
			</PlayerScoresContext.Provider>
		</PlayerDetailsContext.Provider>
	)
}

export default Providers
