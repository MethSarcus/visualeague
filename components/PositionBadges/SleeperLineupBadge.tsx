import { Center, useStyleConfig, Text, Box, Square, Wrap, SimpleGrid, HStack } from "@chakra-ui/react";
import { project_colors } from "../../utility/project_colors";
import {
  getRosterSlotPositions,
  LINEUP_POSITION,
} from "../../utility/rosterFunctions";

type MyProps = {
  slotPosition: LINEUP_POSITION;
};

const SleeperLineupBadge = (props: MyProps) => {
  if (getRosterSlotPositions(props.slotPosition).length == 1) {
    return (
      <Square
        borderRadius={5}
        fontSize={".8em"}
        p={1.5}
        fontWeight={"bold"}
        size='32px'
        bg={project_colors.sleeper.badge_background}
        color={
          project_colors.position[getRosterSlotPositions(props.slotPosition)[0]]
        }
      >
        {props.slotPosition}
      </Square>
    );
  } else {
    return (
      <Square
        borderRadius={5}
        fontSize={".7em"}
        size='32px'
        bg={project_colors.sleeper.badge_background}
      >
        {makeFlexCharColorSpan(props.slotPosition)}
      </Square>
    );
  }
};

function makeFlexCharColorSpan(slotId: LINEUP_POSITION) {
    if (slotId == "BN") {
        return <Text fontWeight={"bold"} textAlign={"center"} p={0}>BN</Text>
    }
  let positions = getRosterSlotPositions(slotId);
  let chars = positions.map((position, index) => {
    return (
      <Box key={position.toString()} color={project_colors.position[position]}>
        {position.toString().charAt(0)}
      </Box>
    );
  });
  if (slotId == LINEUP_POSITION.SUPER_FLEX) {
    return <SimpleGrid fontWeight={"bold"} textAlign={"center"} columns={2} p={0} spacing={"0px"}>{chars}</SimpleGrid>;
  } else {
    return <HStack fontWeight={"bold"} spacing={"1px"} textAlign={"center"} p={0}>{chars}</HStack>;
  }

  
}

export default SleeperLineupBadge;
