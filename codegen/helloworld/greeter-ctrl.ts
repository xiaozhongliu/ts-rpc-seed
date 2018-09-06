export default {

    // proto package name
    package: 'helloworld',
    // proto service name
    service: 'Greeter',

    async sayHello(req: HelloRequest) {
        return {
            message: undefined,
        }
    },

    async sayGoodbye(req: HelloRequest) {
        return {
            message: undefined,
        }
    },
}
