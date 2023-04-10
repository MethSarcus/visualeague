'use client'
import {CacheProvider} from '@chakra-ui/next-js'
import {ChakraProvider} from '@chakra-ui/react'
import {Analytics} from '@vercel/analytics/react'
import {useState} from 'react'
import {LeagueContext} from '../contexts/LeagueContext'
import {SeasonContext} from '../contexts/SeasonContext'
import {StatsContext} from '../contexts/StatsContext'
import '../styles/globals.css'
import customTheme from '../theme/index'

export default function RootLayout({children}: {children: React.ReactNode}) {
	const [context, setContext] = useState({})
	const [statsContext, setStatsContext] = useState({})
	const [seasonContext, setSeasonContext] = useState(null)

	return (
		<html lang='en'>
			<head>
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<title>VisuaLeague</title>
				<meta name='Visualize your league' content='Created by Seth Marcus' />
				<meta name='theme-color' content='#121212' />
				<meta
					name='description'
					content='Visualize your fantasy football leagues and find insights to help you improve. Gauge the strengths and weaknesses for each team at a glance to Learn from past mistakes and prevent future ones'
				></meta>
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicons/apple-touch-icon.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicons/favicon-16x16.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicons/favicon-32x32.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='100x100'
					href='/favicons/favicon-100x100.png'
				/>

				<link
					rel='icon'
					type='image/png'
					sizes='192x192'
					href='/favicons/favicon-192x192.png'
				/>

				<link
					rel='icon'
					type='image/png'
					sizes='512x512'
					href='/favicons/favicon-512x512.png'
				/>
				<link rel='icon' href='/favicon.ico' />
			</head>
			<body>
				{
					<SeasonContext.Provider value={[seasonContext, setSeasonContext]}>
						<StatsContext.Provider value={[statsContext, setStatsContext]}>
							<LeagueContext.Provider value={[context, setContext]}>
								<Analytics />
								<CacheProvider>
									<ChakraProvider theme={customTheme}>
										{children}
									</ChakraProvider>
								</CacheProvider>
							</LeagueContext.Provider>
						</StatsContext.Provider>
					</SeasonContext.Provider>
				}
			</body>
		</html>
	)
}
