'use client'

import {Box, Spinner, Table, TableCaption, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr} from '@chakra-ui/react'
import { throws } from 'assert'
import axios from 'axios'
import {usePathname} from 'next/navigation'
import {useContext} from 'react'
import useSWR from 'swr'
import { Draft, DraftPlayer, DRAFT_TYPE } from '../../../../classes/custom/Draft'
import League from '../../../../classes/custom/League'
import Matchup from '../../../../classes/custom/Matchup'
import { SleeperPlayerDetails } from '../../../../classes/custom/Player'
import {DraftPick} from '../../../../classes/sleeper/DraftPick'
import {Context} from '../../../../contexts/Context'

export default function Page() {
	const [context, setContext] = useContext(Context)
	if (!context.settings) return <Spinner />
	return <TableContainer>
    <Table variant='unstyled' size={"sm"} color={"white"} maxW={"500px"}>
      <TableCaption>Imperial to metric conversion factors</TableCaption>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th isNumeric>Points</Th>
          <Th isNumeric>PPG</Th>
          <Th isNumeric>{context.draft.type == DRAFT_TYPE.SNAKE ? "Picked" : "Price" }</Th>
          <Th isNumeric>Value</Th>
        </Tr>
      </Thead>
      <Tbody>

        {[...context.draft.picks.values()].sort((a: DraftPlayer, b: DraftPlayer) => b.draftValue - a.draftValue).map((pick: DraftPlayer) => {
            return (
            <Tr key={pick.player_id}>
                <Td>{pick.metadata?.first_name ?? ""} {pick.metadata?.last_name ?? ""}</Td>
                <Td isNumeric>{pick.pointsScored.toFixed(2)}</Td>
                <Td isNumeric>{(pick.pointsScored / pick.gamesPlayed).toFixed(2)}</Td>
                <Td isNumeric>{context.draft.type == DRAFT_TYPE.SNAKE ? pick.pick_no.toFixed(2) : "$" + pick.metadata.amount }</Td>
                <Td isNumeric>{pick.draftValue.toFixed(2)}</Td>
              </Tr>)
        })}
      </Tbody>
    </Table>
  </TableContainer>
}


console.log()