'use client'
import {Box, Button, Center, Grid, GridItem, Heading} from '@chakra-ui/react'
import axios from 'axios'
import {enableMapSet} from 'immer'
import Link from 'next/link'
import React, {useContext, useEffect} from 'react'
import useSWR from 'swr'
import {Draft} from '../../../classes/custom/Draft'
import League from '../../../classes/custom/League'
import {DatabasePlayer, PlayerScores, SleeperPlayerDetails} from '../../../classes/custom/Player'
import Footer from '../../../components/Footer'
import Navbar from '../../../components/nav/Navbar'
import {LeagueContext} from '../../../contexts/LeagueContext'
import {PlayerScoresContext} from '../../../contexts/PlayerScoresContext'
import {PlayerDetailsContext} from '../../../contexts/PlayerDetailsContext'
import styles from '../../../styles/Home.module.css'
import {LeagueSettings} from '../../../classes/sleeper/LeagueSettings'
import {SleeperRoster} from '../../../classes/sleeper/SleeperRoster'
import {BlankUserData, SleeperUser, UserData} from '../../../classes/sleeper/SleeperUser'
const LeagueLayout = ({children, params}: {children: React.ReactNode; params: any}) => {
	const { slug } = React.use(params)
	enableMapSet()
	const [leagueContext, setLeagueContext] = useContext(LeagueContext)
	const [playerDetailsContext, setPlayerDetailsContext] = useContext(PlayerDetailsContext)
	const [playerScoresContext, setPlayerScoresContext] = useContext(PlayerScoresContext)

	const fetcher = (url: string) => axios.get(url).then((res) => res.data)
	const disableValidation = {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	}

	const {data: sleeperLeagueData, error: sleeperLeagueError} = useSWR(
		slug != undefined ? `https://api.sleeper.app/v1/league/${slug}` : null,
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
		slug != undefined && sleeperLeagueError == undefined && sleeperLeagueData
			? `/api/league/${slug}`
			: null,
		fetcher,
		disableValidation
	)

	const {data: tradeData, error: tradeError} = useSWR(
		slug != undefined ? `/api/trades/${slug}` : null,
		fetcher,
		disableValidation
	)

	useEffect(() => {
		if (leagueData && draftPicks && draftSettings) {
			let playerScores = new Map<string, PlayerScores>()
			let playerDetails = new Map<string, DatabasePlayer>()
			leagueData.league.player_details.forEach((player: DatabasePlayer) => {
				let settings = leagueData.league.sleeperDetails as LeagueSettings
				let playerObj = new PlayerScores(
					player,
					settings.scoring_settings,
					settings.settings.start_week,
					settings.settings.last_scored_leg
				)
				playerDetails.set(player._id, player)
				playerScores.set(player._id, playerObj)
			})
			console.log(playerDetails)
			console.log(playerScores)
			setPlayerScoresContext(playerScores)
			setPlayerDetailsContext(playerDetails)
			let users: UserData[] = []
			leagueData.league.rosters.forEach((roster: SleeperRoster) => {
				let user = leagueData.league.users.find((user: SleeperUser) => {
					return user.user_id == roster.owner_id
				})
				if (user == undefined) {
					users.push(new BlankUserData(leagueData.league.league_id, roster.owner_id, roster))
				} else {
					users.push(new UserData(user, roster))
				}
			})
			let league = new League(
				users,
				leagueData.league.matchups,
				leagueData.league.sleeperDetails,
				playerScores,
				playerDetails,
				new Draft(draftPicks, draftSettings),
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
									}>
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

	if (leagueError || tradeError) return <Heading color={'white'}>Failed to load</Heading>
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
			fontWeight='bold'>
			<GridItem area={'header'}>
				<Navbar leagueID={slug} />
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
