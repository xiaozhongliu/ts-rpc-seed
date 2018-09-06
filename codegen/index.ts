import fs from 'fs'
import shell from 'shelljs'
import {
    Enum,
    Package,
    Service,
    Method,
    Message,
    Property,
} from './model'

const src = './proto/helloworld.proto'

function deserialize(src: string): Package {
    let pack = undefined
    let isParsingService = false
    let currentService = undefined
    let isParsingMessage = false
    let currentMessage = undefined

    const content = fs.readFileSync(src, { encoding: 'utf8' })
    const lines = content.split('\n')
    for (const line of lines) {

        /**
         *  parse package
         */
        if (!pack && line.startsWith('package')) {
            const [str, name] = /package\s+(.*?);/.exec(line)
            pack = new Package(name)

            console.log('\nparsing package: ', pack.name)
            continue
        }

        /**
         * parse services
         */
        if (!isParsingService && line.startsWith('service')) {
            if (!pack) {
                throw new Error('proto error: you should declare package first')
            }

            isParsingService = true
            const [str, name] = /service\s+(.*?)\s+{/.exec(line)
            currentService = new Service(name, pack.name)
            pack.services.push(currentService)

            console.log('    parsing service: ', name)
            continue
        }
        if (isParsingService && /rpc\s+/.test(line)) {
            const [str, name, req, res] = /rpc\s+(.*?)\s+\((.*?)\)\s+returns\s+\((.*?)\)\s+{}/.exec(line)
            const method = new Method(name, new Message(req), new Message(res))
            currentService.methods.push(method)

            console.log('        parsing method: ', name)
            continue
        }
        if (isParsingService && line === '}') {
            isParsingService = false
            currentService = undefined
            continue
        }

        /**
         * parse messages
         */
        if (!isParsingMessage && line.startsWith('message')) {
            isParsingMessage = true
            const [str, name] = /message\s+(.*?)\s+{/.exec(line)
            currentMessage = new Message(name)

            console.log('    parsing message: ', name)
            continue
        }
        if (isParsingMessage && line !== '}') {
            const [str, type, name, binaryId] = /\s+(.*?)\s+(.*?)\s+=\s+(.*?);/.exec(line)
            const property = new Property(name, type, parseInt(binaryId))
            currentMessage.properties.push(property)

            console.log('        parsed property: ', name)
            continue
        }
        if (isParsingMessage && line === '}') {
            upodateMessages(pack, currentMessage)

            isParsingMessage = false
            currentMessage = undefined
            continue
        }
    }

    return pack
}

function generate(pack: Package) {
    console.log('\nfinal ast: ', JSON.stringify(pack))

    const packDir = `${__dirname}/${pack.name}`
    shell.exec(`rm -rf ${packDir}`)
    shell.mkdir(packDir)

    /**
     * generate ctrl
     */
    pack.services.map(service => {
        const stream = fs.createWriteStream(`${packDir}/${service.name.toLowerCase()}-ctrl.ts`)

        stream.write(`export default {

    // proto package name
    package: '${pack.name}',
    // proto service name
    service: '${service.name}',`,
        )

        for (const method of service.methods) {
            stream.write(`\n
    async ${ method.name}(req: ${method.request.name}) {
        return {${ method.response.properties.map(property => `\n            ${property.name}: undefined,`).join()}
        }
    },`,
            )
        }

        stream.write('\n}\n')
        stream.end()
    })

    /**
     * generate types
     */

}

function main() {
    try {
        generate(deserialize(src))
    } catch (error) {
        console.log(error)
    }
}
main()

/**
 * helper methods
 */
function upodateMessages(pack: Package, message: Message) {
    for (const { methods } of pack.services) {
        for (const method of methods) {
            if (method.request.name === message.name) {
                method.request = message
            }
            if (method.response.name === message.name) {
                method.response = message
            }
        }
    }
}
