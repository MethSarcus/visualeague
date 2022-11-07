import { Box, Button, Collapse, Input, Wrap, WrapItem } from "@chakra-ui/react";
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
    <Box>
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
        {!usernameSubmitted && (
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
        )}
      </form>

      <Box>
        <Collapse in={usernameSubmitted} animate>
          <Box pt={3}>
            <Box as="h1">Leagues</Box>
            <LeagueCellGroup
              usernameSubmitted={usernameSubmitted}
              username={text}
            />
          </Box>
        </Collapse>
        {!usernameSubmitted && storedUsernames.length > 0 && (
          <Box>
            <Box mt={6}>Recent Searches</Box>
            <Wrap mt={2}>
              {storedUsernames.map((item) => {
                return (
                  <WrapItem onClick={() => setText(item)} key={item}>
                    <Button colorScheme={"secondary"} size={"xs"}>
                      {item}
                    </Button>
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
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default UsernameForm;
