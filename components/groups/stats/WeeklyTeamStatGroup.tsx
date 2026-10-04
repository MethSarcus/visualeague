'use client'
import {HStack} from '@chakra-ui/react'
import League from '../../../classes/custom/League'
import MatchupInterface from '../../../classes/custom/MatchupInterface'
import {MatchupSide} from '../../../classes/custom/MatchupSide'
import NotableMatchupStatCard from '../../cards/statcards/NotableMatchupStatCard'

interface MyProps {
	league?: League
	memberId: number
}

const WeeklyTeamStatGroup = (props: MyProps) => {
	let bestWeek: MatchupSide | undefined
	let worstWeek: MatchupSide | undefined
	let bestManagedWeek: MatchupInterface | undefined
	let worstManagedWeek: MatchupInterface | undefined
	let bestManagedSide: MatchupSide | undefined
	let worstManagedSide: MatchupSide | undefined
	let closestMatchup: MatchupInterface | undefined
	let furthestMatchup: MatchupInterface | undefined
	let notableWeeks: ReturnType<League['getMemberNotableWeeks']> | undefined

	if (props.league?.settings != undefined) {
		notableWeeks = props.league.getMemberNotableWeeks(props.memberId)
		bestWeek = notableWeeks.bestWeek?.getMemberSide(props.memberId)
		worstWeek = notableWeeks.worstWeek?.getMemberSide(props.memberId)
		bestManagedWeek = notableWeeks.bestManagedWeek
		worstManagedWeek = notableWeeks.worstManagedWeek
		bestManagedSide = bestManagedWeek?.getMemberSide(props.memberId)
		worstManagedSide = worstManagedWeek?.getMemberSide(props.memberId)
		closestMatchup = notableWeeks.closestGame
		furthestMatchup = notableWeeks.furthestGame
	}

	return (
		<HStack spacing={3} maxWidth='inherit' align={'stretch'}>
			<NotableMatchupStatCard
				title={'Best Week'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={`${bestWeek?.pf.toFixed(2)} PF`}
				matchup={notableWeeks?.bestWeek}
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
				title={'Best Managed Week'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={
					bestManagedSide
						? `${(bestManagedSide.opslap - bestManagedSide.pf).toFixed(2)} pts left`
						: undefined
				}
				subStat={`Week ${bestManagedWeek?.weekNumber}`}
				matchup={bestManagedWeek}
			/>
			<NotableMatchupStatCard
				title={'Worst Managed Week'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={
					worstManagedSide
						? `${(worstManagedSide.opslap - worstManagedSide.pf).toFixed(2)} pts left`
						: undefined
				}
				subStat={`Week ${worstManagedWeek?.weekNumber}`}
				matchup={worstManagedWeek}
			/>
			<NotableMatchupStatCard
				title={'Closest Matchup'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={`${closestMatchup?.getMargin()?.toFixed(2)} Diff`}
				subStat={`Week ${closestMatchup?.weekNumber}`}
				matchup={notableWeeks?.closestGame}
			/>
			<NotableMatchupStatCard
				title={'Furthest Matchup'}
				isLoaded={props.league?.settings != undefined}
				memberId={props.memberId}
				score={`${furthestMatchup?.getMargin()?.toFixed(2)} Diff`}
				subStat={`Week ${furthestMatchup?.weekNumber}`}
				matchup={notableWeeks?.furthestGame}
			/>
		</HStack>
	)
}

export default WeeklyTeamStatGroup
