import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import Navbar from "../../components/nav/Navbar";

const LeaguePage: NextPage = () => {
  const [text, setText] = useState("");
  const router = useRouter();

  return (
    <Box w={"100%"} h="100%" bg={"surface.0"}>
      <Grid
        templateAreas={`"header header"
                  "main main"
                  "footer footer"`}
        gridTemplateRows={"50px 1fr 30px"}
        gridTemplateColumns={"150px 1fr"}
        h="100%"
        gap="1"
        color="surface.0"
        fontWeight="bold"
      >
        <GridItem pl="2" area={"header"}>
          <Navbar />
        </GridItem>
        <GridItem pl="2" bg="green.300" area={"main"}>
          
        </GridItem>
        <GridItem pl="2" bg="blue.300" area={"footer"}>
          Footer
        </GridItem>
      </Grid>
    </Box>
  );
};

export default LeaguePage;
