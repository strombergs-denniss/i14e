const generateUrl = (string = '') => {
    return string.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]/g, ' ').trim().replace(/[_ ]+/g, '-')
}

module.exports = {
    generateUrl
}
