import fs from 'fs'
import path from 'path'
import shell from 'shelljs'
import { promisify } from 'util'
import { Package } from './model'
import deserialize from './deserialize'

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const protoDir = path.resolve('./', 'proto')
const typingsDir = path.resolve('./', 'typings')
const controllerDir = `${__dirname}/dist`

async function main() {
    recreateDirs(controllerDir)

    const protos = await readdir(protoDir)
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
    console.log(`\nfinal AST: ${JSON.stringify(pack, undefined, '    ')}\n`)

    const packDir = `${typingsDir}/${pack.name}`
    recreateDirs(packDir)

    /**
     * generate ctrl
     */
    pack.services.forEach(service => {
        const fileName = `${service.name.toLowerCase()}.ts`
        const stream = fs.createWriteStream(`${controllerDir}/${fileName}`)

        const imports = service.methods.map(({ response }) => `import ${response.name} from '../typings/${pack.name}/${response.name}'`)
        const distinctImports = [...new Set(imports)]
        stream.write(`import { Controller, Context } from 'fong'
${distinctImports.join('\n')}\n
export default class ${service.name}Controller extends Controller {`,
        )

        for (const method of service.methods) {
            stream.write(`\n
    async ${ method.name}(ctx: Context, req: ${method.request.name}): Promise<${method.response.name}> {
        return new ${method.response.name}(
            ${ method.response.properties.map(property => 'null,').join('\n            ')}
        )
    }`,
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
        const stream = fs.createWriteStream(`${packDir}/${fileName}`)

        if (isRequestType) {
            stream.write(`interface ${message.name} extends Req {
${ message.properties.map(property => `    ${property.name}: ${property.type}\n`).join()}}\n`,
            )
        } else {
            stream.write(`export default class ${message.name} {
${ message.properties.map(property => `\n    ${property.name}: ${property.type}`).join()}\n
    constructor(${ message.properties.map(property => `${property.name}: ${property.type}`).join(', ')}) {
${ message.properties.map(property => `        this.${property.name} = ${property.name}`).join('\n')}
    }
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
