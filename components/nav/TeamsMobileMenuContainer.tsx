import {
	Box,
	Button,
	Collapse,
	useDisclosure,
} from '@chakra-ui/react'
import {useContext} from 'react'
import {
	MdOutlineExpandMore,
} from 'react-icons/md'
import LeagueMember from '../../classes/custom/LeagueMember'
import {LeagueContext} from '../../contexts/LeagueContext'
import LeagueMemberButton from '../cards/LeagueMemberButton'
import { RiGroupLine } from "react-icons/ri";

interface MyProps {
	onclose: () => void
}
export default function TeamsMobileMenuContainer(props: MyProps) {
	const [context] = useContext(LeagueContext)
	const {isOpen, onToggle} = useDisclosure()

	return (
		<Box
			_hover={{cursor: 'pointer'}}
			aria-label={'Teams'}
			onClick={onToggle}
		>
			<Button
				variant='ghost'
				w='full'
				justifyContent='flex-start'
				borderRadius='md'
				minH='44px'
				px={3}
				color='textTheme.mediumEmphasis'
				_hover={{bg: 'surface.2', color: 'white'}}
				rightIcon={<MdOutlineExpandMore />}
				leftIcon={<RiGroupLine/>}>
				Teams
			</Button>
			<Collapse in={isOpen} animateOpacity>
				<Box px={3}>
				{context &&
					context.settings != undefined &&
					Array.from(
						context.members as Map<number, LeagueMember>,
						([key, value]) => value
					).map((member: LeagueMember) => {
						return (
							<Box my={1} key={member.userId}>
								<LeagueMemberButton
									onclose={props.onclose}
									member={member}
									leagueId={context.settings.league_id}
								/>
							</Box>
						)
					})}
				</Box>
			</Collapse>
		</Box>
	)
}
