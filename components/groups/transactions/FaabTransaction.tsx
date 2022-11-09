import { Heading, HStack, Icon } from "@chakra-ui/react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface MyProps {
  cash: number;
}

export default function FaabTransaction(props: MyProps) {
  let addDropIcon;
  let iconColor;
  if (props.cash > 0) {
    addDropIcon = FaPlus;
    iconColor = "green";
  } else if (props.cash < 0) {
    addDropIcon = FaMinus;
    iconColor = "red";
  }

  return (
    <HStack>
      {<Icon color={iconColor} as={addDropIcon} />}
        <Heading fontSize="sm" as={"b"}>{Math.abs(props.cash)}</Heading>
    </HStack>
  );
}