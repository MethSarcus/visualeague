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
import { project_colors } from '../../../utility/project_colors'
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
				<SimpleGrid columns={2} spacing={3} py={[3, 0]} >
					<GenericStatCard
						statName={'Best Drafter'}
						isLoaded={bestDrafter != null}
						statValue={bestDrafter?.stats.draftValue.toFixed(2)}
						statOwner={bestDrafter?.name}
						avatar={bestDrafter?.getAvatar() ?? ''}
						isGoodThing={true}
					/>
					<GenericStatCard
						statName={'Worst Drafter'}
						isLoaded={worstDrafter != null}
						statValue={worstDrafter?.stats.draftValue.toFixed(2)}
						statOwner={worstDrafter?.name}
						avatar={worstDrafter?.getAvatar() ?? ''}
						isGoodThing={false}
					/>

					<GenericStatCard
						statName={'Best Pick'}
						isLoaded={bestPick != undefined}
						statValue={bestPick?.draftValue.toFixed(2)}
						statOwner={bestPick?.name}
						avatar={`https://sleepercdn.com/content/nfl/players/${bestPick?.player_id}.jpg`}
						isGoodThing={true}
					/>

					<GenericStatCard
						statName={'Worst Pick'}
						isLoaded={worstPick != undefined}
						statValue={worstPick?.draftValue.toFixed(2)}
						statOwner={worstPick?.name}
						avatar={`https://sleepercdn.com/content/nfl/players/${worstPick?.player_id}.jpg`}
						isGoodThing={false}
					/>
				</SimpleGrid>
			</GridItem>

			<GridItem overflowX={'auto'} area={'best_picks'} alignSelf={"stretch"} pl={[0, 5]}>
				<Text as={"h3"} color={project_colors.textTheme.highEmphasis}>Best Draft Picks</Text>
				<DraftPickPositionalGroup
					title={'Best'}
					positionalMap={bestPositionalPicks}
				/>
			</GridItem>
			<GridItem area={'worst_picks'} overflowX={'auto'} pl={[0, 5]}>
			<Text as={"h3"} color={project_colors.textTheme.highEmphasis} >Worst Draft Picks</Text>
				<DraftPickPositionalGroup
					title={'Worst'}
					positionalMap={worstPositionalPicks}
				/>
			</GridItem>
		</Grid>
	)
}
