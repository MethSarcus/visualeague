import { Spinner } from "@chakra-ui/react";
import { BarDatum, ResponsiveBar } from "@nivo/bar";
import League from "../../../classes/custom/League";
import { PositionColors } from "../ChartColors";

interface MyProps {
  league?: League;
  memberId: number;
}

const theme = {
  background: "none",
  textColor: "white",
};

const getColor = (bar: BarDatum) => PositionColors[bar.id];

const BarChart = (props: MyProps) => {
  if (props.league?.settings == undefined) return <Spinner />;
  let data = formatScoresForBarChart(props.league, props.memberId);

  if (data.length <= 0) return <Spinner />;

  return (
    <ResponsiveBar
    data={data}
    keys={[
        'PF',
        'PA',
        'PP'
    ]}
    indexBy="user"
    margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
    innerPadding={1}
    groupMode="grouped"
    valueScale={{ type: 'linear' }}
    indexScale={{ type: 'band', round: true }}
    colors={{ scheme: 'nivo' }}
    borderWidth={1}
    borderColor={{
        from: 'color',
        modifiers: [
            [
                'darker',
                1.6
            ]
        ]
    }}
    axisTop={null}
    axisRight={null}
    axisBottom={{
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: '',
        legendPosition: 'middle',
        legendOffset: 0
    }}
    axisLeft={null}
    enableGridY={false}
    enableLabel={false}
    labelSkipWidth={5}
    labelSkipHeight={12}
    labelTextColor={{
        from: 'color',
        modifiers: [
            [
                'darker',
                1.6
            ]
        ]
    }}
    legends={[]}
    role="application"
/>
  );
};

function formatScoresForBarChart(league: League, memberId: number) {
  let data: BarDatum[] = [];

  let member = league.members.get(parseInt(memberId as any));
  if (member != undefined) {
    data.push({
      "user": member.name,
      "PF": member.stats.pf,
      "PA": member.stats.pa,
      "PP": member.stats.pp,
    });
    data.push({
      "user": "League",
      "PF": league.stats.avg_pf,
      "PA": league.stats.avg_pa,
      "PP": league.stats.avg_pp,
    });
  }
  return data;
}

export default BarChart;
