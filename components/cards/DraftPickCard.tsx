import React from 'react'
import {Box, Image, Text} from '@chakra-ui/react'
import {DraftPick} from '../../classes/sleeper/DraftPick'
import {DraftPlayer} from '../../classes/custom/Draft'
import {project_colors} from '../../utility/project_colors'
import {POSITION} from '../../utility/rosterFunctions'

type MyProps = {pick: DraftPick | DraftPlayer | undefined}

export default class DraftPickCard extends React.Component<MyProps> {
	constructor(props: MyProps) {
		super(props)
	}

	render() {
		return (
			<Box
				width={'120px'}
				height={'50px'}
				filter={'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'}
				background={
					project_colors.position[
						this.props.pick?.metadata.position as POSITION
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
					{this.props.pick?.metadata.first_name.charAt(0)}
					{'. '}
					{this.props.pick?.metadata.last_name}
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
					{this.props.pick?.metadata.position} -{' '}
					{this.props.pick?.metadata.team} ({this.props.pick?.metadata.number})
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
					{this.props.pick?.round}.{this.props.pick?.draft_slot}
				</Text>
				<Box position={'absolute'} left={'65.67%'} right={'0%'} bottom={'0%'}>
					<Image
						className='DraftCardPlayerThumbnail'
						alt='Player Image'
						src={
							(this.props.pick?.metadata.position as POSITION) != POSITION.DEF
								? 'https://sleepercdn.com/content/nfl/players/' +
								  this.props.pick?.player_id +
								  '.jpg'
								: `https://sleepercdn.com/images/team_logos/nfl/${this.props.pick?.player_id.toLowerCase()}.png`
						}
						fallbackSrc={
							'https://sleepercdn.com/images/v2/icons/player_default.webp'
						}
					></Image>
				</Box>
			</Box>
		)
	}
}
