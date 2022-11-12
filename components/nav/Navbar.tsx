import { Box, Button, Flex, HStack } from "@chakra-ui/react";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import SettingsSidebar from "./SettingsSidebar";
import TeamSidebar from "./TeamSidebar";
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
function Navbar() {
  const [context, setContext] = useContext(Context);


  return (
    <Flex bg={"secondary.600"} maxWidth={"100vw"}>
      <HStack spacing="4px" pl={3} paddingY={1} flex={1} maxWidth={"100vw"} overflow="hidden">
        <Box as={"b"} fontSize="lg" mr={2}>
        {context != undefined && context.settings && <Link href={`league/${context.settings.league_id}`}>
          <Button variant={"ghost"} >
            Visualeague
          </Button>
          </Link>}
        </Box>
        <TeamSidebar />
        <Box>
        {context != undefined && context.settings && <Link href={`league/${context.settings.league_id}/ranks`}>
          <Button
            size={"sm"}
            colorScheme={"secondary"}
            textColor="black"
            variant="ghost"
            aria-label={"teams"}
            
          >
            Power Rankings
          </Button>
          </Link>}
        </Box>
        <Box>
          {context != undefined && context.settings && <Link href={`league/${context.settings.league_id}/trades`}>
          <Button
            size={"sm"}
            colorScheme={"secondary"}
            textColor="black"
            variant="ghost"
            aria-label={"teams"}
            
          >
            Trading
          </Button>
          </Link>}

        </Box>
      </HStack>
      <Box>{context.modifiedSettings && <SettingsSidebar />}</Box>
    </Flex>
  );
}

export default Navbar;
