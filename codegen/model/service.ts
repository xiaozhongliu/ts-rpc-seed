import { Method } from './index'

export default class Service {

    name: string
    package: string
    methods: Method[] = []

    constructor(name: string, pack: string) {
        this.name = name
        this.package = pack
    }
}
