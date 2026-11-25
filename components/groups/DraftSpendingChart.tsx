'use client'

import {Alert, AlertIcon, Avatar, Box, Button, Flex, Heading, HStack, Select, Skeleton, Stack, Switch, Text, Tooltip} from '@chakra-ui/react'
import axios from 'axios'
import {useMemo, useState} from 'react'
import useSWR from 'swr'
import {averageDraftSpending, DraftSpendingResponse, spendingPositions, SpendingPosition} from '../../lib/draftSpending'
import SurfacePanel from '../SurfacePanel'

const colors: Record<SpendingPosition, string> = {
	QB: '#ed7d8c', RB: '#6ccda2', WR: '#65b6ed', TE: '#f6c64f', 'K/DEF': '#8290a9', Other: '#b5a2cf',
}
const money = (value: number) => value.toLocaleString(undefined, {maximumFractionDigits: 2})

const allTime = 'all-time'

export default function DraftSpendingChart({leagueId, currentMemberIds}: {leagueId: string; currentMemberIds: string[]}) {
	const [selectedDraftId, setSelectedDraftId] = useState('')
	const [includeFormer, setIncludeFormer] = useState(false)
	const {data, error, mutate} = useSWR<DraftSpendingResponse>(
		`/api/league/${leagueId}/draft-spending`,
		(url: string) => axios.get<DraftSpendingResponse>(url).then((response) => response.data),
		{revalidateOnFocus: false}
	)
	const drafts = data?.drafts
	const selected = drafts?.find((draft) => draft.draftId === selectedDraftId) || drafts?.[0]
	const isAllTime = selectedDraftId === allTime
	const averages = useMemo(() => averageDraftSpending(drafts || []), [drafts])
	const rows = isAllTime
		? averages.filter((member) => includeFormer || currentMemberIds.includes(member.ownerId)).map((member) => ({
			...member, key: member.ownerId,
		}))
		: selected?.members.map((member) => ({
			...member, key: String(member.rosterId), seasons: 0,
			percentages: spendingPositions.reduce<Record<SpendingPosition, number>>((percentages, position) => {
				percentages[position] = member.total ? member.amounts[position] / member.total * 100 : 0
				return percentages
			}, {QB: 0, RB: 0, WR: 0, TE: 0, 'K/DEF': 0, Other: 0}),
		})) || []
	if (data && !data.hasAuctionDrafts && !error) return null
	return <SurfacePanel p={[4, 6]} my={4}>
		<Flex justify='space-between' gap={4} direction={{base: 'column', md: 'row'}} align={{base: 'stretch', md: 'center'}}>
			<Box>
				<Heading size='md' color='white'>Auction expenditure by position</Heading>
				<Text mt={1} color='surface.8' fontSize='sm' fontWeight='normal'>Distribution of each team&apos;s recorded draft spending.</Text>
			</Box>
			{selected && <Select aria-label='Select auction season' value={isAllTime ? allTime : selected.draftId}
				onChange={(event) => setSelectedDraftId(event.target.value)} maxW={{md: '280px'}} color='white' bg='surface.2'>
				<option value={allTime}>All-time average</option>
				{drafts?.map((draft) => {
					const duplicate = drafts.filter((item) => item.season === draft.season).length > 1
					return <option key={draft.draftId} value={draft.draftId}>
						{draft.season}{duplicate ? ` · ${draft.name ? `${draft.name} · ` : ''}Draft ${draft.draftId}` : ''}{draft.status !== 'complete' ? ' · In progress' : ''}
					</option>
				})}
			</Select>}
		</Flex>
		{error ? <Box mt={4}><Alert status='error' borderRadius='md'><AlertIcon />Unable to load auction draft history.</Alert>
			<Button size='sm' mt={2} onClick={() => mutate()}>Try again</Button></Box> :
			!data ? <Stack mt={4} aria-label='Loading auction draft history'>{[0, 1, 2].map((item) => <Skeleton key={item} height='32px' />)}</Stack> :
			!selected ? <Text mt={4} color='surface.8' fontWeight='normal'>No auction spending is available for these seasons.</Text> :
			<>
				{isAllTime ? <HStack mt={4}>
					<Switch id='include-former-auction-members' colorScheme='secondary' isChecked={includeFormer}
						onChange={(event) => setIncludeFormer(event.target.checked)} />
					<Text as='label' htmlFor='include-former-auction-members' color='surface.9' fontSize='sm' fontWeight='normal'>
						Include former league members
					</Text>
				</HStack> : selected.status !== 'complete' && <Text mt={3} color='surface.8' fontSize='sm' fontWeight='normal'>Auction in progress; totals reflect recorded picks so far.</Text>}
				{isAllTime && rows.length === 0 && <Text mt={4} color='surface.8' fontWeight='normal'>
					{averages.length ? 'No current members have completed auction spending on record.' : 'No completed auction spending is available.'}
				</Text>}
				<Stack spacing={3} mt={5}>
					{rows.map((row) => {
						return <Flex key={row.key} align='center' gap={2}>
							<Avatar size='sm' name={row.name} src={row.avatar || undefined} aria-hidden='true' />
							<Box w={['80px', '150px']} minW={0} flexShrink={0}>
								<Text noOfLines={1} color='white' fontSize='sm' title={row.name}>{row.name}</Text>
								{row.manager !== row.name && <Text noOfLines={1} color='surface.8' fontSize='xs'
									fontWeight='normal' title={row.manager}>{row.manager}</Text>}
								{isAllTime && <Text color='surface.8' fontSize='xs' fontWeight='normal'>
									{row.seasons} {row.seasons === 1 ? 'season' : 'seasons'}
								</Text>}
							</Box>
							<Flex flex='1' minW={0} h='36px' borderRadius='md' overflow='hidden' bg='whiteAlpha.100'
								aria-label={`${row.name} auction spending by position`}>
								{spendingPositions.map((position) => {
									const amount = row.amounts[position]
									if (!amount) return null
									const percent = row.percentages[position]
									const detail = isAllTime
										? `${row.name}, ${position}: $${money(amount)} per season on average (${percent.toFixed(1)}% average share)`
										: `${row.name}, ${position}: $${money(amount)} (${percent.toFixed(1)}%)`
									return <Tooltip key={position} label={detail} hasArrow>
										<Flex tabIndex={0} role='img' aria-label={detail} bg={colors[position]} w={`${percent}%`}
											minW={0} align='center' justify='center' borderRight='1px solid' borderColor='surface.1'
											color='#171717' fontSize='sm' fontWeight='bold' _focusVisible={{outline: '2px solid white', outlineOffset: '-2px'}}>
											{percent >= 8 && <Text display={{base: 'none', md: 'block'}} overflow='hidden' whiteSpace='nowrap'>
												{Math.round(percent)}%
											</Text>}
										</Flex>
									</Tooltip>
								})}
							</Flex>
							<Text w={['60px', '85px']} textAlign='right' color='white' fontSize='sm' flexShrink={0}>
								${money(row.total)}{isAllTime && <Text as='span' fontSize='xs' fontWeight='normal'> avg</Text>}
							</Text>
						</Flex>
					})}
				</Stack>
				<HStack mt={4} spacing={4} flexWrap='wrap' rowGap={2}>
					{spendingPositions.filter((position) => rows.some((row) => row.amounts[position] > 0)).map((position) =>
						<HStack key={position} spacing={2}><Box boxSize='12px' bg={colors[position]} borderRadius='2px' />
							<Text color='surface.8' fontSize='sm' fontWeight='normal'>{position}</Text></HStack>)}
				</HStack>
				<Text mt={3} color='surface.8' fontSize='xs' fontWeight='normal'>
					{isAllTime
						? "Percentages are the average of each season's spending shares; dollars are average spending per recorded season. Completed auctions only; seasons without recorded spending are excluded. Multiple auctions in one season are combined. Totals include keeper picks."
						: "Percentages are each team's share of recorded spending. Totals include keeper picks."}
				</Text>
			</>}
	</SurfacePanel>
}
