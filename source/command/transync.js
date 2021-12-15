const { Command } = require('commander')
const fs = require('fs')
const path = require('path')
const { generateTranslationMap } = require('../translator')

const program = new Command()
program.version('1.0.0')
program
    .option('-i, --input <input>', 'input JSON file')
    .option('-o, --output <output>', 'output JSON file')
    .option('-b, --base <base>', 'base JSON file')
    .option('-s, --source-lang <sourceLang>', 'source language')
    .option('-t, --target-lang <targetLang>', 'target language')
program.parse(process.argv)

const {
    input,
    output,
    base,
    sourceLang,
    targetLang
} = program.opts()

const main = async () => {
    try {
        const inputJson = fs.readFileSync(path.join(__dirname, 'source', input), 'utf8')
        const baseJson = fs.readFileSync(path.join(__dirname, 'source', base), 'utf8')
        const inputData = JSON.parse(inputJson)
        const baseData = JSON.parse(baseJson)
        const keys = []

        for (const baseKey in baseData) {
            if (!inputData[baseKey]) {
                inputData[baseKey] = null
            }
        }

        for (const inputKey in inputData) {
            if (!inputData[inputKey]) {
                keys.push(inputKey)
            }
        }

        // const translationMap = await generateTranslationMap(keys, targetLang, sourceLang)

        for (const inputKey in inputData) {
            const value = inputData[inputKey]
            const translatedValue = translationMap[inputKey] || value
            inputData[inputKey] = translatedValue
        }

        const segments = input.split('/')
        const fileName = segments[segments.length - 1]
        fs.writeFileSync(output ? path.join(__dirname, output) :path.join(__dirname, 'target', fileName), JSON.stringify(inputData))
    } catch (e) {
        console.error(e)
    }
}

main()
