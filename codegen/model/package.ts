import { Service, Message } from './index'

export default class Package {

    name: string
    services: Service[] = []
    messages: Message[] = []

    constructor(name: string) {
        this.name = name
    }
}
