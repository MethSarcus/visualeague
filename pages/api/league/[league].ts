// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import Cors from 'cors'
import {LeagueSettings} from '../../../classes/sleeper/LeagueSettings'
import LeagueData from '../../../classes/sleeper/SleeperLeague'
import {SleeperUser} from '../../../classes/sleeper/SleeperUser'
import {SleeperMatchup} from '../../../classes/sleeper/SleeperMatchup'
import {SleeperRoster} from '../../../classes/sleeper/SleeperRoster'
import {
	getMultiPlayerDetails,
	getMultiPlayerProjections,
	getMultiPlayerStats,
	getWeeklyPlayerStats,
} from '../player/[...player]'
import {SleeperPlayerDetails} from '../../../classes/custom/Player'
const {connectToDatabase} = require('../../../lib/mongodb')
const {MongoClient} = require('mongodb')

const cors = Cors({
	methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result: any) => {
			if (result instanceof Error) {
				return reject(result)
			}

			return resolve(result)
		})
	})
}

type Data = {
	league: LeagueData
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const {league} = req.query
	await runMiddleware(req, res, cors)

	if (league) {
		let leagueId = league.toString()
		let db = connectToDatabase()
		const leagueSettings = (await getLeague(leagueId)) as LeagueSettings
		const leagueUsers = (await getLeagueMembers(leagueId)) as SleeperUser[]
		const leagueRosters = (await getLeagueRosters(leagueId)) as SleeperRoster[]
		const matchups = await getMatchups(leagueId, leagueSettings)
		let allPlayers = [...matchups.allPlayers]
		const playerDetails = await getMultiPlayerDetails(db, allPlayers, leagueSettings.season)
		res
			.status(200)
			.json({
				league: new LeagueData(leagueUsers, leagueSettings, matchups.matchups, leagueRosters, playerDetails),
			})
	} else {
		res.status(401).json({
			league: new LeagueData([], {} as LeagueSettings, [], [], []),
		})
	}
}

export function getLeague(leagueId: string) {
	// gets league details
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve(fetch(`https://api.sleeper.app/v1/league/${leagueId}/`).then((response) => response.json())),
			200
		)
	})
}

export function getLeagueMembers(leagueId: string) {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve(
					fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`).then((response) => response.json())
				),
			200
		)
	})
}

function getLeagueRosters(leagueId: string) {
	// gets league details
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve(
					fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`).then((response) => response.json())
				),
			200
		)
	})
}

function getMatchupPromises(leagueId: string, startWeek: number, endWeek: number) {
	const promises = []
	for (let i = startWeek; i <= endWeek; i++) {
		promises.push(
			new Promise((resolve) => {
				setTimeout(
					() =>
						resolve(
							fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${i}`).then((response) =>
								response.json()
							)
						),
					200
				)
			})
		)
	}

	return promises
}

async function getMatchups(leagueId: string, leagueSettings: LeagueSettings) {
	let allPlayers: Set<string> = new Set()
	let start_week = (leagueSettings as LeagueSettings).settings.start_week
	let endWeek = (leagueSettings as LeagueSettings).settings.last_scored_leg
	const matchups = (await Promise.all(
		getMatchupPromises(leagueId, start_week, endWeek)
	)) as SleeperMatchup[][]
	for (let i = start_week; i <= endWeek; i++) {
		matchups.forEach((weekMatchups) => {
			weekMatchups.forEach((curMatch) => {
				curMatch.players.forEach((playerId: string) => {
					allPlayers.add(playerId)
				})
			})
		})
	}

	return {matchups, allPlayers}
}

// async function getCompleteLeague(leagueId: string) {
//   const leagueSettings = await getLeague(leagueId);
//   const leagueUsers = await getLeagueMembers(leagueId);
//   const leagueRosters = await getLeagueRosters(leagueId);
//   let playerDetails:  SleeperPlayerDetails[] = [];
//   let stats: any[] = [];
//   let allPlayers: string[][] = [];
//   let db = connectToDatabase();

//   // instead of awaiting this call, create an array of Promises

//   playerDetails.push(
//     await getMultiPlayerDetails(db, [...new Set(allPlayers.flat().flat())], (leagueSettings as LeagueSettings).season)
//   );

//   return new SleeperLeague(
//     leagueUsers as SleeperUser[],
//     leagueSettings as LeagueSettings,
//     matchups as SleeperMatchup[][],
//     leagueRosters as SleeperRoster[],
//     getWeeklyPlayerStats(db, [...new Set(allPlayers.flat().flat())], 2023, 1, 2),
//     [],
//     playerDetails[0]
//   );
//   // use await on Promise.all so the Promises execute in parallel

// }
