"use client";
import {
  Box,
  Collapse,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Skeleton,
  Spacer,
} from "@chakra-ui/react";
import { useContext } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import WeeklyRankingBumpChart from "../../../../components/charts/BumpChart";
import BarChart from "../../../../components/charts/bar/PFBarChart";
import PowerRankingBumpChart from "../../../../components/charts/PowerRankingBumpChart";
import HomeStatGroup from "../../../../components/groups/stats/HomeStatGroup";
import LeagueOverviewDataTable from "../../../../components/tables/LeagueOverviewDatatable";
import { Context } from "../../../../contexts/Context";

export default function RankPage() {
  const [context, setContext] = useContext(Context);
  return (
    <Box overflowX={"hidden"} w={"full"} height={"full"}>
      <Grid
        gap={3}
        mx={4}
        my={2}
        templateAreas={`  "header"
                            "bump_chart"
                            `}
        gridTemplateColumns={"1fr"}
        gridTemplateRows={"60px 1fr"}
      >
        <GridItem area={"header"}>
          <Skeleton
            fontWeight="black"
            mx={10}
            isLoaded={context.settings != undefined}
          >
            <Heading
              textAlign={"center"}
              py={2}
              size={"md"}
              m={2}
              color={"white"}
            >
              Power Ranks
            </Heading>
          </Skeleton>
        </GridItem>
        <GridItem area={"bump_chart"} height={"500px"}>
          <WeeklyRankingBumpChart league={context} />
        </GridItem>
      </Grid>
    </Box>
  );
}
