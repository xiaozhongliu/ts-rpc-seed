
import { Context } from '../framework'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
dayjs.locale('zh-cn')

export default async (ctx: Context, req: object, next: Function) => {
    const start = dayjs()
    await next()
    const end = dayjs()

    ctx.app.logger.request({
        '@timestamp': start.format('YYYY-MM-DD HH:mm:ss.SSS'),
        '@duration': end.diff(start, 'millisecond'),
        controller: ctx.controller,
        action: ctx.action,
        metedata: JSON.stringify(ctx.metadata),
        request: JSON.stringify(req),
        response: JSON.stringify(ctx.response),
    })
}
