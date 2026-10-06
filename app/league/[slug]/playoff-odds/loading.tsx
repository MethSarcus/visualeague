'use client'
import {Box, Flex, Skeleton} from '@chakra-ui/react'

const Loading = () => {
	return (
		<Box w='full' mx={[2, 4]} my={2} pr={[4, 8]}>
			<Skeleton h='36px' mx={10} my={2} />
			<Flex direction='column' gap={3}>
				{/* Odds title, description and controls */}
				<Skeleton h={['120px', '90px']} borderRadius='md' />
				{/* Odds table with one row per team */}
				<Skeleton h={['300px', '460px']} borderRadius='md' />
				{/* Playoff picture: standings and bracket */}
				<Skeleton h={['300px', '420px']} borderRadius='md' />
			</Flex>
		</Box>
	)
}

export default Loading
