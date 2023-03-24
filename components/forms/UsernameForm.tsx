'use client'
import {
	Box,
	Button,
	Center,
	Collapse,
	Container,
	Fade,
	HStack,
	Input,
	ScaleFade,
	Select,
	SlideFade,
	Spacer,
	Wrap,
	WrapItem,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import {useEffect, useState} from 'react'
import {project_colors} from '../../utility/project_colors'
import LeagueCellGroup from './LeagueCellGroup'

function UsernameForm() {
	const [text, setText] = useState('')
	const [usernameSubmitted, setUsernameSubmitted] = useState(false)
	const [storedUsernames, setStoredUsernames] = useState(new Array())
	const [selectedSeason, setSelectedSeason] = useState(2022)

	useEffect(() => {
		if ('usernames' in localStorage) {
			setStoredUsernames(
				JSON.parse(localStorage.getItem('usernames') as string)
			)
		}
	}, [])

	function onSeasonChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setSelectedSeason(parseInt(e.target.value))
	}

	const onStorageCleared = () => {
		localStorage.clear()
		setStoredUsernames([])
		setText('')
	}

	const onFormSubmit = (e: React.SyntheticEvent) => {
		e.preventDefault()
		setUsernameSubmitted(true)
		if (!storedUsernames.includes(text.toLowerCase()) && text != '') {
			storedUsernames.push(text.toLowerCase())
			localStorage.setItem('usernames', JSON.stringify(storedUsernames))
		}
	}

	const textChanged = (username: string) => {
		if (usernameSubmitted) {
			setUsernameSubmitted(false)
		}
		setText(username)
	}

	return (
		<Container data-testid='username_form'>
			<form onSubmit={onFormSubmit}>
				<HStack mt={[0, 3]}>
				<Input
					list={'data'}
					variant='outline'
					placeholder='Sleeper Username'
					data-testid='username_input'
					size={['md', 'lg']}
					display='inline-block'

					value={text}
					onChange={(e) => textChanged(e.target.value)}
				/>
				<Select size={['sm','lg']} maxW={["80px", "100px"]} onChange={onSeasonChange}>
				<option value='2022'>2022</option>
				<option value='2021'>2021</option>
				<option value='2020'>2020</option>
				<option value='2019'>2019</option>
				</Select>
				</HStack>

				<Collapse in={!usernameSubmitted}>
					<Button
						variant='solid'
						size='sm'
						type='submit'
						data-testid='username_submit'
						p={4}
						backgroundColor='secondary.500'
						_hover={{background: project_colors.secondary[800]}}
						color='#000000'
						textColor={'white'}
						mt={4}
						h={6}
					>
						Submit
					</Button>

					<Spacer />

					<Link
						href='https://github.com/MethSarcus/visualeague/issues/new/choose'
						target='_blank'
						rel='noreferrer'
					>
						<Button
							variant='outline'
							size='xs'
							textColor={project_colors.textTheme.highEmphasis}
							borderColor={project_colors.statColor.bad}
							_hover={{background: project_colors.statColor.bad}}
							p={3}
							colorScheme='red'
							mt={6}
							h={6}
						>
							Report Bug
						</Button>
					</Link>
					<Link
						href={`/league/842160100956274688`}
						style={{textDecoration: 'none'}}
					>
						<Button
							variant='outline'
							size='xs'
							ml={2}
							data-testid='demo'
							p={3}
							_hover={{background: project_colors.primary[800]}}
							borderColor='primary.500'
							color='#000000'
							textColor={project_colors.textTheme.highEmphasis}
							mt={6}
						>
							Demo
						</Button>
					</Link>
				</Collapse>
			</form>

			<Collapse in={usernameSubmitted}>
				<Box pt={6}>
					<Box as='h1' mb={1}>
						Leagues
					</Box>
					<LeagueCellGroup
						usernameSubmitted={usernameSubmitted}
						selectedSeason={selectedSeason}
						username={text}
					/>
				</Box>
			</Collapse>
			<Collapse
				data-testid='saved_username_container'
				in={!usernameSubmitted && storedUsernames.length > 0}
			>
				<Box textColor={project_colors.textTheme.mediumEmphasis} pt={6}>
					Recent Searches
				</Box>
				<Wrap pt={2}>
					{storedUsernames.map((item, index) => {
						return (
							<WrapItem onClick={() => setText(item)} key={item}>
								<ScaleFade in={true} initialScale={0.01}>
									<Button
										textColor={project_colors.textTheme.highEmphasis}
										borderColor='secondary.800'
										backgroundColor={project_colors.secondary[800]}
										colorScheme={'secondary'}
										variant={'solid'}
										size={'xs'}
									>
										{item}
									</Button>
								</ScaleFade>
							</WrapItem>
						)
					})}
				</Wrap>
				<Button
					variant={'outline'}
					colorScheme={'primary'}
					textColor={project_colors.textTheme.mediumEmphasis}
					borderColor='secondary.800'
					_hover={{
						background: project_colors.secondary[900],
						textColor: project_colors.textTheme.highEmphasis,
					}}
					mt={3}
					size={'xs'}
					onClick={onStorageCleared}
				>
					Clear
				</Button>
			</Collapse>
		</Container>
	)
}

export default UsernameForm
