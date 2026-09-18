import { Spinner } from "@chakra-ui/react";
import { BarDatum, ResponsiveBar } from "@nivo/bar";
import { useMemo } from "react";
import League from "../../../classes/custom/League";

interface MyProps {
  league?: League;
  memberId: number;
}

const theme = {
  background: "none",
  textColor: "white",
};

const BarChart = (props: MyProps) => {
  const league = props.league
  const memberId = props.memberId
  const data = useMemo(() => {
    if (league?.settings == undefined) return undefined
    return formatScoresForBarChart(league, memberId)
  }, [league, memberId])

  if (data == undefined || data.length <= 0) return <Spinner />;

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
    theme={theme}
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
  const data: BarDatum[] = [];

  const member = league.members.get(memberId);
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
