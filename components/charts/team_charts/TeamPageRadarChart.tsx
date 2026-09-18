import { Spinner } from "@chakra-ui/react";
import { ResponsiveRadar } from "@nivo/radar";
import { useMemo } from "react";
import League from "../../../classes/custom/League";
import LeagueMember from "../../../classes/custom/LeagueMember";
import { POSITION } from "../../../utility/rosterFunctions";
import { project_colors } from "../../../utility/project_colors"

interface MyProps {
  league: League | undefined;
  memberId: number;
}

const theme = {
  background: "none",
  textColor: "white",
}

const TeamPageRadarChart = (props: MyProps) => {
  const league = props.league
  const memberId = props.memberId
  const data = useMemo(() => {
    if (league?.settings == undefined) return undefined
    const member = league.members.get(memberId)
    if (!member) return undefined
    return formatScoresForRadarChart(member, league.getPositions(), league)
  }, [league, memberId])

  if (data == undefined) return <Spinner />;

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
            toggleSerie: true,
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
  const data: Record<string, string | number>[] = [];
  const keys: string[] = ["League Avg", member.name];
  let maxValue = 0

  positions.forEach((position) => {
    const positionObj: Record<string, string | number> = { position: position };

    const positionScore = member.stats.position_scores.get(position);
    const positionStarts = member.stats.position_starts.get(position);
    const positionAvgScore = league.stats.position_scores.get(position);
    const positionAvgStarts = league.stats.position_starts.get(position);

    if (positionScore != undefined && positionStarts) {
      const positionAverage = positionScore / positionStarts;
      if (positionAverage > maxValue) {
        maxValue = positionAverage
      }
      positionObj[member.name] = parseFloat(positionAverage.toFixed(2));
    }

    if (positionAvgScore != undefined && positionAvgStarts) {
      const positionAvgAverage = positionAvgScore / positionAvgStarts;
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
