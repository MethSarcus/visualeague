import { Avatar, Box, Center, Heading, HStack, Icon, Text } from "@chakra-ui/react";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import { FaPlus, FaMinus } from "react-icons/fa";
import { TradedPick } from "../../../classes/sleeper/DraftPick";
import { ordinal_suffix_of } from "../../../utility/rosterFunctions";

interface MyProps {
  pick: TradedPick;
  added: boolean;
}

export default function DraftPickTransaction(props: MyProps) {
  let addDropIcon;
  let iconColor;
  if (props.added) {
    addDropIcon = FaPlus;
    iconColor = "green";
  } else if (props.added == false) {
    addDropIcon = FaMinus;
    iconColor = "red";
  }

  const pickValue = `${props.pick.season} ${ordinal_suffix_of(props.pick.round)} (Team ${props.pick.roster_id})`

  return (
    <HStack>
      {<Icon h={3} color={iconColor} as={addDropIcon} />}
        <Heading fontSize="xs">{pickValue}</Heading>
    </HStack>
  );
}
