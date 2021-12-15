const { Client } = require('ssh2')
const { readFileSync } = require('fs')
const CONFIG = require('./config')

const ssh = (command, callback, env = 'TEAM_C') => {
    if (!command) {
        return
    }

    const ENV = CONFIG.ENV[env]

    if (!env) {
        return
    }

    const connection = new Client()

    connection.on('ready', () => {
        let finalData = ''

        connection.exec(ENV.COMMAND + ` -e "${ command.replace(/`/g, '\\`') }"`, (e, stream) => {
            if (e) {
                throw e
            }

            stream.on('close', () => {
                const lines = finalData.split('\n')
                const keys = lines[0].split('\t')
                const rows = []

                for (let a = 1; a < lines.length; ++a) {
                    const line = lines[a]
                    const values = line.split('\t')
                    const row = {}

                    if (values.length < keys.length) {
                        continue
                    }

                    for (let b = 0; b < keys.length; ++b) {
                        const key = keys[b]
                        const value = values[b]
                        row[key] = value
                    }

                    rows.push(row)
                }

                callback(rows)
                connection.end()
            }).on('data', dataBuffer => {
                const data = dataBuffer.toString()
                finalData += data
            }).stderr.on('data', data => {
                console.log(data.toString())
            })
        })
    }).connect({
        host: CONFIG.HOST,
        privateKey: readFileSync(CONFIG.PRIVATE_KEY),
        passphrase: CONFIG.PASSPHRASE,
        username: ENV.USERNAME
    })
}

module.exports = ssh
