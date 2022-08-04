// theme/index.js
import { extendTheme } from "@chakra-ui/react";

// Global style overrides
import theme from "./theme";

// Component style overrides
import Card from "./components/CardTheme";
import DraftPickCard from "./components/DarftPickCardTheme";
import PositionBadge from "./components/PositionBadge";
import FlexPositionBadge from "./components/FlexPositionBadge";

const overrides = {
  theme,
  // Other foundational style overrides go here
  components: {
    Card,
    DraftPickCard,
    PositionBadge,
    FlexPositionBadge
  },
  colors: {
    primary: {
      50: "#F7F2FE",
      100: "#F0E6FC",
      200: "#E8D9FB",
      300: "#E1CDFA",
      400: "#D9C0F8",
      500: "#D1B3F7",
      600: "#CAA7F6",
      700: "#C29AF5",
      800: "#BA8DF3",
      900: "#B381F2",
    },
    primary_dark: {
      50: "#120D19",
      100: "#241A30",
      200: "#362749",
      300: "#483461",
      400: "#5A4179",
      500: "#6B4D91",
      600: "#6002ee",
      700: "#8F67C2",
      800: "#A174DA",
      900: "#B381F2",
    },
    primary_google: {
      50: "#f4ebfe",
      100: "#e2cdfd",
      200: "#cfabfd",
      300: "#bb86fc",
      400: "#aa67f9",
      500: "#994af1",
      600: "#8e44ea",
      700: "#803be0",
      800: "#7335d8",
      900: "#5f27ca",
    },
    secondary_google: {
      50: "#d4f6f2",
      100: "#92e9dc",
      200: "#03dac4",
      300: "#00c7ab",
      400: "#00b798",
      500: "#00a885",
      600: "#009a77",
      700: "#008966",
      800: "#007957",
      900: "#005b39",
    },
    surface_google: {
      0: "#292929",
      1: "#121212",
      2: "#1E1E1E",
      3: "#232323",
      4: "#252525",
      5: "#272727",
      6: "#2C2C2C",
      7: "#2F2F2F",
      8: "#333333",
      9: "#353535",
      10: "#383838",
    },
    position: {
      QB: "rgba(239, 116, 161, 0.8)",
      RB: "rgba(143, 242, 202, 0.8)",
      WR: "rgba(86, 201, 248, 0.8)",
      TE: "rgba(254, 174, 88, 0.8)",
      DL: "rgba(250, 153, 97, 0.8)",
      DB: "rgba(254, 160, 202, 0.8)",
      LB: "rgba(174, 182, 252, 0.8)",
      K: "#7988a1",
      DEF: "#bd66ff"
    }
  },
};

export default extendTheme(overrides);
