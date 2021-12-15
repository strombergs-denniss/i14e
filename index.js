require('dotenv').config()
const { program } = require('commander')
const generateAttributeLabelMap = require('./source/command/attribute-label')
const generateAttributeOptionMap = require('./source/command/attribute-option')
const generateCategoryNameMap = require('./source/command/category-name')
const generateCmsPageIdentifierMap = require('./source/command/cms-page-identifier')

program
    .command('transync')
    .action(() => {
        console.log('transync')
    })

program
    .command('genmap:category-name <storeCode> <targetLang>')
    .option('-e, --env <environment>')
    .action((storeCode, targetLang, options) => {
        generateCategoryNameMap(storeCode, targetLang, options.env)
    })

program
    .command('genmap:attribute-label <storeCode> <targetLang>')
    .option('-e, --env <environment>')
    .action((storeCode, targetLang, options) => {
        generateAttributeLabelMap(storeCode, targetLang, options.env)
    })

program
    .command('genmap:attribute-option <storeCode> <targetLang>')
    .option('-e, --env <environment>')
    .action((storeCode, targetLang, options) => {
        generateAttributeOptionMap(storeCode, targetLang, options.env)
    })

program
    .command('genmap:cms-page-identifier <storeCode> <targetLang>')
    .option('-e, --env <environment>')
    .action((storeCode, targetLang, options) => {
        generateCmsPageIdentifierMap(storeCode, targetLang, options.env)
    })

program.parse(process.argv)
