'use client'

import {Box, Flex, Heading, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VisuallyHidden} from '@chakra-ui/react'
import {FaTrophy} from 'react-icons/fa'
import {aggregateDivisionHistory, aggregateDivisionPairs, DivisionHistory as DivisionHistoryData, DivisionPair, DivisionRecord, DivisionSeason} from '../../lib/divisionHistory'
import {formatHistoryRecord} from '../../lib/historyRecordFormat'

const colors = ['secondary.300', 'primary.400', 'orange.300', 'blue.300', 'pink.300', 'yellow.300']
const color = (id: number) => colors[(id - 1) % colors.length]
const format = (value: number) => value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})

export default function DivisionHistory({history, showTies = history.seasons.some((season) => season.divisions.some((division) => division.ties > 0))}: {history: DivisionHistoryData; showTies?: boolean}) {
	const totals = aggregateDivisionHistory(history)
	const pairs = aggregateDivisionPairs(history)
	const missing = history.seasons.reduce((sum, season) => sum + season.missingDivisionRosters, 0)
	const excluded = history.seasons.reduce((sum, season) => sum + season.excludedGames, 0)
	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' mt={6} p={[4, 6]}>
		<Heading size='md' color='white'>Division bragging rights</Heading>
		<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>
			Head-to-head results between divisions. Records and scoring averages use the same interdivision games. {showTies && 'Ties count as half a win.'}
		</Text>
		{history.seasons.length === 0 ? <Text color='surface.9' mt={5} fontWeight='normal'>No linked seasons have divisions configured.</Text> :
			<Tabs mt={5} colorScheme='teal' isLazy>
				<TabList borderColor='whiteAlpha.200'><Tab>All time</Tab><Tab>By season</Tab></TabList>
				<TabPanels>
					<TabPanel px={0}>
						<Text fontSize='sm' color='surface.8' fontWeight='normal'>Grouped by division slot; names and membership may change. Averages are weighted by interdivision games played.</Text>
						{totals.filter((division) => division.names.length > 1).map((division) => <Text key={division.id} color='surface.9' fontSize='xs' mt={2} fontWeight='normal'>
							Division {division.id} names: {division.names.join(' → ')}
						</Text>)}
						<DivisionComparison pairs={pairs} showTies={showTies} />
						<Coverage missing={missing} excluded={excluded} allTime />
					</TabPanel>
					<TabPanel px={0}>
						<Text fontSize='sm' color='surface.8' fontWeight='normal'>For each metric, teal is higher and purple is lower. Ties and unavailable values are neutral.</Text>
						<Flex align='center' gap={2} mt={2} color='surface.9' fontSize='sm' fontWeight='normal'>
							<Box as='span' color='yellow.300' aria-hidden='true'><FaTrophy /></Box>
							<Text>League champion came from this division.</Text>
						</Flex>
						<SeasonComparisons seasons={history.seasons} showTies={showTies} />
					</TabPanel>
				</TabPanels>
			</Tabs>}
		<Text mt={5} fontSize='sm' color='surface.8' fontWeight='normal'>
			Includes paired regular season and playoff games between divisions, including consolation games. Same-division games, byes, median games, incomplete or invalid matchups, and results for rosters with unknown divisions are excluded. Division assignments use season roster settings and may change mid-season. Season cards compare each metric separately; the trophy identifies the league champion&apos;s reported division, even when the champion is filtered out.
			{history.seasonsWithoutDivisions > 0 && ` ${history.seasonsWithoutDivisions} season(s) without configured divisions are not shown.`}
		</Text>
	</Box>
}

function DivisionComparison({pairs, showTies}: {pairs: DivisionPair[]; showTies: boolean}) {
	if (!pairs.length) return <Text mt={4} color='surface.8' fontWeight='normal'>No interdivision games are available for this comparison.</Text>
	return <>
		<SimpleGrid columns={{base: 1, xl: 2}} spacing={4} mt={3}>
			{pairs.map(({first, second}) => <DivisionFaceoff key={`${first.id}:${second.id}`} first={first} second={second} showTies={showTies} />)}
		</SimpleGrid>
	</>
}

