
import { Context } from 'fong'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
dayjs.locale('zh-cn')

export default async (ctx: Context, req: object, next: Function) => {
    const start = dayjs()
    await next()
    const end = dayjs()

    ctx.logger.request({
        '@duration': end.diff(start, 'millisecond'),
        controller: `${ctx.controller}.${ctx.action}`,
        metedata: JSON.stringify(ctx.metadata),
        request: JSON.stringify(req),
        response: JSON.stringify(ctx.response),
    })
}
