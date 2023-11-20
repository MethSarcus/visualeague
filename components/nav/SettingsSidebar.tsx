'use client'
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
import {produce} from 'immer'
import React, {useContext, useEffect} from 'react'
import {GoGear} from 'react-icons/go'
import League from '../../classes/custom/League'
import LeagueMember from '../../classes/custom/LeagueMember'
import MemberScores from '../../classes/custom/MemberStats'
import {DatabasePlayer, PlayerScores, SleeperPlayerDetails} from '../../classes/custom/Player'
import {LeagueSettings, ScoringSettings} from '../../classes/sleeper/LeagueSettings'
import {LeagueContext} from '../../contexts/LeagueContext'
import {PlayerDetailsContext} from '../../contexts/PlayerDetailsContext'
import {PlayerScoresContext} from '../../contexts/PlayerScoresContext'
import {getReadableScoringKey} from '../../utility/rosterFunctions'
import ScoringInputField from '../forms/ScoringInputField'

interface MyProps {
	leagueSettings: LeagueSettings
}

const SettingsSidebar = (props: MyProps) => {
	const [context, setContext] = useContext(LeagueContext)
	const [playerDetails, setPlayerDetails] = useContext(PlayerDetailsContext) as [
		Map<string, DatabasePlayer>,
		any
	]

	const {isOpen, onOpen, onClose} = useDisclosure()
	const [customSettings, setCustomSettings] = React.useState(props.leagueSettings.scoring_settings)
	const [customScoringChecked, setCustomScoringChecked] = React.useState(context.settings.useModifiedSettings)
	const [taxiIncludedMaxPfChecked, setTaxiIncludedMaxPfChecked] = React.useState(
		context.settings.taxiIncludedInMaxPf
	)

	function onCheckboxClick(e: any) {
		setCustomScoringChecked(e.target.checked)
	}

	function onTaxiCheckboxChanged(e: any) {
		setTaxiIncludedMaxPfChecked(e.target.checked)
	}

	const onInputChange = async (e: {target: {id: string | number; value: string}}) => {
		setCustomSettings(
			produce(customSettings, (draftState: ScoringSettings) => {
				;(draftState as any)[e.target.id] = parseFloat(e.target.value)
			})
		)
	}
	useEffect(() => {
		// call an API and in the success or failure fill the data buy using setData function
		// it could be like below
		if (context.settings != undefined) {
			setTaxiIncludedMaxPfChecked(context.taxiIncludedInMaxPf)
		}
	}, [context.settings, context.taxiIncludedInMaxPf])

	const onApplyPressed = () => {
		let scoringSettings = props.leagueSettings.scoring_settings
		if (customScoringChecked) {
			scoringSettings = customSettings
		}

		let playerScores = new Map<string, PlayerScores>()
		playerDetails.forEach((player: DatabasePlayer) => {
			let playerObj = new PlayerScores(
				player,
				scoringSettings,
				props.leagueSettings.settings.start_week,
				props.leagueSettings.settings.last_scored_leg
			)
			// playerDetails.set(player._id, player)
			playerScores.set(player._id, playerObj)
		})

		let league = new League(
			context?.userData,
			context?.allMatchups,
			context?.settings,
			playerScores,
			playerDetails,
			context.draft,
			context?.trades,
			customSettings
		)

		setContext(league)
	}

	return (
		<>
			<IconButton
				size={'sm'}
				color={"secondary.600"}
				background={'none'}
				disabled={context.settings == undefined}
				_hover={{background: 'secondary.900'}}
				icon={<GoGear />}
				onClick={onOpen}
				aria-label={'settings'}
			/>

			<Drawer isOpen={isOpen} placement='right' onClose={onClose}>
				<DrawerOverlay />
				<DrawerContent bg={'surface.1'} textColor='white'>
					<DrawerCloseButton />
					<DrawerHeader>
						Settings
						<br />
						{context && (
							<FormControl mt={4} display='flex' flexDirection={'column'} alignItems='stretch'>
								<Flex
									mt={2}
									visibility={
										((context as League)?.settings?.settings.taxi_slots ?? 0) > 0 ? 'visible' : 'collapse'
									}>
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
									<Switch id='customSettings' isChecked={customScoringChecked} onChange={onCheckboxClick} />
								</Flex>
							</FormControl>
						)}
					</DrawerHeader>
					<DrawerBody>
						{context.settings && (
							<VStack align={'start'}>
								{Object.keys(context.settings.scoring_settings)
									.sort(function (a, b) {
										return a.localeCompare(b)
									})
									.map((setting) => {
										return (
											<ScoringInputField
												key={setting}
												settingKey={setting}
												originalValue={
													props.leagueSettings.scoring_settings[setting as keyof ScoringSettings] ?? 0
												}
												settingValue={customSettings[setting as keyof ScoringSettings] ?? 0}
												customScoringChecked={customScoringChecked}
												onInputChange={onInputChange}
											/>
										)
									})}
							</VStack>
						)}
					</DrawerBody>

					<DrawerFooter>
						<Button size={'sm'} onClick={onClose} variant='ghost'>
							Close
						</Button>
						<Button size={'sm'} onClick={onApplyPressed} colorScheme={'primary'}>
							Apply
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	)
}

export default SettingsSidebar
