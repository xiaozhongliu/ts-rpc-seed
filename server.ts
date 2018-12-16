if (!process.env.NODE_ENV) process.env.NODE_ENV = 'dev'
// use same root directory for node and ts-node
global.rootdir = __dirname.replace('/dist', '')

import grpc from 'grpc'
import config from './config'
import { proto } from './util'
import register from './register'

const server = new grpc.Server()
register(server)

const serverAddress = `0.0.0.0:${config.API_PORT}`
// server.bind(serverAddress, proto.getCredentials())
server.bind(serverAddress, grpc.ServerCredentials.createInsecure())
server.start()
