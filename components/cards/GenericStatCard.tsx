import React from "react";
import { Box, Container, Text } from "@chakra-ui/react";
import { DraftPick } from "../../interfaces/sleeper_api/DraftPick";
import { render } from "react-dom";

type MyProps = { statName: String; statValue: String };

const GenericStatCard = (props: MyProps) => {
  return (
    <Box bg={"primary.500"} maxW="xs">
      <Text px={2} py={1}>
        {props.statName}
      </Text>
      <Text px={2} py={1}>
        {props.statValue}
      </Text>
    </Box>
  );
};

export default GenericStatCard;
