'use client'
import {Avatar, Box, Button, Center, ScaleFade} from '@chakra-ui/react'
import Link from 'next/link'
import {useContext, useState} from 'react'
import {LeagueSettings} from '../classes/sleeper/LeagueSettings'
import { LeagueContext } from '../contexts/LeagueContext'

type MyProps = {
	league: LeagueSettings
}
const UserLeagueCell = (props: MyProps) => {
	const [leagueSelected, setLeagueSelected] = useState(false)
	const [leagueContext, setLeagueContext] = useContext(LeagueContext)

	function onclick() {
		setLeagueSelected(true)
		setLeagueContext({})
	}

	return (
		<ScaleFade initialScale={0.01} in={true}>
			<Center borderRadius='6' bg={'surface.1'} p={2} px={3}>
				<Avatar
					src={`https://sleepercdn.com/avatars/thumbs/${props.league.avatar}`}
					size='xs'
					name={props.league.name}
					ml={-1}
					mr={2}
				/>
				<Box as='p'>{props.league.name}</Box>
				<Link
					href={`/league/${props.league.league_id}`}
					style={{textDecoration: 'none'}}
				>
					<Box>
						<Button
							ml={2}
							variant='outline'
							size='xs'
							colorScheme={'secondary_inverted'}
							isLoading={leagueSelected}
							onClick={onclick}
						>
							View
						</Button>
					</Box>
				</Link>
			</Center>
		</ScaleFade>
	)
}

export default UserLeagueCell
