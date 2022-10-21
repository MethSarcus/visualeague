import { Box, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import Sidebar from "./Sidebar";
function Navbar() {
  const [context, setContext] = useContext(Context);
  // Pass the computed styles into the `__css` prop
  return (
    <Box bg={"secondary.600"}>
      <HStack spacing="24px" pl={3} paddingY={1}>
        <Box as={"b"} fontSize="lg">
          <Link href="/">
            <a>Dynasty Dash</a>
          </Link>
        </Box>
        <Box>
          
        {context.modifiedSettings && (<Sidebar/>)}
        </Box>
        
      </HStack>
    </Box>
  );
}

export default Navbar;
