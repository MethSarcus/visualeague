import React from 'react'
import {Box, Grid, Image, Text} from '@chakra-ui/react'
import {DraftPick} from '../../classes/sleeper/DraftPick'
import {DraftPlayer} from '../../classes/custom/Draft'
import {project_colors} from '../../utility/project_colors'
import {POSITION} from '../../utility/rosterFunctions'

type MyProps = {pick: DraftPick | DraftPlayer | undefined}

export default function DraftPickCard(props: MyProps) {
  

  const template = `"player_name player_name pick_no"
                    "drafted_by drafted_by thumbnail"`
  
  return (
			<Grid
				width={'120px'}
				height={'50px'}
				filter={'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'}
        gridTemplateColumns={'1fr 1fr 1fr'}
				gridTemplateRows={'1fr 1fr'}
				background={
					project_colors.position[
						props.pick?.metadata.position as POSITION
					]
				}
				borderRadius={'6px 6px 0px 6px'}
			>
				<Box
					maxW={'78%'}
					fontSize={'.8em'}
					fontWeight={'bold'}
					lineHeight={'12px'}
					noOfLines={2}
					whiteSpace={'nowrap'}
					textOverflow={'ellipsis'}
					mt={1.5}
					pl={1}
					display={'flex'}
					alignItems={'center'}
					color={'#000000'}
				>
					{props.pick?.metadata.first_name.charAt(0)}
					{'. '}
					{props.pick?.metadata.last_name}
				</Box>
				<Text
					fontSize={'.5em'}
					lineHeight={'12px'}
					fontWeight={'medium'}
					pl={1}
					display={'flex'}
					alignItems={'center'}
					color={'rgba(0, 0, 0, 0.6)'}
				>
					{props.pick?.metadata.position} -{' '}
					{props.pick?.metadata.team} ({props.pick?.metadata.number})
				</Text>

				<Text
					position={'absolute'}
					left={'78.5%'}
					right={'5%'}
					top={'16.28%'}
					bottom={'60.47%'}
					fontSize={'10px'}
					lineHeight={'12px'}
					display={'flex'}
					alignItems={'center'}
					color={'rgba(0, 0, 0, 0.6)'}
				>
					{props.pick?.round}.{props.pick?.draft_slot}
				</Text>
				<Box position={'absolute'} left={'65.67%'} right={'0%'} bottom={'0%'}>
					<Image
						className='DraftCardPlayerThumbnail'
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
				</Box>
			</Grid>)
}
