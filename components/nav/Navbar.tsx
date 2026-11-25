'use client'
import {Box, Button, Center, Flex, HStack, Image, useMediaQuery} from '@chakra-ui/react'
import {produce} from 'immer'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useContext} from 'react'
import League, {SeasonPortion} from '../../classes/custom/League'
import {DatabasePlayer, PlayerScores} from '../../classes/custom/Player'
import {LeagueContext} from '../../contexts/LeagueContext'
import {PlayerDetailsContext} from '../../contexts/PlayerDetailsContext'
import {PlayerScoresContext} from '../../contexts/PlayerScoresContext'
import ExpandableLeagueSearch from '../forms/ExpandableLeagueSearch'
import MobileSidebar from './MobileSidebar'
import SeasonPortionSelector from './SeasonPortionSelector'
import SettingsSidebar from './SettingsSidebar'
import TeamSidebar from './TeamSidebar'

interface MyProps {
	leagueID: string | undefined
	isHistory?: boolean
}

const Navbar = (props: MyProps) => {
	const [context, setContext] = useContext(LeagueContext)
	const navLeagueId = props.isHistory ? props.leagueID : context.settings?.league_id
	const [playerScores] = useContext(PlayerScoresContext) as [Map<string, PlayerScores>, unknown]
	const [playerDetails] = useContext(PlayerDetailsContext) as [
		Map<string, DatabasePlayer>,
		unknown
	]

	function setSeasonPortion(selected: String) {
		const nextState = produce(context, (draftState: League) => {
			draftState.setSeasonPortion(playerScores, playerDetails, selected as SeasonPortion)
		})
		setContext(nextState)
	}
	return (
		<Flex
			bg={'surface.0'}
			borderBottom="1px solid"
			borderColor="whiteAlpha.200"
			position="sticky"
			top={0}
			zIndex="docked"
			minH="calc(64px + env(safe-area-inset-top))"
			pt="env(safe-area-inset-top)"
			maxWidth={'100vw'}
			align="center"
			backdropFilter="blur(16px)"
			color={'white'}>
			<HStack
				spacing='0px'
				pl={3}
				paddingY={2}
				flex={1}
				display={{sm: 'none', base: 'flex'}}
				maxWidth={'100vw'}
				overflow='hidden'>
				<MobileSidebar leagueID={props.leagueID} isHistory={props.isHistory} />
			</HStack>
			{/* Centered over the bar so it stays centered regardless of the buttons on each side */}
			<Box
				display={{sm: 'none', base: 'block'}}
				position='absolute'
				left='50%'
				top='calc(50% + env(safe-area-inset-top) / 2)'
				transform='translate(-50%, -50%)'>
				<Link href={navLeagueId ? `/league/${navLeagueId}` : '/'}>
					<Image src='/images/logo.png' alt='VisuaLeague' h='40px' maxW='none' />
				</Link>
			</Box>
			<HStack
				py={0}
				my={0}
				flex={1}
				mx={4}
				gap={1}
				spacing='0px'
				display={{sm: 'flex', base: 'none'}}
				maxWidth={'100vw'}
				minW={0}
				overflowX='auto'
				overflowY='hidden'>
				<NavbarButton
					buttonText='League'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}`}
				/>
				<NavbarButton
					buttonText='History'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/history`}
				/>
				<TeamSidebar />
				<NavbarButton
					buttonText='Power Rankings'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/ranks`}
				/>
				<NavbarButton
					buttonText='Position Scoring'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/position-scoring`}
				/>
				{process.env.NODE_ENV === 'development' && <NavbarButton
					buttonText='Experimental'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/experimental`}
				/>}
				<NavbarButton
					buttonText='Playoff Odds'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/playoff-odds`}
				/>
				<NavbarButton
					buttonText='Trading'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/trades`}
				/>
				<NavbarButton
					buttonText='Draft'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/draft`}
				/>
				<NavbarButton
					buttonText='Rosters'
					disabled={!navLeagueId}
					link={`/league/${navLeagueId}/rosters`}
				/>
				<Box pl={3}>
					<ExpandableLeagueSearch />
				</Box>
			</HStack>
			<Center pr={3} my={2}>
				{!props.isHistory && <SeasonPortionSelector onclick={setSeasonPortion} />}
			</Center>
			<Center pr={3} my={2}>
				{!props.isHistory && context?.settings && <SettingsSidebar leagueSettings={context?.settings} />}
			</Center>
		</Flex>
	)
}

export default Navbar

interface NavButtonProps {
	buttonText: string
	link?: string
	disabled?: boolean
	onclick?: () => void
}
function NavbarButton(props: NavButtonProps) {
	const pathName = usePathname()
	const [isLargerThan800] = useMediaQuery('(min-width: 800px)')
	const isCurrent = props.link !== undefined && (
		pathName === props.link ||
		(props.buttonText !== 'League' && pathName?.startsWith(`${props.link}/`))
	)
	if (props.link != undefined && props.disabled != true) {
		return (
			<Link href={props.link}>
				<Button
					transition={'all .18s ease'}
					_hover={{backgroundColor: 'whiteAlpha.100', cursor: 'pointer'}}
					onClick={props.onclick}
					disabled={props.disabled ?? false}
					size={'sm'}
					fontWeight={'semibold'}
					borderRadius={'md'}
					color={isCurrent ? 'white' : 'textTheme.mediumEmphasis'}
					bg={isCurrent ? 'whiteAlpha.200' : 'transparent'}
					isActive={isCurrent && isLargerThan800}
					_active={{bg: 'secondary.700'}}
					variant={'ghost'}
					px={3}
					aria-label={props.buttonText}>
					{props.buttonText}
				</Button>
			</Link>
		)
	} else {
		return (
			<Button
				transition={'all .18s ease'}
				_hover={{backgroundColor: 'whiteAlpha.100', cursor: 'pointer'}}
				onClick={props.onclick}
				disabled={props.disabled ?? false}
				size={'sm'}
				borderRadius={'md'}
				fontWeight={'medium'}
				color='textTheme.mediumEmphasis'
				isActive={isCurrent && isLargerThan800}
				_active={{bg: 'secondary.700'}}
				variant='ghost'
				aria-label={props.buttonText}>
				{props.buttonText}
			</Button>
		)
	}
}
