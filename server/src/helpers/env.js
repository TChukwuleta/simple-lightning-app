require("dotenv").config();

const env = {
    PORT: process.env.PORT,
    LND_GRPC_URL: process.env.LND_GRPC_URL,
    LND_MACAROON: process.env.LND_MACAROON,
    LND_TLS_CERT: process.env.LND_TLS_CERT
};

// Ensure all keys exist
Object.entries(env).forEach(([key, value]) => {
    if(!value){
        throw new Error(`Required environmentr variable '${key}' is missing!`);
    }
});

module.exports = env;