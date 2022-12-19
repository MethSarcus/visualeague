'use client'
import React from 'react'
import {Box} from '@chakra-ui/react'
import {Draft, DraftPlayer, DRAFT_TYPE} from '../../classes/custom/Draft'
import ReactDataGrid from '@inovua/reactdatagrid-community'
import '@inovua/reactdatagrid-community/index.css'
import '@inovua/reactdatagrid-community/index.css'
import '@inovua/reactdatagrid-community/theme/default-dark.css'

interface MyProps {
	draft: Draft
}

export default function DraftValueTable(props: MyProps) {
	const data = [...props.draft.picks.values()].sort(
		(a: DraftPlayer, b: DraftPlayer) => b.draftValue - a.draftValue
	)
	const columns = [
		{name: 'name', header: 'Name', type: 'string'},
		{name: 'ppg', header: 'PPG', type: 'number'},
		{name: 'pointsScored', header: 'PF', type: 'number'},
	]

	const gridStyle = {minHeight: 550}

	if (props.draft.settings.type == DRAFT_TYPE.SNAKE) {
		columns.push({name: 'pick_no', header: 'Pick', type: 'number'})
	} else {
		columns.push({name: 'amount', header: 'Price', type: 'number'})
	}

	columns.push({name: 'draftValue', header: 'Value', type: 'number'})

	return (
			<ReactDataGrid
				idProperty='pick_no'
				columns={columns}
				dataSource={data}
				style={gridStyle}
                theme={"default-dark"}
			/>
	)
}
