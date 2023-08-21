'use client'
import {useRadioGroup, Center, HStack, useRadio, Box} from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
import { SeasonPortion } from '../../classes/custom/League'
import { LeagueContext } from '../../contexts/LeagueContext'
import {project_colors} from '../../utility/project_colors'

interface MyProps {
	onclick: (selected: string) => void
}

export default function HorizontalPillSelector(props: MyProps) {
	const options = [SeasonPortion.REGULAR, SeasonPortion.POST, SeasonPortion.ALL]
    const [context, setContext] = useContext(LeagueContext)
	const [league_id, setLeagueID] = useState(context?.league_id)
	const {getRootProps, getRadioProps} = useRadioGroup({
		name: 'season_portion',
		defaultValue: (context.seasonPortion ?? SeasonPortion.ALL),
		onChange: props.onclick,
	})

	const group = getRootProps()
	useEffect(() => {
		if (context?.league_id != league_id) {
			props.onclick("ALL")
		}
		
	}, [context, context?.league_id, league_id, props])


      

	return (
		<Center textAlign={'center'} mx={[1, 2, 4]}>
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