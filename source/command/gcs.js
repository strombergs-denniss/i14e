const fs = require('fs')
const path = require('path')

const gcs = async (template, sourceWebsiteCode, targetWebsiteCode, sourceStoreCode, targetStoreCode, languageCode, invoicePrefix) => {
    try {
        const templateText = fs.readFileSync(path.join(__dirname, '../../input/gcs', template), 'utf8')

        const segments = input.split('/')
        const fileName = segments[segments.length - 1]
        fs.writeFileSync(path.join(__dirname, '../../output/transync', fileName), JSON.stringify(inputData))
    } catch (e) {
        console.error(e)
    }
}

module.exports = transync
