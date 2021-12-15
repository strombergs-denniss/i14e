const ssh = require('../core/ssh')
const knex = require('knex')({ client: 'mysql' })
const { generateTranslationMap } = require('../core/translator')
const fs = require('fs')
const path = require('path')
const { isException } = require('../core/translator')

const selectCategoryAttribute = (storeCode) => {
    if (!storeCode) {
        return null
    }

    const query = knex('eav_attribute_option_value')
        .distinct(['value'])
        .whereRaw('store_id = (select store_id from store where code = ?)', [storeCode])

    console.log(query.toString())

    return query.toString()
}

const generateAttributeOptionMap = (storeCode, targetLang, env) => {
    ssh(selectCategoryAttribute(storeCode), async rows => {
        const keys = []

        for (const row of rows) {
            const { value } = row
    
            if (value && keys.indexOf(value) < 0 && !isException(value)) {
                if (/[a-z]/.test(value) && /[A-Z]/.test(value) && !/[>]/.test(value)) {
                    keys.push(value)
                }
            }
        }

        const translationMap = await generateTranslationMap(keys, targetLang)

        if (translationMap) {
            fs.writeFileSync(path.join(__dirname, '../../output', targetLang, 'attribute-options.json'), JSON.stringify(translationMap))
        }
    }, env)
}

module.exports = generateAttributeOptionMap
