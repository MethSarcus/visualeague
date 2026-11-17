'use client'

import {Box, Button, Heading, Skeleton, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr} from '@chakra-ui/react'
import {useState} from 'react'
import {AuctionDraftPlayer, Draft, DraftPlayer, DRAFT_TYPE} from '../../classes/custom/Draft'

interface DataRow {
	id: string
	name: string
	ppg: number
	pf: number
	pick: number | null
	amount: number | null
	ppd: number | null
	value: number
}

type SortKey = Exclude<keyof DataRow, 'id'>
const formatNumber = (value: number | null) => value !== null && Number.isFinite(value)
	? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '—'

function formatPlayer(player: DraftPlayer): DataRow {
	const amount = player instanceof AuctionDraftPlayer ? player.amount : null
	return {
		id: player.player_id, name: player.name, ppg: player.ppg, pf: player.pointsScored,
		pick: player.pick_no, amount, ppd: amount ? player.pointsScored / amount : null, value: player.draftValue,
	}
}

export default function DraftValueTable({draft}: {draft: Draft | undefined}) {
	const [sort, setSort] = useState<{key: SortKey; ascending: boolean}>({key: 'ppg', ascending: false})
	const auction = draft?.settings.type === DRAFT_TYPE.AUCTION
	const columns: {key: SortKey; label: string; numeric?: boolean}[] = [
		{key: 'name', label: 'Player'},
		{key: 'ppg', label: 'PPG', numeric: true},
		{key: 'pf', label: 'PF', numeric: true},
		...(auction ? [{key: 'amount' as const, label: 'Cost', numeric: true}, {key: 'ppd' as const, label: 'PF / $', numeric: true}]
			: [{key: 'pick' as const, label: 'Pick', numeric: true}]),
		{key: 'value', label: 'Value', numeric: true},
	]
	const rows = Array.from(draft?.picks.values() ?? [], formatPlayer).sort((a, b) => {
		const x = a[sort.key]
		const y = b[sort.key]
		const xMissing = x === null || (typeof x === 'number' && !Number.isFinite(x))
		const yMissing = y === null || (typeof y === 'number' && !Number.isFinite(y))
		if (xMissing || yMissing) return xMissing === yMissing ? a.name.localeCompare(b.name) : xMissing ? 1 : -1
		const comparison = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y) : Number(x) - Number(y)
		return (sort.ascending ? comparison : -comparison) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
	})
	const selectSort = (key: SortKey) => setSort((current) => ({
		key, ascending: current.key === key ? !current.ascending : key === 'name',
	}))
	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={[4, 5]} h='100%'>
		<Heading size='sm' color='white'>Drafted players</Heading>
		<Text mt={1} mb={4} color='surface.8' fontSize='sm' fontWeight='normal'>
			Player production and draft value. Select a column to sort.
		</Text>
		<Skeleton isLoaded={draft !== undefined} borderRadius='md'>
			<TableContainer maxH='700px' overflowY='auto' overflowX='auto' border='1px solid' borderColor='whiteAlpha.200' borderRadius='md'>
				<Table size='sm' aria-label='Drafted player statistics'
					sx={{'th, td': {px: 3, borderColor: 'whiteAlpha.200'}, 'td': {color: 'surface.9', fontWeight: 'normal'}}}>
					<Thead position='sticky' top={0} zIndex={1} bg='surface.2'><Tr>
						{columns.map((column) => <Th key={column.key} isNumeric={column.numeric}
							aria-sort={sort.key === column.key ? (sort.ascending ? 'ascending' : 'descending') : undefined}>
							<Button variant='unstyled' minH='44px' h='auto' fontSize='inherit' color='surface.9'
								onClick={() => selectSort(column.key)}>{column.label} {sort.key === column.key ? (sort.ascending ? '↑' : '↓') : '↕'}</Button>
						</Th>)}
					</Tr></Thead>
					<Tbody>{rows.map((row) => <Tr key={row.id}>
						<Td color='white' fontSize='sm' fontWeight='medium'>{row.name}</Td>
						<Td isNumeric>{formatNumber(row.ppg)}</Td><Td isNumeric>{formatNumber(row.pf)}</Td>
						{auction ? <><Td isNumeric>{row.amount === null ? '—' : `$${row.amount}`}</Td>
							<Td isNumeric>{formatNumber(row.ppd)}</Td></> : <Td isNumeric>{row.pick ?? '—'}</Td>}
						<Td isNumeric>{formatNumber(row.value)}</Td>
					</Tr>)}</Tbody>
				</Table>
				{draft && !rows.length && <Text p={4} color='surface.8' fontSize='sm'>No drafted players available.</Text>}
			</TableContainer>
		</Skeleton>
	</Box>
}
