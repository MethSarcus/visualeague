'use client'
import {
	Flex,
	Avatar,
	Spacer,
	Box,
	Text,
	useMultiStyleConfig,
	defineStyleConfig,
	ResponsiveValue,
} from '@chakra-ui/react'
import LeagueMember from '../../classes/custom/LeagueMember'
import {MatchupSide} from '../../classes/custom/MatchupSide'
import {project_colors} from '../../utility/project_colors'

interface MyProps {
	matchupSide: MatchupSide | undefined
	member: LeagueMember | undefined
	isWinner: boolean
	size: string
	variant: string
	isTie: boolean
	isByeWeek: boolean
	alteredScore?: number
	alteredProjectedScore?: number
	isHomeTeam: boolean
}

export default function MatchupHeaderTeam(props: MyProps) {
	const {variant, size, ...rest} = props

	let ringColor = project_colors.outcomeColor.tie_color
	if (props.isWinner && props.isTie != true && !props.isByeWeek) {
		ringColor = project_colors.statColor.good
	} else if (
		props.isWinner == false &&
		props.isTie != true &&
		!props.isByeWeek
	) {
		ringColor = project_colors.statColor.bad
	}

	let lineupDiffTextColor = project_colors.outcomeColor.win

	if (
		props.alteredScore &&
		props.matchupSide?.pf &&
		props.alteredScore < props.matchupSide?.pf
	) {
		lineupDiffTextColor = project_colors.outcomeColor.loss
	}

	let scoreDiffText = ((props.alteredScore ?? 0) - (props.matchupSide?.pf ?? 0)).toFixed(2)
	
	if ((props.alteredScore ?? 0) - (props.matchupSide?.pf ?? 0) > 0) {
		scoreDiffText = '+' + ((props.alteredScore ?? 0) - (props.matchupSide?.pf ?? 0)).toFixed(2)
	}

	return (
		<Flex
			bg='#43495A'
			p={2}
			borderRadius={'15px'}
			border={'solid'}
			borderWidth={'thin'}
			borderColor={
				props.isWinner
					? project_colors.statColor.good
					: project_colors.statColor.neutral
			}
			fontSize={'.7em'}
			minW={'180px'}
			position={'relative'}
			flexDirection={props.isHomeTeam ? 'row' : 'row-reverse'}
		>
			<Avatar
				position={'absolute'}
				ml={props.isHomeTeam ? -2 : 'auto'}
				mr={props.isHomeTeam ? 'auto' : -2}
				mt={-7}
				size={'md'}
				borderColor={ringColor}
				borderWidth={2}
				src={props.member?.getTeamAvatar()}
			/>
			<Box
				mt={'auto'}
				mb={'auto'}
				fontWeight={'semibold'}
				color={'#A7BAD0'}
				mr={props.isHomeTeam ? 2 : 0}
				ml={props.isHomeTeam ? 0 : 2}
			>
				<Text
					ml={props.isHomeTeam ? '4em' : 0}
					mr={props.isHomeTeam ? 0 : '4em'}
					textAlign={props.isHomeTeam ? 'start' : 'end'}
					mt={-1.5}
					fontSize={'1em'}
					fontWeight={'semibold'}
					letterSpacing={'tighter'}
				>
					{props.member?.stats.wins}-{props.member?.stats.losses}{' '}
					{`[#${props.member?.stats.overall_rank}]`}
				</Text>
				<Text
					fontWeight={'semibold'}
					mt={4}
					fontSize={'.8em'}
					color={'#A7BAD0'}
					lineHeight='10px'
					textAlign={props.isHomeTeam ? 'start' : 'end'}
				>
					@{props.member?.userDetails.display_name}
				</Text>
				<Text
					fontWeight={'semibold'}
					color={'white'}
					textAlign={props.isHomeTeam ? 'start' : 'end'}
				>
					{props.member?.teamName}
				</Text>
			</Box>
			<Spacer />
			<Text
				position={'absolute'}
				mt={-1.5}
				right={props.isHomeTeam ? 2.5 : '-moz-initial'}
				left={!props.isHomeTeam ? 3.5 : '-moz-initial'}
				mr={1}
				textAlign={props.isHomeTeam ? 'start' : 'end'}
				fontSize={'1em'}
				fontWeight={'regular'}
				display={
					props.alteredScore == props.matchupSide?.pf ? 'none' : 'initial'
				}
				textColor={lineupDiffTextColor}
			>
				{scoreDiffText}
			</Text>
			<Flex
				fontSize={'1em'}
				fontWeight={'bold'}
				position={'absolute'}
				noOfLines={2}
				textOverflow={'ellipsis'}
				mr={props.isHomeTeam ? 3.5 : '-moz-initial'}
				ml={props.isHomeTeam ? '-moz-initial' : 3.5}
				my={'auto'}
				right={props.isHomeTeam ? 0 : '-moz-initial'}
				left={props.isHomeTeam ? '-moz-initial' : 0}
				p={0}
				textAlign={props.isHomeTeam ? 'end' : 'start'}
			>
				<Text fontSize={'1.2em'} color={'#FBFBFB'} mt={1}>
					{props.alteredScore?.toFixed(2) ??
						props.matchupSide?.pf.toFixed(2) ??
						'0.00'}
				</Text>
				<Text
					mt={-1}
					color={'#A7BAD0'}
					fontWeight={'semibold'}
					fontSize={'.9em'}
				>
					{props.alteredProjectedScore?.toFixed(2) ??
						props.matchupSide?.projectedScore.toFixed(2) ??
						'0.00'}
				</Text>
			</Flex>
		</Flex>
	)
}
