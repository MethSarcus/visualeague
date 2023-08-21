import {ModalHeader, Center, Flex, Circle, Box, VStack} from '@chakra-ui/react'
import {useContext} from 'react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import MatchupInterface from '../../classes/custom/MatchupInterface'
import { MatchupSide } from '../../classes/custom/MatchupSide'
import {LeagueContext} from '../../contexts/LeagueContext'
import MatchupHeaderTeam from '../sleeper/MatchupHeaderTeam'

interface MyProps {
	homeMemberId: number
    awayMemberId?: number
}

interface matchupProps {
    home: MatchupSide
    away: MatchupSide
    weekNumber: number
    winnerRosterId: number
}

export default function WeeklyMatchupSummaryHeader(props: MyProps) {
	const [context, setContext] = useContext(LeagueContext)
    let matchups: matchupProps[] = []
    
	if (context?.settings == undefined) return <div>loading</div>
    
		

    (context as League).weeks.forEach(week => {
        let home = week.getMemberMatchupSide(props.homeMemberId)
        let away = week.getMemberMatchupSide(props.awayMemberId ?? -1)

        let winnerRosterId = home.roster_id
        if (home.pf < away.pf) {
            winnerRosterId = away.roster_id
        } else if (home.pf == away.pf) {
            winnerRosterId = -1
        }
        matchups.push({home: home, away: away, weekNumber: week.weekNumber, winnerRosterId: winnerRosterId} as matchupProps)
    })

	return (
		<VStack>
			{matchups?.map((matchupProp) => {
				let homeMember
				let awayMember
				let homeTeam = matchupProp?.home
				let awayTeam = matchupProp?.away

				homeMember = context.getMember(homeTeam?.roster_id) as LeagueMember
				if (awayTeam != undefined) {
					awayMember = context.getMember(awayTeam?.roster_id) as LeagueMember
				}

				return (
					<Box key={matchupProp.weekNumber}>
						<Center>Week {matchupProp?.weekNumber}</Center>
						<Flex mt={2}>
							<Box ml={5}>
								<MatchupHeaderTeam
									matchupSide={matchupProp.home}
									isWinner={
										matchupProp.home.roster_id ==
										matchupProp.winnerRosterId
									}
									isTie={matchupProp.winnerRosterId == -1 ? true : false}
									member={homeMember}
									size={'sm'}
									isHomeTeam={true}
                                    alteredScore={homeTeam.pf}
									variant={'default'}
									isByeWeek={matchupProp?.away == undefined ? true : false}
								/>
							</Box>
							<Circle
								zIndex={5}
								bg={'#1A202E'}
								color={'#A7BAD0'}
								size={'30px'}
								fontSize={'.7em'}
								shadow={'lg'}
								p={1}
								mx={-3}
								fontWeight='semibold'
							>
								<Center textAlign={'center'}>VS</Center>
							</Circle>
							<Box flex={1} mr={5}>
								<MatchupHeaderTeam
									variant={'default'}
									matchupSide={matchupProp?.away}
									isWinner={
										matchupProp?.away?.roster_id ==
										matchupProp?.winnerRosterId
									}
									member={awayMember}
									size={'sm'}
                                    alteredScore={awayTeam.pf}
									isTie={matchupProp.winnerRosterId == -1 ? true : false}
									isByeWeek={matchupProp?.away == undefined ? true : false}
									isHomeTeam={false}
								/>
							</Box>
						</Flex>
					</Box>
				)
			})}
		</VStack>
	)
}
