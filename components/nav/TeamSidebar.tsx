"use client"
import {
  Button, Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader, DrawerOverlay, useDisclosure
} from "@chakra-ui/react";
import { useContext } from "react";
import { usePathname } from 'next/navigation'
import { LeagueContext } from "../../contexts/LeagueContext";
import MemberList from "../groups/MemberList";

const TeamSidebar = () => {
  const [context] = useContext(LeagueContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathName = usePathname();

  return (
    <>
      {context.settings && (
                <Button
                onClick={onOpen}
                transition={"all .18s ease"}
                isActive={pathName?.includes("/team")}
                bg={pathName?.includes("/team") ? "whiteAlpha.200" : "transparent"}
                color={pathName?.includes("/team") ? "white" : "textTheme.mediumEmphasis"}
                _active={{ bg: "secondary.700" }}
                _hover={{ backgroundColor: "whiteAlpha.100", cursor: "pointer" }}
                  size={"sm"}
                  borderRadius={"md"}
                  fontWeight={"semibold"}
                  variant="ghost"
              >
                Teams
              </Button>
      )}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay bg="blackAlpha.700" />
        <DrawerContent bg={"surface.0"} textColor="white" borderRight="1px solid" borderColor="whiteAlpha.200">
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor="whiteAlpha.200">
            Teams
            <br />
          </DrawerHeader>
          <DrawerBody p={0}>
          { context != undefined && context.settings && (<MemberList onclick={onClose} members={context.members} leagueId={context.settings.league_id}/>)}
            
          </DrawerBody>

          <DrawerFooter>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default TeamSidebar