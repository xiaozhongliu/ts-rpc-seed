import { Message } from './index'

export default class Method {

    name: string
    request: Message
    response: Message

    constructor(name: string, request: Message, response: Message) {
        this.name = name
        this.request = request
        this.response = response
    }
}
