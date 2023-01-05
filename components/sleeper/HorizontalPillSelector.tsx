import { Box, Center, HStack, useRadio, useRadioGroup, UseRadioProps } from "@chakra-ui/react";
import { project_colors } from "../../utility/project_colors";


interface MyProps {
    onclick: (selected: string) => void
}

export default function HorizontalPillSelector(props: MyProps) {
    const options = [LINEUP_OPTIONS.ACTUAL, LINEUP_OPTIONS.MAX_PF, LINEUP_OPTIONS.OPSLAP]
  
    const { getRootProps, getRadioProps } = useRadioGroup({
      name: 'starters',
      defaultValue: 'Actual',
      onChange: props.onclick,
    })
  
    const group = getRootProps()
  
    return (
        <Center >
      <HStack {...group} bg={project_colors.sleeper.badge_background} width={"-moz-min-content"} borderRadius={"5em"} mt={2}>
        {options.map((value) => {
          const radio = getRadioProps({ value })
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


export function RadioCard(props: any) {
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
            color: project_colors.sleeper.horizontal_pill_group.text_selected_color,
            bg: project_colors.sleeper.horizontal_pill_group.selected_item_background,
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

  export enum LINEUP_OPTIONS {
    ACTUAL = "Actual",
    MAX_PF = "MaxPF",
    OPSLAP = "OPSLAP"
  }


  