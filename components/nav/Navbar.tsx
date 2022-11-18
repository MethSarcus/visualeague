import { Box, Button, Center, Flex, HStack } from "@chakra-ui/react";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import SettingsSidebar from "./SettingsSidebar";
import TeamSidebar from "./TeamSidebar";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import MobileSidebar from "./MobileSidebar";
function Navbar() {
  const [context, setContext] = useContext(Context);

  return (
    <Flex bg={"secondary.600"} maxWidth={"100vw"}>
      <HStack
        spacing="4px"
        pl={3}
        paddingY={1}
        flex={1}
        display={{ sm: "none", base: "flex" }}
        maxWidth={"100vw"}
        overflow="hidden"
      >
        <MobileSidebar/>
        <Box as={"b"} fontSize="lg" mr={2}>
          
            <Link href={`league/${context?.settings?.league_id}`}>
              <Button variant={"ghost"}>Visualeague</Button>
            </Link>
        </Box>
      </HStack>
      <HStack
        spacing="4px"
        pl={3}
        paddingY={1}
        flex={1}
        display={{ sm: "flex", base: "none" }}
        maxWidth={"100vw"}
        overflow="hidden"
      >
        <Box as={"b"} fontSize="lg" mr={2}>
          {context != undefined && context.settings && (
            <Link href={`league/${context.settings.league_id}`}>
              <Button variant={"ghost"}>Visualeague</Button>
            </Link>
          )}
          {context == undefined && (
              <Button variant={"ghost"}>Visualeague</Button>
          )}
        </Box>
        <TeamSidebar />
        <Box>
            <Link href={`league/${context?.settings?.league_id}/ranks`}>
              <Button
                size={"sm"}
                colorScheme={"primary"}
                textColor="black"
                variant="ghost"
                aria-label={"teams"}
              >
                Power Rankings
              </Button>
            </Link>
        </Box>
        <Box>
            <Link href={`league/${context?.settings?.league_id}/trades`}>
              <Button
                size={"sm"}
                colorScheme={"secondary"}
                textColor="black"
                variant="ghost"
                aria-label={"teams"}
              >
                Trading
              </Button>
            </Link>
        </Box>
      </HStack>
      <Center pr={3}>{context.modifiedSettings && <SettingsSidebar />}</Center>
    </Flex>
  );
}

export default Navbar;
