'use client'
import {
	Box,
	Card,
	Center,
	Grid,
	GridItem,
	HStack,
	Image,
	Skeleton,
	SkeletonText,
	Tag,
	TagLabel,
	Text,
	Tooltip,
	VStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import TrendingLineChart from '../charts/team_charts/TrendingLineChart'

type MyProps = {
	league: League | undefined
	member: LeagueMember | undefined
	variant: string
	size: string
}

const TeamCardWithTrendingGraph = (props: MyProps) => {
	const {variant, size, ...rest} = props
  const [imageLoaded, setImageLoaded] = useState(false)
	const weekCount = props.league?.weeks?.size ?? 0
	const averagePf = props.member && weekCount > 0
		? (props.member.stats.pf / weekCount).toFixed(2)
		: '--'
	const averagePa = props.member && weekCount > 0
		? (props.member.stats.pa / weekCount).toFixed(2)
		: '--'
	return (
		<Card
			boxShadow='md'
			borderWidth='1px'
			borderColor='whiteAlpha.100'
			rounded='md'
			bg='surface.0'
			textColor='white'
			height='max-content'
			overflow='hidden'
		>
			<Grid
				templateAreas={`"member linechart"`}
				templateColumns={['minmax(0, 1fr) minmax(0, 1fr)', 'max-content minmax(0, 1fr)']}
				alignItems='stretch'
				width='100%'
			>
				<GridItem area={'member'} minW={0} borderRightWidth='1px' borderColor='whiteAlpha.100'>
					<Center h='full' justifyContent='flex-start' px={[2, 4]} py={3}>
						<Skeleton isLoaded={imageLoaded} fadeDuration={4} flexShrink={0}>
							<Image
								objectFit='cover'
								boxSize={['56px', '76px']}
								loading='eager'
								_placeholder={{color: 'gray.500'}}
								onLoad={() => setImageLoaded(true)}
								src={`https://sleepercdn.com/avatars/thumbs/${props.member?.avatar}`}
								alt='Team Image'
							/>
						</Skeleton>
						<VStack spacing={1} pl={2} alignItems='flex-start' flex={1} minW={0}>
							<SkeletonText noOfLines={2} isLoaded={props.league?.settings != undefined}>
								<Text fontSize={['sm', 'md']} maxW='full' noOfLines={1}>
									{props?.member?.name}
								</Text>
								<Tooltip
									label={`${props.member?.stats.divisionWins} - ${
										props.member?.stats.divisionLosses
									} ${
										(props.member?.stats?.divisionTies ?? 0) > 0
											? `-${props.member?.stats?.divisionTies}`
											: ''
									} Division Record`}
								>
									<Text p={0} fontSize={['md', 'lg']} fontWeight='bold'>
										{props.member?.stats.wins} - {props.member?.stats.losses}{' '}
										{(props.member?.stats?.ties ?? 0) > 0
											? `- ${props.member?.stats?.ties}`
											: ''}
									</Text>
								</Tooltip>
							</SkeletonText>
							<HStack spacing={1} flexWrap='wrap' rowGap={1}>
								<Tag
									size='sm'
									bg='whiteAlpha.100'
									borderWidth='1px'
									borderColor='whiteAlpha.200'
									color='secondary.100'
								>
									<TagLabel>PF/G {averagePf}</TagLabel>
								</Tag>
								<Tag
									size='sm'
									bg='whiteAlpha.100'
									borderWidth='1px'
									borderColor='whiteAlpha.200'
									color='red.200'
								>
									<TagLabel>PA/G {averagePa}</TagLabel>
								</Tag>
							</HStack>
						</VStack>
					</Center>
				</GridItem>
				<GridItem area={'linechart'} minWidth={0}>
					{props.league?.settings != undefined && props.member != undefined && (
						<TrendingLineChart
							league={props.league}
							memberId={props.member.roster.roster_id}
						/>
					)}
				</GridItem>
			</Grid>
		</Card>
	)
}

export default TeamCardWithTrendingGraph
