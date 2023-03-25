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
	
	const fetcher = (url: string) => axios.get(url).then((res) => res.data)
	function multiFetcher(...urls: any[]) {
		return Promise.allSettled(urls.map((url) => fetcher(url)))
	}
	
	const {data: leagueStats, error: leagueStatsError} = useSWR(
		seasonContext != null && Number.isInteger(seasonContext) &&
		Array.from({length: seasonContext < 2021 ? 17 : 18}, (_, i) => i + 1).map((weekNum) => {
				return `/api/stats/${seasonContext}/${weekNum}`
			}),
		multiFetcher
	)

	const {data: leagueProjections, error: leagueProjectionsError} = useSWR(
		seasonContext != null && Number.isInteger(seasonContext) &&
		Array.from({length: seasonContext < 2021 ? 17 : 18}, (_, i) => i + 1).map((weekNum) => {
				return `/api/projections/${seasonContext}/${weekNum}`
			}),
		multiFetcher
	)

	useMemo(() => {
		if (leagueStats && leagueProjections) {
			
			let stats = leagueStats.filter((v) => {return v.status == 'fulfilled'}).map((weeklyStatString) => {
				return JSON.parse((weeklyStatString as any).value) as any
			})

			let projections = leagueProjections.filter((v) => {return v.status == 'fulfilled'}).map((weeklyProjString) => {
				return JSON.parse((weeklyProjString as any).value) as any
			})

			setStatsContext({stats: stats, projections: projections})
		}
	}, [leagueStats, leagueProjections])
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
