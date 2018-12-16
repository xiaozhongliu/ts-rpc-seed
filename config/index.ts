import base from './config.default'
import dev from './config.dev'
import int from './config.test'
import qa from './config.stage'
import prod from './config.prod'

const envs: Indexed = { dev, int, qa, prod }
const env = process.env.NODE_ENV
console.log(`env is: ${env}`)
export default mergeDeep(base, envs[env])

/**
 * helper functions (they should be here other than in ..util namespace)
 */
function mergeDeep(target: any, source: any): Config {
    const output = Object.assign({}, target)
    if (!isObject(target) || !isObject(source)) {
        return output
    }
    Object.keys(source).forEach(key => {
        if (target[key] && isObject(source[key])) {
            output[key] = mergeDeep(target[key], source[key])
            return
        }
        output[key] = source[key]
    })
    return output
}

function isObject(item: any) {
    return item && typeof item === 'object' && !Array.isArray(item)
}
