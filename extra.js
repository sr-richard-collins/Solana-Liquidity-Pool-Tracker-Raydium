const { PublicKey, Connection } = require("@solana/web3.js");
const { MARKET_STATE_LAYOUT_V3 } = require('@raydium-io/raydium-sdk');

async function logMarketInfo(marketId) {
    const marketInfo = await fetchMarketInfo(marketId);
    console.log({
        marketBaseVault: marketInfo.baseVault,
        marketQuoteVault: marketInfo.quoteVault,
        marketBids: marketInfo.bids,
        marketAsks: marketInfo.asks,
        marketEventQueue: marketInfo.eventQueue,
    })
}

async function fetchMarketInfo(marketId) {
    const connection = new Connection('https://small-alien-needle.solana-mainnet.quiknode.pro/770bd5f12ee210e2c1e3a00c2483d5057c7faa04/', "confirmed");
    const marketAccountInfo = await connection.getAccountInfo(marketId);
    if (!marketAccountInfo) {
        throw new Error('Failed to fetch market info for market id ' + marketId.toBase58());
    }

    return MARKET_STATE_LAYOUT_V3.decode(marketAccountInfo.data);
}

logMarketInfo(new PublicKey('8vU28HaJkurz9dmDSQTLn3nfFp7kbdCeRgQgYin3kJdX'))