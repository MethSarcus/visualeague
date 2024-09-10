import {NextApiRequest, NextApiResponse} from 'next'
import {DraftSettings} from '../../../../classes/sleeper/DraftSettings'
import {SleeperUser} from '../../../../classes/sleeper/SleeperUser'
import {getLeagueMembers} from '../../league/[league]'

type Data = {
	drafts: DraftSettings[] | undefined
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	const {league} = req.query
	//Find the absolute path of the json directory
	if (league) {
		const leagueUsers = (await getLeagueMembers(league.toString())) as SleeperUser[]
		const drafts = leagueUsers.map((user) => {
			return getMemberDraftDetails(user.user_id, 2024)
		})
		let uniqueDrafts = new Set<string>()
		await Promise.all(drafts).then((values) => {
			values.forEach((drafts) => {
				drafts.forEach((draft) => {
					uniqueDrafts.add(JSON.stringify(draft))
				})
			})
			res
				.status(200)
				.json({
					drafts: Array.from(uniqueDrafts).map((draft) =>
						JSON.parse(draft)
					) as any,
				})
		})
	} else {
		res.status(401).json({
			drafts: [],
		})
	}
}

export function getMemberDraftDetails(
	memberId: string,
	season: number
): Promise<DraftSettings[]> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve(
					fetch(
						`https://api.sleeper.app/v1/user/${memberId}/drafts/nfl/${season}`
					).then((response) => response.json())
				),
			200
		)
	})
}

// -------------------------------------------------------------------
// Gets all members of a league
// -------------------------------------------------------------------
export function getDraft(draftId: string) {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve(
					fetch(`https://api.sleeper.app/v1/draft/${draftId}/picks`).then(
						(response) => response.json()
					)
				),
			200
		)
	})
}
