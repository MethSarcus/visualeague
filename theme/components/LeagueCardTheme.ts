const LeagueCard = {
    // The parts of the component
    parts: ["league_name", "details", "controls", "league_image"],
    // The base styles for each part
    baseStyle: {
      display: "flex",
      flexDirection: "column",
      background: "white",
      alignItems: "center",
      gap: 6,
    },
    // The size styles for each part
    sizes: {
      sm: {
        item: {
          fontSize: "0.75rem",
          px: 2,
          py: 1,
        },
      },
      md: {
        item: {
          fontSize: "0.875rem",
          px: 3,
          py: 2,
        },
      },
    },
    // The variant styles for each part
    variants: {
      default: {
        padding: 8,
        borderRadius: "xl",
        boxShadow: "xl",
      },
      list_item: {
        padding: 6,
        borderRadius: "base",
        boxShadow: "md",
      },
    },
    // The default `size` or `variant` values
    defaultProps: {
      variant: "default",
      size: "md",
    },
  };
  
  export default LeagueCard;