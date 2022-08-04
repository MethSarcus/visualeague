import { Box, useStyleConfig } from "@chakra-ui/react";

type MyProps = { variant: string; children: React.ReactNode };

function Card(props: MyProps) {
  const { variant, ...rest } = props;

  const styles = useStyleConfig("Card", { variant });

  // Pass the computed styles into the `__css` prop
  return <Box __css={styles} {...rest} />;
}

export default Card;
