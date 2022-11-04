import { VStack } from "@chakra-ui/react";
import LeagueMember from "../../classes/custom/LeagueMember";
import LeagueMemberCard from "../cards/LeagueMemberCard";

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
