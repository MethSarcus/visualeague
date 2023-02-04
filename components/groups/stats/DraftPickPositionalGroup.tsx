import {Box, Center, HStack, Text, VStack} from '@chakra-ui/react'
import {DraftPlayer} from '../../../classes/custom/Draft'
import { project_colors } from '../../../utility/project_colors'
import {POSITION} from '../../../utility/rosterFunctions'
import DraftPickCard from '../../cards/DraftPickCard'

interface MyProps {
    title: string
	positionalMap: Map<POSITION, DraftPlayer> | undefined
}

export default function DraftPickPositionalGroup(props: MyProps) {
	return (
		<HStack overflowX={"auto"} w={"full"} my={2}>
			{[...(props.positionalMap?.keys() ?? [])].map((pos) => {
				return (
					<VStack key={pos} color={project_colors.textTheme.highEmphasis} spacing={1}>
                        <Text fontSize='xs'>{`${props.title} ${pos} Drafted`}</Text>
						<DraftPickCard pick={props.positionalMap?.get(pos)} />
					</VStack>
				)
			})}
		</HStack>
	)
}
