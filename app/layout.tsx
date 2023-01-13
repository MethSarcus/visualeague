'use client'
import {ChakraProvider} from '@chakra-ui/react'
import {Analytics} from '@vercel/analytics/react'
import axios from 'axios'
import {useContext, useEffect, useMemo, useState} from 'react'
import useSWR from 'swr'
import {Context} from '../contexts/Context'
import {StatsContext} from '../contexts/LeagueContext'
import '../styles/globals.css'
import customTheme from '../theme/index'

export default function RootLayout({children}: {children: React.ReactNode}) {
	const [context, setContext] = useState({})
	const [statsContext, setStatsContext] = useState({})
	const fetcher = (url: string) => axios.get(url).then((res) => res.data)
	function multiFetcher(...urls: any[]) {
		return Promise.all(urls.map((url) => fetcher(url)))
	}
	const weeks = Array.from({length: 18}, (_, i) => i + 1)
	const {data: leagueStats, error: leagueStatsError} = useSWR(
		weeks.map((weekNum) => {
			return `/api/stats/${weekNum}`
		}),
		multiFetcher
	)

	const {data: leagueProjections, error: leagueProjectionsError} = useSWR(
		weeks.map((weekNum) => {
			return `/api/projections/${weekNum}`
		}),
		multiFetcher
	)

	useMemo(() => {
		if (leagueStats && leagueProjections) {
			let stats = leagueStats.map((weeklyStatString) => {
				return JSON.parse(weeklyStatString) as any
			})

			let projections = leagueProjections.map((weeklyProjString) => {
				return JSON.parse(weeklyProjString) as any
			})

			setStatsContext({stats: stats, projections: projections})
		}
	}, [leagueStats, leagueProjections])
	return (
		<html lang='en'>
			<body>
				{
					<StatsContext.Provider value={[statsContext, setStatsContext]}>
						<Context.Provider value={[context, setContext]}>
							<ChakraProvider theme={customTheme}>
								<Analytics />
								{children}
							</ChakraProvider>
						</Context.Provider>
					</StatsContext.Provider>
				}
			</body>
		</html>
	)
}
