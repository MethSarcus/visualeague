'use client'

import {ChevronRightIcon} from '@chakra-ui/icons'
import {Box, Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Tooltip, useDisclosure, VisuallyHidden} from '@chakra-ui/react'
import {ReactNode, useEffect, useId, useRef} from 'react'
import {HistoryRival, HistoryTeam} from '../../lib/leagueHistory'
import HeadToHeadDetails from '../groups/HeadToHeadDetails'

export default function NemesisCard({team, rival, mode, tied, mutual, opponentTied, showTies = team.ties > 0, preview = false}: {team: HistoryTeam; rival: HistoryRival | null; mode: 'losses' | 'points'; tied?: boolean; mutual?: boolean; opponentTied?: boolean; showTies?: boolean; preview?: boolean}) {
	const {isOpen, onToggle} = useDisclosure()
	const historyId = useId()
	const games = rival ? rival.wins + rival.losses + rival.ties : 0
	return (
		<Box bg='surface.2' borderRadius='xl' border='1px solid' borderColor={mutual ? 'yellow.400' : 'whiteAlpha.200'} boxShadow={mutual ? '0 6px 18px rgba(236, 201, 75, 0.18)' : '0 6px 18px rgba(0, 0, 0, 0.28)'} overflow='hidden'>
			<Flex h='184px' direction='column' position='relative' bg='surface.1' overflow='hidden'>
				{mutual && <VisuallyHidden>Mutual nemeses</VisuallyHidden>}
				<Flex position='relative' zIndex={1} align='stretch' minH='48px' flexShrink={0} gap='min(48px, 20%)'
					bgGradient='linear(to-b, rgba(15, 20, 21, 0.96), rgba(15, 20, 21, 0.75))'>
					<TeamLabel name={team.name} nemesis={!!rival && mutual} tied={opponentTied} preview={preview}
						scoring={rival ? {opponent: rival.name, points: rival.pointsFor, games} : undefined} />
					{rival ? <TeamLabel name={rival.name} nemesis tied={tied} preview={preview}
						scoring={{opponent: team.name, points: rival.pointsAgainst, games}} /> :
						<Flex flex='1' minW={0} align='center' justify='center' px={2} py={2} textAlign='center'>
							<Text color='surface.9' fontSize='xs' fontWeight='normal'>{mode === 'losses' ? 'No head-to-head losses yet' : 'No opponent has outscored this team overall'}</Text>
						</Flex>}
					<Box position='absolute' zIndex={2} top='50%' left='50%'
						transform='translate(-50%, -50%)' pointerEvents='none'>
						<Text color='yellow.300' fontSize='3xl' lineHeight='1' fontStyle='italic' fontWeight='black'
							letterSpacing='tight' transform='skew(-10deg)' sx={{WebkitTextStroke: '0.5px #7f1d1d',
								textShadow: '1px 2px 0 #c53030, 2px 3px 0 #421818, 0 3px 8px rgba(0, 0, 0, 0.9)'}}>VS</Text>
					</Box>
				</Flex>
				<Box position='relative' flex='1' minH={0}>
					<Flex position='absolute' top={0} bottom={0} left={0} right={0} aria-hidden='true'>
						<TeamBackground avatar={team.avatar} />
						<TeamBackground avatar={rival?.avatar ?? null} />
					</Flex>
					{rival && <>
						<WinLabel name={team.name} opponent={rival.name} wins={rival.wins} otherWins={rival.losses} side='left' />
						<WinLabel name={rival.name} opponent={team.name} wins={rival.losses} otherWins={rival.wins} side='right' />
					</>}
				</Box>
			</Flex>
			{rival ? <>
				<Button w='full' borderRadius={0} variant='ghost' color='secondary.200' fontSize='sm' fontWeight='medium' h='40px'
					bg='rgba(15, 20, 21, 0.25)' _hover={{bg: 'whiteAlpha.100', color: 'secondary.100'}}
					_focusVisible={{outline: '2px solid white', outlineOffset: '-3px'}}
					onClick={onToggle} aria-expanded={isOpen} aria-controls={historyId}
					aria-haspopup='dialog' tabIndex={preview ? -1 : undefined} pointerEvents={preview ? 'none' : undefined} rightIcon={<ChevronRightIcon />}>
					View rivalry details <VisuallyHidden> between {team.name} and {rival.name}</VisuallyHidden>
				</Button>
				<Modal isOpen={isOpen} onClose={onToggle} size='lg' scrollBehavior='inside' isCentered>
					<ModalOverlay />
					<ModalContent id={historyId} bg='surface.1' color='white' mx={4}>
						<ModalHeader pr={12}>{team.name} vs {rival.name}</ModalHeader>
						<ModalCloseButton />
						<ModalBody pb={6}>
							<HeadToHeadDetails team={team} rival={rival} showTies={showTies} />
						</ModalBody>
					</ModalContent>
				</Modal>
			</> : <Flex h='40px' />}
		</Box>
	)
}

