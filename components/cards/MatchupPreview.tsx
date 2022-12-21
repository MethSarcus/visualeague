'use client'
import {
	Avatar,
	Box,
	Button,
	Center,
	Heading,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	position,
	Radio,
	RadioGroup,
	SkeletonCircle,
	SkeletonText,
	Stack,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import {useContext, useState} from 'react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import Matchup from '../../classes/custom/Matchup'
import MatchupInterface from '../../classes/custom/MatchupInterface'
import {MatchupPlayer} from '../../classes/custom/MatchupPlayer'
import {Context} from '../../contexts/Context'
import {project_colors} from '../../utility/project_colors'
import {LINEUP_POSITION} from '../../utility/rosterFunctions'
import MatchupHeader from '../sleeper/MatchupHeader'
import PositionalMatchupContainer from '../sleeper/PositionalMatchupContainer'

interface MyProps {
	matchup?: MatchupInterface
	member: LeagueMember | undefined
}

export default function MatchupPreview(props: MyProps) {
	const [context, setContext] = useContext(Context)
	const {isOpen, onOpen, onClose} = useDisclosure()
	const [value, setValue] = useState('1')
	let opponentId

	if (props.matchup?.homeTeam.roster_id == props.member?.roster.roster_id) {
		opponentId = props.matchup?.awayTeam?.roster_id
	} else {
		opponentId = props.matchup?.homeTeam?.roster_id
	}

	let shadowColor = `inset 1px 1px 1px 1px ${project_colors.outcomeColor.tie_red}, inset 0px 0px 0px 1px ${project_colors.outcomeColor.tie_green}`
	if (props.member != undefined && props.matchup && !props.matchup?.isTie) {
		if (props.matchup?.winnerRosterId == props?.member.roster.roster_id) {
			shadowColor = `inset 0px 0px 0px 1px ${project_colors.statColor.good}`
		} else {
			shadowColor = `inset 0px 0px 0px 1px ${project_colors.statColor.bad}`
		}
	}

  if (props.matchup?.isByeWeek) {
    shadowColor = `inset 0px 0px 0px 1px ${project_colors.statColor.neutral}`
  }

	return (
		<>
			<Box fontSize={'xs'} p={0} py={1} textAlign={'center'}>
				<Text color={'textTheme.mediumEmphasis'}>
					Week {props.matchup?.weekNumber}
				</Text>
				<VStack
					w={'125px'}
					spacing={0}
					m={1}
					p={2}
					gap={0}
					onClick={onOpen}
					borderRadius={'md'}
					boxShadow={shadowColor}
					transition={'all .2s ease-in-out'}
					_hover={{
						transform: 'scale(1.1)',
						backgroundColor: 'surface.0',
						cursor: 'pointer',
					}}
				>
					<SkeletonCircle isLoaded={props.member != undefined}>
						<Avatar
							size={'sm'}
							ring={1}
							ringColor={'surface.0'}
							ringInset={'inset'}
							src={`https://sleepercdn.com/avatars/${
								context?.members.get(opponentId)?.avatar
							}`}
						/>
					</SkeletonCircle>
					<SkeletonText
						pt={2}
						height={'20px'}
						isLoaded={props.member != undefined}
						noOfLines={1}
					>
						<Text
							fontSize={'xs'}
							letterSpacing={'wide'}
							color={'textTheme.highEmphasis'}
						>
							{context?.members.get(opponentId)?.name ?? "Bye Week"}
						</Text>
					</SkeletonText>
					<Text
						pt={2}
						fontWeight={'semibold'}
						color={
							props.matchup?.winnerRosterId == props.member?.roster.roster_id
								? project_colors.outcomeColor.win
								: project_colors.outcomeColor.loss
						}
						bgGradient={
							props.matchup?.isTie
								? 'linear(to-l, #7928CA, #FF0080)'
								: undefined
						}
						bgClip={props.matchup?.isTie ? 'text' : undefined}
						letterSpacing={'wide'}
					>
						view
					</Text>
				</VStack>
			</Box>

			<Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg={'#1A202E'} color={'white'} overflowX={'hidden'}>
					<ModalHeader>
						<Center>
							<MatchupHeader matchup={props.matchup!} />
						</Center>
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text
							fontWeight={'bold'}
							fontSize={'1.5em'}
							color={project_colors.sleeper.text_normal}
						>
							Starters
						</Text>
						{
							(context as League).settings.roster_positions
								?.filter((rosPos) => rosPos != 'BN')
								.map((pos, index) => {
									return (
										<PositionalMatchupContainer
											key={index}
											position={pos as LINEUP_POSITION}
											homePlayer={props.matchup?.homeTeam.starters.at(index)!}
											awayPlayer={props.matchup?.awayTeam?.starters.at(index)!}
										/>
									)
								}) as any
						}

						<Box mt={8}>
							<Text
								fontWeight={'bold'}
								fontSize={'1.5em'}
								color={project_colors.sleeper.text_normal}
							>
								Bench
							</Text>
							{
								(context as League).settings.roster_positions
									?.filter((rosPos) => rosPos == 'BN')
									.map((pos, index) => {
										return (
											<PositionalMatchupContainer
												key={index}
												position={pos as LINEUP_POSITION}
												homePlayer={
													props.matchup?.homeTeam.bench.at(index) ??
													new MatchupPlayer()
												}
												awayPlayer={
													props.matchup?.awayTeam?.bench.at(index) ??
													new MatchupPlayer()
												}
											/>
										)
									}) as any
							}
						</Box>
					</ModalBody>

					<ModalFooter>
						<Button
							variant='outline'
							colorScheme={'secondary'}
							onClick={onClose}
						>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}
