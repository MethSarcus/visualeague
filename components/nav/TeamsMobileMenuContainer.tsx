import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  IconButton,
  useDisclosure,
  Avatar,
  Center,
  Heading,
  VStack,
  StackDivider,
  Collapse,
  Fade,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import LeagueMember from "../../classes/custom/LeagueMember";
import { Context } from "../../contexts/Context";
import LeagueMemberButton from "../cards/LeagueMemberButton";
import MemberList from "../groups/MemberList";

interface MyProps {
  onclose: () => void;
}
export default function TeamsMobileMenuContainer(props: MyProps) {
  const [context, setContext] = useContext(Context);
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Button
        onClick={onToggle}
        variant={"unstyled"}
        _hover={{ textColor: "grey" }}
      >
        Teams
      </Button>
      <Collapse in={isOpen} animateOpacity>
        {context &&
          context.settings != undefined &&
          Array.from(
            context.members as Map<number, LeagueMember>,
            ([key, value]) => value
          ).map((member: LeagueMember) => {
            return (
              <LeagueMemberButton
                onclose={props.onclose}
                key={member.userId}
                member={member}
                leagueId={context.settings.league_id}
              />
            );
          })}
      </Collapse>
    </>
  );
}

function formatScoreKey(key: string) {
  return key.replaceAll("_", " ");
}
