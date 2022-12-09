import { Box, Text } from "@chakra-ui/react";
import { useContext } from "react";
import Trade from "../../classes/custom/Trade";
import { Context } from "../../contexts/Context";
import TradeCard from "./TradeCard";

interface MyProps {
  trade: Trade | undefined
}

export default function WorstTradeCard(props: MyProps) {

  return (
    <Box color={"white"}>
      <Text>Most Imbalanced Trade</Text>
      {props.trade && <TradeCard trade={props.trade} />}
    </Box>
  );
}
