import {Avatar, Button, Box, useModalContext, useDisclosure} from '@chakra-ui/react'
import Link from 'next/link'
import LeagueMember from '../../classes/custom/LeagueMember'

type MyProps = {
	leagueId: string
	member: LeagueMember
	onclose: () => void
}

const LeagueMemberButton = (props: MyProps) => {
	return (
		<Box onClick={props.onclose}>
			<Link href={`../team/${props.member.roster.roster_id}`}>
				<Button
					size={'sm'}
					p={3}
					colorScheme='secondary'
					leftIcon={
						<Avatar
							src={`https://sleepercdn.com/avatars/thumbs/${props.member.avatar}`}
							size='xs'
							name={props.member.name}
						/>
					}>
					{`${props.member.name} (${props.member.stats.wins}-${props.member.stats.losses})`}
				</Button>
			</Link>
		</Box>
	)
}

export default LeagueMemberButton
