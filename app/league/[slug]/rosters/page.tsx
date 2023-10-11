'use client'
import {
	Grid,
	GridItem,
	HStack, Spinner
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import League from '../../../../classes/custom/League'
import MemberRoster from '../../../../components/groups/roster/MemberRoster'
import { LeagueContext } from '../../../../contexts/LeagueContext'

const Page = () => {
	const [context, setContext] = useContext(LeagueContext)
	const [shownMembers, setShownMembers] = useState([] as string[])
	const desktopGrid = `"controls"
	"rosters"`

	const mobileGrid = `"controls"
	"rosters"`

	if (context.settings == undefined)
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

export default Page