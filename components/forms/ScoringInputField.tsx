import { Center, NumberInput, NumberInputField, Tooltip } from "@chakra-ui/react"
import React from "react"
import { getReadableScoringKey } from "../../utility/rosterFunctions"


interface MyProps {
    settingKey: string
    settingValue: number
	originalValue: number
    customScoringChecked: boolean
    onInputChange: (e: any) => void
}

const ScoringInputField = (props: MyProps) => {
    const [customSettingValue, setCustomSettingValue] = React.useState(props.settingValue)
    
	return (
		<Center key={props.settingKey} visibility={'visible'}>
			{getReadableScoringKey(props.settingKey)}{' '}
			<NumberInput
				ml={2}
				isInvalid={
					customSettingValue != props.originalValue
				}
				isDisabled={!props.customScoringChecked}
				variant={'filled'}
				textColor={'white'}
				defaultValue={props.settingValue}>
				<Tooltip
					isDisabled={
						customSettingValue == props.originalValue
					}
					label={`Original Value: ${props.originalValue}`}
					placement={'top'}>
					<NumberInputField
						bg={'surface.2'}
						_hover={{background: 'surface.3'}}
						id={props.settingKey}
						onChange={(valueString) => {
                            setCustomSettingValue(parseFloat( valueString.target.value))
                            props.onInputChange(valueString)
                        }}
					/>
				</Tooltip>
			</NumberInput>
		</Center>
	)
}

export default ScoringInputField
