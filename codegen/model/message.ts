import { Property } from './index'

export default class Message {

    constructor(name: string) {
        this.name = name
    }

    name: string
    properties: Property[] = []
}
