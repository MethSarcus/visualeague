import {HamburgerIcon} from '@chakra-ui/icons'
import {
	Button,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerFooter,
	Box,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	DrawerHeader,
	DrawerOverlay,
	Icon,
	IconButton,
	useDisclosure,
	Avatar,
	Center,
	Heading,
	VStack,
	StackDivider,
	Collapse,
	Fade,
} from '@chakra-ui/react'
import React, {useContext} from 'react'
import {
	MdOutlineExpandLess,
	MdOutlineExpandMore,
	MdUnfoldLess,
} from 'react-icons/md'
import LeagueMember from '../../classes/custom/LeagueMember'
import {Context} from '../../contexts/Context'
import LeagueMemberButton from '../cards/LeagueMemberButton'
import MemberList from '../groups/MemberList'

interface MyProps {
	onclose: () => void
}
export default function TeamsMobileMenuContainer(props: MyProps) {
	const [context, setContext] = useContext(Context)
	const {isOpen, onToggle} = useDisclosure()

	return (
		<Box
			_hover={{textColor: 'grey', cursor: 'pointer'}}
			aria-label={'Teams'}
			onClick={onToggle}
		>
			<Button variant={'unstyled'} rightIcon={<MdOutlineExpandMore />}>
				Teams
			</Button>
			<Collapse in={isOpen} animateOpacity>
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
			</Collapse>
		</Box>
	)
}

function formatScoreKey(key: string) {
	return key.replaceAll('_', ' ')
}
