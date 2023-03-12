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
import React from 'react'
import League from '../../classes/custom/League'
import {MatchupSide} from '../../classes/custom/MatchupSide'
import {Week} from '../../classes/custom/Week'
import {project_colors} from '../../utility/project_colors'
import AllPlayStatBox, { StatBoxProps } from './AllPlayStatBox'

interface MyProps {
	league: League | undefined
	onHover: (rosterIds: number[]) => void
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
						props.onHover,
						false
					)
				)
			} else {
				//If detects own member push a statbox thats disabled
				bodyRows.push(new StatBoxProps(0, 0, 0, -1, -1, undefined, true))
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
								onHover={props.onHover}
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








export default AllPlayRankGroup
