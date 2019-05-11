import {
    Enum,
    Package,
    Service,
    Method,
    Message,
    Property,
} from './model'

/**
 * deserialize from proto definition to AST
 */
export default function deserialize(content: string): Package {
    let pack
    let isParsingService = false
    let currentService
    let isParsingMessage = false
    let currentMessage
    let isParsingChildMessage = false
    let currentChildMessage
    let isTypeOneof

    content = content
        // remove comments
        .replace(/\/\/.*\n/g, '\n')
        // format one line message to multi lines
        .replace(
            /\nmessage\s.+\s({\s).+(\s})/g,
            (match, p1, p2) => {
                return match
                    .replace(p1, '{\n    ')
                    .replace(p2, '\n}')
            },
        )
        // format multi lines method to one line
        .replace(
            /rpc\s.+\(.+\)(\n\s{6})returns/g,
            (match, p1) => match.replace(p1, ' '),
        )

    for (let line of content.split('\n')) {

        if (line === '') continue

        /**
         *  parse package
         */
        if (!pack && line.startsWith('package')) {
            const name = /package\s+(.*?);/.exec(line)![1]
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
            const name = /service\s+(.*?)\s+{/.exec(line)![1]
            currentService = new Service(name, pack.name)
            pack.services.push(currentService)

            console.log('    parsing service: ', name)
            continue
        }
        if (isParsingService && /rpc\s+/.test(line)) {
            const [str, name, req, res] = /rpc\s+(.*?)\s*\((.*?)\)\s*returns\s*\((.*?)\)\s*{}/.exec(line)!

            let reqMessage
            let resMessage
            if (pack.messages.length) {
                reqMessage = pack.messages.find(message => req === message.name)
                resMessage = pack.messages.find(message => res === message.name)
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

            console.log('        parsed method: ', name)
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
            const name = /message\s+(.*?)\s*{/.exec(line)![1]
            currentMessage = pack.messages.find(message => name === message.name)
            if (!currentMessage) {
                currentMessage = new Message(name)
                pack.messages.push(currentMessage)
            }

            console.log('    parsing message: ', name)
            continue
        }
        if (isParsingMessage && !line.startsWith('  oneof') && !line.startsWith('  message') && line !== '}') {
            const repeated = line.includes('repeated')
            if (repeated) {
                line = line.replace('repeated', '')
            }
            const optional = line.includes('optional')
            if (optional) {
                line = line.replace('optional', '')
            }
            const [str, rawType, name, binaryId] = /\s+(.*?)\s+(.*?)\s*=\s*(.*?);/.exec(line)!
            const type = Enum.TypeMapping[rawType] || rawType
            const finalType = repeated ? `${type}[]` : type
            const finalName = optional ? `${name}?` : name
            const property = new Property(name, finalType, parseInt(binaryId))
            currentMessage.properties.push(property)

            console.log('        parsed property: ', name)
            continue
        }
        if (isParsingMessage && line === '}') {
            isParsingMessage = false
            currentMessage = undefined
            continue
        }

        /**
         * parse child messages
         */
        if (isParsingMessage && !isParsingChildMessage) {
            isParsingMessage = false
            isParsingChildMessage = true
            isTypeOneof = line.startsWith('  oneof')
            const name = isTypeOneof ?
                /\s{2}oneof\s+(.*?)\s*{/.exec(line)![1] :
                /\s{2}message\s+(.*?)\s*{/.exec(line)![1]
            currentChildMessage = pack.messages.find(message => name === message.name)
            if (!currentChildMessage) {
                currentChildMessage = new Message(name)
                pack.messages.push(currentChildMessage)
            }

            console.log('        parsing child message: ', name)
            continue
        }
        if (isParsingChildMessage && line !== '  }') {
            const repeated = line.includes('repeated')
            if (repeated) {
                line = line.replace('repeated', '')
            }
            const optional = line.includes('optional')
            if (optional) {
                line = line.replace('optional', '')
            }
            const [str, rawType, name, binaryId] = /\s+(.*?)\s+(.*?)\s*=\s*(.*?);/.exec(line)!
            const type = Enum.TypeMapping[rawType] || rawType
            const finalType = repeated ? `${type}[]` : type
            const finalName = isTypeOneof || optional ? `${name}?` : name
            const property = new Property(finalName, finalType, parseInt(binaryId))
            currentChildMessage.properties.push(property)

            console.log('            parsed property: ', finalName)
            continue
        }
        if (isParsingChildMessage && line === '  }') {
            isParsingMessage = true
            isParsingChildMessage = false
            currentChildMessage = undefined
            continue
        }
    }

    return upodateMethodsMessages(pack)
}

/**
 * helper methods
 */
function upodateMethodsMessages(pack: Package) {
    for (const { methods } of pack.services) {
        for (const method of methods) {
            const reqMessage = pack.messages.find(message => method.request.name === message.name)
            const resMessage = pack.messages.find(message => method.response.name === message.name)
            method.request = reqMessage as Message
            method.response = resMessage as Message
        }
    }
    return pack
}
