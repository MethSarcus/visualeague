'use client'
import { Skeleton, Spinner } from '@chakra-ui/react'
import '@inovua/reactdatagrid-community/index.css'
import '@inovua/reactdatagrid-community/theme/default-dark.css'
import DataTable, { TableColumn } from 'react-data-table-component'
import { AuctionDraftPlayer, Draft, DraftPlayer, DRAFT_TYPE } from '../../classes/custom/Draft'
import { customDatatableStyles } from './LeagueOverviewDatatable'

interface MyProps {
	draft: Draft | undefined
}

interface DataRow {
	ppd?: number
	name: string
	ppg: number
	pf: number
	pick_no?: number
	amount?: number
	value: number
}

const DraftValueTable = (props: MyProps) => {
	const data = [...props.draft?.picks.values() ?? []].sort(
		(a: DraftPlayer, b: DraftPlayer) => b.draftValue - a.draftValue
	).map(player => {return formatMemberDataForTable(player)})
	const cols: TableColumn<DataRow>[] = [{
		name: "name",
		selector: (row) => row.name,
		sortable: true,
		grow: 1
	}, {
		name: "ppg",
		selector: (row) => row.ppg,
		sortable: true,
		grow: 1
	}, {
		name: "pf",
		selector: (row) => row.pf,
		sortable: true,
		grow: 1
	}]
	
	if (props.draft?.settings.type != DRAFT_TYPE.AUCTION ) {
		cols.push({name: 'pick_no', selector: (row) => row.pick_no ?? 0,
		sortable: true,
		grow: 1})
	} else {
		cols.push({name: 'amount', selector: (row) => row.amount ?? 0,
		sortable: true,
		grow: 1})
		cols.push({name: 'ppd', selector: (row) => row.ppd ?? 0,
		sortable: true,
		grow: 1})
	}

	cols.push({name: 'value', selector: (row) => row.value,
		sortable: true,
		grow: 1})

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
		<Skeleton isLoaded={props.draft != undefined}>
		<DataTable
		theme="dark"
			columns={cols}
			defaultSortFieldId={2}
			defaultSortAsc={false}
			data={data}
			customStyles={customDatatableStyles}
			conditionalRowStyles={conditionalRowStyles}
			progressPending={props.draft == undefined}
			progressComponent={<Spinner />}
			responsive={true}
			dense={true}
		/>
		</Skeleton>
	)
}

function formatMemberDataForTable(player: DraftPlayer): DataRow {
	let playerObj = {
		name: player.name,
		ppg: parseFloat(player.ppg.toFixed(2)),
		pf: parseFloat(player.pointsScored.toFixed(2)),
		value: parseFloat(player.draftValue.toFixed(2)),
		ppd: parseFloat((player.pointsScored / (player.amount ?? 1)).toFixed(2))
	} as DataRow

	if (player instanceof AuctionDraftPlayer) {
		playerObj.amount = player.amount
	} else {
		playerObj.pick_no = player.pick_no
	}
	return playerObj
}

export default DraftValueTable