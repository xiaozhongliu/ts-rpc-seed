import { Property } from './index'

export default class Message {

    name: string
    properties: Property[] = []

    constructor(name: string) {
        this.name = name
    }
}
