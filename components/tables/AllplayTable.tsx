'use client'
import React from 'react'
import {Box, Spinner} from '@chakra-ui/react'
import {Draft, DraftPlayer, DRAFT_TYPE} from '../../classes/custom/Draft'
import ReactDataGrid from '@inovua/reactdatagrid-community'
import '@inovua/reactdatagrid-community/index.css'
import '@inovua/reactdatagrid-community/index.css'
import '@inovua/reactdatagrid-community/theme/default-dark.css'
import League from '../../classes/custom/League'

interface MyProps {
	league: League | undefined
}

interface LooseObject {
	[key: string]: any
}
const AllplayTable = (props: MyProps) => {
	const columns = [{name: 'name', header: 'Name', type: 'string'}]
	const data: object[] = []

    if (!props.league?.members) return <Spinner/>

	props.league.members.forEach((member) => {
		columns.push({name: member.name, header: member.name, type: 'string'})
		let memberDataObj: LooseObject = {id: member.roster.roster_id, name: member.name, total: member.getPowerRecord()}
		props.league?.members.forEach((otherMember) => {
			if (otherMember.roster.roster_id != member.roster.roster_id) {
				memberDataObj[otherMember.name] = `${
					member.stats.allPlayWinMap.get(otherMember.roster.roster_id) ?? 0
				}-${member.stats.allPlayLossMap.get(otherMember.roster.roster_id) ?? 0} 
                ${
									member.stats.allPlayTieMap.has(otherMember.roster.roster_id)
										? '-' +
										  member.stats.allPlayTieMap.get(
												otherMember.roster.roster_id
										  )
										: ''
								}`
			}
		})
		data.push(memberDataObj)
	})

	columns.push({name: 'total', header: 'Total', type: 'string'})
	const gridStyle = {minHeight: "300px"}

	return (
		<ReactDataGrid
			idProperty='pick_no'
			columns={columns}
			dataSource={data}
			style={gridStyle}
			theme={'default-dark'}
		/>
	)
}

export default AllplayTable