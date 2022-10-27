import { Box, Center, Flex, Spacer, Spinner, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { ResponsiveBump } from "@nivo/bump";
import CustomSleeperLeague from "../../classes/custom/League";
import LeagueMember from "../../classes/custom/LeagueMember";
import {
  getPositionColor,
  POSITION,
  project_colors,
} from "../../utility/rosterFunctions";
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
