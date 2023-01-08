import {HamburgerIcon} from '@chakra-ui/icons'
import {
	Avatar,
	Box,
	Button,
	Center,
	Divider,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	Heading,
	IconButton,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React, {useContext} from 'react'
import {Context} from '../../contexts/Context'
import ExpandableLeagueSearch from '../forms/ExpandableLeagueSearch'
import TeamsMobileMenuContainer from './TeamsMobileMenuContainer'

export default function MobileSidebar() {
	const [context, setContext] = useContext(Context)
	const {isOpen, onOpen, onClose} = useDisclosure()
	return (
		<>
			{context.settings && (
				<IconButton
					variant={'ghost'}
					icon={<HamburgerIcon />}
					_hover={{background: 'secondary.600'}}
					onClick={onOpen}
					aria-label={'menu'}
				/>
			)}
			<Drawer isOpen={isOpen} placement='left' onClose={onClose}>
				<DrawerOverlay />
				<DrawerContent bg={'surface.1'} textColor='white'>
					<DrawerCloseButton />
					<DrawerHeader>
						{context != undefined && context.settings && (
							<Box mt={8} display={'inline-block'}>
								<Center>
									<Avatar
										name={context.settings.name}
										src={`https://sleepercdn.com/avatars/thumbs/${context.settings.avatar}`}
									/>
									<Heading ml={1} size={'lg'}>
										{context.settings.name}
									</Heading>
								</Center>
							</Box>
						)}
						<br />
					</DrawerHeader>
					<DrawerBody>
						<VStack
							divider={<Divider borderColor={'textTheme.disabled'} />}
							spacing={0}
							align='stretch'
						>
							{context?.settings && (
								<Link href={`league/${context.settings.league_id}`}>
									<Button variant={'unstyled'} _hover={{textColor: 'grey'}} onClick={onClose}>
										League Summary
									</Button>
								</Link>
							)}
							<Box _hover={{cursor: 'pointer'}}>
								<TeamsMobileMenuContainer onclose={onClose} />
							</Box>

							{context?.settings && (
								<Link href={`league/${context.settings.league_id}/ranks`}>
									<Button variant={'unstyled'} _hover={{textColor: 'grey'}} onClick={onClose}>
										Power Ranks
									</Button>
								</Link>
							)}
							{context?.settings && (
								<Link href={`league/${context.settings.league_id}/trades`} >
									<Button variant={'unstyled'} _hover={{textColor: 'grey'}} onClick={onClose}>
										Trades
									</Button>
								</Link>
							)}
							{context?.settings && (
								<Link href={`league/${context.settings.league_id}/draft`}>
									<Button variant={'unstyled'} _hover={{textColor: 'grey'}} onClick={onClose}>
										Draft
									</Button>
								</Link>
							)}

							{context?.settings && (
								<Link href={`league/${context.settings.league_id}/rosters`}>
									<Button variant={'unstyled'} _hover={{textColor: 'grey'}} onClick={onClose}>
										Rosters
									</Button>
								</Link>
							)}
						</VStack>
						<Box mt={'auto'}>
							<ExpandableLeagueSearch />
						</Box>
					</DrawerBody>

					<DrawerFooter></DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	)
}
