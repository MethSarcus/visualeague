import { Spinner } from '@chakra-ui/react';
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { useMemo } from 'react';
import League from '../../../classes/custom/League';
import LeagueMember from '../../../classes/custom/LeagueMember';
import { PositionColors } from '../ChartColors';

interface MyProps {
    league: League
    roster_id?: number
}

interface RadialBarPoint {
    x: string
    y: number
    color: string
}

const theme = {
    "background": "none",
    "textColor": "white"
}

const PFRadialBarChart = (props: MyProps) => {
    const league = props.league
    const data = useMemo(() => formatScoresForBarChart(league), [league])

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
        role="application"
        ariaLabel="Points for by position, per team"
    />)
}


function formatScoresForBarChart(league: League) {
    const data: {id: string; data: RadialBarPoint[]; pf: number}[] = []
    const memberPositionScores: Map<number, RadialBarPoint[]> = new Map()

    league.members.forEach((member) => {
        member.stats.position_scores.forEach((value, position) => {
            const point = {x: position, y: value, color: PositionColors[position]}
            const existing = memberPositionScores.get(member.roster.roster_id)
            if (existing) {
                existing.push(point)
            } else {
                memberPositionScores.set(member.roster.roster_id, [point])
            }
        })
    })

    league.members.forEach((member: LeagueMember) => {
        const rosterId = league.memberIdToRosterId.get(member.userId)
        if (rosterId != undefined) {
            data.push({
                id: member.name,
                data: memberPositionScores.get(rosterId) ?? [],
                pf: member.stats.pf
            })
        }
    })

    data.sort((a, b) => {
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

export default PFRadialBarChart
