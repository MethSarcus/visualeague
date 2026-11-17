'use client'

import {
	Avatar, Box, Button, Flex, Heading, HStack, Modal, ModalBody, ModalCloseButton, ModalContent,
	ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr,
} from '@chakra-ui/react'
import {useMemo, useState} from 'react'
import {HistoryTeam} from '../../lib/leagueHistory'
import {describeHistoryRecord, formatHistoryRecord} from '../../lib/historyRecordFormat'
import HeadToHeadDetails from './HeadToHeadDetails'

export default function HeadToHeadMatrix({teams, showTies = teams.some((team) => team.ties > 0)}: {teams: HistoryTeam[]; showTies?: boolean}) {
	const [selection, setSelection] = useState<{teamId: string; opponentId: string} | null>(null)
	const sorted = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)), [teams])
	const records = useMemo(() => new Map(teams.map((team) => [team.id, new Map(team.opponents.map((opponent) => [opponent.id, opponent]))])), [teams])
	const selectedTeam = teams.find((team) => team.id === selection?.teamId)
	const selectedOpponent = teams.find((team) => team.id === selection?.opponentId)
	const selectedRecord = selectedTeam && selectedOpponent ? records.get(selectedTeam.id)?.get(selectedOpponent.id) : undefined

	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' mt={6} p={[4, 6]} minW={0}>
		<Heading size='md' color='white'>All-time head-to-head</Heading>
		<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>
			Records are {showTies ? 'wins–losses–ties' : 'wins–losses'} for the team in each row. Select a matchup for details; scroll sideways to see more opponents.
		</Text>
		<HStack spacing={4} mt={2} fontSize='xs' color='surface.9'>
			<Text><Box as='span' color='secondary.300'>●</Box> More wins</Text>
			<Text><Box as='span' color='primary.400'>●</Box> More losses</Text>
			<Text><Box as='span' color='surface.8'>●</Box> Even or no games</Text>
		</HStack>
		{sorted.length < 2 ? <Text mt={4} color='surface.8'>At least two teams are needed for a comparison.</Text> :
			<TableContainer mt={4} overflowX='auto'>
				<Table aria-label='All-time head-to-head records' variant='unstyled' size='sm' width='auto' minW='full' style={{borderCollapse: 'separate', borderSpacing: '4px'}}>
					<Thead><Tr>
						<Th scope='col' minW='150px' color='surface.8' fontSize='xs' position='sticky' left={0} bg='surface.1' zIndex={1}>TEAM / OPPONENT</Th>
						{sorted.map((team) => <Th scope='col' key={team.id} textAlign='center' p={1} minW='78px'>
							<Flex direction='column' align='center' gap={1}>
								<Avatar size='sm' name={team.name} src={team.avatar || undefined} aria-hidden='true' />
								<Text color='surface.9' fontSize='xs' maxW='78px' noOfLines={1} textTransform='none' title={team.name}>{team.name}</Text>
							</Flex>
						</Th>)}
					</Tr></Thead>
					<Tbody>{sorted.map((team) => <Tr key={team.id}>
						<Th scope='row' p={1} textTransform='none' position='sticky' left={0} bg='surface.1' zIndex={1}>
							<HStack spacing={2}><Avatar size='sm' name={team.name} src={team.avatar || undefined} aria-hidden='true' />
								<Text color='white' fontSize='sm' maxW='130px' noOfLines={1} title={team.name}>{team.name}</Text></HStack>
						</Th>
						{sorted.map((opponent) => {
							if (team.id === opponent.id) return <Td key={opponent.id} p={0} textAlign='center' color='surface.7' aria-label='Same team'>—</Td>
							const record = records.get(team.id)?.get(opponent.id)
							const score = record ? formatHistoryRecord(record, showTies) : '—'
							const borderColor = !record || record.wins === record.losses ? 'whiteAlpha.300' : record.wins > record.losses ? 'secondary.300' : 'primary.400'
							return <Td key={opponent.id} p={0}>
								<Button w='full' h='48px' minW='74px' p={1} bg='surface.2' border='1px solid' borderColor={borderColor} borderRadius='md'
									color={record ? 'white' : 'surface.8'} fontSize='sm' fontWeight='medium'
									_hover={{bg: 'surface.3'}} _focusVisible={{outline: '2px solid', outlineColor: 'white'}}
									aria-label={`${team.name} vs ${opponent.name}: ${record ? describeHistoryRecord(record, showTies) : 'no games'}`}
									onClick={() => setSelection({teamId: team.id, opponentId: opponent.id})}>{score}</Button>
							</Td>
						})}
					</Tr>)}</Tbody>
				</Table>
			</TableContainer>}
		<Modal isOpen={Boolean(selectedTeam && selectedOpponent)} onClose={() => setSelection(null)} size='lg' scrollBehavior='inside' isCentered>
			<ModalOverlay />
			<ModalContent bg='surface.1' color='white' mx={4}>
				<ModalHeader pr={12}>Head-to-head matchup</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					{selectedTeam && selectedOpponent && <>
						<Flex align='center' justify='space-between' gap={3}>
							<TeamHeader team={selectedTeam} />
							<Box textAlign='center' flexShrink={0}>
								<Text color='primary.300' fontWeight='bold'>VS</Text>
								<Text fontSize='lg' aria-label={selectedRecord ? `${selectedTeam.name}: ${describeHistoryRecord(selectedRecord, showTies)} against ${selectedOpponent.name}` : 'No games'}>
									{selectedRecord ? formatHistoryRecord(selectedRecord, showTies) : '—'}
								</Text>
							</Box>
							<TeamHeader team={selectedOpponent} />
						</Flex>
						{selectedRecord ? <HeadToHeadDetails team={selectedTeam} rival={selectedRecord} showTies={showTies} /> :
							<Text mt={5} color='surface.8'>No paired head-to-head games between these teams yet.</Text>}
					</>}
				</ModalBody>
			</ModalContent>
		</Modal>
	</Box>
}

function TeamHeader({team}: {team: HistoryTeam}) {
	return <Box flex='1' minW={0} textAlign='center'>
		<Avatar size='md' name={team.name} src={team.avatar || undefined} aria-hidden='true' />
		<Text mt={2} fontSize='sm' color='white' overflowWrap='anywhere'>{team.name}</Text>
	</Box>
}
