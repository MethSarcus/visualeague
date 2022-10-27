import { Spinner } from '@chakra-ui/react';
import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { ResponsiveRadialBar } from '@nivo/radial-bar';
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

const PFRadialBarChart = (props: MyProps) => {
    let data = formatScoresForBarChart(props.league) as any

    if (data.length <= 0) return <Spinner/>
    return (<ResponsiveRadialBar
        data={data}
        valueFormat=" >-.2f"
        endAngle={319}
        colors={{ datum: "data.color" }}
        padding={0.3}
        theme={theme}
        padAngle={1}
        cornerRadius={22}
        margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.2
                ]
            ]
        }}
        enableTracks={false}
        tracksColor="#000000"
        radialAxisStart={{ tickSize: 8, tickPadding: 5, tickRotation: 37 }}
        circularAxisOuter={{ tickSize: 5, tickPadding: 12, tickRotation: 0 }}
        legends={[
            {
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 69,
                translateY: 0,
                itemsSpacing: 6,
                itemDirection: 'left-to-right',
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#999',
                symbolSize: 18,
                symbolShape: 'square',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />)
}


    function formatScoresForBarChart(league: CustomSleeperLeague, statType?: MemberStat) {
        let data: object[] = []
        let memberPositionScores: Map<number, object[]> = new Map()

        league.members.forEach((member) => {
            member.stats.position_scores.forEach((value, position) => {
                if (memberPositionScores.has(member.roster.roster_id)) {
                    (memberPositionScores.get(member.roster.roster_id) as object[]).push({
                        x: position,
                        y: value,
                        color: colors[position]
                    })
                } else {
                    memberPositionScores.set(member.roster.roster_id, [{
                        x: position,
                        y: value,
                        color: colors[position]
                    }])
                }
            }) 
        })

        league.members.forEach((member: LeagueMember) => {
            if (league.memberIdToRosterId.has(member.userId)) {
                data.push({
                    id: member.name,
                    data: memberPositionScores.get(league.memberIdToRosterId.get(member.userId) as number),
                    pf: member.stats.pf
                })
            }
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

        return data
    }

    enum MemberStat {
        PF = "pf",
        PA = "pa",
        PP = "pp",
        GP = "gp",
        OPSLAP = "opslap",
    }

export default PFRadialBarChart