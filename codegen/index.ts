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

const src = './proto/greeter.proto'
function main(src: string) {
    try {
        generate(deserialize(src))
    } catch (error) {
        console.log(error)
    }
}
main(src)

/**
 * deserialize from proto definition to AST
 */
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

            let reqMessage
            let resMessage
            if (pack.messages.length) {
                reqMessage = pack.messages.find((message => req === message.name))
                resMessage = pack.messages.find((message => res === message.name))
            }
            if (!reqMessage) {
                reqMessage = new Message(req)
                pack.messages.push(reqMessage)
            }
            if (!resMessage) {
                resMessage = new Message(res)
                pack.messages.push(resMessage)
            }
            const method = new Method(name, reqMessage, resMessage)
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
            currentMessage = pack.messages.find((message => name === message.name))

            if (!pack) {
                throw new Error(`proto error: unused message [${name}]`)
            }
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
            isParsingMessage = false
            currentMessage = undefined
            continue
        }
    }

    return upodateMethodsMessages(pack)
}

/**
 * generate ts files from AST
 */
function generate(pack: Package) {
    console.log('\nfinal AST: ', JSON.stringify(pack, null, '    '))

    const packDir = `${__dirname}/__${pack.name}`
    shell.exec(`rm -rf ${packDir}`)
    shell.exec(`mkdir ${packDir}`)
    const typeDir = `type/${pack.name}`
    shell.exec(`rm -rf ${typeDir}`)
    shell.exec(`mkdir ${typeDir}`)

    /**
     * generate ctrl
     */
    pack.services.forEach(service => {
        const fileName = `${service.name.toLowerCase()}-ctrl.ts`
        const stream = fs.createWriteStream(`${packDir}/${fileName}`)

        const imports = service.methods.map(({ response }) => `import ${response.name} from '../type/${pack.name}/${response.name}'`)
        const distinctImports = [...new Set(imports)]
        stream.write(`${distinctImports.join('\n')}\n
export default {\n
    // proto package name
    package: '${pack.name}',
    // proto service name
    service: '${service.name}',`,
        )

        for (const method of service.methods) {
            stream.write(`\n
    async ${ method.name}(req: ${method.request.name}) {
        return new ${method.response.name}(
            ${ method.response.properties.map(property => 'undefined,').join('\n            ')}
        )
    },`,
            )
        }

        stream.write('\n}\n')
        stream.end()
        console.log('\ngenerated ctrl: ', fileName)
    })

    /**
     * generate types
     */
    pack.messages.forEach(message => {
        const isRequestType = message.name.includes('Request')
        const fileName = `${message.name}${isRequestType ? '.d' : ''}.ts`
        const stream = fs.createWriteStream(`${typeDir}/${fileName}`)

        if (isRequestType) {
            stream.write(`interface ${message.name} extends Req {\n
    body: {${ message.properties.map(property => `\n        ${property.name}: ${property.type}`).join()}
    }
}\n`,
            )
        } else {
            stream.write(`export default class ${message.name} {\n
    constructor(${ message.properties.map(property => `${property.name}: ${property.type}`).join(', ')}) {
${ message.properties.map(property => `        this.${property.name} = ${property.name}`).join('\n')}
    }
${ message.properties.map(property => `\n    ${property.name}: ${property.type}`).join()}
}\n`,
            )
        }

        stream.end()
        console.log('generated %s: %s', isRequestType ? 'type' : 'class', fileName)
    })
}

/**
 * helper methods
 */
function upodateMethodsMessages(pack: Package) {
    for (const { methods } of pack.services) {
        for (const method of methods) {
            const reqMessage = pack.messages.find(message => method.request.name === message.name)
            const resMessage = pack.messages.find(message => method.response.name === message.name)
            method.request = reqMessage
            method.response = resMessage
        }
    }
    return pack
}
