import { VStack } from "@chakra-ui/react";
import { ReactElement } from "react";
import LeagueMember from "../../classes/custom/LeagueMember";
import LeagueMemberButton from "../cards/LeagueMemberButton";

interface MyProps {
  members: Map<number, LeagueMember>;
  leagueId: string
  onclick: () => void
}

const MemberList = (props: MyProps) => {
    const memberButtons: ReactElement[] = []
    props.members.forEach((member, key) => {
        memberButtons.push(<LeagueMemberButton onclose={props.onclick} key={key} leagueId={props.leagueId} member={member}/>)
    })
  return (<VStack align="stretch" spacing={2} mx={5}>
      {memberButtons}
    </VStack>
  );
};

export default MemberList;
