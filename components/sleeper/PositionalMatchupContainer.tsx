'use client'
import {Box, Center} from '@chakra-ui/react'
import {useContext} from 'react'
import {BlankPlayer, MatchupPlayer} from '../../classes/custom/MatchupPlayer'
import { PlayerScores, SleeperPlayerDetails } from '../../classes/custom/Player'
import {LeagueContext} from '../../contexts/LeagueContext'
import { PlayerDetailsContext } from '../../contexts/PlayerDetailsContext'
import { PlayerScoresContext } from '../../contexts/PlayerScoresContext'
import {project_colors} from '../../utility/project_colors'
import {LINEUP_POSITION} from '../../utility/rosterFunctions'
import SleeperLineupBadge from '../PositionBadges/SleeperLineupBadge'
import PositionalMatchupPlayer from './PositionalMatchupPlayer'

interface MyProps {
	position: LINEUP_POSITION
	homePlayer: MatchupPlayer | undefined | BlankPlayer
	awayPlayer: MatchupPlayer | undefined | BlankPlayer
	isByeWeek?: boolean
}

const PositionalMatchupContainer = (props: MyProps) => {
	const [playerScoresContext, setPlayerInfoContext] = useContext(PlayerScoresContext) as [Map<string, PlayerScores>, any];
	const [playerDetailsContext, setPlayerDetailsContext] = useContext(PlayerDetailsContext) as [Map<string, SleeperPlayerDetails>, any];

	let homePlayerDetails
	let awayPlayerDetails
	if (playerDetailsContext.size > 0) {
		homePlayerDetails = playerDetailsContext.get(props.homePlayer?.playerId ?? "0")

		if (props.awayPlayer) {
			awayPlayerDetails = playerDetailsContext.get(props.awayPlayer?.playerId ?? "0")
		}
	} else {
		return <></>
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

			{!(props.isByeWeek ?? false) && <PositionalMatchupPlayer
				player={props.awayPlayer ?? new BlankPlayer()}
				playerDetails={awayPlayerDetails}
				isInverted={true}
			/>}
		</Center>
	)
}

export default PositionalMatchupContainer