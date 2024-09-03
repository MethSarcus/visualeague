import { Spinner } from "@chakra-ui/react";
import { BumpPoint, ResponsiveBump } from "@nivo/bump";
import League from "../../classes/custom/League";
import LeagueMember from "../../classes/custom/LeagueMember";
import { project_colors } from "../../utility/project_colors";

interface MyProps {
  league: League | undefined;
  filteredIds?: number[] | undefined
}



const WeeklyRankingBumpChart = (props: MyProps) => {
  if (props.league?.settings == undefined) return <Spinner />;
  let data = formatScoresForBumpChart(props.league, props.filteredIds) as any;
  const theme = {
    text: {fill: project_colors.textTheme.highEmphasis}
  };

  const CustomPoint = ({ point }: { point: BumpPoint<any, any> }) => {
    let avatar = props.league?.getRosterIdByName(point.id.split(".")[0])?.avatar
    return (
      <g
        transform={`translate(${point.x}, ${point.y})`}
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <clipPath id="clipCircle">
            <circle
              r={point.size * 1}
              x={point.size * -1}
              y={point.size * -1}
            />
          </clipPath>
        </defs>
        <image
          clipPath="url(#clipCircle)"
          x={point.size * -1}
          y={point.size * -1}
          width={point.size * 2}
          height={point.size * 2}
          href={`https://sleepercdn.com/avatars/thumbs/${avatar}`}
        ></image>

      </g>
    );
  };

  if (data.length <= 0) return <Spinner />;

  return (
    <ResponsiveBump
      data={data}
      colors={{ scheme: "spectral" }}
      theme={theme}
      lineWidth={3}
      activeLineWidth={6}
      inactiveLineWidth={3}
      inactiveOpacity={0.15}
      pointSize={10}
      pointComponent={CustomPoint}
      activePointSize={16}
      inactivePointSize={0}
      pointColor={{ theme: "background" }}
      pointBorderWidth={3}
      activePointBorderWidth={3}
      pointBorderColor={{ from: "serie.color" }}
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Weekly Power Rankings",
        legendPosition: "middle",
        legendOffset: -30,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendPosition: "middle",
        legendOffset: 0,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ranking",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
      axisRight={null}
    />
  );
};

function formatScoresForBumpChart(league: League, filteredIds: number[] = []) {
  let data: object[] = [];
  let memberPowerRankMap: Map<number, object[]> = new Map();
  if (filteredIds.length < 1) {
    league.members.forEach(member => {
      filteredIds.push(member.roster.roster_id)
    })
  }

  league.weeks.forEach((week) => {
    week.getAllScores().forEach((team) => {
      if (memberPowerRankMap.has(team.id)) {
        (memberPowerRankMap.get(team.id) as object[]).push({
          x: week.weekNumber,
          y: team.rank,
        });
      } else {
        memberPowerRankMap.set(team.id, [
          {
            x: week.weekNumber,
            y: team.rank,
          },
        ]);
      }
    });
  });

  league.members.forEach((member: LeagueMember) => {
    if (league.memberIdToRosterId.has(member.userId) && filteredIds.includes(member.roster.roster_id)) {
      data.push({
        id: member.name,
        data: memberPowerRankMap.get(
          league.memberIdToRosterId.get(member.userId) as number
        ),
      });
    }
  });

  return data;
}

export default WeeklyRankingBumpChart;
