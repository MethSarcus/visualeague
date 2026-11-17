'use client'

import {
	Avatar, Box, Button, Flex, Heading, HStack, Select, Table, TableContainer, Tbody, Td,
	Text, Th, Thead, Tr,
} from '@chakra-ui/react'
import {useMemo, useState} from 'react'
import {HistoryTeam} from '../../lib/leagueHistory'
import {formatHistoryRecord} from '../../lib/historyRecordFormat'

interface Standing {
	id: string
	name: string
	manager: string
	avatar: string | null
	seasons: number
	points: number
	games: number
	wins: number
	losses: number
	ties: number
	winLossRatio: number | null
	pointsAgainst: number
	ppg: number | null
	papg: number | null
}

type SortKey = 'name' | 'wins' | 'winLossRatio' | 'games' | 'points' | 'pointsAgainst' | 'ppg' | 'papg' | 'seasons'
const format = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
const panel = {bg: 'surface.1', border: '1px solid', borderColor: 'whiteAlpha.200', borderRadius: 'xl'}
const scoringColors = {for: 'secondary.300', against: 'primary.400'}

export default function HistoryStandings({teams, showTies = teams.some((team) => team.ties > 0)}: {teams: HistoryTeam[]; showTies?: boolean}) {
	const [seasonId, setSeasonId] = useState('all')
	const [sort, setSort] = useState<{key: SortKey; ascending: boolean}>({key: 'wins', ascending: false})
	const seasons = useMemo(() => {
		const byId = new Map<string, string>()
		teams.forEach((team) => team.seasonRecords.forEach((season) => byId.set(season.leagueId, season.season)))
		return Array.from(byId, ([id, year]) => ({id, year})).sort((a, b) => b.year.localeCompare(a.year) || a.id.localeCompare(b.id))
	}, [teams])
	const selectedSeasonId = seasonId === 'all' || seasons.some((season) => season.id === seasonId) ? seasonId : 'all'
	const standings = useMemo(() => teams.flatMap((team): Standing[] => {
		const season = selectedSeasonId === 'all' ? undefined : team.seasonRecords.find((item) => item.leagueId === selectedSeasonId)
		if (selectedSeasonId !== 'all' && !season) return []
		const record = season || team.headToHead
		return [{
			id: team.id, name: team.name, manager: team.manager, avatar: team.avatar, seasons: season ? 1 : team.seasons,
			points: season ? season.points : team.points,
			games: record.games, wins: record.wins, losses: record.losses, ties: record.ties,
			winLossRatio: record.losses ? record.wins / record.losses : record.wins ? Infinity : null,
			pointsAgainst: record.pointsAgainst,
			ppg: record.games ? record.pointsFor / record.games : null,
			papg: record.games ? record.pointsAgainst / record.games : null,
		}]
	}), [teams, selectedSeasonId])
	const sorted = useMemo(() => [...standings].sort((a, b) => {
		const x = a[sort.key]
		const y = b[sort.key]
		if (x === null || y === null) return x === y ? a.name.localeCompare(b.name) : x === null ? 1 : -1
		const result = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y) : Number(x) - Number(y)
		return (sort.ascending ? result : -result) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
	}), [standings, sort])
	const selectSort = (key: SortKey) => setSort((current) => ({
		key,
		ascending: current.key === key ? !current.ascending : key === 'name',
	}))
	const columns: {key: SortKey; label: string; numeric?: boolean}[] = [
		{key: 'name', label: 'Team'},
		{key: 'wins', label: showTies ? 'W-L-T' : 'W-L', numeric: true},
		{key: 'winLossRatio', label: 'W/L ratio', numeric: true},
		{key: 'games', label: 'GP', numeric: true},
		{key: 'points', label: 'PF', numeric: true},
		{key: 'pointsAgainst', label: 'PA', numeric: true},
		{key: 'ppg', label: 'PF / game', numeric: true},
		{key: 'papg', label: 'PA / game', numeric: true},
		...(selectedSeasonId === 'all' ? [{key: 'seasons' as const, label: 'Seasons', numeric: true}] : []),
	]
	return <Box {...panel} mt={6} p={[4, 6]}>
		<Flex justify='space-between' align={{base: 'stretch', md: 'end'}} direction={{base: 'column', md: 'row'}} gap={4}>
			<Box>
				<Heading size='md' color='white'>All-time standings</Heading>
				<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>Select a season for its breakdown. Select a column heading to sort.</Text>
			</Box>
			<Box minW={{base: 'full', md: '200px'}}>
				<Text as='label' htmlFor='history-season' fontSize='xs' color='surface.9'>SEASON</Text>
				<Select id='history-season' value={selectedSeasonId} onChange={(event) => setSeasonId(event.target.value)} bg='surface.2' color='white' mt={1}>
					<option value='all'>All seasons</option>
					{seasons.map((season) => <option key={season.id} value={season.id}>{season.year}{seasons.filter((item) => item.year === season.year).length > 1 ? ` · ${season.id}` : ''}</option>)}
				</Select>
			</Box>
		</Flex>
		<TableContainer mt={4}>
			<Table aria-label='History standings' size='sm' variant='simple'>
				<Thead><Tr>{columns.map((column) => <Th key={column.key} isNumeric={column.numeric}
					aria-sort={sort.key === column.key ? (sort.ascending ? 'ascending' : 'descending') : undefined}>
					<Button variant='unstyled' minH='44px' h='auto' fontSize='inherit' color='surface.9'
						onClick={() => selectSort(column.key)}>{column.label} {sort.key === column.key ? (sort.ascending ? '↑' : '↓') : '↕'}</Button>
				</Th>)}</Tr></Thead>
				<Tbody>{sorted.map((team) => <Tr key={team.id}>
					<Td><HStack spacing={2}><Avatar aria-hidden='true' name={team.name} src={team.avatar || undefined} size='sm' /><Box><Text color='white'>{team.name}</Text>{team.manager !== team.name && <Text fontSize='xs' color='surface.8' fontWeight='normal'>{team.manager}</Text>}</Box></HStack></Td>
					<Td isNumeric>{formatHistoryRecord(team, showTies, '-')}</Td>
					<Td isNumeric>{team.winLossRatio === null ? '—' : team.winLossRatio === Infinity ? '∞' : format(team.winLossRatio)}</Td>
					<Td isNumeric>{team.games}</Td>
					<Td isNumeric>{format(team.points)}</Td>
					<Td isNumeric>{format(team.pointsAgainst)}</Td>
					<Td isNumeric>{team.ppg === null ? '—' : format(team.ppg)}</Td>
					<Td isNumeric>{team.papg === null ? '—' : format(team.papg)}</Td>
					{selectedSeasonId === 'all' && <Td isNumeric>{team.seasons}</Td>}
				</Tr>)}</Tbody>
			</Table>
		</TableContainer>
		<Text mt={4} fontSize='sm' color='surface.8' fontWeight='normal'>
			GP, PA and per-game averages use paired head-to-head games only. PF includes all scored weeks, including byes and unpaired matchups. {showTies ? 'W-L-T' : 'W-L'} sorts by wins. W/L is wins divided by losses{showTies ? ', excluding ties' : ''}; ∞ means wins with no losses, and — means no wins or losses.
		</Text>
		<ScoringChart standings={standings} />
	</Box>
}

