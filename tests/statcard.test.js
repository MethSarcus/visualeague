import { cleanup, render, screen, mount } from "@testing-library/react";
import "@testing-library/jest-dom";
import {renderer} from 'react-test-renderer';
import TeamStatCard from "../components/cards/statcards/TeamStatCard.tsx";

describe("StatCard", () => {
  // afterEach function runs after each test suite is executed
  afterEach(() => {
    cleanup(); // Resets the DOM after each test suite
  });

  it("Renders TeamStatCard", () => {
    let statName = "Test Stat";
    let statValue = 100;
    let statOwner = "Fake Person";
    let isLoaded = true;
    let isGoodThing = true;
    let statCard = <TeamStatCard
        statName={statName}
        statValue={statValue}
        statOwner={statOwner}
        isLoaded={isLoaded}
        isGoodThing={isGoodThing}
      />

    expect(statCard)
    // const statCardContainer = statCard.getByTestId("team_stat_card_container");

    // const statCardName = screen.getByTestId("team_stat_card_stat_name");
    // expect(statCardName).toContain("Fake Person");
  });
});
