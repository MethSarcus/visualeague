import { Flex, Spacer, VStack } from "@chakra-ui/react";
import CustomSleeperLeague from "../../classes/custom/League";
import GenericStatCard from "../cards/statcards/GenericStatCard";

interface MyProps {
  league: CustomSleeperLeague;
}

const BaseStatsLayout = (props: MyProps) => {
  return (
    <Flex h={'100%'}>
    <VStack>
      <GenericStatCard
        statName={"Highest PF"}
        statValue={"100"}
      />
      <Spacer/>
      <GenericStatCard
        statName={"Lowest PF"}
        statValue={"100"}
      />
    </VStack>
    <Spacer />
    <VStack>
      <GenericStatCard
        statName={"Highest PF"}
        statValue={"100"}
      />
      <Spacer/>
      <GenericStatCard
        statName={"Lowest PF"}
        statValue={"100"}
      />
    </VStack>
    </Flex>
  );
};

export default BaseStatsLayout;
