import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import config from '../config'
import { logger as initLogger } from '../util'

dayjs.locale('zh-cn')
const logger = initLogger(config.API_LOG_PATH)

export default async (req: Req, res: Res, next: Function) => {

    const start = dayjs()
    await next()
    const end = dayjs()

    logger.info('%s  [ %s.%s ]  %sms  -  req: %s  -  res: %s',
        end.format('YYYY-MM-DD HH:mm:ss.SSS'),
        req.controller,
        req.action,
        end.diff(start, 'millisecond'),
        JSON.stringify(req.body),
        JSON.stringify(res.data),
    )
}
