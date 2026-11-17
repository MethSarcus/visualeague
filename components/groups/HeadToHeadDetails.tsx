'use client'

import {Box, Flex, Text} from '@chakra-ui/react'
import {HistoryRival, HistoryTeam} from '../../lib/leagueHistory'

const points = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

export default function HeadToHeadDetails({team, rival, showTies}: {team: HistoryTeam; rival: HistoryRival; showTies: boolean}) {
	const games = rival.wins + rival.losses + rival.ties
	const total = rival.pointsFor + rival.pointsAgainst
	const canCompare = rival.pointsFor >= 0 && rival.pointsAgainst >= 0 && total > 0
	const difference = rival.pointsAgainst - rival.pointsFor
	return <Box pt={3}>
		<Text fontSize='xs' color='surface.8' mb={1}>HEAD-TO-HEAD RESULTS</Text>
		<Flex h='9px' borderRadius='full' overflow='hidden' bg='whiteAlpha.100'
			role='img' aria-label={`${team.name}: ${rival.wins} wins; ${rival.name}: ${rival.losses} wins${showTies ? `; ${rival.ties} ties` : ''}`}>
			<Box w={`${rival.wins / games * 100}%`} bg='secondary.300' />
			{showTies && <Box w={`${rival.ties / games * 100}%`} bg='surface.7' />}
			<Box w={`${rival.losses / games * 100}%`} bg='primary.400' />
		</Flex>
		<Flex justify='space-between' gap={2} mt={1} fontSize='xs' color='surface.9'>
			<Text>{rival.wins} wins</Text>{showTies && <Text>{rival.ties} ties</Text>}<Text>{rival.losses} wins</Text>
		</Flex>
		<Text fontSize='xs' color='surface.8' mt={4} mb={2}>POINTS SCORED AGAINST EACH OTHER</Text>
		<Flex h='9px' bg='whiteAlpha.100' borderRadius='full' overflow='hidden' role='img'
			aria-label={`${team.name}: ${points(rival.pointsFor)} points, ${points(rival.pointsFor / games)} per game; ${rival.name}: ${points(rival.pointsAgainst)} points, ${points(rival.pointsAgainst / games)} per game`}>
			{canCompare && <>
				<Box w={`${rival.pointsFor / total * 100}%`} bg='secondary.300' />
				<Box w={`${rival.pointsAgainst / total * 100}%`} bg='primary.400' />
			</>}
		</Flex>
		<Flex justify='space-between' gap={2} mt={1} fontSize='xs' color='surface.9'>
			<Box flex='1' minW={0}><Text overflowWrap='anywhere'>{team.name}</Text><Text>{points(rival.pointsFor)}</Text><Text fontWeight='normal'>{points(rival.pointsFor / games)} / game</Text></Box>
			<Box flex='1' minW={0} textAlign='right'><Text overflowWrap='anywhere'>{rival.name}</Text><Text>{points(rival.pointsAgainst)}</Text><Text fontWeight='normal'>{points(rival.pointsAgainst / games)} / game</Text></Box>
		</Flex>
		{!canCompare && <Text fontSize='xs' color='surface.8' fontWeight='normal' mt={2}>Point shares unavailable for zero or negative totals.</Text>}
		<Text fontSize='xs' color='surface.8' fontWeight='normal' mt={3}>
			{difference > 0 ? `${rival.name} leads by ${points(difference)} points` : difference < 0 ? `${team.name} leads by ${points(-difference)} points` : 'Total points are tied'}
		</Text>
		<Text fontSize='xs' color='surface.8' fontWeight='normal' mt={5} mb={2}>MATCHUPS · {team.name}&apos;s score first</Text>
		{rival.matchups.map((game) => {
			const result = game.teamPoints > game.opponentPoints ? 'W' : game.teamPoints < game.opponentPoints ? 'L' : 'T'
			return <Flex key={`${game.leagueId}-${game.week}`} align='center' gap={2} py={2} borderTop='1px solid' borderColor='whiteAlpha.100'>
				<Text flex='1' fontSize='sm' color='surface.9'>{game.season} · Week {game.week}</Text>
				<Text color='white' fontSize='sm' whiteSpace='nowrap'>{points(game.teamPoints)} – {points(game.opponentPoints)}</Text>
				<Text w='20px' textAlign='right' fontSize='sm' color={result === 'W' ? 'secondary.300' : result === 'L' ? 'primary.300' : 'surface.9'}>{result}</Text>
			</Flex>
		})}
	</Box>
}
