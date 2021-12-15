const CONFIG = {
    HOST: process.env.HOST,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    PASSPHRASE: process.env.PASSPHRASE,
    ENV: {
        TEAM_C: {
            USERNAME: process.env.TEAM_C_USERNAME,
            COMMAND: process.env.TEAM_C_COMMAND
        },
        DEMO: {
            USERNAME: process.env.DEMO_USERNAME,
            COMMAND: process.env.DEMO_COMMAND
        },
        LIVE: {
            USERNAME: process.env.LIVE_USERNAME,
            COMMAND: process.env.LIVE_COMMAND
        }
    },
    DEEPL: {
        URL: process.env.DEEPL_URL,
        AUTH_KEY: process.env.DEEPL_AUTH_KEY,
        BATCH_SIZE: process.env.DEEPL_BATCH_SIZE
    }
}

module.exports = CONFIG
