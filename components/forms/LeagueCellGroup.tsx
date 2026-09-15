import {Spinner, VStack} from '@chakra-ui/react'
import axios from 'axios'
import useSWR from 'swr'
import {LeagueSettings} from '../../classes/sleeper/LeagueSettings'
import UserLeagueCell from '../UserLeagueCell'

type MyProps = {
	username: String
	usernameSubmitted: Boolean
	selectedSeason: number
}

const LeagueCellGroup = (props: MyProps) => {
	
	const fetcher = (url: string) => axios.get(url).then((res) => res.data)
	const {data: userData, error: userError} = useSWR(
		props.usernameSubmitted
			? `https://api.sleeper.app/v1/user/${props.username}`
			: null,
		fetcher
	)

	const {data: leaguesData, error: leaguesError} = useSWR(
		() =>
			userData?.user_id
				? `https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/${props.selectedSeason}`
				: null,
		fetcher
	)
	if (props.usernameSubmitted != true) return <div></div>
	if (props.usernameSubmitted && userError) return <div>Unable to find user</div>
	if (props.usernameSubmitted && userData == null) return <Spinner size={'md'} />
	if (leaguesError) return <div>Unable to load leagues</div>
	if (!leaguesData) return <Spinner size={'md'} />
	if (leaguesData.length === 0) return <div>No Leagues Found</div>

	return (
		<VStack overflowY={'auto'} maxH={'400px'} align={'flex-start'}>
			{leaguesData.map((league: LeagueSettings) => {
				return <UserLeagueCell key={league.league_id} league={league} />
			})}
		</VStack>
	)
}

export default LeagueCellGroup
