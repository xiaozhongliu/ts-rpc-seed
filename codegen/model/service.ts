import { Method } from './index'

export default class Service {

    constructor(name: string, pack: string) {
        this.name = name
        this.package = pack
    }

    name: string
    package: string
    methods: Method[] = []
}
