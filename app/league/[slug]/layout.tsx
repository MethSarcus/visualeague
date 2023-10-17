'use client'
import {Box, Button, Center, Grid, GridItem, Heading} from '@chakra-ui/react'
import axios from 'axios'
import {enableMapSet} from "immer"
import Link from 'next/link'
import React, {useContext, useEffect} from 'react'
import useSWR from 'swr'
import {Draft} from '../../../classes/custom/Draft'
import League from '../../../classes/custom/League'
import { DatabasePlayer, PlayerScores, SleeperPlayerDetails } from '../../../classes/custom/Player'
import Footer from '../../../components/Footer'
import Navbar from '../../../components/nav/Navbar'
import {LeagueContext} from '../../../contexts/LeagueContext'
import {PlayerScoresContext} from '../../../contexts/PlayerScoresContext'
import {PlayerDetailsContext} from '../../../contexts/PlayerDetailsContext'
import styles from '../../../styles/Home.module.css'
const LeagueLayout = ({
	children,
	params,
}: {
	children: React.ReactNode
	params: {slug: string}
}) => {
	enableMapSet()
	const [leagueContext, setLeagueContext] = useContext(LeagueContext)
	const [playerDetailsContext, setPlayerDetailsContext] = useContext(PlayerDetailsContext)
	const [playerScoresContext, setPlayerScoresContext] = useContext(PlayerScoresContext)


	const fetcher = (url: string) => axios.get(url).then((res) => res.data)
	const disableValidation = {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false
	  }

	const {data: sleeperLeagueData, error: sleeperLeagueError} = useSWR(
		params.slug != undefined
			? `https://api.sleeper.app/v1/league/${params.slug}`
			: null,
		fetcher,
		disableValidation
	)

	const {data: draftSettings, error: draftSettingsError} = useSWR(
		sleeperLeagueData?.draft_id != undefined && sleeperLeagueError == undefined
			? `https://api.sleeper.app/v1/draft/${sleeperLeagueData.draft_id}`
			: null,
		fetcher,
		disableValidation
	)

	const {data: draftPicks, error: draftError} = useSWR(
		sleeperLeagueData?.draft_id != undefined && sleeperLeagueError == undefined
			? `https://api.sleeper.app/v1/draft/${sleeperLeagueData.draft_id}/picks`
			: null,
		fetcher,
		disableValidation
	)

	const {data: leagueData, error: leagueError} = useSWR(
		params.slug != undefined &&
			sleeperLeagueError == undefined &&
			sleeperLeagueData
			? `/api/league/${params.slug}`
			: null,
		fetcher,
		disableValidation
	)

	const {data: tradeData, error: tradeError} = useSWR(
		params.slug != undefined ? `/api/trades/${params.slug}` : null,
		fetcher,
		disableValidation
	)

	useEffect(() => {
		if (leagueData && draftPicks && draftSettings) {
			let playerScores = new Map<string, PlayerScores>()
			let playerDetails = new Map<string, SleeperPlayerDetails>()
			leagueData.league.player_details.forEach((player: DatabasePlayer) => {
				let playerObj = new PlayerScores(player, leagueData.league.sleeperDetails)
				playerDetails.set(player._id, player.details)
				playerScores.set(player._id, playerObj)
			})
			setPlayerScoresContext(playerScores)
			setPlayerDetailsContext(playerDetails)
			
			let league = new League(
				leagueData.league,
				playerScores,
				playerDetails,
				new Draft(draftPicks, draftSettings),
				undefined,
				tradeData?.trades
			)
			setLeagueContext(league)
			console.log(league)

			return
		}
	}, [
		draftPicks,
		draftSettings,
		leagueData,
		setLeagueContext,
		setPlayerScoresContext,
		setPlayerDetailsContext,
		tradeData?.trades,
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
									{children}
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
		<Grid
			bg={'surface.6'}
			gap={0}
			h={'100dvh'}
			gridTemplateRows={'0fr 1fr 0fr'}
			templateAreas={`"header header"
                    "main main"
                    "footer footer"`}
			color='surface.0'
			fontWeight='bold'
		>
			<GridItem area={'header'}>
				<Navbar leagueID={params.slug} />
			</GridItem>
			<GridItem area={'main'} p={[0, 0, 4]} overflowY={'auto'}>
				{children}
			</GridItem>

			<GridItem bg='surface.0' mt={'auto'} area={'footer'}>
				<Footer />
			</GridItem>
		</Grid>
	)
}

export default LeagueLayout
