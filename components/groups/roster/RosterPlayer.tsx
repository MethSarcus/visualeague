import {
	Avatar,
	Box,
	Center,
	Collapse,
	Flex,
	HStack,
	Spacer,
	Text,
	useDisclosure,
} from '@chakra-ui/react'
import {SleeperPlayerDetails} from '../../../classes/custom/Player'
import SeasonPlayer from '../../../classes/custom/SeasonPlayer'
import {project_colors} from '../../../utility/project_colors'
import RosterPlayerTrendingLineChart from '../../charts/team_charts/RosterPlayerTrendingLineChart'
import PositionBadge from '../../PositionBadges/PositionBadge'

interface MyProps {
	playerDetails: SleeperPlayerDetails | undefined
	playerSeasonDetails: SeasonPlayer | undefined
	leaguePositionAverage: number
	isBenched?: boolean
}

export default function RosterPlayer(props: MyProps) {
	const {isOpen, onToggle} = useDisclosure()
	return (
		<Box
			bg={project_colors.sleeper.background_dark}
			borderRadius={2}
			minW={'175px'}
			my={1}
			_hover={{
				cursor: 'pointer',
				boxShadow: '2xl',
				dropShadow: '2xl',
				shadow: `inset 0px 0px 10px ${project_colors.sleeper.border_color}`
			}}
			onClick={onToggle}
			transition={'all .2s ease-in-out'}

		>
			<HStack
				py={2}
				px={2}
				shadow={'dark'}
				fontSize={'.7em'}
				position={'relative'}
				verticalAlign={'middle'}
				lineHeight={1.3}
				flexDirection={'row'}

			>
				<PositionBadge
					variant={
						props.isBenched == true
							? 'BN'
							: props.playerDetails?.fantasy_positions[0] ?? 'RB'
					}
					size={'xs'}
				/>
				<Avatar
					size={'xs'}
					src={
						isNaN(+props.playerDetails?.player_id!)
							? `https://sleepercdn.com/images/team_logos/nfl/${props.playerDetails?.player_id.toLowerCase()}.png`
							: `https://sleepercdn.com/content/nfl/players/${props.playerDetails?.player_id}.jpg`
					}
				/>
				<Box textAlign={'start'}>
					<Text
						color={'white'}
						fontWeight={'semibold'}
						fontSize={'.9em'}
						noOfLines={1}
						textOverflow={"clip"}
					>
						{props.playerDetails?.first_name.charAt(0)}.{' '}
						{props.playerDetails?.last_name}
					</Text>
					<Text
						as={'p'}
						fontWeight={'semibold'}
						color={'white'}
						fontSize={'.6em'}
					>
						{props.playerDetails?.fantasy_positions[0]}-
						{props.playerDetails?.team}
					</Text>
				</Box>
				<Spacer/>
				<Text color={project_colors.sleeper.text_normal} fontSize={".65em"} >
					{(props.playerDetails?.fantasy_positions[0] ?? 'UN') +
						props.playerSeasonDetails?.teamPositionRank}
				</Text>
			</HStack>
			<Collapse in={isOpen} animateOpacity>
				<Box p='5px' zIndex={1} fontSize={'.8em'} color='white'>
					<Flex textAlign={"center"} flexDirection={"row"} align={"center"}>
					<Spacer/>
						<Center noOfLines={3} textAlign={"center"}>
							<Text fontSize={'.6em'}>Avg</Text>
							<Text fontSize={'.6em'}>
								{props.playerSeasonDetails?.avgPointsPerStart.toFixed(2)}
							</Text>
							<Text fontWeight={'thin'} fontSize={'.5em'}>
								PPS
							</Text>
						</Center>
						<Spacer/>
						<Center noOfLines={3}>
							<Text fontSize={'.6em'}>Starter Points</Text>
							<Text fontSize={'.6em'}>
								{props.playerSeasonDetails?.starter_points.toFixed(2)}
							</Text>
							<Text fontWeight={'thin'} fontSize={'.5em'}>
								PF
							</Text>
						</Center>
						<Spacer/>
						<Center noOfLines={3}>
							<Text fontSize={'.6em'}>Consistency</Text>
							<Text fontSize={'.6em'}>
								{props.playerSeasonDetails?.stdDev.toFixed(2)}
							</Text>
							<Text fontWeight={'thin'} fontSize={'.5em'}>
								Std Dev
							</Text>
						</Center>
						<Spacer/>
					</Flex>
					<Box w={'155px'} h={'60px'}>
						<RosterPlayerTrendingLineChart
							player={props.playerSeasonDetails}
							positionAverage={props.leaguePositionAverage}
						/>
					</Box>
				</Box>
			</Collapse>
		</Box>
	)
}
