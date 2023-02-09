

export default class MemberBadge {
    title: string
    description: string
    icon: string
    isGoodThing: boolean | undefined
    isUnique: boolean | undefined
    recipient_id: number
    constructor(title: string, description: string, icon: string, roster_id: number, isGoodThing?: boolean, isUnique?: boolean) {
        this.title = title
        this.description = description
        this.icon = icon
        this.isGoodThing = isGoodThing
        this.isUnique = isUnique
        this.recipient_id = roster_id
    }
}