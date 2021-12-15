# I14E

Module for automatic generation of translations for Magento 2 content.

This module is project specific.

## Commands:

    transync <input> <targetLang> --output
    Will synchronize 2 translation maps by taking keys from latest one and adding them to old one.

    genmap:category-name <storeCode> <targetLang> --env'
    Will generate translation map of category names and category URL keys.

    genmap:attribute-label <storeCode> <targetLang> --env'
    Will generate translation map of attribute labels.

    genmap:attribute-option <storeCode> <targetLang> --env'
    WIll generate translation map of attribute option.

    genmap:cms-page-identifier <storeCode> <targetLang> --env'
    Will generate translation map of CMS page identifiers.
