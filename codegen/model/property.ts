import { PropertyType } from './enum'

export default class Property {

    constructor(name: string, type: string, binaryId: number) {
        this.name = name
        this.type = type
        this.binaryId = binaryId
    }

    name: string
    type: string
    binaryId: number
}
