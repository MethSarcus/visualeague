import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  Box,
  Center,
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
        <GridItem  bg="blue.300" area={"footer"}>
          <Center h={"100%"} fontSize={'xs'} fontWeight="medium"> © Seth Marcus 2022</Center>
       
        </GridItem>
      </Grid>
    </Box>
  );
};

export default LeaguePage;
