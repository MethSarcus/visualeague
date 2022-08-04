import React from "react";
import { Image } from "@chakra-ui/react";
import { DraftPick } from "../interfaces/sleeper_api/DraftPick";

type MyProps = { pick: DraftPick };

export default class DraftPickCard extends React.Component<MyProps> {
  constructor(props: MyProps) {
    super(props);
  }

  render() {
    return (
      <div
        className={`DraftPickCardBackground ${this.props.pick.metadata.position}`}
      >
        <p className="DraftPickCardH1">
          {this.props.pick.metadata.first_name.charAt(0)}{". "}
          {this.props.pick.metadata.last_name}
        </p>
        <p className="DraftPickCardH2">
          {this.props.pick.metadata.position} - {this.props.pick.metadata.team}{" "}
          ({this.props.pick.metadata.number})
        </p>
        <p className="DraftPickCardPickNumber">
          {this.props.pick.round}.{this.props.pick.draft_slot}
        </p>
        <div className="DraftPickImageContainer">
          <Image
            className="DraftCardPlayerThumbnail"
            alt="Player Image"
            src={
              "https://sleepercdn.com/content/nfl/players/" +
              this.props.pick.player_id +
              ".jpg"
            }
            fallbackSrc={
              "https://sleepercdn.com/images/v2/icons/player_default.webp"
            }
          ></Image>
        </div>
      </div>
    );
  }
}
