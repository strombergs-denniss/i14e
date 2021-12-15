const axios = require('axios').default
const qs = require('qs')
const CONFIG = require('./config')

const exceptions = [
    'homepage-eng',
    'sitemap',
    'Nike',
    'adidas',
    'Under Armour',
    'The North Face',
    'Helly Hansen',
    'Musto',
    'Salomon',
    'Roxy',
    'Timberland',
    'Quiksilver',
    'ONeill',
    'Vans',
    'Converse',
    'Puma',
    'New Balance',
    'adidas Originals',
    'Casall',
    'Skechers',
    'New Era',
    '8848 Altitude',
    'Tommy Sport',
    'Columbia',
    'Polar',
    'SiS',
    'Bottecchia',
    'Esperia',
    'K2',
    'Madshus',
    'Ziener',
    'Speedo',
    'Arena',
    'Cep',
    'North Bend',
    'Spalding',
    'Discmania',
    'Alpen Gaudi',
    'RE21'
]

const isException = (key) => {
    if (exceptions.indexOf(key) > -1) {
        return true
    }

    return false
}

const translate = (keys, targetLang, sourceLang) => {
    const params = {
        auth_key: CONFIG.DEEPL.AUTH_KEY,
        target_lang: targetLang,
        preserver_formatting: 1,
        text: keys
    }

    if (sourceLang) {
        params['source_lang'] = sourceLang
    }

    return axios.post(CONFIG.DEEPL.URL, null, {
        params,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
    }).then(res => {
        return res.data.translations
    })
}

const generateTranslationMap = async (keys, targetLang, sourceLang) => {
    const values = []
    const translationMap = {}
    const BATCH_SIZE = parseInt(CONFIG.DEEPL.BATCH_SIZE)

    for (let a = 0; a < Math.ceil(keys.length / BATCH_SIZE); ++a) {
        const batch = keys.slice(BATCH_SIZE * a, BATCH_SIZE * a + BATCH_SIZE)
        const translations = await translate(batch, targetLang, sourceLang)

        for (const translation of translations) {
            values.push(translation.text)
        }
    }

    for (let a = 0; a < keys.length; ++a) {
        const key = keys[a]
        const value = values[a]
        translationMap[key] = value
    }

    return translationMap
}

module.exports = {
    translate,
    isException,
    generateTranslationMap
}
