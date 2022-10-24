import { Spinner } from '@chakra-ui/react';
import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { useContext, useEffect, useState } from 'react';
import CustomSleeperLeague from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { Context } from '../../contexts/Context';
import { getPositionColor, POSITION, project_colors } from '../../utility/rosterFunctions';


interface MyProps {
    league: CustomSleeperLeague
}
const colors: Record<string, string> = {
    QB: "rgba(239, 116, 161, 0.95)",
    RB: "rgba(143, 242, 202, 0.95)",
    WR: "rgba(86, 201, 248, 0.95)",
    TE: "rgba(254, 174, 88, 0.95)",
    DL: "rgba(250, 153, 97, 0.95)",
    DB: "rgba(254, 160, 202, 0.95)",
    LB: "rgba(174, 182, 252, 0.95)",
    K: "#7988a1",
    DEF: "#bd66ff"
  }

  const theme = {
    "background": project_colors.surface[1],
    "textColor": "white"
}

const getColor = (bar: BarDatum) => colors[bar.id];

const BarChart = (props: MyProps) => {
    let formattedData = formatScoresForBarChart(props.league)
    let keys = formattedData.chartKeys
    let data = formattedData.chartData as BarDatum[]

    if (data.length <= 0) return <Spinner/>

    return (<ResponsiveBar
        data={data}
        keys={keys}
        indexBy="member"
        //layout='horizontal' maybe do this or add a toggle for it
        margin={{ top: 50, right: 80, bottom: 50, left: 80 }}
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
            legend: 'Team',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Points Scored",
            legendPosition: 'middle',
            legendOffset: -40
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
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemTextColor: "white",
                itemWidth: 100,
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


    function formatScoresForBarChart(league: CustomSleeperLeague, statType?: MemberStat) {
        let keys: Set<string> = new Set<string>();
        let data: object[] = []
        league.members.forEach((member: LeagueMember, key: number) => {
            let memberData: {[k: string]: any} = {}
            memberData.member = member.name
            member.stats.position_scores.forEach((value, key) => {
                keys.add(key)
                memberData[key] = parseFloat(value.toFixed(2))
                memberData[`${key}Color`] = getPositionColor(key)
            })

            data.push(memberData)
        })

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