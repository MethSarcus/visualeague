import { Spinner } from '@chakra-ui/react';
import { BarDatum, ResponsiveBar } from '@nivo/bar';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { getPositionColor } from '../../utility/rosterFunctions';
import { project_colors } from "../../utility/project_colors";
import { PositionColors } from './ChartColors';


interface MyProps {
    league: League
}

  const theme = {
    "background": project_colors.surface[1],
    "textColor": "white"
}

const getColor = (bar: BarDatum) => PositionColors[bar.id];

const BarChart = (props: MyProps) => {
    let formattedData = formatScoresForBarChart(props.league)
    let keys = formattedData.chartKeys
    let data = formattedData.chartData as BarDatum[]

    if (data.length <= 0) return <Spinner/>

    return (<ResponsiveBar
        data={data}
        keys={keys}
        indexBy="member"
        layout='horizontal'
        margin={{ top: 50, right: 10, bottom: 50, left: 80 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={getColor as any}
        theme={theme}
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
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'PF',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -30,
            legend: "",
            legendPosition: 'middle',
            legendOffset: -100
        }}
        labelSkipWidth={12}
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
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'top',
                direction: 'row',
                justify: false,
                translateY: -20,
                itemTextColor: "white",
                itemWidth: 50,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
        role="application"
        ariaLabel="Points Scored by Member"
        barAriaLabel={function(e){return e.id+": "+e.formattedValue+" in country: "+e.indexValue}}
    />)
}


    function formatScoresForBarChart(league: League, statType?: MemberStat) {
        let keys: Set<string> = new Set<string>();
        let data: object[] = []
        
        league.members.forEach((member: LeagueMember, key: number) => {
            let memberData: {[k: string]: any} = {}
            memberData.member = member.name
            memberData.pf = member.stats.pf
            member.stats.position_scores.forEach((value, key) => {
                keys.add(key)
                memberData[key] = parseFloat(value.toFixed(2))
                memberData[`${key}Color`] = getPositionColor(key)

            })

            
            data.push(memberData)
        })
        data.sort((a: any, b: any) => {
            if (a.pf < b.pf) {
              return 1;
            } else if (a.pf > b.pf) {
              return -1;
            } else {
              return 0;
            }
          });

        let formattedData = {chartKeys: Array.from(keys), chartData: data}

        return formattedData
    }

    enum MemberStat {
        PF = "pf",
        PA = "pa",
        PP = "pp",
        GP = "gp",
        OPSLAP = "opslap",
    }

export default BarChart