'use client'
import {Box, Button, Center, Grid, GridItem, Heading} from '@chakra-ui/react'
import axios from 'axios'
import {enableAllPlugins} from 'immer'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import React from 'react'
import {useContext, useEffect, useMemo, useState} from 'react'
import useSWR from 'swr'
import {Draft} from '../../../classes/custom/Draft'
import League from '../../../classes/custom/League'
import Footer from '../../../components/Footer'
import Navbar from '../../../components/nav/Navbar'
import { LeagueContext } from '../../../contexts/LeagueContext'
import { SeasonContext } from '../../../contexts/SeasonContext'
import { StatsContext } from '../../../contexts/StatsContext'
import styles from '../../../styles/Home.module.css'
export default function LeagueLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode
}) {
	enableAllPlugins()
	const [leagueContext, setLeagueContext] = useContext(LeagueContext)
	const [statsContext, setStatsContext] = useContext(StatsContext)
	const [seasonContext, setSeasonContext] = useContext(SeasonContext)
	const [leagueDataExists, setLeagueDataExists] = useState(false)

	
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

	if (leagueId?.includes('/rosters')) {
		leagueId = leagueId.replace('/rosters', '')
	}

	const fetcher = (url: string) => axios.get(url).then((res) => res.data)

	const {data: sleeperLeagueData, error: sleeperLeagueError} = useSWR(
		leagueId != undefined
			? `https://api.sleeper.app/v1/league/${leagueId}`
			: null,
		fetcher
	)

	const {data: leagueData, error: leagueError} = useSWR(
		leagueId != undefined &&
			!leagueDataExists &&
			sleeperLeagueError == undefined &&
			sleeperLeagueData
			? `/api/league/${leagueId}`
			: null,
		fetcher
	)
	const {data: tradeData, error: tradeError} = useSWR(
		leagueId != undefined &&
			!leagueDataExists &&
			sleeperLeagueData
			? `/api/trades/${leagueId}`
			: null,
		fetcher
	)

	const {data: draftSettings, error: draftSettingsError} = useSWR(
		leagueData?.league != undefined &&
			!leagueDataExists &&
			leagueError == undefined
			? `https://api.sleeper.app/v1/draft/${leagueData.league.sleeperDetails.draft_id}`
			: null,
		fetcher
	)

	const {data: draftData, error: draftError} = useSWR(
		leagueData?.league != undefined &&
			!leagueDataExists &&
			leagueError == undefined
			? `https://api.sleeper.app/v1/draft/${leagueData.league.sleeperDetails.draft_id}/picks`
			: null,
		fetcher
	)

	useEffect(() => {
		if (leagueId == leagueContext.settings?.league_id) {
			setLeagueDataExists(true)
		}
		if (seasonContext != parseInt(sleeperLeagueData?.season)) {
			setSeasonContext(parseInt(sleeperLeagueData?.season))
		}
		if (
			leagueData &&
			leagueData.league &&
			tradeData &&
			tradeData?.trades &&
			draftData &&
			draftSettings &&
			statsContext?.stats &&
			sleeperLeagueError == undefined
		) {
			let league = new League(
				leagueData.league,
				statsContext.stats,
				statsContext.projections,
				new Draft(draftData, draftSettings),
				undefined,
				tradeData?.trades
			)
			console.log(league)
			setLeagueContext(league)
			return
		}
	}, [
		leagueContext.settings?.league_id,
		draftData,
		draftSettings,
		leagueData,
		leagueId,
		setLeagueContext,
		tradeData,
		tradeData?.trades,
		statsContext,
		statsContext.stats,
		sleeperLeagueError,
		seasonContext,
		setSeasonContext,
		sleeperLeagueData?.season
	])

	if (sleeperLeagueError) {
		return (
			<section>
				<main className={styles.main}>
					<div className='App'>
						<Center pt={10}>
							<Box>
								<Heading color={'white'} my={2}>
									Error Finding League
								</Heading>

								<Link href={'/'}>
									<Button>Return to homepage</Button>
								</Link>
								<Link
									href={
										'https://github.com/MethSarcus/visualeague/issues/new?assignees=MethSarcus&labels=&template=bug_report.md&title='
									}
								>
									<Button mx={5} variant={'outline'} colorScheme={'red'}>
										Report bug
									</Button>
								</Link>
							</Box>
						</Center>
					</div>
				</main>
			</section>
		)
	}

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
