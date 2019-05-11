export default (appInfo: AppInfo): Config => {
    return {
        // basic
        PORT: 50051,

        // log
        COMMON_LOG_PATH: `${appInfo.rootPath}/log/common`,
        REQUEST_LOG_PATH: `${appInfo.rootPath}/log/request`,
    }
}
