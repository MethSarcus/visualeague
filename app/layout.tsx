'use client'
import {ChakraProvider} from '@chakra-ui/react'
import {Analytics} from '@vercel/analytics/react'
import axios from 'axios'
import {useContext, useEffect, useMemo, useState} from 'react'
import useSWR from 'swr'
import {LeagueContext} from '../contexts/LeagueContext'
import {StatsContext} from '../contexts/StatsContext'
import {SeasonContext} from '../contexts/SeasonContext'
import {useSWRConfig} from 'swr'
import '../styles/globals.css'
import customTheme from '../theme/index'

export default function RootLayout({children}: {children: React.ReactNode}) {
	const [context, setContext] = useState({})
	const [statsContext, setStatsContext] = useState({})
	const [seasonContext, setSeasonContext] = useState(null)
	
	return (
		<html lang='en'>
			<body>
				{
					<SeasonContext.Provider value={[seasonContext, setSeasonContext]}>
						<StatsContext.Provider value={[statsContext, setStatsContext]}>
							<LeagueContext.Provider value={[context, setContext]}>
								<ChakraProvider theme={customTheme}>
									<Analytics />
									{children}
								</ChakraProvider>
							</LeagueContext.Provider>
						</StatsContext.Provider>
					</SeasonContext.Provider>
				}
			</body>
		</html>
	)
}
