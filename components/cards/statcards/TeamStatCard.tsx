"use client";
import { Box, Container, Flex, SkeletonText } from "@chakra-ui/react";

type MyProps = {
  statName?: String | null | undefined;
  statValue?: String | null | undefined;
  statOwner?: String | null | undefined;
  isLoaded: boolean;
  isGoodThing: boolean | null | undefined;
};

const TeamStatCard = (props: MyProps) => {
  let borderColor = "#B00020";

  if (props.isGoodThing == null || props.isGoodThing == undefined) {
    borderColor = "grey";
  } else if (props.isGoodThing == true) {
    borderColor = "rgb(151,245,143, .8)";
  }
  return (
    <Box
      p={2}
      textAlign={"center"}
      bg={"surface.0"}
      border={"1px"}
      borderRadius={4}
      boxShadow={"2xl"}
      data-testid="team_stat_card_container"
      borderTop="2px"
      borderTopColor={borderColor}
    >
      <SkeletonText noOfLines={3} spacing={1} isLoaded={props.isLoaded}>
        <Box
          data-testid="team_stat_card_stat_name"
          fontWeight="bold"
          fontSize={".8em"}
          color={"textTheme.highEmphasis"}
        >
          {props.statName}
        </Box>
        <Box
          data-testid="team_stat_card_owner"
          fontSize={".9em"}
          fontWeight={"medium"}
          color={"textTheme.highEmphasis"}
        >
          {props.statOwner}
        </Box>
        <Box
          fontSize={".8em"}
          fontWeight="light"
          color={"textTheme.mediumEmphasis"}
          data-testid="team_stat_card_stat_value"
        >
          {props.statValue}
        </Box>
      </SkeletonText>
    </Box>
  );
};

export default TeamStatCard;
