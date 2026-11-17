'use client'

import {Avatar, Box, Button, Flex, Grid, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Skeleton, Stack, Text, Tooltip} from '@chakra-ui/react'
import axios from 'axios'
import {useState} from 'react'
import useSWR from 'swr'
import League from '../../classes/custom/League'
import {FaabPurchaseDetails} from '../../lib/faabTransactions'

const currency = (amount: number) => `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString()}`

export default function FaabBalances({league}: {league: League}) {
	const [selectedRosterId, setSelectedRosterId] = useState<number | null>(null)
	const waiverType = league.settings?.settings?.waiver_type
	const isFaab = waiverType === 2 || waiverType === 3
	const {data: purchases, error, mutate} = useSWR<FaabPurchaseDetails[]>(
		isFaab && league.settings?.league_id ? `/api/league/${league.settings.league_id}/faab-purchases` : null,
		(url: string) => axios.get<FaabPurchaseDetails[]>(url).then((response) => response.data),
		{revalidateOnFocus: false}
	)
	if (!league.settings) return <Skeleton h='180px' borderRadius='xl' aria-label='Loading FAAB balances' />
	if (typeof waiverType === 'number' && Number.isFinite(waiverType) && !isFaab) return null

	const budget = league.settings.settings?.waiver_budget
	const validBudget = typeof budget === 'number' && Number.isFinite(budget) && budget >= 0
	const purchasesByRoster = new Map<number, FaabPurchaseDetails[]>()
	for (const purchase of purchases || []) {
		const entries = purchasesByRoster.get(purchase.rosterId) || []
		entries.push(purchase)
		purchasesByRoster.set(purchase.rosterId, entries)
	}
	const balances = Array.from(league.members.values(), (member) => {
		const used = member.roster.settings?.waiver_budget_used
		const remaining = validBudget && typeof used === 'number' && Number.isFinite(used) ? budget - used : null
		const name = member.roster.owner_id ? member.name : `Unowned roster ${member.roster.roster_id}`
		const entries = purchasesByRoster.get(member.roster.roster_id) || []
		const spent = entries.reduce((sum, purchase) => sum + purchase.amount, 0)
		return {member, name, remaining, entries, spent}
	}).sort((a, b) => {
		if (a.remaining === null) return b.remaining === null ? a.name.localeCompare(b.name) : 1
		if (b.remaining === null) return -1
		return b.remaining - a.remaining || a.name.localeCompare(b.name)
	})
	const scale = balances.reduce((max, {remaining, spent}) => Math.max(max, Math.max(remaining ?? 0, 0) + spent), validBudget ? budget : 0)
	const selected = balances.find(({member}) => member.roster.roster_id === selectedRosterId)

	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={[4, 6]}>
		<Heading size='md' color='white'>FAAB remaining</Heading>
		{typeof waiverType !== 'number' || !Number.isFinite(waiverType) ? <Text mt={3} color='surface.8' fontWeight='normal'>The league waiver settings are unavailable.</Text> :
			!validBudget ? <Text mt={3} color='surface.8' fontWeight='normal'>The league FAAB budget is unavailable.</Text> :
			!balances.length ? <Text mt={3} color='surface.8' fontWeight='normal'>No roster balances are available.</Text> : <>
				<Text mt={1} color='surface.8' fontSize='sm' fontWeight='normal'>
					Remaining balance and recorded waiver purchases. Starting budget: {currency(budget)}.
				</Text>
				{error ? <Flex mt={2} gap={2} align='center'><Text color='orange.200' fontSize='sm'>Unable to load waiver purchases.</Text>
					<Button size='xs' onClick={() => mutate()}>Try again</Button></Flex> :
					!purchases && <Text mt={2} color='surface.8' fontSize='sm'>Loading waiver purchases…</Text>}
				<Stack spacing={3} mt={5}>
					{balances.map(({member, name, remaining, entries}) => <Grid key={member.roster.roster_id}
						templateColumns={{base: '32px minmax(0, 1fr) auto auto', md: '32px 150px minmax(0, 1fr) 72px'}}
						columnGap={3} rowGap={2} alignItems='center'>
						<Avatar size='sm' name={name} src={member.roster.owner_id && member.avatar ? member.getAvatar() : undefined} aria-hidden='true' />
						<Text minW={0} color='white' fontSize='sm' noOfLines={1} title={name}>{name}</Text>
						<Flex gridColumn={{base: '1 / -1', md: 'auto'}} gridRow={{base: 2, md: 'auto'}} minW={0} h='16px' borderRadius='full' bg='whiteAlpha.100'
							role='group' aria-label={`${name}: ${remaining === null ? 'FAAB balance unavailable' : `${currency(remaining)} FAAB remaining`}`}>
							{remaining !== null && <Box h='full' w={`${scale > 0 ? Math.max(0, remaining) / scale * 100 : 0}%`}
								bg='secondary.300' borderRadius='full' flexShrink={0} />}
							{entries.map((purchase, index) => {
								const label = `${purchase.playerNames.join(', ')} · ${currency(purchase.amount)} · Week ${purchase.week}`
								return <Tooltip key={purchase.id} label={label} hasArrow maxW='260px' whiteSpace='normal'>
									<Box as='button' type='button' h='full' w={`${scale > 0 ? purchase.amount / scale * 100 : 0}%`}
										flexShrink={0} bgGradient='linear(to-b, #a4b2b3, #728587)' aria-label={`${name}: ${label}`}
										sx={(index > 0 || (remaining !== null && remaining > 0)) ? {
											'&::before': {content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', maxWidth: '100%', background: 'var(--chakra-colors-surface-1)'},
										} : undefined}
										position='relative'
										borderLeftRadius={index === 0 ? 'full' : 0}
										borderRightRadius={index === entries.length - 1 ? 'full' : 0}
										boxShadow='inset 0 1px 0 rgba(255,255,255,0.2)'
										_hover={{bgGradient: 'linear(to-b, #c0d0d0, #8ca3a3)'}}
										_focusVisible={{outline: '2px solid white', outlineOffset: '-2px', zIndex: 1}} />
								</Tooltip>
							})}
						</Flex>
						{entries.length > 0 && <Button display={{base: 'inline-flex', md: 'none'}} size='xs' variant='ghost'
							color='secondary.200' onClick={() => setSelectedRosterId(member.roster.roster_id)}
							aria-label={`View ${name} waiver purchases`}>Details</Button>}
						<Text gridColumn={{base: 4, md: 'auto'}} gridRow={{base: 1, md: 'auto'}} textAlign='right' color='white' fontSize='sm'>
							{remaining === null ? 'N/A' : currency(remaining)}
						</Text>
					</Grid>)}
				</Stack>
				{purchases && <Text mt={3} color='surface.8' fontSize='xs' fontWeight='normal'>
					Grey segments are successful bids. Hover, focus or select Details to see players. Trades affect balances but are not purchases.
				</Text>}
				<Modal isOpen={selected !== undefined} onClose={() => setSelectedRosterId(null)} isCentered scrollBehavior='inside'>
					<ModalOverlay />
					<ModalContent bg='surface.1' color='white' mx={4}>
						<ModalHeader pr={12}>{selected?.name} waiver purchases</ModalHeader>
						<ModalCloseButton />
						<ModalBody pb={6}>
							<Stack spacing={0}>
								{selected?.entries.map((purchase) => <Flex key={purchase.id} justify='space-between' gap={4} py={3} borderBottom='1px solid' borderColor='whiteAlpha.200'>
									<Box minW={0}><Text>{purchase.playerNames.join(', ')}</Text>
										<Text fontSize='sm' color='surface.8' fontWeight='normal'>Week {purchase.week}</Text></Box>
									<Text flexShrink={0}>{currency(purchase.amount)}</Text>
								</Flex>)}
							</Stack>
						</ModalBody>
					</ModalContent>
				</Modal>
			</>}
	</Box>
}
