"use client";
import { Box, Container, HStack, SimpleGrid } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import TradeCard from "../../cards/TradeCard";

type MyProps = {
  league: League | undefined;
  memberId: number | undefined | string;
};

const MemberTradeGroup = (props: MyProps) => {
  let id = props.memberId;

  if (id != undefined) {
    id = parseInt(id + "");
  }
  return (
    <Box
      textColor={"white"}
      overflowY={"auto"}
      color="white"
    >
      {props.league?.transactions &&
        props.league?.transactions
          ?.filter((transaction) => {
            return transaction.consenter_ids.includes(id as number);
          })
          .map((transaction, index) => {
            return <TradeCard key={index} trade={transaction} />;
          })}
    </Box>
  );
};

export default MemberTradeGroup;
