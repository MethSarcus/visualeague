import { Box, Skeleton, Spinner } from "@chakra-ui/react"
import DataTable, {
	TableColumn
} from "react-data-table-component"
import League from "../../classes/custom/League"
import LeagueMember from "../../classes/custom/LeagueMember"
import { project_colors } from "../../utility/project_colors"
import { useMediaQuery } from '@chakra-ui/react'

const LeagueOverviewDataTable = (props: MyProps): JSX.Element => {
	const formattedMembers: DataRow[] = []
	const [isOnMobile] = useMediaQuery('(max-width: 768px)')
	const columns: TableColumn<DataRow>[] = [
		{
			name: "Team",
			selector: (row) => row.name,
			sortable: true,
			grow: 1,
		},
		{
			name: "Record",
			selector: (row) => row.record,
			sortable: true,
			grow: 1,
			omit: isOnMobile,
		},
		{
			name: "PF",
			selector: (row) => row.pf,
			sortable: true,
			grow: 1,
		},
		{
			name: "OPSLAP",
			selector: (row) => row.opslap,
			sortable: true,
			grow: 1
		},
		{
			name: "PA",
			selector: (row) => row.pa,
			sortable: true,
			grow: 1,
			omit: isOnMobile,
		},
		
		{
			name: "PP",
			selector: (row) => row.pp,
			sortable: true,
			grow: 1,
		},
		{
			name: "GP",
			selector: (row) => row.gp,
			sortable: true,
			grow: 1,
		},
	
	]
	if (props.league.members != undefined) {
		props.league.members.forEach((value: LeagueMember) => {
			formattedMembers.push(formatMemberDataForTable(value))
		});
	}

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
	const conditionalRowStyles = [
		{
			when: (row: any) => true,
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
		<Skeleton isLoaded={props.league != undefined}>
		<DataTable
		theme="dark"
			columns={columns}
			defaultSortFieldId={3}
			defaultSortAsc={false}
			data={formattedMembers}
			customStyles={customStyles}
			conditionalRowStyles={conditionalRowStyles}
			progressPending={props.league.settings == undefined}
			progressComponent={<Spinner />}
			responsive={true}
			// conditionalRowStyles={conditionalRowStyles}
			// expandableRowsComponent={ExpandedComponent}
			dense={true}
		/>
		</Skeleton>

	)
}


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



const customStyles = {
    rows: {
        style: {
            minHeight: '72px', // override the row height
        },
    },
	columns: {
        style: {
			
        },
	},
    headCells: {

        style: {
			background: project_colors.surface[2],
			fontSize: ".5em",
			minWidth: "60px!important",
			color: project_colors.textTheme.highEmphasis,
        },
    },
    cells: {
        style: {
			fontSize: ".6em",
			minWidth: "60px!important",
			color: project_colors.textTheme.highEmphasis,
			background: project_colors.surface[1]
        },
    },
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
