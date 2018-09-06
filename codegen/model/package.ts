import { Service } from './index'

export default class Package {

    constructor(name: string) {
        this.name = name
    }

    name: string
    services: Service[] = []
}
