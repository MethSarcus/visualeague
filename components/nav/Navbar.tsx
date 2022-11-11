import { Box, Button, Flex, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import SettingsSidebar from "./SettingsSidebar";
import TeamSidebar from "./TeamSidebar";
import { useRouter, usePathname } from 'next/navigation';
function Navbar() {
  const [context, setContext] = useContext(Context);
  const router = useRouter();
  const curPath = usePathname()
  // Pass the computed styles into the `__css` prop
  return (
    <Flex bg={"secondary.600"} maxWidth={"100vw"}>
      <HStack spacing="4px" pl={3} paddingY={1} flex={1} maxWidth={"100vw"} overflow="hidden">
        <Box as={"b"} fontSize="lg" mr={2}>
          <Button variant={"ghost"} onClick={() => router.push(`${curPath}`)}>
            Visualeague
          </Button>
        </Box>
        <Box>{context.modifiedSettings && <TeamSidebar />}</Box>
        <Box>
          <Button
            size={"sm"}
            colorScheme={"secondary"}
            textColor="black"
            variant="ghost"
            aria-label={"teams"}
          >
            Power Rankings
          </Button>
        </Box>
        <Box>
          <Button
            size={"sm"}
            colorScheme={"secondary"}
            textColor="black"
            variant="ghost"
            aria-label={"teams"}
            onClick={() => router.push(`${curPath}/trades`)}
          >
            Trading
          </Button>
        </Box>
      </HStack>
      <Box>{context.modifiedSettings && <SettingsSidebar />}</Box>
    </Flex>
  );
}

export default Navbar;
