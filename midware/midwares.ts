class MidwareList {

    private list: Function[] = []

    use(midware: Function) {
        this.list.push(midware)
    }

    async execute(req: Req, res: Res, final: Function) {
        let index = 0

        const next = async () => {
            const midware = this.list[index++]
            if (midware) {
                return midware(req, res, next)
            }
            return final(req, res)
        }

        return next()
    }
}

export default new MidwareList()
