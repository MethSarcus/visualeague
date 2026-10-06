'use client'
import {Avatar, Box, Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr} from '@chakra-ui/react'
import {useMemo} from 'react'
import League from '../../classes/custom/League'

interface MyProps {
	league: League
}

interface ActivityRow {
	rosterId: number
	name: string
	avatar: string
	trades: number
	playersSent: number
	playersReceived: number
	picksSent: number
	picksReceived: number
}

const TradeActivityTable = ({league}: MyProps) => {
	const rows = useMemo(() => {
		const byRoster = new Map<number, ActivityRow>()
		league.members.forEach((member) => {
			const rosterId = member.roster.roster_id
			byRoster.set(rosterId, {
				rosterId,
				name: member.name,
				avatar: member.getTeamAvatar(),
				trades: 0,
				playersSent: 0,
				playersReceived: 0,
				picksSent: 0,
				picksReceived: 0,
			})
		})

		league.trades.forEach((trade) => {
			trade.consenter_ids.forEach((id) => {
				const row = byRoster.get(id)
				if (row) row.trades += 1
			})
			// Drops map player to the roster that sent them; adds map player to the roster that received them
			Object.values(trade.drops ?? {}).forEach((rosterId) => {
				const row = byRoster.get(rosterId as number)
				if (row) row.playersSent += 1
			})
			Object.values(trade.adds ?? {}).forEach((rosterId) => {
				const row = byRoster.get(rosterId as number)
				if (row) row.playersReceived += 1
			})
			trade.draft_picks.forEach((pick) => {
				const sender = byRoster.get(pick.previous_owner_id)
				if (sender) sender.picksSent += 1
				const receiver = byRoster.get(pick.owner_id)
				if (receiver) receiver.picksReceived += 1
			})
		})

		return Array.from(byRoster.values()).sort(
			(a, b) => b.trades - a.trades || b.playersSent + b.picksSent - (a.playersSent + a.picksSent)
		)
	}, [league])

	return (
		<Box bg='surface.1' borderRadius='md' p={3} h='full'>
			<Text color='white' fontWeight='bold' mb={2} textAlign='center'>
				Trade Activity
			</Text>
			<TableContainer>
				<Table size='sm' variant='unstyled'>
					<Thead>
						<Tr color='textTheme.mediumEmphasis'>
							<Th color='inherit'>Team</Th>
							<Th color='inherit' isNumeric>Trades</Th>
							<Th color='inherit' isNumeric>Players sent</Th>
							<Th color='inherit' isNumeric>Players got</Th>
							<Th color='inherit' isNumeric>Picks sent</Th>
							<Th color='inherit' isNumeric>Picks got</Th>
						</Tr>
					</Thead>
					<Tbody color='white'>
						{rows.map((row) => (
							<Tr key={row.rosterId} _hover={{bg: 'whiteAlpha.100'}}>
								<Td>
									<Flex align='center' gap={2}>
										<Avatar size='xs' src={row.avatar} name={row.name} />
										<Text fontSize='sm' noOfLines={1}>
											{row.name}
										</Text>
									</Flex>
								</Td>
								<Td isNumeric fontWeight='bold'>{row.trades}</Td>
								<Td isNumeric>{row.playersSent}</Td>
								<Td isNumeric>{row.playersReceived}</Td>
								<Td isNumeric>{row.picksSent}</Td>
								<Td isNumeric>{row.picksReceived}</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
		</Box>
	)
}

export default TradeActivityTable
