import {
	Avatar,
	Box,
	Button,
	Center,
	Grid,
	GridItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Tooltip,
	useDisclosure,
} from '@chakra-ui/react'
import League from '../../classes/custom/League'
import {MatchupSide} from '../../classes/custom/MatchupSide'
import {Week} from '../../classes/custom/Week'
import {project_colors} from '../../utility/project_colors'

interface MyProps {
	league: League | undefined
}

const AllPlayRankGroup = (props: MyProps) => {
	const firstRow: MemberNameProps[] = []
	const bodyRows: (MemberNameProps | StatBoxProps)[] = []
	const data: object[] = []

	if (!props.league?.members) return <Spinner />
	props.league?.members.forEach((member) => {
		firstRow.push({name: member.name, imageSrc: member.getTeamAvatar()})
	})
	props.league?.members.forEach((member) => {
		bodyRows.push({name: member.name, imageSrc: member.getTeamAvatar()})
		props.league?.members.forEach((opponent) => {
			let oppRosterId = opponent.roster.roster_id
			if (oppRosterId != member.roster.roster_id) {
				bodyRows.push(
					new StatBoxProps(
						member.stats.allPlayWinMap.get(oppRosterId) ?? 0,
						member.stats.allPlayLossMap.get(oppRosterId) ?? 0,
						member.stats.allPlayTieMap.get(oppRosterId) ?? 0,
						oppRosterId,
						member.roster.roster_id,
						false
					)
				)
			} else {
				//If detects own member push a statbox thats disabled
				bodyRows.push(new StatBoxProps(0, 0, 0, -1, -1, true))
			}
		})
	})
	return (
		<Grid
			gap='5px'
			templateColumns={`repeat(${props.league.members.size + 1}, 1fr)`}
			templateRows={`repeat(${props.league.members.size + 1}, 1fr)`}
			textAlign={'center'}
		>
			<GridItem
				my={'auto'}
				width={'50px'}
				height={'50px'}
				color='textTheme.highEmphasis'
				fontSize={'.9em'}
				noOfLines={1}
			>
				User
			</GridItem>
			{firstRow.map((mems: MemberNameProps) => {
				return (
					<GridItem key={mems.name}>
						<MemberNameHeader name={mems.name} imageSrc={mems.imageSrc} />
					</GridItem>
				)
			})}
			{bodyRows.map((cell: MemberNameProps | StatBoxProps, index) => {
				if (cell instanceof StatBoxProps) {
					return (
						<GridItem key={index}>
							<AllPlayStatBox
								wins={cell.wins}
								losses={cell.losses}
								ties={cell.ties}
								homeId={cell.homeId}
								disabled={cell.disabled}
								opponentId={cell.opponentId}
								league={props.league}
							/>
						</GridItem>
					)
				} else {
					return (
						<GridItem key={index}>
							<MemberNameHeader
								name={cell.name}
								imageSrc={cell.imageSrc}
								isRotated={true}
							/>
						</GridItem>
					)
				}
			})}
		</Grid>
	)
}

interface MemberNameProps {
	name: string
	imageSrc: string
	isRotated?: boolean
}

function MemberNameHeader(props: MemberNameProps) {
	return (
		<Center
			width={'50px'}
			height={'50px'}
			color='textTheme.highEmphasis'
			fontSize={'.7em'}
			px={1}
			textAlign={'center'}
			noOfLines={2}
		>
			<Avatar src={props.imageSrc} size={'sm'} name={props.name} />
			{props.isRotated != true && props.name}
		</Center>
	)
}

class StatBoxProps {
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

interface ModalObject {
	home: MatchupSide
	away: MatchupSide
	weekNumber: number
}

function AllPlayStatBox(props: StatBoxProps) {
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
				<ModalContent bg={'surface.1'} color={'white'}>
					<ModalHeader mt={3}>
						{homeMember?.name} vs {awayMember?.name}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody></ModalBody>

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

export default AllPlayRankGroup
