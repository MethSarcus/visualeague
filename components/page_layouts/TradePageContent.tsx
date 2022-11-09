import { Box, Wrap, Heading, SimpleGrid, Container } from "@chakra-ui/react";
import axios from "axios";
import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import League from "../../classes/custom/League";
import { SleeperTransaction } from "../../classes/sleeper/SleeperTransaction";
import TradeCard from "../cards/TradeCard";


export default function TradePageContent() {
    const fetcher = (url: string) => axios.get(url).then((res) => res.data);
    const router = useRouter();
    const leagueId = router.query.league;
    const [trades, setTrades] = useState([])
    const { data: tradeData, error: tradeError } = useSWR(
      leagueId != undefined ? `/api/trades/${router.query.league}` : null,
      fetcher
    );

    useEffect(() => {
        if (tradeData && tradeData.trades) {
          console.log(tradeData);
          setTrades(tradeData.trades);
          console.log(trades);
        }
      }, [tradeData, setTrades, trades]);
    
      if (tradeError)
        return (
          <Heading color={"white"} >
            Failed to load
          </Heading>
        );
      if (!tradeData)
        return (
          <Heading color={"white"} >
            Loading...
          </Heading>
        );
    
    return (<Box textColor={"white"}>{trades.map((trade: SleeperTransaction) => {return <TradeCard key={trade.transaction_id} trade={trade}/>})}</Box>)
}

