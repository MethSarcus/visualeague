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
import {Context} from '../../contexts/Context'
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

export default function MatchupHeader(props: MyProps) {
	const [context, setContext] = useContext(Context)
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
		<ModalHeader fontSize={"md"}>
			<Center>Week {props.matchup?.weekNumber}</Center>
			<Flex mt={2}>
				<Box ml={5}>
					<MatchupHeaderTeam
						matchupSide={props.matchup?.homeTeam}
						isWinner={
							props.matchup?.homeTeam.roster_id == props.matchup?.winnerRosterId
						}
						isTie={props.matchup?.isTie ?? false}
						member={homeMember}
						size={'sm'}
						isInverted={true}
						variant={'default'}
						isByeWeek={props.matchup?.isByeWeek ?? false}
						alteredScore={props.homeAlteredScore}
						alteredProjectedScore={props.homeAlteredProjectedScore}
					/>
					<HorizontalPillSelector onclick={props.homeLineupOnclick} />
				</Box>
				<Circle
					zIndex={5}
					bg={'#1A202E'}
					color={'#A7BAD0'}
					size={'30px'}
					fontSize={'.7em'}
					p={1}
					mx={-3}
					fontWeight='semibold'
				>
					<Center textAlign={'center'}>VS</Center>
				</Circle>
        <Box flex={1} mr={5}>
				<MatchupHeaderTeam
					variant={'default'}
					matchupSide={props.matchup?.awayTeam}
					isWinner={
						props.matchup?.awayTeam?.roster_id == props.matchup?.winnerRosterId
					}
					member={awayMember}
					size={'sm'}
					isTie={props.matchup?.isTie ?? false}
					isByeWeek={props.matchup?.isByeWeek ?? false}
					isInverted={false}
          alteredScore={props.awayAlteredScore}
          alteredProjectedScore={props.awayAlteredProjectedScore}
				/>
        <HorizontalPillSelector onclick={props.awayLineupOnclick}/>
        </Box>
			</Flex>
       

		</ModalHeader>
	)
}
