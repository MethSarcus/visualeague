import { Box, Center, Flex, Spacer, Spinner, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { ResponsiveBump } from "@nivo/bump";
import CustomSleeperLeague from "../../classes/custom/League";
import LeagueMember from "../../classes/custom/LeagueMember";
import {
  getPositionColor,
  POSITION,
  project_colors,
} from "../../utility/rosterFunctions";
import LeagueMemberCard from "../cards/LeagueMemberCard";
import GenericStatCard from "../cards/statcards/GenericStatCard";

interface MyProps {
  members: Map<number, LeagueMember>;
  callback: Function
}

const MemberList = (props: MyProps) => {

    let memberButtons = [] as any
    props.members.forEach((member, key) => {
        memberButtons.push(<LeagueMemberCard member={member}/>)
    })
  return (<VStack align="stretch" spacing={2} mx={5}>
      {memberButtons}
    </VStack>
  );
};

export default MemberList;
