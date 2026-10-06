import { Heading, HStack, Icon } from "@chakra-ui/react";
import { useContext } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { TradedPick } from "../../../classes/sleeper/DraftPick";
import { LeagueContext } from "../../../contexts/LeagueContext";
import { ordinal_suffix_of } from "../../../utility/rosterFunctions";

interface MyProps {
  pick: TradedPick;
  added: boolean;
}

export default function DraftPickTransaction(props: MyProps) {
  const [league] = useContext(LeagueContext);
  let addDropIcon;
  let iconColor;
  if (props.added) {
    addDropIcon = FaPlus;
    iconColor = "green";
  } else if (props.added == false) {
    addDropIcon = FaMinus;
    iconColor = "red";
  }

  const originalOwner = league?.members?.get(props.pick.roster_id)?.name ?? `Team ${props.pick.roster_id}`
  const pickValue = `${props.pick.season} ${ordinal_suffix_of(props.pick.round)} (${originalOwner})`

  return (
    <HStack>
      {<Icon h={3} color={iconColor} as={addDropIcon} />}
        <Heading fontSize="xs">{pickValue}</Heading>
    </HStack>
  );
}