function ScoringChart({standings}: {standings: Standing[]}) {
	const rows = standings.filter((team) => team.ppg !== null && team.papg !== null)
		.sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
	if (!rows.length) return <Text mt={6} color='surface.8'>No paired games available for the scoring comparison.</Text>
	const values = rows.flatMap((team) => [team.ppg!, team.papg!])
	const min = Math.min(...values)
	const max = Math.max(...values)
	const padding = Math.max((max - min) * 0.1, 1)
	const start = min - padding
	const end = max + padding
	const position = (value: number) => (value - start) / (end - start) * 100
	return <Box mt={8} pt={6} borderTop='1px solid' borderColor='whiteAlpha.200'>
		<Heading size='sm' color='white'>Scoring vs. competition</Heading>
		<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>Each line connects points scored and allowed per head-to-head game. Ranked by scoring; the scale is zoomed to the data.</Text>
		<HStack spacing={5} my={4} fontSize='xs' color='surface.9'>
			<HStack><Box w={3} h={3} bg={scoringColors.for} borderRadius='full' /><Text>PF / game (scored)</Text></HStack>
			<HStack><Box w={3} h={3} bg={scoringColors.against} borderRadius='full' /><Text>PA / game (allowed)</Text></HStack>
		</HStack>
		<Box role='img' aria-label='Connected dot chart comparing points for and points against per head-to-head game. Values are also available in the standings table.'>
			{rows.map((team) => {
				const pfLeft = team.ppg! <= team.papg!
				const equal = team.ppg === team.papg
				const markerPosition = (value: number, left: boolean) => `calc(${position(value)}% ${equal ? (left ? '- 4px' : '+ 4px') : '+ 0px'})`
				const labelPosition = (value: number, left: boolean) => `calc(${position(value)}% ${left ? '-' : '+'} ${equal ? 14 : 10}px)`
				return <Flex key={team.id} py={2} direction={{base: 'column', md: 'row'}} align={{base: 'stretch', md: 'center'}} borderBottom='1px solid' borderColor='whiteAlpha.100'>
				<HStack flex={{md: '0 0 220px'}} minW={0} spacing={2}>
					<Avatar aria-hidden='true' name={team.name} src={team.avatar || undefined} size='sm' />
					<Text color='white' fontSize='sm' noOfLines={2}>{team.name}</Text>
				</HStack>
				<Box flex='1' minW={0}>
					<Box position='relative' h='44px' mx={{base: '80px', md: '100px'}}>
						<Text position='absolute' top='50%' left={labelPosition(team.ppg!, pfLeft)} transform={pfLeft ? 'translate(-100%, -50%)' : 'translateY(-50%)'} whiteSpace='nowrap' fontSize='xs' color={scoringColors.for}>PF {format(team.ppg!)}</Text>
						<Text position='absolute' top='50%' left={labelPosition(team.papg!, !pfLeft)} transform={!pfLeft ? 'translate(-100%, -50%)' : 'translateY(-50%)'} whiteSpace='nowrap' fontSize='xs' color={scoringColors.against}>PA {format(team.papg!)}</Text>
						<Box position='absolute' top='50%' transform='translateY(-50%)' w='full' h='2px' bg='whiteAlpha.200' />
						<Box position='absolute' top='50%' transform='translateY(-50%)' left={`${Math.min(position(team.ppg!), position(team.papg!))}%`} w={`${Math.abs(position(team.ppg!) - position(team.papg!))}%`} h='4px' bg='surface.7' />
						<Box position='absolute' top='50%' left={markerPosition(team.papg!, !pfLeft)} transform='translate(-50%, -50%)' w='12px' h='12px' bg={scoringColors.against} borderRadius='full' border='1px solid' borderColor='surface.1' />
						<Box position='absolute' top='50%' left={markerPosition(team.ppg!, pfLeft)} transform='translate(-50%, -50%)' w='12px' h='12px' bg={scoringColors.for} borderRadius='full' border='1px solid' borderColor='surface.1' />
					</Box>
				</Box>
			</Flex>})}
		</Box>
	</Box>
}
