import {
  Box,
  Button,
  Center,
  Collapse,
  Heading,
  Input,
  useStyleConfig,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import useSWR from "swr";
import LeagueCellGroup from "./LeagueCellGroup";


function UsernameForm() {
  const [text, setText] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const onFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    setUsernameSubmitted(true)
  };

  const textChanged = (username: string) => {
    setUsernameSubmitted(false)
    setText(username)
  }

  return (
    <Box>
       <form onSubmit={onFormSubmit}>
        <Input
          variant="outline"
          placeholder="Username"
          size="lg"
          display="inline-block"
          mt={3}
          value={text}
          onChange={(e) => textChanged(e.target.value)}
        />
        {!usernameSubmitted &&
        <Button
          variant="solid"
          size="md"
          type="submit"
          backgroundColor="#6200EE"
          color="#000000"
          mt={2}
        >
          Submit
        </Button>}
      </form>
      <Collapse in={usernameSubmitted} animate>
      <Box>
        <Box as="h1">Leagues</Box>
          <LeagueCellGroup usernameSubmitted={usernameSubmitted} username={text}/>
      </Box>
      </Collapse>

    </Box>
  );
}

export default UsernameForm;
