import { Server } from 'grpc'
import { proto } from './util'
import { midwares, logger } from './midware'
import { greeterCtrl } from './ctrl'

export default (server: Server) => {

    // register common midwares here
    midwares.use(logger)

    // register all controllers here
    register(server, greeterCtrl)
}

function register(server: Server, controller: Controller) {

    const impl: Indexed = {}

    for (const member of Object.keys(controller)) {
        if (typeof controller[member] !== 'function') continue

        impl[member] = (call: any, callback: Function) => {
            try {
                midwares.execute(
                    {
                        controller: controller.service,
                        action: member,
                        body: call.request,
                    },
                    {},
                    async (req: Req, res: Res) => {
                        const data = await controller[member](req)
                        callback(null, data)
                        res.data = data
                    },
                )
            } catch (error) {
                // TODO: handle errors
                console.log(error)
            }
        }
    }

    const pack = proto.loadPackage(controller.package)
    server.addService(pack[controller.service].service, impl)
}
