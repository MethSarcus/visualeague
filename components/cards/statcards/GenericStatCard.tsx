"use client";
import { Box, Container, Flex, SkeletonText } from "@chakra-ui/react";

type MyProps = {
  statName?: String | null | undefined;
  statValue?: String | null | undefined;
  statOwner?: String | null | undefined;
  isLoaded: boolean;
  isGoodThing: boolean;
};

const GenericStatCard = (props: MyProps) => {
  return (
    <Box
      p={2}
      textAlign={"center"}
      bg={"surface.0"}
      border={"1px"}
      borderRadius={4}
      boxShadow={"2xl"}
      borderTop="2px"
      borderTopColor={props.isGoodThing ? "rgb(151,245,143, .8)" : "#B00020"}
    >

            <SkeletonText noOfLines={3} spacing={1} isLoaded={props.isLoaded}>
              <Box
                fontWeight="bold"
                fontSize={[".7em", "1em"]}
                color={"textTheme.highEmphasis"}
              >
                {props.statName}
              </Box>
              <Box
                fontSize={[".9em", "1em"]}
                fontWeight={"medium"}
                color={"textTheme.highEmphasis"}
              >
                {props.statOwner}
              </Box>
              <Box
                fontSize={[".7em", ".9em"]}
                fontWeight="light"
                color={"textTheme.mediumEmphasis"}
              >
                {props.statValue}
              </Box>
            </SkeletonText>
    </Box>
  );
};

export default GenericStatCard;
