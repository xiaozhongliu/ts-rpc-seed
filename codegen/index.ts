import fs from 'fs'
import shell from 'shelljs'
import { promisify } from 'util'
import deserialize from './deserialize'
import {
    Enum,
    Package,
    Service,
    Method,
    Message,
    Property,
} from './model'

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)

async function main() {
    const protos = await readdir('./proto')
    for (const proto of protos) {
        const content = await readFile(`./proto/${proto}`)
        generate(deserialize(content.toString()))
    }
}
main()

/**
 * generate ts files from AST
 */
function generate(pack: Package) {
    console.log('\nfinal AST: ', JSON.stringify(pack, undefined, '    '))

    const packDir = `${__dirname}/__${pack.name}`
    const typeDir = `typings/${pack.name}`
    recreateDirs(packDir, typeDir)

    /**
     * generate ctrl
     */
    pack.services.forEach(service => {
        const fileName = `${service.name.toLowerCase()}-ctrl.ts`
        const stream = fs.createWriteStream(`${packDir}/${fileName}`)

        const imports = service.methods.map(({ response }) => `import ${response.name} from '../typings/${pack.name}/${response.name}'`)
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
            ${ method.response.properties.map(property => 'null,').join('\n            ')}
        )
    },`,
            )
        }

        stream.write('\n}\n')
        stream.end()
        console.log('\ngenerated ctrl:', fileName)
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
function recreateDirs(...dirs: string[]) {
    dirs.forEach(dir => {
        shell.exec(`rm -rf ${dir}`)
        shell.exec(`mkdir -p ${dir}`)
    })
}
