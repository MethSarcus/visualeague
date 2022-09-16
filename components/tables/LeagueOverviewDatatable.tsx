import DataTable, {
	ExpanderComponentProps,
	TableColumn,
} from "react-data-table-component"
import React from "react"
import { DraftPick } from "../../interfaces/sleeper_api/DraftPick";
import FantasyLeagueMember from "../../interfaces/sleeper_api/custom/FantasyLeagueMember";

type MyProps = { members: FantasyLeagueMember[] }

interface DataRow {
	name: string
	record: string
	pf: number
}

const columns: TableColumn<DataRow>[] = [
	{
		name: "Team",
		selector: (row) => row.name,
		sortable: true,
	},
	{
		name: "Record",
		selector: (row) => row.record,
		sortable: true,
	},
	{
		name: "PF",
		selector: (row) => row.pf,
		sortable: true,
		grow: 6
	}
]

const customStyles = {
    rows: {
        style: {
            minHeight: '72px', // override the row height
        },
    },
	columns: {
        style: {
            innerWidth: '0px', // override the cell padding for data cells
            outerWidth: '1px',
			width: "4px"
        },
	},
    headCells: {
        style: {
            paddingLeft: '0px', // override the cell padding for head cells
            paddingRight: '0px',
			width: "4px"
        },
    },
    cells: {
        style: {
            innerWidth: 3, // override the cell padding for data cells
            outerWidth: 7,
			width: 6
        },
    },
}

const LeagueOverviewDataTable = (props: MyProps): JSX.Element => {
	// data provides access to your row data

	// const ExpandedComponent: React.FC<ExpanderComponentProps<DataRow>> = ({
	// 	data,
	// }) => {
	// 	return (
	// 		<pre>
	// 			{JSON.stringify(
	// 				data,
	// 				["pick", "player", "picked_by", "draft_id"],
	// 				2
	// 			)}
	// 		</pre>
	// 	)
	// }
	// const conditionalRowStyles = [
	// 	{
	// 		when: (row: any) => row.id.includes(props.focusedUser),
	// 		style: {
	// 			backgroundColor: "green",
	// 			color: "white",
	// 			"&:hover": {
	// 				cursor: "pointer",
	// 			},
	// 		},
	// 	},
	// ]

	return (
		<DataTable
		theme="dark"
			columns={columns}
			defaultSortFieldId={1}
			data={props.members.map((member: FantasyLeagueMember) => formatMemberDataForTable(member))}
			// conditionalRowStyles={conditionalRowStyles}
			// expandableRowsComponent={ExpandedComponent}
			dense={true}
		/>
	)
}

function formatMemberDataForTable(member: FantasyLeagueMember): DataRow {
	return {
		name: member.displayName,
		record: member.wins + "-" + member.losses,
		pf: member.pf
	}
}

export default LeagueOverviewDataTable
