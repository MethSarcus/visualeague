import {Box, Flex, HStack, Text, VStack} from '@chakra-ui/react'
import {ReactNode} from 'react'

export interface ChartTooltipRow {
	key: string
	label: ReactNode
	value?: ReactNode
	color?: string
}

export default function ChartTooltip({title, rows, whiteSpace}: {
	title?: ReactNode
	rows: ChartTooltipRow[]
	whiteSpace?: string
}) {
	return <Box bg='surface.2' color='white' p={3} borderRadius='md' boxShadow='lg' fontSize='sm' whiteSpace={whiteSpace}>
		{title !== undefined && <Text mb={1} fontWeight='semibold'>{title}</Text>}
		<VStack align='stretch' spacing={1}>
			{rows.map(({key, label, value, color}) => <Flex key={key} align='center' justify='space-between' gap={5}>
				<HStack spacing={2} minW={0}>
					{color && <Box boxSize='10px' flexShrink={0} borderRadius='full' bg={color} />}
					<Text color={color || 'surface.9'}>{label}</Text>
				</HStack>
				{value !== undefined && <Text flexShrink={0}>{value}</Text>}
			</Flex>)}
		</VStack>
	</Box>
}
