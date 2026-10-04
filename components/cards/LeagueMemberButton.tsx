import {Avatar, Button, Box} from '@chakra-ui/react'
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
			<Link href={`/league/${props.leagueId}/team/${props.member.roster.roster_id}`}>
				<Button
					size={'sm'}
					w='full'
					justifyContent='flex-start'
					px={2}
					borderRadius='md'
					variant='ghost'
					color='textTheme.mediumEmphasis'
					_hover={{bg: 'surface.2', color: 'white'}}
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
