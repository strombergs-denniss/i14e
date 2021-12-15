const ssh = require('../core/ssh')
const knex = require('knex')({ client: 'mysql' })
const { generateTranslationMap } = require('../core/translator')
const fs = require('fs')
const path = require('path')
const { isException } = require('../core/translator')
const { generateUrl } = require('../core/utility')

const selectCategoryAttribute = (attributeCodes, storeCode) => {
    if (!attributeCodes || !storeCode) {
        return null
    }

    const query = knex('eav_attribute as a')
        .select('b.row_id', 'a.attribute_code', 'b.value')
        .leftJoin('catalog_category_entity_varchar as b', 'a.attribute_id', 'b.attribute_id').as('b')
        .whereIn('a.attribute_code', attributeCodes)
        .whereRaw('b.store_id = (select store_id from store where code = ?)', [storeCode])
        .orderBy('b.row_id')
        .orderBy('b.attribute_id')

    console.log(query.toString())

    return query.toString()
}

const generateCategoryNameMap = (storeCode, targetLang, env) => {
    ssh(selectCategoryAttribute(['name', 'url_key'], storeCode), async rows => {
        const objects = {}

        for (const row of rows) {
            const { row_id, attribute_code, value } = row

            if (!objects[row_id]) {
                objects[row_id] = {}
            }

            objects[row_id][attribute_code] = value
        }

        const keys = []

        for (const key in objects) {
            const value = objects[key]
            const { name, url_key } = value
            const newUrlKey = generateUrl(name)
            const isEqual = url_key === newUrlKey

            if (name && url_key) {
                if (!isEqual) {
                    if (keys.indexOf(url_key) < 0 && !isException(url_key)) {
                        keys.push(url_key)
                    }
                } else {
                    if (keys.indexOf(name) < 0 && !isException(name)) {
                        keys.push(name)
                    }
                }
            }
        }

        const translationMap = await generateTranslationMap(keys, targetLang)

        for (const key in objects) {
            const value = objects[key]
            const { name, url_key } = value
            const translatedName = translationMap[name]
            const translatedUrlKey = translationMap[url_key]
    
            objects[key]['translatedName'] = translatedName
            objects[key]['translatedUrlKey'] = translatedUrlKey
        }
    
        const names = {}
        const urlKeys = {}
    
        for (const key in objects) {
            const value = objects[key]
            const { name, url_key, translatedName, translatedUrlKey } = value
    
            if (translatedName) {
                names[name] = translatedName
                urlKeys[url_key] = translatedUrlKey ? generateUrl(translatedUrlKey) : generateUrl(translatedName)
            }
        }
    
        if (names) {
            fs.writeFileSync(path.join(__dirname, 'target', 'category-names.json'), JSON.stringify(names))
        }

        if (urlKeys) {
            fs.writeFileSync(path.join(__dirname, 'target', 'category-url-keys.json'), JSON.stringify(urlKeys))
        }
    }, env)
}

module.exports = generateCategoryNameMap
