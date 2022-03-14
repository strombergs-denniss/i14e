const fs = require('fs')
const path = require('path')
const { generateTranslationMap } = require('../core/translator')
const csv = require('csv-parser')
const fastcsv = require('fast-csv');

const allowedList = [
    /Sportland/,
    /Sales/,
    /Customer/,
    /Email/,
    /Checkout/,
    /Gdpr/,
    /^web$/
]

const isAllowed = (value) => {
    for (const allowed of allowedList) {
        if (allowed.test(value)) {
            return true
        }
    }

    return false
}

const processCsv = (input, targetLang) => {
    const inputData = []
    const oldBaseData = []
    const baseData = []
    const data = {}
    const keys = []

    fs.createReadStream(path.join(__dirname, '../../input/transync', input))
        .pipe(csv())
        .on('data', data => inputData.push(data))

    fs.createReadStream(path.join(__dirname, '../../input/transync', 'lv_LV_old.csv'))
        .pipe(csv())
        .on('data', data => oldBaseData.push(data))

    fs.createReadStream(path.join(__dirname, '../../input/transync', 'lv_LV.csv'))
        .pipe(csv())
        .on('data', (data) => baseData.push(data))
        .on('end', async () => {
            for (const baseDatum of baseData) {
                if (!baseDatum.key || !baseDatum.value || !baseDatum.scope || !baseDatum.scope_id) {
                    continue
                }

                const baseKey = baseDatum.key + ';;;' + baseDatum.scope + ';;;' + baseDatum.scope_id
                let exists = false

                for (const oldBaseDatum of oldBaseData) {
                    const oldBaseKey = oldBaseDatum.key + ';;;' + oldBaseDatum.scope + ';;;' + oldBaseDatum.scope_id

                    if (baseKey === oldBaseKey) {
                        exists = true

                        break;
                    }
                }

                if (!exists && isAllowed(baseDatum.scope_id)) {
                    data[baseKey] = true
                }
            }

            for (const key in data) {
                let exists = false

                for (const inputDatum of inputData) {
                    const inputKey = inputDatum.key + ';;;' + inputDatum.scope + ';;;' + inputDatum.scope_id

                    if (key === inputKey) {
                        exists = true

                        break;
                    }
                }

                if (!exists) {
                    const values = key.split(';;;')

                    if (values[0]) {
                        inputData.push({
                            key: values[0],
                            value: '',
                            scope: values[1],
                            scope_id: values[2]
                        })
                    }
                }
            }

            let chars = 0

            for (const inputDatum of inputData) {
                if (!inputDatum.value) {
                    if (keys.indexOf(inputDatum.key) < 0) {
                        keys.push(inputDatum.key)
                        chars += inputDatum.key.length
                    }
                }
            }

            const temp = fs.readFileSync(path.join(__dirname, '../../output/transync/temp.json'), 'utf8')
            const translationMap = JSON.parse(temp); // await generateTranslationMap(keys, targetLang)
            // fs.writeFileSync(path.join(__dirname, '../../output/transync', 'temp.json'), JSON.stringify(translationMap))

            for (const inputDatum of inputData) {
                const value = inputDatum.key
                const translatedValue = translationMap[value]

                if (translatedValue && (inputDatum.key === inputDatum.value || !inputDatum.value)) {
                    inputDatum.value = translatedValue
                }
            }

            const segments = input.split('/')
            const fileName = segments[segments.length - 1]
            const ws = fs.createWriteStream(path.join(__dirname, '../../output/transync', fileName));
            fastcsv
              .write(inputData, { headers: false, quoteColumns: [true, true] })
              .pipe(ws);
        });
}

const transync = async (input, base, targetLang) => {
    if (input.includes('.csv') || base.includes('.csv')) {
        processCsv(input, base, targetLang)

        return
    }

    try {
        const inputJson = fs.readFileSync(path.join(__dirname, '../../input/transync', input), 'utf8')
        const baseJson = fs.readFileSync(path.join(__dirname, '../../input/transync', 'lv_LV.json'), 'utf8')
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

        // const translationMap = await generateTranslationMap(keys, targetLang)

        for (const inputKey in inputData) {
            const value = inputData[inputKey]
            const translatedValue = translationMap[inputKey] || value
            inputData[inputKey] = translatedValue
        }

        const segments = input.split('/')
        const fileName = segments[segments.length - 1]
        fs.writeFileSync(path.join(__dirname, '../../output/transync', fileName), JSON.stringify(inputData))
    } catch (e) {
        console.error(e)
    }
}

module.exports = transync
