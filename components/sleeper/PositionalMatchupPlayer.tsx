import {
  Box, Flex, Spacer, Text
} from '@chakra-ui/react'
import { MatchupPlayer } from '../../classes/custom/MatchupPlayer'
import { DatabasePlayer, SleeperPlayerDetails } from '../../classes/custom/Player'
import { project_colors } from '../../utility/project_colors'

interface MyProps {
	player: MatchupPlayer | undefined
	playerDetails: DatabasePlayer | undefined
	isInverted?: boolean
}

export default function PositionalMatchupPlayer(props: MyProps) {
	return (
		<Flex
			py={2}
			fontSize={'.7em'}
			position={'relative'}
			align={'stretch'}
			lineHeight={1.3}
			w={'full'}
			flexDirection={props.isInverted ? 'row-reverse' : 'row'}
		>
			<Box textAlign={props.isInverted ? 'end' : 'start'}>
				<Text as={'p'} color={'white'} fontWeight={'bold'} fontSize={'1.1em'}>
					{props.playerDetails?.details.first_name?.charAt(0)}.{' '}
					{props.playerDetails?.details.last_name}
				</Text>
				<Text
					as={'p'}
					fontWeight={'semibold'}
					color={'white'}
					fontSize={'.8em'}
				>
					{props.playerDetails?.details.fantasy_positions?.at(0)}-
					{props.playerDetails?.details.team}
				</Text>
			</Box>
			<Spacer />
			<Box noOfLines={2} textAlign={props.isInverted ? 'start' : 'end'}>
				<Text as={'p'} color={'white'} fontWeight={'bold'} fontSize={'1.1em'}>
					{props.player?.score.toFixed(2)}
				</Text>
				<Text
					as={'p'}
					color={project_colors.sleeper.text_grey}
					fontWeight={'semibold'}
					fontSize={'.8em'}
				>
					{props.player?.projectedScore.toFixed(2)}
				</Text>
			</Box>
		</Flex>
	)
}
