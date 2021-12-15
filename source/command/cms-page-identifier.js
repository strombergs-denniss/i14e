const ssh = require('../core/ssh')
const knex = require('knex')({ client: 'mysql' })
const { generateTranslationMap, isException } = require('../core/translator')
const fs = require('fs')
const path = require('path')
const { generateUrl } = require('../core/utility')

const selectCategoryAttribute = (storeCode) => {
    if (!storeCode) {
        return null
    }

    const query = knex('cms_page as a')
        .distinct(['a.identifier'])
        .leftJoin('cms_page_store as b', 'a.row_id', 'b.row_id').as('b')
        .whereRaw('store_id = (select store_id from store where code = ?)', [storeCode])

    console.log(query.toString())

    return query.toString()
}

const generateCmsPageIdentifierMap = (storeCode, targetLang, env) => {
    ssh(selectCategoryAttribute(storeCode), async rows => {
        const keys = []

        for (const row of rows) {
            const { identifier } = row
    
            if (identifier && keys.indexOf(identifier) < 0 && !isException(identifier)) {
                keys.push(identifier)
            }
        }

        const translationMap = await generateTranslationMap(keys, targetLang)

        for (const key in translationMap) {
            translationMap[key] = generateUrl(translationMap[key])
        }

        fs.writeFileSync(path.join(__dirname, 'target', 'cms-page-identifiers.json'), JSON.stringify(translationMap))
    }, env)
}

module.exports = generateCmsPageIdentifierMap