function SeasonComparisons({seasons, showTies}: {seasons: DivisionSeason[]; showTies: boolean}) {
	return <SimpleGrid columns={{base: 1, md: 2, xl: 3}} spacingX={4} spacingY={7} mt={6} alignItems='start'>
		{seasons.flatMap((season) => {
			const pairs = season.matchups
			if (!pairs.length) return [<Box key={season.leagueId} position='relative' bg='surface.2' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={4} pt={6}>
				<SeasonTab season={season.season} />
				<Text color='surface.8' fontSize='sm' fontWeight='normal'>No interdivision games are available for this comparison.</Text>
				<Coverage missing={season.missingDivisionRosters} excluded={season.excludedGames} />
			</Box>]
			return pairs.map(({first, second}, index) => <SeasonFaceoff key={`${season.leagueId}:${first.id}:${second.id}`}
				first={first} second={second} season={season.season} championDivisionId={season.championDivisionId} showTies={showTies}
				coverage={index === 0 ? {missing: season.missingDivisionRosters, excluded: season.excludedGames} : undefined} />)
		})}
	</SimpleGrid>
}

function SeasonFaceoff({first, second, season, championDivisionId, showTies, coverage}: {
	first: DivisionRecord; second: DivisionRecord; season: string; championDivisionId?: number | null
	showTies: boolean; coverage?: {missing: number; excluded: number}
}) {
	const rate = (division: DivisionRecord) => division.games ? (division.wins + division.ties / 2) / division.games * 100 : null
	const average = (division: DivisionRecord) => division.games ? division.pointsFor / division.games : null
	const firstRate = rate(first)
	const secondRate = rate(second)
	const firstAverage = average(first)
	const secondAverage = average(second)
	const name = (division: DivisionRecord) => division.name === `Division ${division.id}` ? division.name : `${division.name} · D${division.id}`
	const metric = (value: number | null, other: number | null, display: (value: number) => string) => {
		const result = value !== null && other !== null ? Math.sign(value - other) : 0
		return <Text mt={1} fontSize='lg' fontWeight='bold' lineHeight='shorter' sx={{fontVariantNumeric: 'tabular-nums'}}
			color={result > 0 ? 'secondary.200' : result < 0 ? 'primary.300' : 'surface.9'}>
			{value === null ? 'No games' : display(value)}{result !== 0 && <VisuallyHidden> {result > 0 ? 'higher' : 'lower'} than the other division</VisuallyHidden>}
		</Text>
	}
	return <Box position='relative' minW={0} bg='surface.2' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={3} pt={5}>
		<SeasonTab season={season} />
		<Flex gap={3}>
			{[first, second].map((division, index) => <Box key={division.id} flex='1' minW={0} textAlign={index ? 'right' : 'left'}>
				<Flex align='center' gap={1} justify={index ? 'flex-end' : 'flex-start'}>
					<Text fontSize='sm' fontWeight='bold' lineHeight='short' color='white' overflowWrap='anywhere'>{name(division)}</Text>
					{championDivisionId === division.id && <Box as='span' role='img' aria-label={`${name(division)}: league champion`} title='League champion' color='yellow.300' flexShrink={0}><FaTrophy aria-hidden='true' /></Box>}
				</Flex>
				<Text mt={3} fontSize='xs' fontWeight='medium' letterSpacing='wide' color='surface.8'>WIN RATE</Text>
				{metric(index ? secondRate : firstRate, index ? firstRate : secondRate, (value) => `${value.toFixed(1)}%`)}
				<Text mt={1} fontSize='xs' fontWeight='normal' color='surface.8'>
					Record: <Box as='span' color='surface.10' fontWeight='medium' sx={{fontVariantNumeric: 'tabular-nums'}}>{division.games ? formatHistoryRecord(division, showTies) : '—'}</Box>
				</Text>
				<Text mt={3} fontSize='xs' fontWeight='medium' letterSpacing='wide' color='surface.8'>AVG PF / GAME</Text>
				{metric(index ? secondAverage : firstAverage, index ? firstAverage : secondAverage, format)}
			</Box>)}
		</Flex>
		<Box as='details' mt={3} pt={2} borderTop='1px solid' borderColor='whiteAlpha.200'>
			<Box as='summary' color='secondary.200' fontSize='xs' fontWeight='medium' cursor='pointer'>View graphs</Box>
			<ComparisonBar label='WIN RATE' first={first} second={second} firstValue={firstRate} secondValue={secondRate} unit='win rate'
				display={(value) => `${value.toFixed(1)}%`} compareColors />
			<ComparisonBar label='POINTS SCORED / GAME' first={first} second={second} firstValue={firstAverage} secondValue={secondAverage}
				unit='points scored per team-game' display={format} compareColors />
		</Box>
		{coverage && <Coverage {...coverage} />}
	</Box>
}

function SeasonTab({season}: {season: string}) {
	return <Text position='absolute' top='-12px' left={4} px={3} py={1} bg='secondary.300' color='surface.0'
		borderRadius='md' fontSize='xs' fontWeight='bold' lineHeight='1'>{season}</Text>
}

