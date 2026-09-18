// __tests__/index.test.jsx

import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import {ChakraProvider} from '@chakra-ui/react'
import Page from '../app/page'
import customTheme from '../theme'
import type * as ReactDom from 'react-dom';

jest.mock('react-dom', () => ({
  ...jest.requireActual<typeof ReactDom>('react-dom'),
  preload: jest.fn(),
}));

describe('Home', () => {
	// afterEach function runs after each test suite is executed
	afterEach(() => {
		cleanup() // Resets the DOM after each test suite
	})
	it('Renders Form', () => {
		render(
			<ChakraProvider theme={customTheme}>
				<Page />
			</ChakraProvider>
		)
		jest.spyOn(window.localStorage.__proto__, 'setItem')
		const form = screen.getByTestId('username_form')
		let input = screen.getByTestId('username_input')
		expect(input).toBeInTheDocument()
		expect(form).toBeInTheDocument()
	})

	it('Saves Username', () => {
		jest.spyOn(window.localStorage.__proto__, 'setItem')
		render(
			<ChakraProvider theme={customTheme}>
				<Page />
			</ChakraProvider>
		)

		let input = screen.getByTestId('username_input')
		fireEvent.change(input, {target: {value: 'MethSarcus'}})
		fireEvent.click(screen.getByTestId('username_submit'))

		expect(localStorage.setItem).toHaveBeenCalled()
		expect(localStorage.getItem('usernames')).toContain('methsarcus')
	})
})
