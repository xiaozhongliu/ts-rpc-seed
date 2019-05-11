import { promises as fs } from 'fs'
import { Framework } from '../class'

export default async (app: Framework) => {
    const midwarePath = `${app.appInfo.rootPath}/midware`
    const files = await fs.readdir(midwarePath)
    for (const file of files) {

        const module = await import(`${midwarePath}/${file}`)
        const midware: Function = module.default
        app.midware.use(midware)
    }
}