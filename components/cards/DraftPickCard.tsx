import React, {useContext} from 'react'
import {
	Avatar,
	Box,
	Center,
	Grid,
	GridItem,
	HStack,
	Image,
	Text,
} from '@chakra-ui/react'
import {DraftPick} from '../../classes/sleeper/DraftPick'
import {DraftPlayer} from '../../classes/custom/Draft'
import {project_colors} from '../../utility/project_colors'
import {POSITION} from '../../utility/rosterFunctions'
import {LeagueContext} from '../../contexts/LeagueContext'
import League from '../../classes/custom/League'

type MyProps = {
	pick: DraftPlayer | undefined
	focusedRosterId?: number
	numMembers?: number
	isSnakeDraft?: boolean
}

export default function DraftPickCard(props: MyProps) {
	const [context, setContext] = useContext(LeagueContext)
	const template = `"player_name player_name pick_no"
                    "drafted_by drafted_by thumbnail"`
	let opacity = 1
	if (props.focusedRosterId != -1 && props.focusedRosterId != props.pick?.roster_id) {
		opacity= .25
	} else {
		opacity = 1
	}

	let pickNumber = props.pick?.draft_slot ?? 1
	if (props.isSnakeDraft && (props.pick?.round ?? 2) % 2 == 0) {
		pickNumber = Math.abs(pickNumber - (props.numMembers ?? 0)) + 1
	}
	// pickNumber = (props.pick?.pick_no ?? 1) % (props.numMembers ?? 1)
	// if (pickNumber == 0) {
	// 	pickNumber = 10
	// }

	if (props.numMembers == undefined) {
		pickNumber = props.pick?.draft_slot ?? 1
	}
	return (
		<Grid
			width={'auto'}
			height={'50px'}
			minW={"120px"}
			opacity={opacity}
			filter={'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'}
			templateAreas={template}
			overflow={'hidden'}
			gridTemplateColumns={'1fr 1fr .75fr'}
			background={
				project_colors.position[props.pick?.metadata.position as POSITION]
			}
			borderRadius={'6px 6px 0px 6px'}
		>
			<GridItem area={'player_name'} pl={2} pt={1}>
				<Text
					fontSize={'.8em'}
					fontWeight={'semibold'}
					lineHeight={'12px'}
					noOfLines={2}
					whiteSpace={'nowrap'}
					textOverflow={'ellipsis'}
					display={'flex'}
					color={'#000000'}
				>
					{`${props.pick?.metadata.first_name.charAt(0)}. ${
						props.pick?.metadata.last_name
					}`}
				</Text>

				<Text
					fontSize={'.5em'}
					fontWeight={'normal'}
					color={'rgba(0, 0, 0, 0.6)'}
				>
					{props.pick?.metadata.position} - {props.pick?.metadata.team} (
					{props.pick?.metadata.number})
				</Text>
			</GridItem>
			<GridItem area={'pick_no'} textAlign={'end'} pt={1} pr={2}>
				<Text fontSize={'10px'} color={'rgba(0, 0, 0, 0.6)'}>
					{props.pick?.amount != null
						? `$${props.pick.amount}`
						: `${props.pick?.round}.${pickNumber}`}
				</Text>
			</GridItem>

			<GridItem area={'drafted_by'}>
				<Text
					fontSize={'.6em'}
					fontWeight={'light'}
					pl={2}
					pt={1}
					color={'rgba(0, 0, 0, 0.6)'}
					noOfLines={2}
					whiteSpace={'nowrap'}
					textOverflow={'ellipsis'}
				>
					@
					{(context as League)?.members?.get(props.pick?.roster_id ?? -1)
						?.name ?? ''}
				</Text>
			</GridItem>

			<GridItem area={'thumbnail'} mt={-2} mx={0}>
				<Image
					alt='Player Image'
					src={
						(props.pick?.metadata.position as POSITION) != POSITION.DEF
							? 'https://sleepercdn.com/content/nfl/players/' +
							  props.pick?.player_id +
							  '.jpg'
							: `https://sleepercdn.com/images/team_logos/nfl/${props.pick?.player_id.toLowerCase()}.png`
					}
					fallbackSrc={
						'https://sleepercdn.com/images/v2/icons/player_default.webp'
					}
				></Image>
			</GridItem>
		</Grid>
	)
}
