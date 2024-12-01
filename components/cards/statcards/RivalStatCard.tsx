"use client";
import { Avatar, Box, Container, Flex, SkeletonText, Spacer } from "@chakra-ui/react";

type MyProps = {
  statName?: String | null | undefined;
  statValue?: String | null | undefined;
  statOwner?: String | null | undefined;
  isLoaded: boolean;
  isGoodThing: boolean;
  avatar?: string
};

const RivalStatCard = (props: MyProps) => {
  return (
    <Flex
      p={2}
      flexDir={"column"}
      textAlign={"center"}
      bg={"surface.0"}
      border={"1px"}
      borderRadius={4}
      boxShadow={"2xl"}
      borderTop="2px"
      borderTopColor={props.isGoodThing ? "rgb(151,245,143, .8)" : "#B00020"}
    >
        <Spacer/>
            <SkeletonText noOfLines={3} spacing={1} isLoaded={props.isLoaded}>
              <Box
                fontWeight={"medium"}
                fontSize={[".6em", "1em"]}
                color={"textTheme.highEmphasis"}
              >
                {props.statName}
              </Box>
              <Avatar size={["sm", "md"]} my={1} src={props.avatar} />
              <Box
              fontWeight="bold"
                fontSize={[".9em", "1em"]}

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
            <Spacer/>
    </Flex>
  );
};

export default RivalStatCard;
