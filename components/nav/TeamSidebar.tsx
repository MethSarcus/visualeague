"use client"
import {
  Button, Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader, DrawerOverlay, useDisclosure
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { usePathname } from 'next/navigation'
import { LeagueContext } from "../../contexts/LeagueContext";
import MemberList from "../groups/MemberList";
import { project_colors } from "../../utility/project_colors";

export default function TeamSidebar() {
  const [context, setContext] = useContext(LeagueContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathName = usePathname();

  return (
    <>
      {context.settings && (
                <Button
                onClick={onOpen}
                transition={"all .2s ease"}
                isActive={pathName?.includes("/team")}
                _active={
                  { bg: project_colors.secondary[500]}
                }
                _hover={{
                  backgroundColor: "secondary.600",
                  cursor: "pointer",
                }}
                  size={"md"}
                  borderRadius={0}
                  fontWeight={"semibold"}
                  colorScheme={"secondary_inverted"}
                  textColor="white"
                  variant="ghost"
              >
                Teams
              </Button>
      )}
      <Drawer isOpen={isOpen} placement="left"  onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={"surface.1"} textColor="white">
          <DrawerCloseButton />
          <DrawerHeader>
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

function formatScoreKey(key: string) {
  return key.replaceAll("_", " ");
}
