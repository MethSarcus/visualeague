import { Box, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
function Navbar() {
  // Pass the computed styles into the `__css` prop
  return (
    <Box bg={"brand.secondary"}>
      <HStack spacing="24px" pl={3} paddingY={1}>
        <Box as={"b"} fontSize="lg">
          <Link href="/">
            <a>Draft Sniper</a>
          </Link>
        </Box>
      </HStack>
    </Box>
  );
}

export default Navbar;
