import { Controller, Context } from '../framework'
import HelloReply from '../typings/greeter/HelloReply'

export default class GreeterController extends Controller {

    async sayHello(ctx: Context, req: HelloRequest): Promise<HelloReply> {
        const message = `Hello ${req.name}`
        return new HelloReply(
            message,
        )
    }

    async sayGoodbye(ctx: Context, req: HelloRequest): Promise<HelloReply> {
        const message = `Goodbye ${req.name}`
        return new HelloReply(
            message,
        )
    }
}
