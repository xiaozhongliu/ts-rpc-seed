import { Enum } from '../../typings/enum'

class TypeMapping extends Enum {
    bool = 'boolean'
    int32 = 'number'
    double = 'number'
}

export default {
    TypeMapping: new TypeMapping(),
}
