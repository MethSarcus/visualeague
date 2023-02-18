import {
	Box,
	Wrap,
	Text,
	SimpleGrid,
	Spinner,
	VStack,
	WrapItem,
	Grid,
	GridItem,
} from '@chakra-ui/react'
import League from '../../../classes/custom/League'
import {project_colors} from '../../../utility/project_colors'
import GenericStatCard from '../../cards/statcards/GenericStatCard'
import DraftPickPositionalGroup from './DraftPickPositionalGroup'

interface MyProps {
	league: League | undefined
}

export default function DraftPageStatGroup(props: MyProps) {
	const desktopGrid = `
	"card_grid best_picks"
	"card_grid worst_picks"`

	const mobileGrid = `
	"card_grid"
	"best_picks"
	"worst_picks"`

	if (!props.league) return <Spinner />
	let bestPick = props.league?.draft.bestValuePick
	let worstPick = props.league?.draft.worstValuePick
	let bestPositionalPicks = props.league?.draft.bestPositionalPicks
	let worstPositionalPicks = props.league?.draft.worstPositionalPicks
	let drafterStats = props.league?.getBestAndWorstDrafter()
	let bestDrafter = drafterStats?.bestDrafter
	let worstDrafter = drafterStats?.worstDrafter

	return (
		<Grid
			templateAreas={[mobileGrid, desktopGrid]}
			gridTemplateColumns={['1fr', '1fr 1fr']}
			my={4}
			gap={3}
		>
			<GridItem area={'card_grid'}>
				<SimpleGrid columns={2} spacing={3} py={[3, 0]}>
					<GenericStatCard
						statName={'Best Drafter'}
						isLoaded={bestDrafter != null}
						statValue={bestDrafter?.stats.draftPercentage + '% Value Drafted'}
						statOwner={bestDrafter?.name}
						avatar={bestDrafter?.getAvatar() ?? ''}
						isGoodThing={true}
					/>

					<GenericStatCard
						statName={'Best Pick'}
						isLoaded={bestPick != undefined}
						statValue={bestPick?.amount == null ? `Round ${bestPick?.round}, Pick ${bestPick?.draft_slot}` : `$${bestPick?.amount}`}
						statOwner={bestPick?.name}
						avatar={`https://sleepercdn.com/content/nfl/players/${bestPick?.player_id}.jpg`}
						isGoodThing={true}
					/>

					<GenericStatCard
						statName={'Worst Drafter'}
						isLoaded={worstDrafter != null}
						statValue={worstDrafter.stats.draftPercentage + '% Value Drafted'}
						statOwner={worstDrafter?.name}
						avatar={worstDrafter?.getAvatar() ?? ''}
						isGoodThing={false}
					/>

					<GenericStatCard
						statName={'Worst Pick'}
						isLoaded={worstPick != undefined}
						statValue={worstPick?.amount == null ? `Round ${worstPick?.round}, Pick ${worstPick?.draft_slot}` : `$${worstPick?.amount}`}
						statOwner={worstPick?.name}
						avatar={`https://sleepercdn.com/content/nfl/players/${worstPick?.player_id}.jpg`}
						isGoodThing={false}
					/>
				</SimpleGrid>
			</GridItem>

			<GridItem
				overflowX={'auto'}
				area={'best_picks'}
				pl={[0, 3]}
				minH={'100px'}
				borderColor={'surface.0'}
				borderWidth='thin'
				borderStyle={['none', 'solid']}

				borderRadius={2}
			>
				<Text as={'h3'} color={project_colors.textTheme.highEmphasis} mt={2}>
					Best Draft Picks
				</Text>
				<DraftPickPositionalGroup
					title={'Best'}
					positionalMap={bestPositionalPicks}
				/>
			</GridItem>
			<GridItem
				area={'worst_picks'}
				overflowX={'auto'}
				pl={[0, 3]}
				minH={'100px'}
				borderColor={'surface.0'}
				borderWidth='thin'
				borderStyle={['none', 'solid']}
				borderRadius={4}
			>
				<Text as={'h3'} color={project_colors.textTheme.highEmphasis} mt={2}>
					Worst Draft Picks
				</Text>
				<DraftPickPositionalGroup
					title={'Worst'}
					positionalMap={worstPositionalPicks}
				/>
			</GridItem>
		</Grid>
	)
}
