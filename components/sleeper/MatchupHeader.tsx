'use client'
import {
	Flex,
	Avatar,
	Center,
	Box,
	Text,
	useMultiStyleConfig,
	ModalHeader,
	Circle,
} from '@chakra-ui/react'
import {useContext} from 'react'
import LeagueMember from '../../classes/custom/LeagueMember'
import Matchup from '../../classes/custom/Matchup'
import MatchupInterface from '../../classes/custom/MatchupInterface'
import {LeagueContext} from '../../contexts/LeagueContext'
import {project_colors} from '../../utility/project_colors'
import HorizontalPillSelector from './HorizontalPillSelector'
import MatchupHeaderTeam from './MatchupHeaderTeam'

interface MyProps {
	matchup: MatchupInterface | undefined
	homeLineupOnclick: (selected: string) => void
	awayLineupOnclick: (selected: string) => void
	homeAlteredScore?: number
	homeAlteredProjectedScore?: number
	awayAlteredScore?: number
	awayAlteredProjectedScore?: number
}

const MatchupHeader = (props: MyProps) => {
	const [context, setContext] = useContext(LeagueContext)
	if (context.settings == undefined)
		return (
			<ModalHeader>
				<div>Loading</div>
			</ModalHeader>
		)
	let homeTeam = props.matchup?.homeTeam
	let awayTeam = props.matchup?.awayTeam
	let homeMember
	let awayMember

	homeMember = context.getMember(homeTeam?.roster_id) as LeagueMember
	awayMember = context.getMember(awayTeam?.roster_id) as LeagueMember

	return (
		<ModalHeader fontSize={'md'}>
			<Center>Week {props.matchup?.weekNumber}</Center>
			<Flex mt={2}>
				<Box ml={5}>
					<MatchupHeaderTeam
						matchupSide={props.matchup?.homeTeam}
						isWinner={
							(props.homeAlteredScore ?? props.matchup?.homeTeam.pf ?? 0) >
							(props.awayAlteredScore ?? props.matchup?.awayTeam?.pf ?? 0)
						}
						isTie={props.matchup?.isTie ?? false}
						member={homeMember}
						size={'sm'}
						isHomeTeam={true}
						variant={'default'}
						isByeWeek={props.matchup?.isByeWeek ?? false}
						alteredScore={props.homeAlteredScore}
						alteredProjectedScore={props.homeAlteredProjectedScore}
					/>
					<HorizontalPillSelector onclick={props.homeLineupOnclick} />
				</Box>
				{!props.matchup?.isByeWeek && (
					<Circle
						zIndex={5}
						bg={'#1A202E'}
						color={'#A7BAD0'}
						size={'30px'}
						fontSize={'.7em'}
						shadow={'lg'}
						p={1}
						mx={-3}
						fontWeight='semibold'
					>
						<Center textAlign={'center'}>VS</Center>
					</Circle>
				)}
				<Box flex={1} mr={5}>
					{!props.matchup?.isByeWeek && (
						<MatchupHeaderTeam
							variant={'default'}
							matchupSide={props.matchup?.awayTeam}
							isWinner={
								(props.homeAlteredScore ?? props.matchup?.homeTeam.pf ?? 0) <
								(props.awayAlteredScore ?? props.matchup?.awayTeam?.pf ?? 0)
							}
							member={awayMember}
							size={'sm'}
							isTie={props.matchup?.isTie ?? false}
							isByeWeek={props.matchup?.isByeWeek ?? false}
							isHomeTeam={false}
							alteredScore={props.awayAlteredScore}
							alteredProjectedScore={props.awayAlteredProjectedScore}
						/>
					)}{' '}
					{!props.matchup?.isByeWeek && (
						<HorizontalPillSelector onclick={props.awayLineupOnclick} />
					)}
				</Box>
			</Flex>
		</ModalHeader>
	)
}

export default MatchupHeader