import {Grid, GridItem, Spinner} from '@chakra-ui/react'
import {useState} from 'react'
import {DraftPlayer, DRAFT_TYPE} from '../../classes/custom/Draft'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import {POSITION} from '../../utility/rosterFunctions'
import DraftPickCard from '../cards/DraftPickCard'
import LeagueMemberDraftCard from '../LeagueMemberDraftCard'

interface MyProps {
	league: League | undefined
	filteredPositions?: string[]
}

export default function DraftBoard(props: MyProps) {
	const [focusedRosterId, setfocusedRosterId] = useState(-1)

	function setFocusOnclick(rosterID: number) {
		if (focusedRosterId == rosterID) {
			setfocusedRosterId(-1)
		} else {
			setfocusedRosterId(rosterID)
		}
	}

	if (props.league?.settings == undefined) return <Spinner />
	let isSnakeDraft = (props.league?.draft.settings.type == DRAFT_TYPE.SNAKE)
	let draftRounds = new Map<number, DraftPlayer[]>()
	let allPicks = [...props.league.draft.picks.values()]

	allPicks.forEach((pick) => {
		if (draftRounds.has(pick.round)) {
			draftRounds.get(pick.round)?.push(pick)
		} else {
			draftRounds.set(pick.round, [pick])
		}
	})

	let snakePicks: DraftPlayer[][] = []

	for (let [key, value] of draftRounds) {
		//check if even round
		if (key % 2 == 0 && isSnakeDraft) {
			snakePicks.push(value.reverse())
		} else {
			snakePicks.push(value)
		}
	}

	return (
		<Grid
			templateColumns={`repeat(${props.league?.members?.size}, 1fr)`}
			gap={1}
			mx={'auto'}
			px={2}
			maxW={'1800px'}
			overflowX={'auto'}
		>
			{[...props.league.members.values()]
				.sort((a: LeagueMember, b: LeagueMember) => a.draft_pos - b.draft_pos)
				.map((mem) => {
					return (
						<GridItem key={mem.userId}>
							<LeagueMemberDraftCard
								user={mem}
								setFocusFunction={setFocusOnclick as any} 
								focusedRosterId={focusedRosterId}							/>
						</GridItem>
					)
				})}
			{snakePicks
				.flat()
				.filter((pick) => {
					return !props.filteredPositions?.includes(
						pick.metadata.position as POSITION
					)
				})
				.map((pick: DraftPlayer) => {
					return (
						<GridItem key={pick.draft_id + '_' + pick.player_id}>
							<DraftPickCard pick={pick} focusedRosterId={focusedRosterId} numMembers={10} isSnakeDraft={isSnakeDraft} />
						</GridItem>
					)
				})}
		</Grid>
	)
}
