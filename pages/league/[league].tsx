import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Box, Container, Heading, Input, Text } from "@chakra-ui/react";

const LeaguePage: NextPage = () => {
  const [text, setText] = useState("");
  const router = useRouter();

  return (
    <Box w={"100%"} h="100%" bg={"surface.0"}>
        <div className="App">
        </div>
    </Box>
  );
};

export default LeaguePage;
