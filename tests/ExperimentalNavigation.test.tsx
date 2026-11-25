import '@testing-library/jest-dom'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {ChakraProvider} from '@chakra-ui/react'
import Navbar from '../components/nav/Navbar'
import {LeagueContext} from '../contexts/LeagueContext'
import {PlayerDetailsContext} from '../contexts/PlayerDetailsContext'
import {PlayerScoresContext} from '../contexts/PlayerScoresContext'
import theme from '../theme'

jest.mock('next/navigation', () => ({usePathname: () => '/league/123'}))
jest.mock('../components/forms/ExpandableLeagueSearch', () => () => null)
jest.mock('../components/nav/TeamSidebar', () => () => null)
jest.mock('../components/nav/TeamsMobileMenuContainer', () => () => null)

afterEach(() => jest.restoreAllMocks())

it.each([
	['development', true],
	['production', false],
	['test', false],
] as const)('shows the experimental navigation only in development (%s)', (nodeEnv, visible) => {
	jest.replaceProperty(process, 'env', {...process.env, NODE_ENV: nodeEnv})
	render(<ChakraProvider theme={theme}>
		<LeagueContext.Provider value={[{}, jest.fn()]}>
			<PlayerDetailsContext.Provider value={[new Map(), jest.fn()]}>
				<PlayerScoresContext.Provider value={[new Map(), jest.fn()]}>
					<Navbar leagueID='123' isHistory />
				</PlayerScoresContext.Provider>
			</PlayerDetailsContext.Provider>
		</LeagueContext.Provider>
	</ChakraProvider>)

	const desktop = screen.queryByRole('button', {name: 'Experimental', hidden: true})
	if (visible) expect(desktop?.closest('a')).toHaveAttribute('href', '/league/123/experimental')
	else expect(desktop).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole('button', {name: 'menu', hidden: true}))
	const drawer = screen.getByRole('dialog')
	const mobile = within(drawer).queryByRole('button', {name: 'Experimental'})
	if (visible) expect(mobile?.closest('a')).toHaveAttribute('href', '/league/123/experimental')
	else expect(mobile).not.toBeInTheDocument()
	expect(within(drawer).getByRole('button', {name: 'League Summary'})).toBeInTheDocument()
})
