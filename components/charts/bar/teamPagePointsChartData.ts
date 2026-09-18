import {BarDatum} from '@nivo/bar'
import {POSITION} from '../../../utility/rosterFunctions'

export const LEAGUE_AVG_KEY = 'League Avg'
export const OPPONENT_KEY = 'Opponent Total'

export function formatTeamPagePointsData(
	memberName: string,
	homePointMap: Map<POSITION, number>,
	awayPointMap: Map<POSITION, number>,
	avgPointMap: Map<POSITION, number>
) {
	const positions = Array.from(homePointMap.keys())
	const data: BarDatum[] = positions.map((pos) => ({
		position: pos,
		[memberName]: homePointMap.get(pos) ?? 0,
		[LEAGUE_AVG_KEY]: avgPointMap.get(pos) ?? 0,
		[OPPONENT_KEY]: awayPointMap.get(pos) ?? 0,
	}))

	return {
		data,
		keys: [memberName, LEAGUE_AVG_KEY, OPPONENT_KEY],
	}
}
