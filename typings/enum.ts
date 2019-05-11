class Enum {

    [index: string]: any

    private map: Map<string, string>

    updateMap(property: string, text: string) {
        if (!this.map) { this.map = new Map<string, string>() }
        this.map.set(property, text)
    }

    getNames() {
        return [...this.map.keys()]
    }

    getTexts() {
        return [...this.map.values()]
    }

    getTextByName(name: string) {
        return this.map.get(name)
    }

    getTextByValue(value: number) {
        const name = this.getNames().find(item => this[item] === value)
        return this.map.get(name)
    }

    getValueByText(text: string) {
        for (const [key, value] of this.map.entries()) {
            if (text === value) { return this[key] }
        }
    }
}

function desc(text: string) {
    return function actual<T extends Enum>(target: T, property: string) {
        target.updateMap(property, text)
    }
}

export {
    Enum,
    desc,
}
