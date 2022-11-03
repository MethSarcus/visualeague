import { Spinner } from "@chakra-ui/react";
import { ResponsiveAreaBump } from "@nivo/bump";
import CustomSleeperLeague from "../../classes/custom/League";
import { MatchupSide } from "../../classes/custom/MatchupSide";
import {
  project_colors
} from "../../utility/rosterFunctions";

interface MyProps {
  league: CustomSleeperLeague;
}

const PowerRankingBumpChart = (props: MyProps) => {
  let data = formatScoresForBumpChart(props.league) as any;
  const theme = {
    background: project_colors.surface[1],
    textColor: "white",
  };

  if (data.length <= 0) return <Spinner />;

  return (
    <ResponsiveAreaBump
      data={data}
      theme={theme}
      margin={{ top: 60, right: 200, bottom: 40, left: 200 }}
      spacing={5}
      colors={{ scheme: "nivo" }}
      blendMode="multiply"
      startLabel={"id" as any}
      endLabel={"id" as any}
      // interpolation='linear'
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Week",
        legendPosition: "middle",
        legendOffset: -36,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendPosition: "middle",
        legendOffset: 32,
      }}
    />
  );
};

function formatScoresForBumpChart(league: CustomSleeperLeague) {
  let data: object[] = [];

  //Roster ID to array of power wins each week
  let memberPowerWins: Map<number, []> = new Map();
  league.members.forEach((member) => {
    memberPowerWins.set(member.roster.roster_id, []);
  });

  let weeks: any[] = []

  league.weeks.forEach((week) => {
    weeks.push(week.weekNumber)
    let teams = week.getAllTeams().sort((a: MatchupSide, b: MatchupSide) => {
      if (a.pf < b.pf) {
        return 1;
      } else if (a.pf > b.pf) {
        return -1;
      } else {
        return 0;
      }
    });
    teams.forEach((team, index) => {
      if (memberPowerWins.get(team.roster_id) != undefined) {
        (memberPowerWins.get(team.roster_id) as number[]).push(
          teams.length - index - 1
        );
      }
    });
  });

  memberPowerWins.forEach((value, key) => {
    let leagueMember = league.members.get(key);
    if (leagueMember != undefined) {
      let memberWins: number[] = [];
      let totalWins = 0;
      value.forEach((wins) => {
        totalWins += wins;
        memberWins.push(totalWins);
      });
      data.push({
        id: leagueMember.name,
        data: memberWins.map((wins, index) => {
          return {
            x: weeks[index],
            y: wins,
          };
        }),
      });
    }
  });

  return data;
}

export default PowerRankingBumpChart;
