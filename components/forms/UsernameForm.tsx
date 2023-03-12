'use client'
import {
	Box,
	Button,
	Collapse,
	Container,
	Fade,
	Input,
	ScaleFade,
	SlideFade,
	Wrap,
	WrapItem,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import {useEffect, useState} from 'react'
import LeagueCellGroup from './LeagueCellGroup'

function UsernameForm() {
	const [text, setText] = useState('')
	const [usernameSubmitted, setUsernameSubmitted] = useState(false)
	const [storedUsernames, setStoredUsernames] = useState(new Array())

	useEffect(() => {
		if ('usernames' in localStorage) {
			setStoredUsernames(
				JSON.parse(localStorage.getItem('usernames') as string)
			)
		}
	}, [])

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
				<Input
					list={'data'}
					variant='outline'
					placeholder='Sleeper Username'
					data-testid='username_input'
					size='lg'
					p={5}
					display='inline-block'
					mt={[0, 3]}
					value={text}
					onChange={(e) => textChanged(e.target.value)}
				/>
				<Collapse in={!usernameSubmitted}>
					<Button
						variant='solid'
						size='sm'
						type='submit'
						data-testid='username_submit'
						p={4}
						backgroundColor='primary.500'
						color='#000000'
						textColor={'white'}
						mt={4}
						h={6}
					>
						Submit
					</Button>
					<Link
						href='https://github.com/MethSarcus/visualeague/issues/new/choose'
						target='_blank'
						rel='noreferrer'
					>
						<Button
							variant='ghost'
							size='sm'
							ml={2}
							p={4}
							colorScheme='red'
							mt={4}
							h={6}
						>
							Report Bug
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
						username={text}
					/>
				</Box>
			</Collapse>
			<Collapse
				data-testid='saved_username_container'
				in={!usernameSubmitted && storedUsernames.length > 0}
			>
				<Box pt={6}>Recent Searches</Box>
				<Wrap pt={2}>
					{storedUsernames.map((item, index) => {
						return (
							<WrapItem onClick={() => setText(item)} key={item}>
								<ScaleFade in={true} initialScale={0.01}>
									<Button colorScheme={'secondary'} size={'xs'}>
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