function TeamBackground({avatar}: {avatar: string | null}) {
	return <Box flex='1' minW={0} h='full' position='relative' bg='surface.2'>
		{avatar && <Box as='img' src={avatar} alt='' w='full' style={{height: '100%'}} objectFit='cover' objectPosition='center' />}
	</Box>
}

function WinLabel({name, opponent, wins, otherWins, side}: {name: string; opponent: string; wins: number; otherWins: number; side: 'left' | 'right'}) {
	return <StatChip corner={side === 'left' ? 'bottomLeft' : 'bottomRight'} tone={wins === otherWins ? 'neutral' : wins > otherWins ? 'good' : 'bad'}
		label={`${name}: ${wins} ${wins === 1 ? 'win' : 'wins'} against ${opponent}`}>
		{wins} {wins === 1 ? 'WIN' : 'WINS'}
	</StatChip>
}

function StatChip({corner, tone, label, children}: {corner: 'bottomLeft' | 'bottomRight'; tone: 'good' | 'bad' | 'neutral'; label: string; children: ReactNode}) {
	const textColor = tone === 'good' ? '#9ae6b4' : tone === 'bad' ? '#feb2b2' : '#f7fafc'
	return <Text position='absolute' bottom={2}
		left={corner.endsWith('Left') ? 2 : undefined} right={corner.endsWith('Right') ? 2 : undefined}
		data-comparison={tone} color={textColor} bg='rgba(15, 20, 21, 0.92)' boxShadow='0 0 10px 3px rgba(15, 20, 21, 0.3)'
		borderRadius='full' px={1.5} py={0.5}
		fontSize='10px' fontWeight='medium' lineHeight='1' whiteSpace='nowrap'
		aria-label={label}>
		{children}
	</Text>
}

function TeamLabel({name, nemesis, tied, preview, scoring}: {name: string; nemesis?: boolean; tied?: boolean; preview?: boolean; scoring?: {opponent: string; points: number; games: number}}) {
	const nameRef = useRef<HTMLParagraphElement>(null)
	const tooltip = useDisclosure()

	useEffect(() => {
		const element = nameRef.current
		if (!element) return

		let active = true
		let width = -1
		const fitName = () => {
			if (!active || element.clientWidth === 0) return
			element.style.webkitLineClamp = 'unset'
			let size = 12
			do {
				element.style.fontSize = `${size}px`
				if (element.scrollHeight <= Math.ceil(size * 1.2 * 2)) break
				size -= 0.5
			} while (size >= 8)
			element.style.webkitLineClamp = ''
		}
		const update = () => {
			if (element.clientWidth === width) return
			width = element.clientWidth
			fitName()
		}
		update()
		const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
		observer?.observe(element)
		if (document.fonts) void document.fonts.ready.then(fitName)
		return () => {
			active = false
			observer?.disconnect()
		}
	}, [name])

	const label = scoring ? scoring.games > 0
		? `${name}: ${(scoring.points / scoring.games).toFixed(2)} PPG against ${scoring.opponent}`
		: `${name}: PPG unavailable against ${scoring.opponent} (no games)` : ''
	return <Flex flex='1' minW={0} align='center' textAlign='center' px={2} py={2} gap={1}>
		<Tooltip label={label} hasArrow bg='surface.3' color='white' isDisabled={!scoring || preview}
			isOpen={tooltip.isOpen && !preview} onOpen={tooltip.onOpen} onClose={tooltip.onClose} closeOnClick={false}>
			<Text ref={nameRef} flex='1' minW={0} color='white' fontSize='xs' fontWeight='semibold' lineHeight='1.2'
				overflowWrap='anywhere' noOfLines={2} title={scoring ? undefined : name}
				role={scoring ? 'button' : undefined} tabIndex={scoring && !preview ? 0 : undefined}
				_focusVisible={{outline: '2px solid', outlineColor: 'secondary.300', outlineOffset: '2px', borderRadius: 'sm'}}
				onClick={scoring && !preview ? tooltip.onOpen : undefined}
				onKeyDown={scoring && !preview ? (event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault()
						tooltip.onOpen()
					}
				} : undefined}>{name}</Text>
		</Tooltip>
		{nemesis && <VisuallyHidden>{tied ? 'Tied nemesis' : 'Nemesis'}</VisuallyHidden>}
	</Flex>
}
