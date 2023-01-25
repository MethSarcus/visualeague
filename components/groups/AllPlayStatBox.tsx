import { useDisclosure, Spinner, Tooltip, Box, Center, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from "@chakra-ui/react"
import League from "../../classes/custom/League"
import { MatchupSide } from "../../classes/custom/MatchupSide"
import { Week } from "../../classes/custom/Week"
import { project_colors } from "../../utility/project_colors"
import WeeklyMatchupSummaryHeader from "./WeeklyMatchupSummary"

interface ModalObject {
	home: MatchupSide
	away: MatchupSide
	weekNumber: number
}

export class StatBoxProps {
	wins: number
	losses: number
	ties: number
	homeId: number
	disabled?: boolean
	opponentId: number
	league?: League

	constructor(
		wins: number,
		losses: number,
		ties: number,
		opponentId: number,
		homeId: number,
		disabled?: boolean | undefined
	) {
		this.wins = wins
		this.losses = losses
		this.ties = ties
		this.disabled = disabled
		this.homeId = homeId
		this.opponentId = opponentId
	}
}

export default function AllPlayStatBox(props: StatBoxProps) {
	const {isOpen, onOpen, onClose} = useDisclosure()
	if (props.homeId == -1) return <Box />
	if (!props.league?.members) return <Spinner />

	const weekPreviews: ModalObject[] = []
	let cardOutlineColor =
		props.wins > props.losses
			? project_colors.statColor.good
			: project_colors.statColor.bad
	if (props.wins == props.losses) {
		cardOutlineColor = project_colors.statColor.neutral
	}

	let homeMember = props.league?.members?.get(props.homeId)
	let awayMember = props.league?.members?.get(props.opponentId)

	props.league?.weeks?.forEach((week: Week) => {
		let homeSide = week.getMemberMatchupSide(props.homeId)
		let awaySide = week.getMemberMatchupSide(props.opponentId)
		weekPreviews.push({
			home: homeSide,
			away: awaySide,
			weekNumber: week.weekNumber,
		})
	})
	return (
		<>
			<Tooltip
				placement='right'
				isDisabled={props.disabled}
				label={
					(props.wins / (props.wins + props.losses + props.ties))
						.toFixed(3)
						.slice(1) +
					'% Win Rate vs ' +
					awayMember?.name
				}
			>
				<Box
					borderRadius={'4px'}
					width={'auto'}
					onClick={onOpen}
					height={'50px'}
					p='.5em'
					bg={props.disabled ? 'surface' : 'surface.0'}
					color='textTheme.mediumEmphasis'
					fontSize={'.9em'}
					transition={'all .2s ease-in-out'}
					dropShadow={'dark-lg'}
					_hover={
						!props.disabled
							? {
									transform: 'scale(1.1)',
									backgroundColor: 'surface.1',
									cursor: 'pointer',
							  }
							: {}
					}
					borderColor={
						props.disabled ? project_colors.statColor.neutral : cardOutlineColor
					}
					borderWidth={'thin'}
				>
					<Center
						h={'100%'}
						visibility={props.disabled ? 'collapse' : 'visible'}
					>
						{props.wins}-{props.losses}
						{props.ties > 0 ? `-${props.ties}` : ''}
					</Center>
				</Box>
			</Tooltip>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg={project_colors.sleeper.background_dark} color={'white'}>
					<ModalHeader mt={3}>
						{homeMember?.name} vs {awayMember?.name}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
                        
						<WeeklyMatchupSummaryHeader homeMemberId={props.homeId} awayMemberId={props.opponentId} />
					</ModalBody>

					<ModalFooter>
						<Button colorScheme='blue' mr={3} onClick={onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}

