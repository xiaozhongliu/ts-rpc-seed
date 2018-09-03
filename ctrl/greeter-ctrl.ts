export default {

    // proto package name
    package: 'helloworld',
    // proto service name
    service: 'Greeter',

    async sayHello(req: Req) {
        const message = `Hello ${req.body.name}`
        return { message }
    },

    async sayGoodbye(req: Req) {
        const message = `Goodbye ${req.body.name}`
        return { message }
    },
}
