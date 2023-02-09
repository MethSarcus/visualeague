'use client'
import {
	Grid,
	GridItem,
	HStack, Spinner
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import League from '../../../../classes/custom/League'
import MemberRoster from '../../../../components/groups/roster/MemberRoster'
import { Context } from '../../../../contexts/Context'

export default function Page() {
	const [context, setContext] = useContext(Context)
	const [shownMembers, setShownMembers] = useState([] as string[])
	const desktopGrid = `"controls"
	"rosters"`

	const mobileGrid = `"controls"
	"rosters"`

	if (context.settings == undefined || context.playerDetails == undefined)
		return <Spinner />
	return (
		<Grid
			templateAreas={[mobileGrid, desktopGrid]}
			gridTemplateColumns={['1fr', '1fr 1fr 1fr']}
			mx={5}
		>
			<GridItem area={'rosters'}>
				<HStack align={"top"} gap={3}>
                    {Array.from((context as League)?.members.values()).map((leagueMember, index) => {
						return <MemberRoster key={index} member={leagueMember}/>
					})}
                </HStack>
			</GridItem>
		</Grid>
	)
}