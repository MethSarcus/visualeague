'use client'

import {ChevronLeftIcon, ChevronRightIcon} from '@chakra-ui/icons'
import {Avatar, Box, Button, Flex, Heading, HStack, IconButton, Radio, RadioGroup, Stack, Text} from '@chakra-ui/react'
import {useReducedMotion} from 'framer-motion'
import {useEffect, useId, useRef, useState} from 'react'
import {HistoryRival, HistoryTeam} from '../../lib/leagueHistory'
import NemesisCard from '../cards/NemesisCard'
import SurfacePanel from '../SurfacePanel'

type NemesisMode = 'losses' | 'points'
type NemesisCarouselCard = {team: HistoryTeam; rival: HistoryRival | null; mutual: boolean; tied: boolean; opponentTied: boolean}

function representsTeam(card: NemesisCarouselCard, teamId: string) {
	return card.team.id === teamId
}

export default function NemesisSection({teams, showTies = teams.some((team) => team.ties > 0)}: {teams: HistoryTeam[]; showTies?: boolean}) {
	const [mode, setMode] = useState<NemesisMode>('losses')
	const [rotation, setRotation] = useState(0)
	const [stageWidth, setStageWidth] = useState(360)
	const [activeHeight, setActiveHeight] = useState(226)
	const stageRef = useRef<HTMLDivElement>(null)
	const activeRef = useRef<HTMLDivElement>(null)
	const touchStart = useRef<{x: number; y: number} | null>(null)
	const reducedMotion = useReducedMotion()
	const carouselId = useId()
	const teamsById = new Map(teams.map((team) => [team.id, team]))
	const cards: NemesisCarouselCard[] = []
	for (const team of teams) {
		const rivals = team.nemeses[mode]
		if (!rivals.length) {
			cards.push({team, rival: null, mutual: false, tied: false, opponentTied: false})
			continue
		}
		for (const rival of rivals) {
			const opponent = teamsById.get(rival.id)
			const opponentRivals = opponent?.nemeses[mode] || []
			const mutual = opponentRivals.some((item) => item.id === team.id)
			cards.push({team, rival, mutual, tied: rivals.length > 1, opponentTied: opponentRivals.length > 1})
		}
	}
	const activeIndex = cards.length ? ((rotation % cards.length) + cards.length) % cards.length : 0
	const active = cards[activeIndex]
	useEffect(() => {
		const element = stageRef.current
		if (!element) return
		const update = () => { if (element.clientWidth) setStageWidth(element.clientWidth) }
		update()
		if (typeof ResizeObserver === 'undefined') return
		const observer = new ResizeObserver(update)
		observer.observe(element)
		return () => observer.disconnect()
	}, [Boolean(active)])
	useEffect(() => {
		const element = activeRef.current
		if (!element) return
		const update = () => { if (element.offsetHeight) setActiveHeight(element.offsetHeight) }
		update()
		if (typeof ResizeObserver === 'undefined') return
		const observer = new ResizeObserver(update)
		observer.observe(element)
		return () => observer.disconnect()
	}, [activeIndex, mode, cards.length])
	const cardWidth = Math.min(270, stageWidth * (cards.length > 1 ? 0.85 : 1))
	const angle = cards.length > 1 ? 360 / cards.length : 0
	const radius = cards.length > 2 ? (cardWidth + 24) / (2 * Math.tan(Math.PI / cards.length)) : cards.length === 2 ? (cardWidth + 24) / 2 : 0
	const navigate = (direction: number) => {
		if (cards.length > 1) setRotation((current) => current + direction)
	}
	const distanceTo = (index: number) => {
		let distance = (index - activeIndex + cards.length) % cards.length
		if (distance > cards.length / 2) distance -= cards.length
		return distance
	}
	const selectTeam = (teamId: string) => {
		let nearestDistance: number | undefined
		cards.forEach((card, index) => {
			if (!representsTeam(card, teamId)) return
			const distance = distanceTo(index)
			if (nearestDistance === undefined || Math.abs(distance) < Math.abs(nearestDistance)) nearestDistance = distance
		})
		if (nearestDistance !== undefined) navigate(nearestDistance)
	}
	return <SurfacePanel mt={6} p={[4, 6]}>
		<Flex justify='space-between' direction={{base: 'column', lg: 'row'}} gap={4}>
			<Box>
				<Heading size='md' color='white'>Every team has a nemesis</Heading>
				<Text mt={1} fontSize='sm' color='surface.8' fontWeight='normal'>
					{mode === 'losses'
						? 'Most head-to-head losses; ties are broken by total opponent points. Exact ties share the title.'
						: 'The opponent with the largest total scoring advantage over the team. Exact ties share the title.'}
				</Text>
			</Box>
			<RadioGroup value={mode} onChange={(value) => {
				if (value === 'losses' || value === 'points') {
					setMode(value)
					setRotation(0)
				}
			}} aria-label='Choose nemesis metric'>
				<Stack direction={{base: 'column', sm: 'row'}} spacing={4}>
					<Radio value='losses' colorScheme='teal'>Most losses</Radio>
					<Radio value='points' colorScheme='teal'>Points differential</Radio>
				</Stack>
			</RadioGroup>
		</Flex>
		{active ? <>
			<Flex role='group' aria-label='Choose a team nemesis' wrap='wrap' gap={2} mt={4}>
				{teams.map((team) => {
					const selected = representsTeam(active, team.id)
					return <Button key={team.id} size='sm' height='auto' minH='36px' maxW='100%' px={2} py={1}
						borderRadius='full' border='1px solid' borderColor={selected ? 'secondary.300' : 'whiteAlpha.300'}
						bg={selected ? 'secondary.300' : 'surface.3'} color={selected ? 'surface.0' : 'white'}
						_hover={{bg: selected ? 'secondary.200' : 'surface.4'}}
						_focusVisible={{outline: '2px solid', outlineColor: 'white', outlineOffset: '2px'}}
						aria-pressed={selected} aria-controls={carouselId} onClick={() => selectTeam(team.id)}>
						<Avatar name={team.name} src={team.avatar || undefined} size='xs' mr={2} aria-hidden='true' />
						<Text isTruncated>{team.name}</Text>
					</Button>
				})}
			</Flex>
			<Box ref={stageRef} id={carouselId} role='region' aria-label='Nemesis cards' aria-roledescription='carousel' tabIndex={0}
				mt={4} position='relative' overflow='hidden' h={`${activeHeight + 32}px`} sx={{perspective: '1200px'}}
				onKeyDown={(event) => {
					if (event.target !== event.currentTarget) return
					if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
						event.preventDefault()
						navigate(event.key === 'ArrowLeft' ? -1 : 1)
					}
				}}
				onTouchStart={(event) => {
					const touch = event.touches[0]
					touchStart.current = {x: touch.clientX, y: touch.clientY}
				}}
				onTouchEnd={(event) => {
					const touch = event.changedTouches[0]
					const start = touchStart.current
					touchStart.current = null
					if (!start || !touch) return
					const dx = touch.clientX - start.x
					if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) navigate(dx < 0 ? 1 : -1)
				}}>
				<Box position='absolute' top={4} left='50%' w={`${cardWidth}px`}
					sx={{transformStyle: 'preserve-3d', transform: `translateX(-50%) translateZ(${-radius}px) rotateY(${-rotation * angle}deg)`,
						transition: reducedMotion ? 'none' : 'transform 0.5s ease'}}>
					{cards.map((card, cardIndex) => {
						const isActive = cardIndex === activeIndex
						const distance = distanceTo(cardIndex)
						const selectable = !isActive && Math.abs(distance * angle) < 90
						return <Box key={JSON.stringify([card.team.id, card.rival?.id])} data-carousel-card='' position='absolute' w='full' top={0}
							sx={{transform: `rotateY(${cardIndex * angle}deg) translateZ(${radius}px)`, backfaceVisibility: 'hidden'}}>
							<Box ref={isActive ? activeRef : undefined} aria-hidden={!isActive || undefined}>
								<NemesisCard {...card} mode={mode} showTies={showTies} preview={!isActive} />
							</Box>
							{selectable && <Box as='button' type='button' position='absolute' inset={0} w='full' h='full' borderRadius='xl'
								aria-label={`Show ${card.team.name}${card.rival ? ` vs ${card.rival.name}` : ''}`}
								_focusVisible={{outline: '2px solid', outlineColor: 'secondary.300'}}
								onClick={() => navigate(distance)} />}
						</Box>
					})}
				</Box>
			</Box>
			{cards.length > 1 && <HStack justify='center' mt={2} spacing={3}>
				<IconButton aria-label='Previous nemesis card' aria-controls={carouselId} icon={<ChevronLeftIcon boxSize={6} />}
					isRound size='md' bg='secondary.300' color='surface.0' boxShadow='0 4px 14px rgba(0, 199, 171, 0.3)'
					_hover={{bg: 'secondary.200'}} _active={{bg: 'secondary.400'}} _focusVisible={{outline: '2px solid', outlineColor: 'white', outlineOffset: '2px'}}
					onClick={() => navigate(-1)} />
				<Text aria-live='polite' fontSize='sm' color='white' fontWeight='bold' px={4} py={2} borderRadius='full' bg='surface.3'
					border='1px solid' borderColor='whiteAlpha.300'>{activeIndex + 1} / {cards.length}</Text>
				<IconButton aria-label='Next nemesis card' aria-controls={carouselId} icon={<ChevronRightIcon boxSize={6} />}
					isRound size='md' bg='secondary.300' color='surface.0' boxShadow='0 4px 14px rgba(0, 199, 171, 0.3)'
					_hover={{bg: 'secondary.200'}} _active={{bg: 'secondary.400'}} _focusVisible={{outline: '2px solid', outlineColor: 'white', outlineOffset: '2px'}}
					onClick={() => navigate(1)} />
			</HStack>}
		</> : <Text mt={4} color='surface.8'>No teams available.</Text>}
	</SurfacePanel>
}
