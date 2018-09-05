if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev'
// use same root directory for node and ts-node
global.rootdir = __dirname.replace('/dist', '')

import grpc from 'grpc'
import fs from 'fs'
import register from './register'
import config from './config'

const server = new grpc.Server()
register(server)

const credentials = grpc.ServerCredentials.createSsl(
    fs.readFileSync('./config/cert/ca.crt'),
    [{
        cert_chain: fs.readFileSync('./config/cert/server.crt'),
        private_key: fs.readFileSync('./config/cert/server.key')
    }],
    true
)
const serverAddress = `127.0.0.1:${config.API_PORT}`
server.bind(serverAddress, credentials)
server.start()
