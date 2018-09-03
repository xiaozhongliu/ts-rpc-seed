import base from './base'
import dev from './dev'
import int from './int'
import qa from './qa'
import prod from './prod'

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
