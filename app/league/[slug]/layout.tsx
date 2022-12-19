'use client'
import {Grid, GridItem, Heading} from '@chakra-ui/react'
import axios from 'axios'
import {enableAllPlugins} from 'immer'
import {usePathname} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import useSWR from 'swr'
import {Draft} from '../../../classes/custom/Draft'
import League from '../../../classes/custom/League'
import Footer from '../../../components/Footer'
import Navbar from '../../../components/nav/Navbar'
import {Context} from '../../../contexts/Context'
import styles from '../../../styles/Home.module.css'
export default function LeagueLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode
}) {
	enableAllPlugins()
	const [context, setContext] = useContext(Context)
	let leagueId = usePathname()?.replace('/league/', '')
	if (leagueId?.includes('/trades')) {
		leagueId = leagueId.replace('/trades', '')
	}

	if (leagueId?.includes('/ranks')) {
		leagueId = leagueId.replace('/ranks', '')
	}

	if (leagueId?.includes('/team')) {
		leagueId = leagueId.split('/team')[0]
	}

	if (leagueId?.includes('/draft')) {
		leagueId = leagueId.replace('/draft', '')
	}

	const fetcher = (url: string) => axios.get(url).then((res) => res.data)

	const {data: leagueData, error: leagueError} = useSWR(
		leagueId != undefined ? `/api/league/${leagueId}` : null,
		fetcher
	)
	const {data: tradeData, error: tradeError} = useSWR(
		leagueId != undefined ? `/api/trades/${leagueId}` : null,
		fetcher
	)

	const {data: draftSettings, error: draftSettingsError} = useSWR(
		leagueData?.league != undefined
			? `https://api.sleeper.app/v1/draft/${leagueData.league.sleeperDetails.draft_id}`
			: null,
		fetcher
	)

	const {data: draftData, error: draftError} = useSWR(
		leagueData?.league != undefined
			? `https://api.sleeper.app/v1/draft/${leagueData.league.sleeperDetails.draft_id}/picks`
			: null,
		fetcher
	)

	useEffect(() => {
		if (
			leagueData &&
			leagueData.league &&
			tradeData.trades &&
			draftData &&
			draftSettings
		) {
			let league = new League(
				leagueData.league,
				new Draft(draftData, draftSettings)
			)
			league.addTrades(tradeData.trades)
			console.log(league)
			setContext(league)
		}
	}, [leagueData, setContext, tradeData, draftData, draftSettings])

	if (leagueError || tradeError)
		return <Heading color={'white'}>Failed to load</Heading>
	return (
		<section>
			<main className={styles.main}>
				<div className='App'>
					<Grid
						gap={0}
						h={'100vh'}
						gridTemplateRows={'0fr 1fr 0fr'}
						templateAreas={`"header header"
                    "main main"
                    "footer footer"`}
						color='surface.0'
						fontWeight='bold'
					>
						<GridItem area={'header'}>
							<Navbar leagueID={leagueId} />
						</GridItem>

						<GridItem area={'main'} p={[0, 0, 4]} overflowY={'auto'}>
							{children}
						</GridItem>

						<GridItem bg='surface.0' mt={'auto'} area={'footer'}>
							<Footer />
						</GridItem>
					</Grid>
				</div>
			</main>
		</section>
	)
}
