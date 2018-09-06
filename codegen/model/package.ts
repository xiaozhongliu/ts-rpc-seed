import { Service, Message } from './index'

export default class Package {

    constructor(name: string) {
        this.name = name
    }

    name: string
    services: Service[] = []
    messages: Message[] = []
}
