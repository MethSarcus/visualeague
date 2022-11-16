import { AvatarGroup, Box, HStack } from "@chakra-ui/react"
import LeagueMember from "../../classes/custom/LeagueMember"
import { OrdinalStatInfo } from "../../classes/custom/OrdinalStatInfo"
import NumericalAvatar from "./NumericalAvatar"
import { Text } from '@chakra-ui/react'

interface MyProps {
    avatars: OrdinalStatInfo[]
    statTitle: string
}

const NumericalAvatarGroup = (props: MyProps) => {
    return (
    <Box p={6} color={"white"}>
        <Text fontSize='md'>{props.statTitle}</Text>
        <HStack spacing={4} mt={2}>
        
        {props.avatars.map((avatarStats) => {
            return <NumericalAvatar key={avatarStats.name} avatarStats={avatarStats}/>})}
    </HStack>
    </Box>
    )

}

export default NumericalAvatarGroup;