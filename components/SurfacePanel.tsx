import {Box, BoxProps, Heading, HeadingProps, Text, TextProps} from '@chakra-ui/react'
import {ReactNode} from 'react'

interface SurfacePanelProps extends Omit<BoxProps, 'title'> {
	title?: ReactNode
	description?: ReactNode
	titleSize?: HeadingProps['size']
	descriptionProps?: TextProps
	contentProps?: BoxProps
}

export default function SurfacePanel({
	title,
	description,
	titleSize = 'md',
	descriptionProps,
	contentProps,
	children,
	...boxProps
}: SurfacePanelProps) {
	return <Box bg='surface.1' border='1px solid' borderColor='whiteAlpha.200' borderRadius='xl' p={[4, 5]} {...boxProps}>
		{title && <Heading size={titleSize} color='white'>{title}</Heading>}
		{description && <Text mt={2} fontSize='sm' color='surface.8' fontWeight='normal' {...descriptionProps}>{description}</Text>}
		{contentProps ? <Box {...contentProps}>{children}</Box> : children}
	</Box>
}
