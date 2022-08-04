const DraftCard = {
  // The parts of the component
  parts: ["name", "metadata", "pickNumber", "playerImage"],
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
    traded: {
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

export default DraftCard;

// <div
// className={`DraftPickCardBackground ${this.props.pick.metadata.position}`}
// >
// <p className="DraftPickCardH1">
//   {this.props.pick.metadata.first_name}{" "}
//   {this.props.pick.metadata.last_name}
// </p>
// <p className="DraftPickCardH2">
//   {this.props.pick.metadata.position} - {this.props.pick.metadata.team}{" "}
//   ({this.props.pick.metadata.number})
// </p>
// <p className="DraftPickCardPickNumber">
//   {this.props.pick.round}.{this.props.pick.draft_slot}
// </p>
// <div className="DraftPickImageContainer">
//   <Image
//     className="DraftCardPlayerThumbnail"
//     alt="Player Image"
//     src={
//       "https://sleepercdn.com/content/nfl/players/" +
//       this.props.pick.player_id +
//       ".jpg"
//     }
//     fallbackSrc={
//       "https://sleepercdn.com/images/v2/icons/player_default.webp"
//     }
//   ></Image>
// </div>
// </div>
