import grpc from 'grpc'
import { promisify } from 'util'
import * as protoLoader from '@grpc/proto-loader'

const proto = './proto/greeter.proto'
const address = '0.0.0.0:50051'

const packageDefinition = protoLoader.loadSync(
    proto,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    },
)
const pack: any = grpc.loadPackageDefinition(packageDefinition).greeter
const client = new pack.Greeter(address, grpc.credentials.createInsecure())

const sayHello = promisify(client.sayHello).bind(client)
const sayGoodbye = promisify(client.sayGoodbye).bind(client)

async function main() {
    const helloRes = await sayHello({ name: 'world' })
    console.log('Greeting:', helloRes.message)
    const goodbyeRes = await sayGoodbye({ name: 'world' })
    console.log('Leaving:', goodbyeRes.message)
}
main()
