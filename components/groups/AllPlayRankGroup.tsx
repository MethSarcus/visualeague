import {
	Text,
	Box,
	SimpleGrid,
	Card,
	Center,
	Grid,
	Avatar,
	Spinner,
	GridItem,
} from '@chakra-ui/react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import {project_colors} from '../../utility/project_colors'
import LeagueMemberButton from '../cards/LeagueMemberButton'

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
						false
					)
				)
			} else {
				//If detects own member push a statbox thats disabled
				bodyRows.push(new StatBoxProps(0, 0, 0, true))
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
                height={"50px"}
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
								disabled={cell.disabled}
							/>
						</GridItem>
					)
				} else {
					return (
						<GridItem key={index}>
							<MemberNameHeader name={cell.name} imageSrc={cell.imageSrc} isRotated={true} />
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
	disabled?: boolean

	constructor(
		wins: number,
		losses: number,
		ties: number,
		disabled?: boolean | undefined
	) {
		this.wins = wins
		this.losses = losses
		this.ties = ties
		this.disabled = disabled
	}
}
function AllPlayStatBox(props: StatBoxProps) {
	let cardOutlineColor =
		props.wins > props.losses
			? project_colors.statColor.good
			: project_colors.statColor.bad
	if (props.wins == props.losses) {
		cardOutlineColor = project_colors.statColor.neutral
	}
	return (
		<Box
			borderRadius={'4px'}
			width={'auto'}
			height={'50px'}
            p=".5em"
			bg={props.disabled ? 'surface' : 'surface.0'}
			color='textTheme.mediumEmphasis'
			fontSize={'.9em'}
			dropShadow={'dark-lg'}
			borderColor={
				props.disabled ? project_colors.statColor.neutral : cardOutlineColor
			}
			borderWidth={'thin'}
		>
			<Center h={'100%'} visibility={props.disabled ? 'collapse' : 'visible'}>
				{props.wins}-{props.losses}
				{props.ties > 0 ? `-${props.ties}` : ''}
			</Center>
		</Box>
	)
}

export default AllPlayRankGroup
