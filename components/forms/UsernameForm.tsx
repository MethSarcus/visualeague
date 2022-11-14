"use client"
import { Box, Button, Collapse, Container, Fade, Input, ScaleFade, SlideFade, Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import LeagueCellGroup from "./LeagueCellGroup";

function UsernameForm() {
  const [text, setText] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [storedUsernames, setStoredUsernames] = useState(new Array());

  useEffect(() => {
    if ("usernames" in localStorage) {
      setStoredUsernames(
        JSON.parse(localStorage.getItem("usernames") as string)
      );
    }
  }, []);

  const onStorageCleared = () => {
    localStorage.clear();
    setStoredUsernames([]);
    setText("");
  };

  const onFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setUsernameSubmitted(true);
    if (!storedUsernames.includes(text) && text != "") {
      storedUsernames.push(text);
      localStorage.setItem("usernames", JSON.stringify(storedUsernames));
    }
  };

  const textChanged = (username: string) => {
    if (usernameSubmitted) {
      setUsernameSubmitted(false);
    }
    setText(username);
  };

  return (
    <Container>
      <form onSubmit={onFormSubmit}>
        <Input
          list={"data"}
          variant="outline"
          placeholder="Username"
          size="lg"
          p={5}
          display="inline-block"
          mt={[0, 3]}
          value={text}
          onChange={(e) => textChanged(e.target.value)}
        />
         <Collapse in={!usernameSubmitted}>
          <Button
            variant="solid"
            size="sm"
            type="submit"
            p={4}
            backgroundColor="primary.500"
            color="#000000"
            textColor={'white'}
            mt={4}
            h={6}
          >
            Submit
          </Button>
        </Collapse>
      </form>

      <Collapse in={usernameSubmitted}>
          <Box pt={6} overflowY={"scroll"}>
            <Box as="h1" mb={1}>Leagues</Box>
            <LeagueCellGroup
              usernameSubmitted={usernameSubmitted}
              username={text}
            />
          </Box>
        </Collapse>
        <Collapse in={!usernameSubmitted && storedUsernames.length > 0}>
            <Box pt={6}>Recent Searches</Box>
            <Wrap pt={2}>
              {storedUsernames.map((item, index) => {
                return (
                  <WrapItem onClick={() => setText(item)} key={item}>
                   <ScaleFade in={true} initialScale={0.01}>
                    <Button colorScheme={"secondary"} size={"xs"}>
                      {item}
                    </Button>
                    </ScaleFade>
                  </WrapItem>
                );
              })}
            </Wrap>
            <Button
              variant={"outline"}
              colorScheme={"primary"}
              mt={3}
              size={"xs"}
              onClick={onStorageCleared}
            >
              Clear
            </Button>
        </Collapse>

        
    </Container>
  );
}

export default UsernameForm;
