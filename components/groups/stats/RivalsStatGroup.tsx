'use client'
import {Box, Flex, HStack, SimpleGrid, Spacer} from '@chakra-ui/react'
import {useContext} from 'react'
import League from '../../../classes/custom/League'
import {OrdinalStatInfo} from '../../../classes/custom/OrdinalStatInfo'
import {PlayerScores, SleeperPlayerDetails} from '../../../classes/custom/Player'
import {PlayerDetailsContext} from '../../../contexts/PlayerDetailsContext'
import {PlayerScoresContext} from '../../../contexts/PlayerScoresContext'
import {POSITION} from '../../../utility/rosterFunctions'
import GenericStatCard from '../../cards/statcards/GenericStatCard'
import TeamPlayerStatCard from '../../cards/statcards/TeamPlayerStatCard'
import TeamStatCard from '../../cards/statcards/TeamStatCard'

interface MyProps {
	league?: League
	memberId: number | undefined
}

const RivalsGroup = (props: MyProps) => {
	if (props.league?.settings == undefined || props.memberId == undefined) return <div>Loading...</div>
	let rival = props.league?.getMemberRival(props.memberId)
	let nemesis = props.league?.getMemberNemesis(props.memberId)
	let littleBro

	console.debug(rival)
	if (rival == undefined || nemesis == undefined) return <div>Loading...</div>
	return (
		<HStack spacing={3} maxWidth='inherit' align={'stretch'}>
			<GenericStatCard
				statName={'League Rival'}
				statValue={`${rival!.getPointDifferential().toFixed(2).toString()} PF Diff`}
				statOwner={props.league.members.get(rival.rivalRosterId)?.getDisplayName()}
				isLoaded={props.league?.settings != null}
				isGoodThing={true}
				avatar={props.league.members.get(rival.rivalRosterId)?.getAvatarUrl()}
			/>
			<GenericStatCard
				statName={'League Nemesis'}
				statValue={`${nemesis!.getPointDifferential().toFixed(2).toString()} PF Diff`}
				statOwner={props.league.members.get(nemesis.rivalRosterId)?.getDisplayName()}
				isLoaded={props.league?.settings != null}
				isGoodThing={true}
				avatar={props.league.members.get(nemesis.rivalRosterId)?.getAvatarUrl()}
			/>
		</HStack>
	)
}

export default RivalsGroup
