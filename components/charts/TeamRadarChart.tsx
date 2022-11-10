import { Box, Spinner } from '@chakra-ui/react';
import { ResponsiveRadar } from '@nivo/radar';
import { useState } from 'react';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { POSITION } from '../../utility/rosterFunctions';


interface MyProps {
    league: League
}

const TeamRadarChart = (props: MyProps) => {
    let data = formatScoresForRadarChart(Array.from(props.league.members.values()), props.league.getPositions() as POSITION[]) as any
    const [hiddenMembers, setHiddenMembers] = useState([])
    const theme = {
        "background": "none",
        "textColor": "white"
    }

    if (data.length <= 0) return <Spinner/>
    return (<Box height={"350px"}>

    <ResponsiveRadar
        data={data.chartData}
        keys={data.keys}
        theme={theme}
        indexBy="position"
        valueFormat=">-.2f"
        margin={{ top: 50, right: 150, bottom: 50, left: 0 }}
        borderColor={{ from: 'color' }}
        gridLabelOffset={20}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={[
            {
                anchor: 'right',
                direction: 'column',
                translateX: -90,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: '#999',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#FFFFFF'
                        }
                    }
                ]
            }
        ]}
    /></Box>)
}


function formatScoresForRadarChart(members: LeagueMember[], positions: POSITION[]) {
    let data: object[] = []
    let keys: string[] = []

    members.forEach((member: LeagueMember, key: number) => {keys.push(member.name)})

    positions.forEach((position) => {
        let positionObj: {[k: string]: any} = {position: position}
        members.forEach((member: LeagueMember, key: number) => {
            if (position != undefined && !isNaN(member.stats.position_scores.get(position) as any) && !isNaN(member.stats.position_starts.get(position) as any)) {
                let positionScore = member.stats.position_scores.get(position)
                let positionStarts = member.stats.position_starts.get(position)
                let positionAverage = positionScore!! / positionStarts!!
                positionObj[member.name] =  parseFloat(positionAverage.toFixed(2))
            }

        })
        data.push(positionObj)
    })

    return {chartData: data, keys: keys}
}

export default TeamRadarChart