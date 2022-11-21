import { Flex, Spacer, VStack } from "@chakra-ui/react";
import League from "../../classes/custom/League";
import GenericStatCard from "../cards/statcards/GenericStatCard";

interface MyProps {
  league: League;
}

const BaseStatsLayout = (props: MyProps) => {
  return (
    <Flex h={'100%'}>
    <VStack>
      <GenericStatCard
          statName={"Highest PF"}
          statValue={"100"} isLoaded={true} isGoodThing={false}      />
      <Spacer/>
      <GenericStatCard
          statName={"Lowest PF"}
          statValue={"100"} isLoaded={true} isGoodThing={false}      />
    </VStack>
    <Spacer />
    <VStack>
      <GenericStatCard
          statName={"Highest PF"}
          statValue={"100"} isLoaded={true} isGoodThing={false}      />
      <Spacer/>
      <GenericStatCard
          statName={"Lowest PF"}
          statValue={"100"} isLoaded={true} isGoodThing={false}      />
    </VStack>
    </Flex>
  );
};

export default BaseStatsLayout;
