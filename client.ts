if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev'

import grpc from 'grpc'
import fs from 'fs'
import config from './config'
import { proto } from './util'
import { promisify } from 'util'

const credentials = grpc.credentials.createSsl(
    fs.readFileSync('./config/cert/ca.crt'),
    fs.readFileSync('./config/cert/client.key'),
    fs.readFileSync('./config/cert/client.crt')
);
const clientAddress = `localhost:${config.API_PORT}`
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
