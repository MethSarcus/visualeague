"use client"

import { Box, Grid, Heading, Spinner } from "@chakra-ui/react"
import { useContext } from "react"
import KTC_Bar_Chart from "../../../../components/charts/bar/KTC_Bar_Chart"
import { LeagueContext } from "../../../../contexts/LeagueContext"

const DynastyPage = () => {
    const [context, setContext] = useContext(LeagueContext)

    
	const desktopTemplate = `"TeamSum TeamSum TeamSum"
    "schedule schedule schedule"
    "stats stats stats"
    "playerStats playerStats playerStats"
    "weekStats weekStats weekStats"
    "radar radar radar"`
  
      const mobileTemplate = `"TeamSum"
    "schedule"
    "stats"
    "playerStats"
    "weekStats"
    "radar"`


    if (context?.settings == undefined) return (<Spinner/>)
    return (
        <Box>
            <Heading>Dynasty Page</Heading>

            <Box overflowX={'hidden'}>
			<Grid
				gap={5}
				mx={4}
				my={2}
				templateAreas={[mobileTemplate, desktopTemplate]}
			>
                
            </Grid>
            <Box width={"800px"} height={"1200px"}>
                <KTC_Bar_Chart league={context}/>
            </Box>
            </Box>
        </Box>
    )
}

export default DynastyPage