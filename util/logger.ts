/* ******************************************************************
 * file logger on the basis of log4js
 *
 * IMPORTANT: please install a module to work under pm2 cluster mode:
 * pm2 install pm2-intercom
 ****************************************************************** */
import fs from 'fs'
import log4js from 'log4js'
import config from '../config'

export default (logPath: string) => {

    const layout = {
        type: 'pattern',
        pattern: '%m',
    }
    const appenders = {
        dateFile: {
            type: 'dateFile',
            category: 'APP',
            pattern: 'yyyyMMdd.log',
            alwaysIncludePattern: true,
            filename: logPath,
            layout,
        },
    }
    const categories = {
        default: { appenders: ['dateFile'], level: 'info' },
    }

    // non prod logs also output to console
    if (config.DEBUG) {
        // @ts-ignore
        appenders.console = { type: 'console', layout }
        categories.default.appenders.push('console')
    }

    // create the log path if it doesn't exist
    fs.existsSync(logPath) || fs.mkdirSync(logPath)

    log4js.configure({
        appenders,
        categories,
        pm2: true,
    })

    return log4js.getLogger('APP')
}
