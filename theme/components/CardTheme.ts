"use client"
const Card = {
  // The parts of the component
  parts: [],
  // The base styles for each part
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    background: "surface.1",
    color: "textTheme.highEmphasis",
    alignItems: "center",
    gap: 4,
    border: "1px solid",
    borderColor: "whiteAlpha.200",
  },
  // The size styles for each part
  sizes: {},
  // The variant styles for each part
  variants: {
    stat: {
      padding: 6,
      borderRadius: "lg",
      boxShadow: "md",
    },
    smooth: {
      padding: 6,
      borderRadius: "lg",
      boxShadow: "md",
    },
  },
  // The default `size` or `variant` values
  defaultProps: {
    variant: "smooth",
  },
};

export default Card;
