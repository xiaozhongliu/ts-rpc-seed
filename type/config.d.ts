interface Config extends Indexed {

    // basic
    API_NAME: string
    API_PORT: number

    // logs location
    API_LOG_PATH: string
    TASK_LOG_PATH: string

    // env specific
    DEBUG?: Boolean
    MAILER_ON?: Boolean

    ZOO_KEEPER?: string,
}
