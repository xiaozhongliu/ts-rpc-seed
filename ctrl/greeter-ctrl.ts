import HelloReply from '../type/greeter/HelloReply'

export default {

    // proto package name
    package: 'greeter',
    // proto service name
    service: 'Greeter',

    async sayHello(req: HelloRequest) {
        const message = `Hello ${req.body.name}`
        return new HelloReply(
            message,
        )
    },

    async sayGoodbye(req: HelloRequest) {
        const message = `Goodbye ${req.body.name}`
        return new HelloReply(
            message,
        )
    },
}
