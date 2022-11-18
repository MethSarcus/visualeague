"use client"
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  SkeletonText,
  Spacer,
} from "@chakra-ui/react";
import GenericStatCard from "../../../components/cards/statcards/GenericStatCard";

export default function Loading() {
  return (
    <Box overflowX={"hidden"}>
      <SkeletonText noOfLines={1} fontSize={"4xl"}>
        <Heading
          width={"100%"}
          textAlign={"center"}
          my={3}
          size={"sm"}
          color={"white"}
        >
          League Name
        </Heading>
      </SkeletonText>

      <Grid
        gap={2}
        m={4}
        templateAreas={`"pfStats pfStats pfStats"
                          "pfTable pfTable pfTable"
                          "pfChart pfChart pfChart"`}
        gridTemplateColumns={"1fr 1fr 1fr"}
      >
        <GridItem area={"pfStats"}>
          <Flex>
            <SkeletonText noOfLines={3} p={1} bg={"surface.1"}>
              {/* <GenericStatCard
                statName={"Best PF"}
                statValue={"1000"}
                statOwner={"Tom Cruise"}
              /> */}
            </SkeletonText>
            <Spacer />
            <SkeletonText noOfLines={3} p={1} bg={"surface.2"}>
              {/* <GenericStatCard
                statName={"Worst PA"}
                statValue={"1000"}
                statOwner={"Tom Cruise"}
              />
            </SkeletonText>
            <Spacer />
            <SkeletonText p={1} bg={"surface.3"} noOfLines={3}>
              <GenericStatCard
                statName={"Best Manager"}
                statValue={"1000"}
                statOwner={"Tom Cruise"}
              />
            </SkeletonText>
            <Spacer />
            <SkeletonText noOfLines={3}>
              <GenericStatCard
                statName={"Longest Streak"}
                statValue={"1000"}
                statOwner={"Tom Cruise"}
              /> */}
            </SkeletonText>
          </Flex>
        </GridItem>
        <GridItem area={"pfTable"} overflowX={"scroll"} borderRadius={4}>
          <SkeletonText noOfLines={12}>
            <Flex mx={4} />
          </SkeletonText>
        </GridItem>
        <GridItem area={"pfChart"}>few</GridItem>
      </Grid>
    </Box>
  );
}
