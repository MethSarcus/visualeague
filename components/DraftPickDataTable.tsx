import DataTable, {
	ExpanderComponentProps,
	TableColumn,
} from "react-data-table-component"
import {
	DraftPick,
} from "../interfaces/sleeper_api/DraftPick"
import React from "react"
import { LeagueSettings } from "../interfaces/sleeper_api/LeagueSettings"
import { SleeperUser } from "../interfaces/sleeper_api/SleeperUser"

type MyProps = { picks: DraftPick[]; includedDrafts: string[], includedPositions: string[], focusedUser: string }

interface DataRow {
	id: string
	pick: number
	player: string
	picked_by: string
	draft_id: string
	league: string
}

const columns: TableColumn<DataRow>[] = [
	{
		name: "Pick",
		selector: (row) => row.pick,
		sortable: true,
	},
	{
		name: "Player",
		selector: (row) => row.player,
		sortable: true,
	},
]

const DraftPickDataTable = (props: MyProps): JSX.Element => {
	// data provides access to your row data

	const ExpandedComponent: React.FC<ExpanderComponentProps<DataRow>> = ({
		data,
	}) => {
		return (
			<pre>
				{JSON.stringify(
					data,
					["pick", "player", "picked_by", "draft_id"],
					2
				)}
			</pre>
		)
	}
	const conditionalRowStyles = [
		{
			when: (row: any) => row.id.includes(props.focusedUser),
			style: {
				backgroundColor: "green",
				color: "white",
				"&:hover": {
					cursor: "pointer",
				},
			},
		},
	]

	return (
		<DataTable
		theme="dark"
			columns={columns}
			defaultSortFieldId={1}
			data={props.picks
				.filter((e) => {
					return props.includedDrafts.includes(e.draft_id)
				}).filter((e) => {
					return props.includedPositions.includes(e.metadata.position)
				})
				.map((pick: DraftPick) => formatPickForTable(pick))}
			conditionalRowStyles={conditionalRowStyles}
			expandableRows
			expandableRowsComponent={ExpandedComponent}
			dense={true}
		/>
	)
}

function formatPickForTable(pick: DraftPick): DataRow {
	return {
		id: pick.picked_by + "_" + pick.player_id + "_" + pick.draft_id,
		pick: pick.pick_no,
		player: pick.metadata.first_name + " " + pick.metadata.last_name,
		picked_by: pick.picked_by,
		draft_id: pick.draft_id,
		league: pick.draft_id
	}
}

function getLeagueFromDraftId(leagues: LeagueSettings[], draftId: string) {
	return leagues.forEach((league) => {
		if(league.draft_id == draftId) {
			return league.name
		}
	})
}

function getUsernameFromUserId(users: SleeperUser[], userId: string) {
	return users.forEach((user) => {
		if(user.user_id == userId) {
			return user.display_name
		}
	})
}

export default DraftPickDataTable
