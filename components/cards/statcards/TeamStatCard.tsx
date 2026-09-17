'use client'
import {Box, SkeletonText} from '@chakra-ui/react'
import {getGoodBadBorderColor} from '../../../utility/statCardHelpers'

type MyProps = {
	statName?: String | null | undefined
	statValue?: String | null | undefined
	statOwner?: String | null | undefined
	isLoaded: boolean
	isGoodThing: boolean | null | undefined
}

const TeamStatCard = (props: MyProps) => {
	const borderColor = getGoodBadBorderColor(props.isGoodThing)
	return (
		<Box
			p={2}
			textAlign={'center'}
			bg={'surface.0'}
			border={'1px'}
			borderRadius={4}
			boxShadow={'2xl'}
			data-testid='team_stat_card_container'
			borderTop='2px'
			borderTopColor={borderColor}
		>
			<SkeletonText noOfLines={3} spacing={1} isLoaded={props.isLoaded}>
				<Box
					data-testid='team_stat_card_stat_name'
					fontWeight='bold'
					fontSize={'.8em'}
					color={'textTheme.highEmphasis'}
				>
					{props.statName}
				</Box>
				<Box
					data-testid='team_stat_card_owner'
					fontSize={'.9em'}
					fontWeight={'medium'}
					color={'textTheme.highEmphasis'}
				>
					{props.statOwner}
				</Box>
				<Box
					fontSize={'.8em'}
					fontWeight='light'
					color={'textTheme.mediumEmphasis'}
					data-testid='team_stat_card_stat_value'
				>
					{props.statValue}
				</Box>
			</SkeletonText>
		</Box>
	)
}

export default TeamStatCard
