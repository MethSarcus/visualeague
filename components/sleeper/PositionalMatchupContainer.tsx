'use client'
import {Box, Center} from '@chakra-ui/react'
import {useContext} from 'react'
import {BlankPlayer, MatchupPlayer} from '../../classes/custom/MatchupPlayer'
import {Context} from '../../contexts/Context'
import {project_colors} from '../../utility/project_colors'
import {LINEUP_POSITION} from '../../utility/rosterFunctions'
import SleeperLineupBadge from '../PositionBadges/SleeperLineupBadge'
import PositionalMatchupPlayer from './PositionalMatchupPlayer'

interface MyProps {
	position: LINEUP_POSITION
	homePlayer: MatchupPlayer | BlankPlayer
	awayPlayer: MatchupPlayer | undefined | BlankPlayer
}

export default function PositionalMatchupContainer(props: MyProps) {
	const [context, setContext] = useContext(Context)
	let homePlayerDetails
	let awayPlayerDetails

	if (context.playerDetails) {
		homePlayerDetails = context.playerDetails.get(props.homePlayer.playerId)

		if (props.awayPlayer) {
			awayPlayerDetails = context.playerDetails.get(props.awayPlayer?.playerId)
		}
	}

	return (
		<Center
			borderBottom={'1px'}
			borderColor={project_colors.sleeper.border_color}
		>
			<PositionalMatchupPlayer
				player={props.homePlayer}
				playerDetails={homePlayerDetails}
			/>
			<Box mx={2} zIndex={4}>
				<SleeperLineupBadge slotPosition={props.position} />
			</Box>

			<PositionalMatchupPlayer
				player={props.awayPlayer ?? new BlankPlayer()}
				playerDetails={awayPlayerDetails}
				isInverted={true}
			/>
		</Center>
	)
}
