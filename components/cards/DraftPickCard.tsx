import React, {useContext} from 'react'
import {Avatar, Box, Center, Grid, GridItem, HStack, Image, Text} from '@chakra-ui/react'
import {DraftPick} from '../../classes/sleeper/DraftPick'
import {DraftPlayer} from '../../classes/custom/Draft'
import {project_colors} from '../../utility/project_colors'
import {POSITION} from '../../utility/rosterFunctions'
import {Context} from '../../contexts/Context'
import League from '../../classes/custom/League'

type MyProps = {pick: DraftPick | DraftPlayer | undefined}

export default function DraftPickCard(props: MyProps) {
	const [context, setContext] = useContext(Context)
	const template = `"player_name player_name pick_no"
                    "drafted_by drafted_by thumbnail"`
	return (
		<Grid
			width={'120px'}
			height={'50px'}
			filter={'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'}
			templateAreas={template}
      overflow={"hidden"}
			gridTemplateColumns={'1fr 1fr 1fr'}
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

				<Text fontSize={'.5em'} fontWeight={'normal'} color={'rgba(0, 0, 0, 0.6)'}>
					{props.pick?.metadata.position} - {props.pick?.metadata.team} (
					{props.pick?.metadata.number})
				</Text>
			</GridItem>
			<GridItem area={'pick_no'} textAlign={'end'} pt={1} pr={2}>
				<Text fontSize={'10px'} color={'rgba(0, 0, 0, 0.6)'}>
					{props.pick?.round}.{props.pick?.draft_slot}
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
					@{(context as League)?.members?.get(props.pick?.roster_id ?? -1)
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
