'use client'
import {
	Avatar,
	Box,
	Button,
	Center,
	Flex,
	Modal,
	ModalOverlay,
	Skeleton,
	SkeletonCircle,
	Spacer,
	Text,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import {useContext} from 'react'
import LeagueMember from '../../../classes/custom/LeagueMember'
import Matchup from '../../../classes/custom/Matchup'
import {MatchupSide} from '../../../classes/custom/MatchupSide'
import {LeagueContext} from '../../../contexts/LeagueContext'
import MatchupModalBody from '../../MatchupModalBody'

type MyProps = {
	matchupSide: MatchupSide | undefined
	memberId: number | undefined
	mainStat: String | undefined
	subStat?: String | undefined
	matchup?: Matchup | undefined
	title: String | undefined
	isLoaded: boolean
}

const WeekStatCard = (props: MyProps) => {
	const {isOpen, onOpen, onClose} = useDisclosure()
	const [context, setContext] = useContext(LeagueContext)

	let leagueMember

	if (context?.settings != undefined) {
		leagueMember = context?.members?.get(props.memberId) as LeagueMember
	}
	return (
		<Flex
			minWidth={'150px'}
			border={'1px'}
			borderRadius={4}
			boxShadow={'2xl'}
			bg={'surface.0'}
			dropShadow='2xl'
		>
			<Box textAlign={'center'}>
				<Skeleton isLoaded={props.isLoaded}>
					<Text fontWeight='normal' fontSize={'1em'} color={'white'}>
						{props.title}
					</Text>
				</Skeleton>

				<VStack>
					<SkeletonCircle isLoaded={props.isLoaded} mt={2}>
						<Avatar
							size={'md'}
							src={`https://sleepercdn.com/avatars/thumbs/${leagueMember?.avatar}`}
						/>
					</SkeletonCircle>
					<Skeleton isLoaded={props.isLoaded}>
						<Text
							fontSize={'.8em'}
							fontWeight='medium'
							color={'textTheme.highEmphasis'}
						>
							{props.subStat}
						</Text>
					</Skeleton>
				</VStack>

				<Skeleton isLoaded={props.isLoaded}>
					<Text
						fontWeight={'bold'}
						fontSize={'1.2em'}
						color={'textTheme.highEmphasis'}
					>
						{props.mainStat}
					</Text>
				</Skeleton>

				<Button
					visibility={props.matchup != undefined ? 'visible' : 'hidden'}
					mt={2}
					isLoading={!props.isLoaded}
					variant={'ghost'}
					colorScheme={'secondary'}
					onClick={onOpen}
					size={'xs'}
				>
					View
				</Button>
				<Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
					<ModalOverlay />
					<MatchupModalBody matchup={props.matchup} onClose={onClose} />
				</Modal>
			</Box>
		</Flex>
	)
}

export default WeekStatCard
