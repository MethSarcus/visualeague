import {
	Checkbox,
	CheckboxGroup,
	Grid,
	GridItem,
	Spinner,
	Stack,
    useCheckboxGroup,
    useRadioGroup,
} from '@chakra-ui/react'
import {DraftPlayer} from '../../classes/custom/Draft'
import League from '../../classes/custom/League'
import {DraftPick} from '../../classes/sleeper/DraftPick'
import DraftPickCard from '../cards/DraftPickCard'
import {AnimatePresence, motion} from 'framer-motion'
import {useEffect, useMemo, useState} from 'react'
import {POSITION} from '../../utility/rosterFunctions'

interface MyProps {
	league: League | undefined
    filteredPositions?: string[]
}

export default function DraftBoard(props: MyProps) {
	if (props.league?.settings == undefined) return <Spinner />

	return (
			<Grid
				templateColumns={`repeat(${props.league?.members?.size}, 1fr)`}
				gap={1}
			>
				{[...props.league.draft.picks.values()].filter((pick) => {
						return !props.filteredPositions?.includes(pick.metadata.position as POSITION)
					})
					.map((pick: DraftPlayer) => {
						return (
									<GridItem
										colSpan={1}
                                        key={pick.draft_id + '_' + pick.player_id}
									>
										<DraftPickCard pick={pick} />
									</GridItem>
						)
					})}
			</Grid>
	)
}
