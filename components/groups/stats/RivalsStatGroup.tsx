'use client'
import {HStack} from '@chakra-ui/react'
import League from '../../../classes/custom/League'
import GenericStatCard from '../../cards/statcards/GenericStatCard'

interface MyProps {
	league?: League
	memberId: number | undefined
}

const RivalsGroup = (props: MyProps) => {
	if (props.league?.settings == undefined || props.memberId == undefined) return <div>Loading...</div>
	let rival = props.league?.getMemberRival(props.memberId)
	let nemesis = props.league?.getMemberNemesis(props.memberId)

	if (rival == undefined || nemesis == undefined) return <div>Loading...</div>
	return (
		<HStack spacing={3} maxWidth='inherit' align={'stretch'}>
			<GenericStatCard
				statName={'League Rival'}
				statValue={`${rival.getPointDifferential().toFixed(2).toString()} PF Diff`}
				statOwner={props.league.members.get(rival.rivalRosterId)?.getDisplayName()}
				isLoaded={props.league?.settings != null}
				isGoodThing={true}
				avatar={props.league.members.get(rival.rivalRosterId)?.getAvatarUrl()}
			/>
			<GenericStatCard
				statName={'League Nemesis'}
				statValue={`${nemesis.getPointDifferential().toFixed(2).toString()} PF Diff`}
				statOwner={props.league.members.get(nemesis.rivalRosterId)?.getDisplayName()}
				isLoaded={props.league?.settings != null}
				isGoodThing={true}
				avatar={props.league.members.get(nemesis.rivalRosterId)?.getAvatarUrl()}
			/>
		</HStack>
	)
}

export default RivalsGroup
