import { Message } from './index'

export default class Method {

    constructor(name: string, request: Message, response: Message) {
        this.name = name
        this.request = request
        this.response = response
    }

    name: string
    request: Message
    response: Message
}
