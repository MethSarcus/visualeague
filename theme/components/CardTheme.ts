const Card = {
  // The parts of the component
  parts: [],
  // The base styles for each part
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    background: "white",
    alignItems: "center",
    gap: 6,
  },
  // The size styles for each part
  sizes: {},
  // The variant styles for each part
  variants: {
    stat: {
      padding: 8,
      borderRadius: "xl",
      boxShadow: "xl",
    },
    smooth: {
      padding: 6,
      borderRadius: "base",
      boxShadow: "md",
    },
  },
  // The default `size` or `variant` values
  defaultProps: {
    variant: "smooth",
  },
};

export default Card;
