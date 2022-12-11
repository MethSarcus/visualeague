"use client"
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack
} from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import League from "../../../../classes/custom/League";
import Trade from "../../../../classes/custom/Trade";
import { SleeperTransaction } from "../../../../classes/sleeper/SleeperTransaction";
import TradeCard from "../../../../components/cards/TradeCard";
import WorstTradeCard from "../../../../components/cards/WorstTradeCard";
import TradeChordChart from "../../../../components/charts/TradeChordChart";
import { Context } from "../../../../contexts/Context";
  
  export default function Page() {
    const [context, setContext] = useContext(Context)
    const fetcher = (url: string) => axios.get(url).then((res) => res.data);
    const leagueId = usePathname()?.replace("/league/","").replace("/trades", "");
    const desktopTemplate = `
    "chart chart trades trades"
    "chart chart trades trades"
    "imba imba trades trades"`

    const mobileTemplate = `
    "chart"
    "imba"
    "trades"`
  
    if ((context as League).trades == undefined) return <Heading color={"white"}>Loading</Heading>;
  
    let sortedTrades = context.getSortedTrades()
    return (
      <Box maxW={"container.xl"} p={[0, "auto"]} m={[0, "auto"]}>
        <Grid
          templateAreas={[mobileTemplate, desktopTemplate]}
          maxH={"full"}
          gap={0}
        >
      <GridItem height={"500px"} area={'chart'} p={10} m={0}>
        <TradeChordChart trades={sortedTrades} />
      </GridItem>
      <GridItem mx={4} area="imba" >      <WorstTradeCard trade={sortedTrades[0]} title={"Most Imbalanced Trade"}/>
      <WorstTradeCard trade={sortedTrades[1]} title={"Second Most Imbalanced Trade"}/></GridItem>
      <GridItem  area="trades" >
      
      <Container textColor={"white"} overflowY={"scroll"} color='white'>
      <Text color={"white"}>Trades</Text>
      <VStack maxH={"800px"} overflowY={"auto"} align={'stretch'}>
      {context.getTradeScoreSortedTrades().map((trade: Trade) => {
              return <TradeCard key={trade.transaction_id} trade={trade} />;
            })}
      </VStack>

    </Container>
  
            </GridItem>
            {/* <GridItem color={"black"} area="chart">
              <TradeChordChart trades={trades} />
            </GridItem>
            <GridItem textColor={"white"} colSpan={2} rowSpan={1} area="trades">
            {trades.map((trade: SleeperTransaction) => {
              return <TradeCard key={trade.transaction_id} trade={trade} />;
            })}
            </GridItem> */}
        </Grid>
      </Box>
    );
  };
  