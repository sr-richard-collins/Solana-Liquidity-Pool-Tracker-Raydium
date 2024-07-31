// Import Solana library
const { Connection, PublicKey } = require("@solana/web3.js");

//Save address of Radium liquidty pool v4
const RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";

// Generate random hash to make sure request from https and web socket endpoints reaches node
const SESSION_HASH = 'QNDEMO' + Math.ceil(Math.random() * 1e9); // Random unique identifier for your session
//Track credit usage on QuickNode. Resource intesive operation
let credits = 0;

// Supply Radium public key and assign to a variable
const raydium = new PublicKey(RAYDIUM_PUBLIC_KEY);
// Initialize connecition
const connection = new Connection(`HTTP_URL`, { // Replace HTTP_URL & WSS_URL with QuickNode HTTPS and WSS Solana Mainnet endpoint
    wsEndpoint: `WSS_URL`,
    httpHeaders: {"x-session-hash": SESSION_HASH} // Sending hash which created in the beginning
});

// Monitor logs
// connection = connection object
// programAddress = PublicKey object    
async function main(connection, programAddress) {
    console.log("Monitoring logs for program:", programAddress.toString());
    // connection listening for an update in log
    connection.onLogs(
        programAddress,
        ({ logs, err, signature }) => {
            // If error, return
            if (err) return;

            // if log contains instruction (initialize2) which is used to create new radium token pool, print transaction signature
            // then run fetchRaydiumAccounts function
            if (logs && logs.some(log => log.includes("initialize2"))) {
                console.log("Signature for 'initialize2':", signature);
                fetchRaydiumAccounts(signature, connection);
            }
        },
        "finalized"
    );
}

// Parse transaction and filter data
// update credits usage
async function fetchRaydiumAccounts(txId, connection) {
    const tx = await connection.getParsedTransaction(
        txId,
        {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });
    
    credits += 100;
    
    // finding input accounts of the transaction
    // stored within the accounts object, within instructions object, within message object, within transaction object
    const accounts = tx?.transaction.message.instructions.find(ix => ix.programId.toBase58() === RAYDIUM_PUBLIC_KEY).accounts;

    // if no accounts found
    if (!accounts) {
        console.log("No accounts found in the transaction.");
        return;
    }

    // saving index of accounts object
    const tokenAIndex = 8;
    const tokenBIndex = 9;

    // saving the accounts addresses of the transaction object
    const tokenAAccount = accounts[tokenAIndex];
    const tokenBAccount = accounts[tokenBIndex];

    // display the account addresses of the tokens
    const displayData = [
        { "Token": "A", "Account Public Key": tokenAAccount.toBase58() },
        { "Token": "B", "Account Public Key": tokenBAccount.toBase58() }
    ];
    console.log("New LP Found");
    console.log(generateExplorerUrl(txId));
    console.table(displayData);
    console.log("Total QuickNode Credits Used in this session:", credits);
}

// print solscan url of transaction
function generateExplorerUrl(txId) {
    return `https://solscan.io/tx/${txId}`;
}

main(connection, raydium).catch(console.error);