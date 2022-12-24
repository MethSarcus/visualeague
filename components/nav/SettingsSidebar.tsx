"use client"
import {
	Box,
	Button,
	Center,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	FormControl,
	FormLabel,
	HStack,
	IconButton,
	Input,
	NumberInput,
	NumberInputField,
	Spacer,
	Spinner,
	Switch,
	Tooltip,
	useDisclosure,
	VStack,
} from '@chakra-ui/react'
import produce from 'immer'
import React, {useContext, useEffect} from 'react'
import {GoGear} from 'react-icons/go'
import League from '../../classes/custom/League'
import {LeagueSettings} from '../../classes/sleeper/LeagueSettings'
import {Context} from '../../contexts/Context'
import { getReadableScoringKey } from '../../utility/rosterFunctions'

export default function SettingsSidebar() {
	const [context, setContext] = useContext(Context)
  
	const {isOpen, onOpen, onClose} = useDisclosure()
  
	const [customSettings, setCustomSettings] = React.useState(
		context.modifiedSettings
	)
	const [customScoringChecked, setCustomScoringChecked] = React.useState(
		context.settings.useModifiedSettings
	)

  const [taxiIncludedMaxPfChecked, setTaxiIncludedMaxPfChecked] = React.useState(
		context.settings.taxiIncludedInMaxPf
	)

	function onCheckboxClick(e: any) {
		setCustomScoringChecked(e.target.checked)
	}

  function onTaxiCheckboxChanged(e: any) {
		setTaxiIncludedMaxPfChecked(e.target.checked)
	}

	const onInputChange = async (e: {
		target: {id: string | number; value: string}
	}) => {
		setCustomSettings(
			produce(customSettings, (draftState: LeagueSettings) => {
				;(draftState.scoring_settings as any)[e.target.id] = parseFloat(
					e.target.value
				)
			})
		)
	}
  useEffect(() => {
    // call an API and in the success or failure fill the data buy using setData function
    // it could be like below
    if (context.settings != undefined) {
      setTaxiIncludedMaxPfChecked(context.taxiIncludedInMaxPf)
    }
  }, [context.settings, context.taxiIncludedInMaxPf]);

	const onApplyPressed = () => {
		let settings = context.settings.scoring_settings
		if (customScoringChecked) {
			settings = customSettings.scoring_settings
		}
    
		const nextState = produce(context, (draftState: League) => {
      draftState.setTaxiSquadIncluded(taxiIncludedMaxPfChecked)
      draftState.modifyStats(settings, taxiIncludedMaxPfChecked)
      draftState.useModifiedSettings = customScoringChecked
		})
		setContext(nextState)
	}

	return (
		<>
			{context.settings && (
				<IconButton
					bg={'none'}
					_hover={{background: 'primary.100'}}
					icon={<GoGear />}
					onClick={onOpen}
					aria-label={'settings'}
				/>
			)}
			<Drawer isOpen={isOpen} placement='right' onClose={onClose}>
				<DrawerOverlay />
				<DrawerContent bg={'surface.1'} textColor='white'>
					<DrawerCloseButton />
					<DrawerHeader>
						Settings
						<br />
						{context && (
							<FormControl
								mt={4}
								display='flex'
								flexDirection={'column'}
								alignItems='stretch'
							>
                <Flex mt={2} visibility={((context as League)?.settings?.settings.taxi_slots ?? 0) > 0 ? "visible" : 'collapse'}>
									<FormLabel htmlFor='taxiMaxPf' mb='0'>
										Taxi squad in MaxPF
									</FormLabel>
									<Spacer />
									<Switch
										id='taxiMaxPf'
										isChecked={taxiIncludedMaxPfChecked}
										onChange={onTaxiCheckboxChanged}
									/>
								</Flex>
								<Flex mt={2}>
									<FormLabel htmlFor='customSettings' mb='0'>
										Use Custom settings
									</FormLabel>
									<Spacer />
									<Switch
										id='customSettings'
										isChecked={customScoringChecked}
										onChange={onCheckboxClick}
									/>
								</Flex>


							</FormControl>
						)}
					</DrawerHeader>
					<DrawerBody>
						{context.settings && (
							<VStack align={'start'}>
								{Object.keys(context.modifiedSettings.scoring_settings)
									.sort(function (a, b) {
										return a.localeCompare(b)
									})
									// .filter(setting => setting.includes(searchTerm))
									.map((setting) => {
										return (
											<Center key={setting} visibility={'visible'}>
												{getReadableScoringKey(setting)}{' '}
												<NumberInput
													ml={2}
													isInvalid={
														customSettings.scoring_settings[setting] !=
														context.settings.scoring_settings[setting]
													}
													isDisabled={!customScoringChecked}
													variant={'filled'}
													textColor={'white'}
													defaultValue={
														context.modifiedSettings.scoring_settings[setting]
													}
												>
													<Tooltip
														isDisabled={
															customSettings.scoring_settings[setting] ==
															context.settings.scoring_settings[setting]
														}
														label={
															'Original Value: ' +
															context.settings.scoring_settings[setting]
														}
														placement={'top'}
													>
														<NumberInputField
															bg={'surface.2'}
															_hover={{background: 'surface.3'}}
															id={setting}
															onChange={onInputChange}
														/>
													</Tooltip>
												</NumberInput>
											</Center>
										)
									})}
							</VStack>
						)}
					</DrawerBody>

					<DrawerFooter>
						<Button size={'sm'} onClick={onClose} variant='ghost'>
							Close
						</Button>
						<Button
							size={'sm'}
							onClick={onApplyPressed}
							colorScheme={'primary'}
						>
							Apply
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	)
}

function formatScoreKey(key: string) {
	return key.replaceAll('_', ' ')
}
