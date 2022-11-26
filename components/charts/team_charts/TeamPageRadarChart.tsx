import { Box, Spinner } from "@chakra-ui/react";
import { ResponsiveRadar } from "@nivo/radar";
import { useState } from "react";
import League from "../../../classes/custom/League";
import LeagueMember from "../../../classes/custom/LeagueMember";
import { POSITION } from "../../../utility/rosterFunctions";
import TeamRadarChart from "../TeamRadarChart";
import { project_colors } from "../../../utility/project_colors"

interface MyProps {
  league: League | undefined;
  memberId: number;
}
const TeamPageRadarChart = (props: MyProps) => {


  if (props.league?.settings == undefined) return <Spinner />;

  let data = formatScoresForRadarChart(
    props.league.members.get(props.memberId)!,
    props.league.getPositions() as POSITION[],
    props.league
  ) as any;

  const theme = {
    background: "none",
    textColor: "white",
  };
  return (

      <ResponsiveRadar
        data={data.chartData}
        keys={data.keys}
        theme={theme}
        indexBy="position"
        valueFormat=">-.2f"
        fillOpacity={.2}
        isInteractive={true}
        margin={{ top: 30, right: 30, bottom: 30, left:30 }}
        borderColor={{ from: "color" }}
        maxValue={data.maxValue}
        gridLevels={7}
        colors={[project_colors.primary[600], project_colors.secondary[600]]}
        blendMode="normal"
        motionConfig="wobbly"
        legends={[
          {
            anchor: "top-left",
            direction: "column",
            translateX: -20,
            translateY: -20,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: "#999",
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#FFFFFF",
                },
              },
            ],
          },
        ]}
      />
  );
};

function formatScoresForRadarChart(
  member: LeagueMember,
  positions: POSITION[],
  league: League
) {
  let data: object[] = [];
  let keys: string[] = [];
  let maxValue = 0

  keys.push("League Avg");
  keys.push(member.name);


  positions.forEach((position) => {
    let positionObj: { [k: string]: any } = { position: position };

    if (
      position != undefined &&
      !isNaN(member.stats.position_scores.get(position) as any) &&
      !isNaN(member.stats.position_starts.get(position) as any)
    ) {
      let positionScore = member.stats.position_scores.get(position);
      let positionStarts = member.stats.position_starts.get(position);
      let positionAverage = positionScore! / positionStarts!;
      if (positionAverage > maxValue) {
        maxValue = positionAverage
      }
      positionObj[member.name] = parseFloat(positionAverage.toFixed(2));

      let positionAvgScore = league.stats.position_scores.get(position);
      let positionAvgStarts = league.stats.position_starts.get(position);
      let positionAvgAverage = positionAvgScore! / positionAvgStarts!;
      if (positionAvgAverage > maxValue) {
        maxValue = positionAvgAverage
      }
      positionObj["League Avg"] = parseFloat(positionAvgAverage.toFixed(2));
    }

    data.push(positionObj);
  });
  

  return { chartData: data, keys: keys, maxValue: maxValue + (maxValue / 9) };
}

export default TeamPageRadarChart;
