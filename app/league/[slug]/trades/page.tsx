'use client'
import {
	Box,
	Center,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
	Text,
	VStack,
} from '@chakra-ui/react'
import axios from 'axios'
import type {NextPage} from 'next'
import {usePathname} from 'next/navigation'
import {useContext, useEffect, useState} from 'react'
import useSWR from 'swr'
import League from '../../../../classes/custom/League'
import Trade from '../../../../classes/custom/Trade'
import {SleeperTransaction} from '../../../../classes/sleeper/SleeperTransaction'
import TradeCard from '../../../../components/cards/TradeCard'
import WorstTradeCard from '../../../../components/cards/WorstTradeCard'
import WeeklyTradesLineChart from '../../../../components/charts/line/WeeklyTradesLineChart'
import TradeChordChart from '../../../../components/charts/TradeChordChart'
import {LeagueContext} from '../../../../contexts/LeagueContext'

const Page = () => {
	const [context, setContext] = useContext(LeagueContext)
	const desktopTemplate = `
    "imba imba trades trades"
    "imba imba trades trades"
    "chart chart trades trades"
	"weeklyTradesChart weeklyTradesChart tradeBarGraph tradeBarGraph"`

	const mobileTemplate = `
    "chart"
    "imba"
	"tradeBarGraph"
    "trades"
	"weeklyTradesChart"`

	const [trades, setTrades] = useState([] as Trade[])

	useEffect(() => {
		if (context.settings) {
			let sortedTrades = (context as League).getTradeScoreSortedTrades() as Trade[]
			setTrades(sortedTrades)
		}

	}, [context])

	if (!(context as League)?.trades || !context?.settings)
		return <Heading color={'white'}>Loading</Heading>

	return (
		<Box maxW={'container.xl'} p={[0, 'auto']} m={[0, 'auto']}>
			<Grid
				templateAreas={[mobileTemplate, desktopTemplate]}
				maxH={'full'}
				gap={0}
			>
				<GridItem height={'500px'} area={'chart'} p={10} m={0}>
					<TradeChordChart trades={(context as League).getTradeScoreSortedTrades()} />
				</GridItem>
				<GridItem mx={4} area='imba'>
					<WorstTradeCard
						trade={trades.at(0)}
						title={'Most Imbalanced Trade'}
					/>
					<Box mt={4}>
						<WorstTradeCard
							trade={trades.at(1)}
							title={'Second Most Imbalanced Trade'}
						/>
					</Box>
				</GridItem>
				<GridItem area='trades'>
					<Container textColor={'white'} overflowY={'scroll'} color='white'>
						<Text color={'white'}>Trades</Text>
						<VStack maxH={'800px'} overflowY={'auto'} align={'stretch'}>
							{trades.map((trade: Trade) => {
								return <TradeCard key={trade.transaction_id} trade={trade} />
							})}
						</VStack>
					</Container>
				</GridItem>
				<GridItem area='weeklyTradesChart' height={"300px"}>
					<Center color={"white"} p={3}>Weekly Trades</Center>
					<WeeklyTradesLineChart trades={(context as League).trades}/>
				</GridItem>
			</Grid>
		</Box>
	)
}

export default Page