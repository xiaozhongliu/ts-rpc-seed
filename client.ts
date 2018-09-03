if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev'

import grpc from 'grpc'
import config from './config'
import { proto } from './util'
import { promisify } from 'util'

const clientAddress = `localhost:${config.API_PORT}`
const credentials = grpc.credentials.createInsecure()
const pack = proto.loadPackage('helloworld')
const client = new pack.Greeter(clientAddress, credentials)

const sayHello = promisify(client.sayHello).bind(client)
const sayGoodbye = promisify(client.sayGoodbye).bind(client)

async function main() {
    const helloRes = await sayHello({ name: 'foo' })
    console.log('Greeting:', helloRes.message)
    const goodbyeRes = await sayGoodbye({ name: 'foo' })
    console.log('Leaving:', goodbyeRes.message)
}
main()