function DivisionFaceoff({first, second, showTies, season, coverage}: {first: DivisionRecord; second: DivisionRecord; showTies: boolean; season?: string; coverage?: {missing: number; excluded: number}}) {
	const name = (division: DivisionRecord) => division.name === `Division ${division.id}` ? division.name : `${division.name} · D${division.id}`
	const rate = (division: DivisionRecord) => division.games ? (division.wins + division.ties / 2) / division.games * 100 : null
	const average = (division: DivisionRecord) => division.games ? division.pointsFor / division.games : null
	const firstRate = rate(first)
	const secondRate = rate(second)
	const firstAverage = average(first)
	const secondAverage = average(second)
	return <Box position='relative' minW={0} bgGradient='linear(to-br, surface.3, surface.1)' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={4} pt={season ? 6 : 4}>
		{season && <SeasonTab season={season} />}
		<Flex align='start' justify='space-between' gap={2} fontSize='sm' color='white'>
			<Text flex='1' minW={0} overflowWrap='anywhere'>{name(first)}</Text>
			<Text color='primary.300' fontStyle='italic' fontWeight='black'>VS</Text>
			<Text flex='1' minW={0} textAlign='right' overflowWrap='anywhere'>{name(second)}</Text>
		</Flex>
		<ComparisonBar label='WIN RATE' first={first} second={second} firstValue={firstRate} secondValue={secondRate} unit='win rate'
			display={(value) => `${value.toFixed(1)}%`} />
		<Flex justify='space-between' gap={3} mt={1} color='surface.8' fontSize='xs' fontWeight='normal'>
			<Text>{formatHistoryRecord(first, showTies, '-')} · {first.games} games</Text>
			<Text textAlign='right'>{formatHistoryRecord(second, showTies, '-')} · {second.games} games</Text>
		</Flex>
		<ComparisonBar label='POINTS SCORED / GAME' first={first} second={second} firstValue={firstAverage} secondValue={secondAverage} unit='points scored per team-game' display={format} />
		{coverage && <Coverage {...coverage} />}
	</Box>
}

function ComparisonBar({label, first, second, firstValue, secondValue, unit, display, compareColors = false}: {
	label: string; first: DivisionRecord; second: DivisionRecord; firstValue: number | null; secondValue: number | null; unit: string; display: (value: number) => string; compareColors?: boolean
}) {
	const canCompare = firstValue !== null && secondValue !== null && firstValue >= 0 && secondValue >= 0 && firstValue + secondValue > 0
	const firstDisplay = firstValue === null ? 'no games' : display(firstValue)
	const secondDisplay = secondValue === null ? 'no games' : display(secondValue)
	return <Box mt={4}>
		<Text fontSize='xs' color='surface.8' mb={1}>{label}</Text>
		<Flex h='9px' borderRadius='full' overflow='hidden' bg='whiteAlpha.100' role='img'
			aria-label={`${first.name} (Division ${first.id}): ${firstDisplay} ${unit}; ${second.name} (Division ${second.id}): ${secondDisplay} ${unit}`}>
			{canCompare && <>
				<Box w={`${firstValue / (firstValue + secondValue) * 100}%`} bg={compareColors ? firstValue === secondValue ? 'surface.7' : firstValue > secondValue ? 'secondary.300' : 'primary.400' : color(first.id)} />
				<Box w={`${secondValue / (firstValue + secondValue) * 100}%`} bg={compareColors ? firstValue === secondValue ? 'surface.7' : secondValue > firstValue ? 'secondary.300' : 'primary.400' : color(second.id)} />
			</>}
		</Flex>
		<Flex justify='space-between' gap={3} mt={1} fontSize='xs' color='surface.9'>
			<Text>{firstDisplay}</Text><Text textAlign='right'>{secondDisplay}</Text>
		</Flex>
		{!canCompare && <Text fontSize='xs' color='surface.8' fontWeight='normal' mt={2}>Relative shares unavailable for missing, negative, or all-zero values.</Text>}
	</Box>
}

function Coverage({missing, excluded, allTime}: {missing: number; excluded: number; allTime?: boolean}) {
	if (!missing && !excluded) return null
	return <Text color='orange.200' fontSize='xs' mt={4} fontWeight='normal'>
		{missing > 0 && `${missing} ${allTime ? 'season roster assignment(s)' : 'roster(s)'} missing a valid division; their results cannot be assigned. `}
		{excluded > 0 && `${excluded} incomplete or invalid matchup group(s) excluded.`}
	</Text>
}
