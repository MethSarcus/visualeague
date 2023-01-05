import {useRadioGroup, Center, HStack, useRadio, Box} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { Context } from '../../contexts/Context'
import {project_colors} from '../../utility/project_colors'

interface MyProps {
	onclick: (selected: string) => void
}

export default function HorizontalPillSelector(props: MyProps) {
	const options = ['Regular', 'Post', 'All']
    const [context, setContext] = useContext(Context)

	const {getRootProps, getRadioProps} = useRadioGroup({
		name: 'season_portion',
		defaultValue: 'All',
		onChange: props.onclick,
	})

	const group = getRootProps()

    useEffect(() => {

        
      }, [context]);

      const [seasonPortion, setSeasonPortion] = useState('All')

	return (
		<Center textAlign={'center'}>
			<HStack
				{...group}
				bg={project_colors.secondary[800]}
				width={'-moz-min-content'}
				borderRadius={'5em'}
			>
				{options.map((value) => {
					const radio = getRadioProps({value})
					return (
						<RadioCard key={value} {...radio}>
							{value}
						</RadioCard>
					)
				})}
			</HStack>
		</Center>
	)
}


function RadioCard(props: any) {
    const { getInputProps, getCheckboxProps } = useRadio(props)
  
    const input = getInputProps()
    const checkbox = getCheckboxProps()
  
    return (
      <Box as='label' fontSize={".6em"}>
        <input {...input} />
        <Box
          {...checkbox}
          cursor='pointer'
          borderRadius='5em'
          boxShadow='md'
          _checked={{
            color: project_colors.sleeper.text_normal,
            bg: project_colors.secondary[500],
          }}
          px={1.5}
          py={1}
          transition={"all .2s ease"}
        >
          {props.children}
        </Box>
      </Box>
    )
  }