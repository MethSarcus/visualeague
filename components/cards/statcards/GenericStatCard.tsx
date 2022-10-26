import React, { useContext, useEffect } from "react";
import { Box, Center, Container, Flex, Spacer, Text } from "@chakra-ui/react";
import { DraftPick } from "../../../classes/sleeper/DraftPick";
import { render } from "react-dom";
import { Context } from "../../../contexts/Context";
import CustomSleeperLeague from "../../../classes/custom/League";

type MyProps = { statName: String; statValue: String, league: CustomSleeperLeague };

const GenericStatCard = (props: MyProps) => {
  const [context, setContext] = useContext(Context);

  useEffect(() => {
    if (context.settings) {
      props.league.changeName("testName")
    }
  }, [context, context.settings, props.league, setContext]);


  return (
    <Box
      my={1}
      p={4}
      bg={"surface.1"}
      maxW="xs"
      fontSize={"lg"}
      borderRadius={10}
      boxShadow={"2xl"}
      color="white"
    >
      <Text>{context.settings.name}</Text>
      <Text>{props.statValue}</Text>
    </Box>
  );
};

export default GenericStatCard;

export const OrdinalStatCard = (props: MyProps) => {
  return (
    <Flex
      my={1}
      py={3}
      px={0}
      bg={"surface.1"}
      maxW="xs"
      borderRadius={10}
      boxShadow={"2xl"}
      color="white"
      alignItems={"left"}
    >
      <Center>
        <Box mx={2} bg={"surface.2"} alignItems={"start"} fontWeight={"bold"} fontSize={"lg"} p={2}>1st</Box>
        <Box >
          <Text fontSize={"md"}>{props.statName}</Text>
          <Text fontSize={"sm"}>{props.statValue}</Text>
        </Box>
      </Center>
      <Spacer></Spacer>
    </Flex>
  )
}
