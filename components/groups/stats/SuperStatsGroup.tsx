'use client'
import {Flex, SimpleGrid, Spacer} from '@chakra-ui/react'
import League from '../../../classes/custom/League'
import GenericStatCard from '../../cards/statcards/GenericStatCard'

interface MyProps {
	league: League | null
}

const SuperStatsGroup = (props: MyProps) => {
	let bestStreak
	let worstStreak
	let biggestUnderdog
	let tooBigToFail
	let bestTrajectory
	let worstTrajectory
	let mostConsistent
	let leastConsistent

	if (props.league?.settings == undefined) return <Flex>Loading</Flex>
	let notableMembers = props.league?.getLeagueSuperStats()
	console.log(notableMembers)
	if (notableMembers) {
		bestStreak = notableMembers.bestStreak
		worstStreak = notableMembers.worstStreak
		biggestUnderdog = notableMembers.underdog
		tooBigToFail = notableMembers.tooBigToFail
		bestTrajectory = notableMembers.bestTrajectory
		worstTrajectory = notableMembers.worstTrajectory
		mostConsistent = notableMembers.mostConsistent
		leastConsistent = notableMembers.leastConsistent
	}
	return (
		<SimpleGrid columns={8} spacing={3} height={'full'} overflowX={'scroll'} minChildWidth={'150px'}>
			<GenericStatCard
				statName={'Best Win Streak'}
				isLoaded={props.league?.settings != undefined}
				statValue={`${bestStreak?.stats?.currentStreak} Wins`}
				statOwner={bestStreak?.teamName}
				avatar={bestStreak?.getAvatar() ?? ''}
				isGoodThing={true}
			/>

			<GenericStatCard
				statName={'Worst Loss Streak'}
				isLoaded={props.league?.settings != undefined}
				statValue={`${Math.abs(worstStreak?.stats?.currentStreak ?? 0)} Losses`}
				statOwner={worstStreak?.teamName}
				avatar={worstStreak?.getAvatar() ?? ''}
				isGoodThing={false}
			/>

			<GenericStatCard
				statName={'Biggest Underdog'}
				isLoaded={props.league?.settings != undefined}
				statValue={`${biggestUnderdog?.stats.upsets} Upsets`}
				statOwner={biggestUnderdog?.teamName}
				avatar={biggestUnderdog?.getAvatar() ?? ''}
				isGoodThing={true}
			/>

			<GenericStatCard
				statName={'Paper Tiger'}
				isLoaded={props.league?.settings != undefined}
				statValue={`${tooBigToFail?.stats.wasUpset} Favored matches lost`}
				statOwner={tooBigToFail?.teamName}
				avatar={tooBigToFail?.getAvatar() ?? ''}
				isGoodThing={false}
			/>
			<GenericStatCard
				statName={'On The Rise'}
				isLoaded={props.league?.settings != undefined}
				statValue={`+${bestTrajectory?.stats.trajectory.toFixed(2)} Recent Trajectory`}
				statOwner={bestTrajectory?.teamName}
				avatar={bestTrajectory?.getAvatar() ?? ''}
				isGoodThing={true}
			/>
			<GenericStatCard
				statName={'In a slump'}
				isLoaded={props.league?.settings != undefined}
				statValue={`${worstTrajectory?.stats.trajectory.toFixed(2)} Recent Trajectory`}
				statOwner={worstTrajectory?.teamName}
				avatar={worstTrajectory?.getAvatar() ?? ''}
				isGoodThing={false}
			/>
			<GenericStatCard
				statName={'Most Consistent'}
				isLoaded={props.league?.settings != undefined}
				statValue={`${mostConsistent?.stats.stdDev.toFixed(2)} Std Dev`}
				statOwner={mostConsistent?.teamName}
				avatar={mostConsistent?.getAvatar() ?? ''}
				isGoodThing={true}
			/>
			<GenericStatCard
				statName={'Least Consistent'}
				isLoaded={props.league?.settings != undefined}
				statValue={`${leastConsistent?.stats.stdDev.toFixed(2)} Std Dev`}
				statOwner={leastConsistent?.teamName}
				avatar={leastConsistent?.getAvatar() ?? ''}
				isGoodThing={false}
			/>
		</SimpleGrid>
	)
}

export default SuperStatsGroup
