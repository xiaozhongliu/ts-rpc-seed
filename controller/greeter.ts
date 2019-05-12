import { Controller, Context } from 'fong'
import HelloReply from '../typings/greeter/HelloReply'

export default class GreeterController extends Controller {

    async sayHello(ctx: Context, req: HelloRequest): Promise<HelloReply> {
        return new HelloReply(
            `Hello ${req.name}`,
        )
    }

    async sayGoodbye(ctx: Context, req: HelloRequest): Promise<HelloReply> {
        return new HelloReply(
            `Goodbye ${req.name}`,
        )
    }
}
