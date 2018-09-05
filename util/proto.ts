/* ******************************************************************
 * grpc related util functions
 ****************************************************************** */
import fs from 'fs'
import grpc from 'grpc'
import { loadSync } from '@grpc/proto-loader'

export default {

    loadPackage(packageName: string): Indexed {
        const proto = loadSync(
            `./proto/${packageName}.proto`,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        )
        return grpc.loadPackageDefinition(proto)[packageName]
    },

    getCredentials() {
        return grpc.ServerCredentials.createSsl(
            fs.readFileSync('../config/cert/ca.crt'),
            [{
                cert_chain: fs.readFileSync('../config/cert/server.crt'),
                private_key: fs.readFileSync('../config/cert/server.key'),
            }],
            true,
        )
    },
}
