import { HamburgerIcon } from "@chakra-ui/icons";
import {
    Button, Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    Box,
    DrawerHeader, DrawerOverlay, Icon, IconButton, useDisclosure, Avatar, Center, Heading, VStack, StackDivider
  } from "@chakra-ui/react";
import Link from "next/link";
  import React, { useContext } from "react";
  import { Context } from "../../contexts/Context";
  import MemberList from "../groups/MemberList";
import TeamsMobileMenuContainer from "./TeamsMobileMenuContainer";
  
  export default function MobileSidebar() {
    const [context, setContext] = useContext(Context);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [customSettings, setCustomSettings] = React.useState(
      context.modifiedSettings
    );
    return (
      <>
        {context.settings && (
            <IconButton variant={"ghost"} icon={<HamburgerIcon />} onClick={onOpen} aria-label={"menu"}/>
        )}
        <Drawer isOpen={isOpen} placement="left"  onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg={"surface.1"} textColor="white">
            <DrawerCloseButton />
            <DrawerHeader>
            { context != undefined && context.settings && <Center><Avatar name={context.settings.name} src={`https://sleepercdn.com/avatars/thumbs/${context.settings.avatar}`}/><Heading ml={1} size={"md"}>{context.settings.name}</Heading></Center>}
              <br />
            </DrawerHeader>
            <DrawerBody>
            <VStack
  spacing={0}
  align='stretch'
>
  <Box _hover={{ cursor: "pointer"}}>
    <TeamsMobileMenuContainer onclose={onClose} />
  </Box>
  { context != undefined && context.settings &&<Link href={`league/${context.settings.league_id}/ranks`}><Button variant={"unstyled"} _hover={{textColor: "grey"}}>Power Ranks</Button></Link>}
  { context != undefined && context.settings &&<Link href={`league/${context.settings.league_id}/trades`}><Button variant={"unstyled"} _hover={{textColor: "grey"}}>Trades</Button></Link>}
</VStack>
              
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
  