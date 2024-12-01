'use client'
import {HStack} from '@chakra-ui/react'
import League from '../../../classes/custom/League'
import Matchup from '../../../classes/custom/Matchup'
import {OrdinalStatInfo} from '../../../classes/custom/OrdinalStatInfo'
import GenericStatCard from '../../cards/statcards/GenericStatCard'
import NotableMatchupStatCard from '../../cards/statcards/NotableMatchupStatCard'
import TeamPersonalStatCard from '../../cards/statcards/TeamPersonalStatCard'
import RivalsGroup from './RivalsStatGroup'

interface MyProps {
	league?: League
	memberId: number
}

const TeamStatGroup = (props: MyProps) => {
	let member
	let bestWeek
	let worstWeek
	let closestMatchup
	let furthestMatchup
	let notableWeeks

	if (props.league?.settings != undefined) {
		member = props.league.members.get(props.memberId)
		notableWeeks = props.league.getMemberNotableWeeks(props.memberId)
		bestWeek = (notableWeeks.bestWeek as unknown as Matchup).getMemberSide(props.memberId)
		worstWeek = (notableWeeks.worstWeek as unknown as Matchup).getMemberSide(props.memberId)
		closestMatchup = notableWeeks.closestGame as unknown as Matchup
		furthestMatchup = notableWeeks.furthestGame as unknown as Matchup
	}

	return (
		<HStack spacing={3} maxWidth='inherit' align={'stretch'}>
			<NotableMatchupStatCard
				title={'Best Week'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={`${bestWeek?.pf.toFixed(2)} PF`}
				matchup={notableWeeks?.bestWeek as any}
				subStat={`Week ${bestWeek?.weekNumber}`}
			/>
			<NotableMatchupStatCard
				title={'Worst Week'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={`${worstWeek?.pf.toFixed(2)} PF`}
				subStat={`Week ${worstWeek?.weekNumber}`}
				matchup={notableWeeks?.worstWeek}
			/>
			<NotableMatchupStatCard
				title={'Closest Matchup'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={`${closestMatchup?.getMargin().toFixed(2)} Diff`}
				subStat={`Week ${closestMatchup?.weekNumber}`}
				matchup={notableWeeks?.closestGame}
			/>
			<NotableMatchupStatCard
				title={'Furthest Matchup'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={`${furthestMatchup?.getMargin().toFixed(2)} Diff`}
				subStat={`Week ${furthestMatchup?.weekNumber}`}
				matchup={notableWeeks?.furthestGame}
			/>
		</HStack>
	)
}

export default TeamStatGroup
