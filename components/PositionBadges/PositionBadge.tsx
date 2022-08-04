import { Center, useStyleConfig } from "@chakra-ui/react"

type MyProps = {
    variant: string
    size: string
  };

const PositionBadge = (props: MyProps) => {
    const { variant, size, ...rest } = props
    const styles = useStyleConfig('PositionBadge', { variant, size })
    return <Center __css={styles} {...rest}>{props.variant}</Center>
}

export default PositionBadge