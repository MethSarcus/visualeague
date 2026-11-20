import {HamburgerIcon} from '@chakra-ui/icons'

import Link from 'next/link'
import {useContext} from 'react'
import {RxLoop} from 'react-icons/rx'
import {GiStrong} from 'react-icons/gi'
import {BsGrid3X2, BsBarChart, BsTrophy, BsClockHistory} from 'react-icons/bs'
import {VscListTree} from 'react-icons/vsc'
import {LeagueContext} from '../../contexts/LeagueContext'
import ExpandableLeagueSearch from '../forms/ExpandableLeagueSearch'
import TeamsMobileMenuContainer from './TeamsMobileMenuContainer'
import { useDisclosure, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, Text, DrawerHeader, Center, Avatar, Heading, DrawerBody, VStack, Button, HStack, Box } from '@chakra-ui/react'

export default function MobileSidebar({leagueID, isHistory}: {leagueID?: string; isHistory?: boolean}) {
	const [context] = useContext(LeagueContext)
	const hasContext = Boolean(context?.settings)
	const navLeagueId = isHistory ? leagueID : context?.settings?.league_id
	const {isOpen, onOpen, onClose} = useDisclosure()
	return (
		<>
			{navLeagueId && (
				<IconButton
					variant={'ghost'}
					color={'secondary.200'}
					icon={<HamburgerIcon />}
					_hover={{background: 'secondary.600'}}
					onClick={onOpen}
					aria-label={'menu'}
				/>
			)}
			<Drawer isOpen={isOpen} placement='left' onClose={onClose}>
				<DrawerOverlay bg='blackAlpha.700' />
				<DrawerContent bg={'surface.0'} textColor='white' borderRight='1px solid' borderColor='whiteAlpha.200'>
					<DrawerCloseButton />
					<DrawerHeader borderBottom='1px solid' borderColor='whiteAlpha.200' pb={5}>
						{hasContext && (
							<Box mt={5}>
								<Center justifyContent='flex-start'>
									<Avatar
										name={context.settings.name}
										src={`https://sleepercdn.com/avatars/thumbs/${context.settings.avatar}`}
									/>
									<Heading ml={3} size={'md'} noOfLines={1}>
										{context.settings.name}
									</Heading>
								</Center>
							</Box>
						)}
					</DrawerHeader>
					<DrawerBody>
						<VStack
							spacing={1}
							align='stretch'
						>
							{navLeagueId && (
								<Link href={`/league/${navLeagueId}`}>
									<Button
										variant={'ghost'}
										w='full'
										justifyContent='flex-start'
										borderRadius='md'
										minH='44px'
										px={3}
										leftIcon={<BsBarChart/>}
										color='textTheme.mediumEmphasis'
										_hover={{bg: 'surface.2', color: 'white'}}
										onClick={onClose}
									>
										League Summary
									</Button>
								</Link>
							)}
							{navLeagueId && (
								<Link href={`/league/${navLeagueId}/history`}>
									<Button variant='ghost' w='full' justifyContent='flex-start' borderRadius='md' minH='44px' px={3}
										leftIcon={<BsClockHistory />} color='textTheme.mediumEmphasis'
										_hover={{bg: 'surface.2', color: 'white'}} onClick={onClose}>
										League History
									</Button>
								</Link>
							)}
							{hasContext && <Box _hover={{cursor: 'pointer'}}>
								<TeamsMobileMenuContainer onclose={onClose} />
							</Box>}

							{navLeagueId && (
								<Link href={`/league/${navLeagueId}/ranks`}>
									<Button
										leftIcon={<GiStrong />}
										variant={'ghost'}
										w='full'
										justifyContent='flex-start'
										borderRadius='md'
										minH='44px'
										px={3}
										color='textTheme.mediumEmphasis'
										_hover={{bg: 'surface.2', color: 'white'}}
										onClick={onClose}
									>
										Power Ranks
								</Button>
							</Link>
						)}
						{navLeagueId && (
							<Link href={`/league/${navLeagueId}/playoff-odds`}>
								<Button
									leftIcon={<BsTrophy />}
									variant={'ghost'}
									w='full'
									justifyContent='flex-start'
									borderRadius='md'
									minH='44px'
									px={3}
									color='textTheme.mediumEmphasis'
									_hover={{bg: 'surface.2', color: 'white'}}
									onClick={onClose}
								>
									Playoff Odds
									</Button>
								</Link>
							)}
							{navLeagueId && (
								<Link href={`/league/${navLeagueId}/position-scoring`}>
									<Button
										leftIcon={<BsBarChart />}
										variant='ghost'
										w='full'
										justifyContent='flex-start'
										borderRadius='md'
										minH='44px'
										px={3}
										color='textTheme.mediumEmphasis'
										_hover={{bg: 'surface.2', color: 'white'}}
										onClick={onClose}
									>
										Position Scoring
									</Button>
								</Link>
							)}
							{navLeagueId && (
								<Link href={`/league/${navLeagueId}/trades`}>
									<Button
										leftIcon={<RxLoop />}
										variant={'ghost'}
										w='full'
										justifyContent='flex-start'
										borderRadius='md'
										minH='44px'
										px={3}
										color='textTheme.mediumEmphasis'
										_hover={{bg: 'surface.2', color: 'white'}}
										onClick={onClose}
									>
										Trades
									</Button>
								</Link>
							)}
							{navLeagueId && (
								<Link href={`/league/${navLeagueId}/draft`}>
									<Button
										variant={'ghost'}
										w='full'
										justifyContent='flex-start'
										borderRadius='md'
										minH='44px'
										px={3}
										color='textTheme.mediumEmphasis'
										_hover={{bg: 'surface.2', color: 'white'}}
										onClick={onClose}
									>
										<HStack>
											<BsGrid3X2 />
											<Text>Draft</Text>
										</HStack>
									</Button>
								</Link>
							)}

							{navLeagueId && (
								<Link href={`/league/${navLeagueId}/rosters`}>
									<Button
										variant={'ghost'}
										w='full'
										justifyContent='flex-start'
										borderRadius='md'
										minH='44px'
										px={3}
										color='textTheme.mediumEmphasis'
										_hover={{bg: 'surface.2', color: 'white'}}
										onClick={onClose}
									>
										<HStack>
										<VscListTree/>
										<Text>Rosters</Text>
										</HStack>
										
									</Button>
								</Link>
							)}
						</VStack>
						<Box mt={5} pt={5} borderTop='1px solid' borderColor='whiteAlpha.200'>
							<ExpandableLeagueSearch />
						</Box>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	)
}
