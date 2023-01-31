const lnrpc = require("@radar/lnrpc");
const env = require('./helpers/env');
const ApiError = require("./helpers/ApiError")
require("dotenv").config();

const host = process.env.LND_RPC_URL
const macaroon = process.env.LND_MACAROON
const cert = process.env.LND_TLS_CERT

const connectRpc = async () => {
    try {
        const lnRpcClient = await lnrpc.createLnRpc({
            server: env.LND_GRPC_URL,
            cert: Buffer.from(env.LND_TLS_CERT, 'hex').toString('utf-8'),
            macaroon: env.LND_MACAROON
        })
        return lnRpcClient
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error)
    }
}
 
const connectorRpc = async () => {
    try {
        const lnRpcClient = await lnrpc.createLnRpc({
            server: host,
            cert: Buffer.from(cert, 'hex').toString('utf-8'),
            macaroon
        })

        ///const info = await lnRpcClient.getInfo()
        return lnRpcClient
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error)
    }
}

const getInfo = async () => {
    try {
        const lnRpcClient = await connectorRpc();
        console.log(lnRpcClient);
        const node = await lnRpcClient.getInfo();
        return node;
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error)   
    } 
}

const subscribeToInvoices = async () => {
    try {
        const stream = await lnRpcClient.subscribeInvoices()
        return stream;
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error) 
    }
}

const generateInvoice = async (postId, contentLength) => {

    try {
        const lnRpcClient = await connectRpc();
        const invoice = await lnRpcClient.addInvoice({
            memo: `Lightning Posts post #${postId}`,
            value: contentLength,
            expiry: '180' // 3 minutes
        })
        return invoice;
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error) 
    }
}

const decodeInvoice = async (invoice) => {
    try {
        const lnRpcClient = await connectRpc();
        const decodedInvoice = await lnRpcClient.decodePayReq({ payReq: invoice })
        return decodedInvoice;
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error) 
    }
}

const invoiceLookUp = async (invoice) => {
    try {
        const lnRpcClient = await connectRpc();
        const decoded = await decodeInvoice(invoice);
        const lookup = await lnRpcClient.lookupInvoice({ rHashStr: decoded.paymentHash })
        return lookup;
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error) 
    }
}

module.exports = {
    connectRpc,
    getInfo,
    subscribeToInvoices,
    generateInvoice,
    invoiceLookUp,
    decodeInvoice,
    connectorRpc
};