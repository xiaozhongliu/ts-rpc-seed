export default class Property {

    name: string
    type: string
    binaryId: number

    constructor(name: string, type: string, binaryId: number) {
        this.name = name
        this.type = type
        this.binaryId = binaryId
    }
}
