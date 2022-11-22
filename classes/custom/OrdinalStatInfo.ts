import { ordinal_suffix_of } from "../../utility/rosterFunctions"
import LeagueMember from "./LeagueMember"

export class OrdinalStatInfo {
    name: string
    stat: string
    placement: string
    avatar: string
    rosterId: number
    placementValue: number
    isAboveAverage: boolean | null

    constructor(name: string, rosterId: number,  placement: number, stat: string, avatar: string, isAboveAverage: boolean | null) {
        this.name = name
        this.rosterId = rosterId
        this.stat = stat
        this.placement = ordinal_suffix_of(placement)
        this.avatar = avatar
        this.placementValue = placement
        this.isAboveAverage = isAboveAverage
    }
}