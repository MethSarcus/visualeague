import { Box, Spinner } from '@chakra-ui/react';
import { ResponsiveAreaBump, ResponsiveBump } from '@nivo/bump';
import { ResponsiveRadar } from '@nivo/radar';
import { BasicTooltip } from '@nivo/tooltip';
import { useState } from 'react';
import CustomSleeperLeague from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { getPositionColor, POSITION, project_colors } from '../../utility/rosterFunctions';


interface MyProps {
    league: CustomSleeperLeague
}

const TeamRadarChart = (props: MyProps) => {
    let data = formatScoresForRadarChart(Array.from(props.league.members.values()), props.league.getPositions() as POSITION[]) as any
    const [hiddenMembers, setHiddenMembers] = useState([])
    const theme = {
        "background": project_colors.surface[1],
        "textColor": "white"
    }

    if (data.length <= 0) return <Spinner/>
    return (<ResponsiveRadar
        data={data.chartData}
        keys={data.keys}
        theme={theme}
        indexBy="position"
        valueFormat=">-.2f"
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: 'color' }}
        gridLabelOffset={36}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={[
            {
                anchor: 'top-left',
                direction: 'column',
                translateX: -50,
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
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />)
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