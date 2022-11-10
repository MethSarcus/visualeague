import DataTable, {
	TableColumn
} from "react-data-table-component"
import League from "../../classes/custom/League"
import LeagueMember from "../../classes/custom/LeagueMember"

type MyProps = { league: League }

interface DataRow {
	name: string
	record: string
	pf: number
	pa: number
	pp: number
	gp: number
	opslap: number
}

const columns: TableColumn<DataRow>[] = [
	{
		name: "Team",
		selector: (row) => row.name,
		sortable: true,
		grow: 1
	},
	{
		name: "Record",
		selector: (row) => row.record,
		sortable: true,
		grow: 0
	},
	{
		name: "PF",
		selector: (row) => row.pf,
		sortable: true,
		grow: 0
	},
	{
		name: "PA",
		selector: (row) => row.pa,
		sortable: true,
		grow: 0
	},
	{
		name: "PP",
		selector: (row) => row.pp,
		sortable: true,
		grow: 0
	},
	{
		name: "GP",
		selector: (row) => row.gp,
		sortable: true,
		grow: 0
	},
	{
		name: "OPSLAP",
		selector: (row) => row.opslap,
		sortable: true,
		grow: 0
	},
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
	const formattedMembers: DataRow[] = []
	props.league.members.forEach((value: LeagueMember) => {
		formattedMembers.push(formatMemberDataForTable(value))
	});
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
			data={formattedMembers}
			// conditionalRowStyles={conditionalRowStyles}
			// expandableRowsComponent={ExpandedComponent}
			dense={true}
		/>
	)
}

function formatMemberDataForTable(member: LeagueMember): DataRow {
	return {
		name: member.name,
		record: member.stats.wins + "-" + member.stats.losses,
		pf: parseFloat(member.stats.pf.toFixed(2)),
		pa: parseFloat(member.stats.pa.toFixed(2)),
		pp: parseFloat(member.stats.pp.toFixed(2)),
		gp: parseFloat(member.stats.gp.toFixed(2)),
		opslap: parseFloat(member.stats.opslap.toFixed(2))
	}
}

export default LeagueOverviewDataTable
