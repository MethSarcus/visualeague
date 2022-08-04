import { Box, Button, Heading, Input, useStyleConfig } from "@chakra-ui/react";
import { FormEventHandler, useState } from "react";

type MyProps = { callback: FormEventHandler };

function UsernameForm(props: MyProps) {
  const [text, setText] = useState("");
  return (
    <Box
      display="inline-block"
      bg={"surface.0"}
      opacity={1}
      boxShadow={5}
      p={10}
      overflow="hidden"
      borderRadius={10}
    >
      <Heading
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        size="2xl"
        color="#FFFFFF"
        pb={30}
      >
        Draft Sniper
      </Heading>
      <form onSubmit={props.callback}>
        <Input
          variant="outline"
          placeholder="Username"
          size="lg"
          display="inline-block"
          mt={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          variant="solid"
          size="md"
          type="submit"
          backgroundColor="#6200EE"
          color="#000000"
          mt={2}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
}

export default UsernameForm;
