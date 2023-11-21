import {Box, Button, Collapse, Spacer, Text, useDisclosure} from '@chakra-ui/react'
import {useContext} from 'react'
import League from '../../../classes/custom/League'
import LeagueMember from '../../../classes/custom/LeagueMember'
import { DatabasePlayer, PlayerScores, SleeperPlayerDetails } from '../../../classes/custom/Player'
import {LeagueContext} from '../../../contexts/LeagueContext'
import { PlayerDetailsContext } from '../../../contexts/PlayerDetailsContext'
import { PlayerScoresContext } from '../../../contexts/PlayerScoresContext'
import {POSITION} from '../../../utility/rosterFunctions'
import TeamCard from '../../cards/TeamCard'
import TeamCardWithTrendingGraph from '../../cards/TeamCardWithTrendingGraph'
import TeamPositionalBarChart from '../../charts/team_charts/TeamPositionalBarChart'
import TrendingLineChart from '../../charts/team_charts/TrendingLineChart'
import RosterPlayer from './RosterPlayer'

interface MyProps {
	member: LeagueMember
}

export default function MemberRoster(props: MyProps) {
	const [context, setContext] = useContext(LeagueContext)
	const [playerScores, setPlayerScores] = useContext(PlayerScoresContext) as [Map<string, PlayerScores>, any];
	const [playerDetails, setPlayerDetails] = useContext(PlayerDetailsContext) as [Map<string, DatabasePlayer>, any];
	return (
		<Box>
			<Box w={'full'} height={'40px'}>
				<TeamPositionalBarChart
					memberId={props.member.roster.roster_id}
					league={context}
				/>
			</Box>
			<TeamCard league={context} member={props.member} variant={''} size={''} />

			<Box mt={4}>
				<Text as={'h5'} color={'white'}>Starters</Text>
				{props.member.roster.starters.map((starter_id) => {
					return (
						<RosterPlayer
							key={starter_id}
							league={context}
							playerDetails={playerDetails?.get(
								starter_id
							)}
							leaguePositionAverage={(
								context as League
							)?.stats.getPositionAvgPPG(
								props.member.players.get(starter_id)?.positions[0] ?? POSITION.K
							)}
							playerSeasonDetails={props.member.players.get(starter_id)}
						/>
					)
				})}
				<Spacer/>
				<Text as={'h5'} color={'white'}>
					Bench
				</Text>
				{props.member.roster.players
					.filter((player) => !props.member.roster.starters.includes(player))
					.map((bench_id) => {
						return (
							<RosterPlayer
							league={context}
								key={bench_id}
								isBenched={true}
								playerDetails={playerDetails?.get(
									bench_id
								)}
								leaguePositionAverage={(
									context as League
								)?.stats.getPositionAvgPPG(
									props.member.players.get(bench_id)?.positions[0] ?? POSITION.K
								)}
								playerSeasonDetails={props.member.players.get(bench_id)}
							/>
						)
					})}
			</Box>
		</Box>
	)
}
