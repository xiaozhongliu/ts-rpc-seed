if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev'
// use same root directory for node and ts-node
global.rootdir = __dirname.replace('/dist', '')

import grpc, { Server } from 'grpc'
import register from './register'
import config from './config'

const server = new Server()
register(server)

const serverAddress = `127.0.0.1:${config.API_PORT}`
const credentials = grpc.ServerCredentials.createInsecure()
server.bind(serverAddress, credentials)
server.start()
