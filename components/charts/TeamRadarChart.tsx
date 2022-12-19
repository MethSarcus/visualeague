import { Box, Spinner, useMediaQuery } from '@chakra-ui/react';
import { ResponsiveRadar } from '@nivo/radar';
import { useState } from 'react';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { POSITION } from '../../utility/rosterFunctions';
import { useBreakpointValue } from '@chakra-ui/react'


interface MyProps {
    league: League | undefined
}

const TeamRadarChart = (props: MyProps) => {
    const [hiddenMembers, setHiddenMembers] = useState([])
    const [isLargerThan800] = useMediaQuery('(min-width: 800px)', {
        ssr: true,
        fallback: false, // return false on the server, and re-evaluate on the client side
      })

    let marginVals = { top: 50, right: 100, bottom: 75, left: 0 }
    let legendDirection = 'column'
    let legendAnchor = 'right'
    let legendsArr = []
    if (!isLargerThan800) {
        marginVals = { top: 0, right: 25, bottom: 75, left: 25 }
        legendDirection = "row"
        legendAnchor = 'bottom'
    }

    if (isLargerThan800) {
        legendsArr.push(
            {
                anchor: legendAnchor as any,
                direction: legendDirection as any,
                translateX: -20,
                translateY: -40,
                itemWidth: 80,
                toggleSerie: true,
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
        )
    }

    if (props.league?.settings == undefined) return <Spinner/>
    let data = formatScoresForRadarChart(Array.from(props.league?.members.values()), props.league?.getPositions() as POSITION[]) as any

    const theme = {
        "background": "none",
        "textColor": "white"
    }


    return (

    <ResponsiveRadar
        data={data.chartData}
        keys={data.keys}
        theme={theme}
        
        indexBy="position"
        valueFormat=">-.2f"
        margin={marginVals}
        borderColor={{ from: 'color' }}
        gridLabelOffset={20}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        motionConfig="wobbly"
        
        legends={legendsArr as any}
    />)
}


function formatScoresForRadarChart(members: LeagueMember[] | undefined, positions: POSITION[] | undefined) {
    let data: object[] = []
    let keys: string[] = []

    members?.forEach((member: LeagueMember, key: number) => {keys.push(member.name)})

    positions?.forEach((position) => {
        let positionObj: {[k: string]: any} = {position: position}
        members?.forEach((member: LeagueMember, key: number) => {
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