// Etherscan API key
const etherscanAPIKey = "6AMB9PGBYJ5AHHCZHCCZAU5Y7E4KEVET47"

// Instantiating Web3 object
var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/58ea22f2caa14187bd2b8c0682c84848'));


// ############################### Start Definitions ###############################

function decimals_to_units(tokenUnits, decimals) {
    let decimalsInt = parseInt(decimals);
    let tokenUnit = tokenUnits.slice(0, -decimalsInt) + "." + tokenUnits.slice(-decimalsInt);
    return parseFloat(tokenUnit);
}

async function getTokenBalance(smartContractAddress, ethWalletAddress) {
    // ABI endpoint provided by Etherscan
    let etherscan_abi_endpoint = `https://api.etherscan.io/api?module=contract&action=getabi&address=${smartContractAddress}&apikey=${etherscanAPIKey}`
    // Call the endpoint
    let abi = await d3.json(etherscan_abi_endpoint);
    // Create Web3 contract object
    let contract = new web3.eth.Contract(JSON.parse(abi.result), smartContractAddress);
    // Get balance of ERC20 token on Ethereum wallet
    let balance = await contract.methods.balanceOf(ethWalletAddress).call();
    // Get number of decimals used for ERC20 token
    let decimals = await contract.methods.decimals().call();
    // Return human friendly token balance to user
    return decimals_to_units(balance, decimals);
}

function updateTokenInfo(contractAddress, ethWalletAddress) {
    `
    Gets token information/ balance infomation for given contract and wallet addresses
    `
    // Remove old information if present
    let tokenInfo1 = d3.select("#token-information").selectAll("p")
    let tokenInfo2 = d3.select("#token-information").selectAll("h3")
    if (tokenInfo1) {tokenInfo1.remove();}
    if (tokenInfo2) {tokenInfo2.remove();}
    
    // Add new token information to page
    getTokenInfo(contractAddress, ethWalletAddress)
        // Use promise returned to display information
        .then(info => {
            d3.select("#token-information").append("h3").text("ERC-20 Token Balance")
            Object.entries(info).forEach(elem => {
                d3.select("#token-information")
                    .append("p")
                    .text(`${elem[0]}: ${elem[1]}`);
            })
        })
        // Catch error if getTokenInfo() throws error and display message
        .catch(error => {
            d3.select("#token-information")
                .append("p")
                .text(`Cannot load token information due to query error: ${error}`);
        });
    }

function handleTextInputs() {
    `
    Adds data to webpage when appropriate user inputs are provided
    `
    // Capture Input values
    var walletAdd = document.getElementById("wallet-address").value;
    var contractAdd = document.getElementById("contract-address").value;
    // Display ETH balance
    if (walletAdd) {
        // Check if wallet address is valid
        if (web3.utils.isAddress(walletAdd)) {
            getEthBalance(walletAdd);
        } else {
            console.log("Wallet address not valid");
        }
    }
    // Ensure both values are present to display token info
    if (!walletAdd) {
        console.log("No ETH wallet address provided");
    } else if (!contractAdd) {
        console.log("No smart contract address provided");
    } else {
        // Check if smart contract address is valid
        if (web3.utils.isAddress(contractAdd)) {
            updateTokenInfo(contractAdd, walletAdd);
        } else {
            console.log("Contract address not valid")
        }
    }
}

function getEthBalance(ethAddress) {
    `
    Gets Ethereum token balance of given wallet address
    `
    // Remove old information if present
    let ethBalanceInfo1 = d3.select("#eth-balance").selectAll("p");
    let ethBalanceInfo2 = d3.select("#eth-balance").selectAll("h3");
    if (ethBalanceInfo1) {ethBalanceInfo1.remove();}
    if (ethBalanceInfo2) {ethBalanceInfo2.remove();}
    // Add new ETH balance information to page
    web3.eth.getBalance(ethAddress)
        .then(balance => {
            // Convert Wei to Eth
            let ethBalance = web3.utils.fromWei(balance, "ether");
            // Add to webpage
            d3.select("#eth-balance").append("h3").text("Wallet's ETH Balance")
            d3.select("#eth-balance").append("p").text(`ETH Balance: ${ethBalance}`);
        })
        .catch(error => {
            d3.select("#eth-balance").append("p").text(`Cannot load ETH balance due to query error: ${error}`);
        })
    }

function handleTxInput() {
    `
    Displays transaction data of given transaction hash
    `
    // Remove old information if present
    let txReceiptData = d3.select("#tx-receipt").selectAll("p");
    let txDataData = d3.select("#tx-data").selectAll("p");
    if (txReceiptData) {txReceiptData.remove();}
    if (txDataData) {txDataData.remove();}
    // Get inputted transaction hash
    let transactionHash = document.getElementById("transaction-hash").value;
    // Gets transaction overview
    web3.eth.getTransactionReceipt(transactionHash).then(txReceipt => {
        Object.entries(txReceipt).forEach(tx => {
            d3.select("#tx-receipt").append("p").text(`${tx[0]}: ${tx[1]}`);
        })
    });
    // Gets transaction data, including input
    web3.eth.getTransaction(transactionHash).then(txData => {
        Object.entries(txData).forEach(tx => {
            d3.select("#tx-data").append("p").text(`${tx[0]}: ${tx[1]}`);
        })
    });
}

function displayBlockInformation(blockNumber="latest", transactionDisplay=true) {
    `
    Displays block information
    Arguments:
        1) blockNumber - Block number or block hash of block to display
        2) transactionDisplay - If true: display full transactions, if false: display hashed transactions
    `
    blockInfoElem = d3.select("#block-information");
    // Remove old information if present
    blockInfoElem.selectAll("p").remove()
    // Add remove information button
    var x = document.getElementById("block-remove-button");
    x.style.display = "block";
    web3.eth.getBlock(blockNumber, transactionDisplay).then(data => {
        // Display number of block transactions
        web3.eth.getBlockTransactionCount(blockNumber).then(numTransactions => {
            blockInfoElem.append("p").text(`number of transactions: ${numTransactions}`);
        })
        // Display block data
        blockData = Object.entries(data);
        blockData.forEach(elem => {
            blockInfoElem
                .append("p")
                .text(`${elem[0]}: ${elem[1]}`);
        })
    });
}

function removeBlockInfo() {
    // Remove old information if present
    blockInfoElem = d3.select("#block-information");
    blockInfoElem.selectAll("p").remove()
    // Remove removeBlockButton
    var x = document.getElementById("block-remove-button");
    x.style.display = "none";
    // Add back helper text
    d3.select("#block-info-header").append("p").text("Click this button to get the latest blockchain information")
}

function isHash() {
    `
    Determines if text entered is a hex value. Displays true or false based on result.
    `
    // Remove old information if present
    let oldInfo = d3.select("#hash-test-container").selectAll("p")
    if (oldInfo) {oldInfo.remove()}
    // Get inputted value
    let hash = document.getElementById("hash-test").value;
    // Determine if hex
    let result = web3.utils.isHex(hash);
    // Display on web page
    d3.select("#hash-test-container").append("p").text(result);
}

function textToHash() {
    `
    Converts text input to hex. Displays on web page.
    `
    // Remove old information if present
    let oldInfo = d3.select("#hash-factory-container").selectAll("p")
    if (oldInfo) {oldInfo.remove()}
    // Get inputted value
    let text = document.getElementById("hash-factory").value;
    // Create hash
    let hash = web3.utils.toHex(text);
    // Add hash to web page
    d3.select("#hash-factory-container").append("p").text(hash);
}

function hashToText() {
    `
    Converts hex to UTF-8 plain text. Displays on web page.
    `
    // Remove old information if present
    let oldInfo = d3.select("#hash-to-text-container").selectAll("p")
    if (oldInfo) {oldInfo.remove()}
    // Get inputted value
    let hash = document.getElementById("hash-to-text").value;
    // Convert hash to text
    try {
        let text = web3.utils.hexToUtf8(hash);
        d3.select("#hash-to-text-container").append("p").text(text);
    } catch (error) {
        try {
            let text = web3.utils.hexToAscii(hash);
            d3.select("#hash-to-text-container").append("p").text(text);
        } catch (error) {
            d3.select("#hash-to-text-container").append("p").text(`Cannot complete request with error message: '${error}'`);
        }
    }
}

function getGasPriceNow() {
    `
    Adds current gas price to webpage on load
    `
    web3.eth.getGasPrice().then(gasPriceWei => {
        let gasPrice = web3.utils.fromWei(gasPriceWei, "gwei");
        d3.select("#gas-price").text(gasPrice)});
}

function getBlockNumberNow() {
    `
    Adds current block number to website on load
    `
    web3.eth.getBlockNumber().then(num => {
        d3.select("#block-number").text(num);
    })
}

// ################################ End Definitions ################################

// Event handlers
addressInput = d3.select("#wallet-address");
contractInput = d3.select("#contract-address");
blockButton = d3.select("#block-button");
removeBlockButton = d3.select("#block-remove-button");
hashTestInput = d3.select("#hash-test");
hashFactoryInput = d3.select("#hash-factory");
hashToTextInput = d3.select("#hash-to-text");
transactionHashInput = d3.select("#transaction-hash")

addressInput.on("change", handleTextInputs);
addressInput.on("onsubmit", handleTextInputs);
contractInput.on("change", handleTextInputs);
contractInput.on("onsubmit", handleTextInputs);
blockButton.on("click", displayBlockInformation);
removeBlockButton.on("click", removeBlockInfo)
hashTestInput.on("change", isHash);
hashTestInput.on("onsubmit", isHash);
hashFactoryInput.on("change", textToHash);
hashFactoryInput.on("onsubmit", textToHash);
hashToTextInput.on("change", hashToText);
hashToTextInput.on("onsubmit", hashToText);
transactionHashInput.on("click", handleTxInput)
transactionHashInput.on("onsubmit", handleTxInput)

// Functions run at page load
getBlockNumberNow()
getGasPriceNow()

// getTokenInfo("0x514910771af9ca656af840dff83e8264ecf986ca", "0xD806e6019AC21714B3B96b0731DD0715Ef2f08AC");





console.log(web3.version);












// Converts string to SHA3
// let string = "Logan Bonsignore"
// console.log(web3.utils.sha3("myFunction(address,uint256[])"));

// calculate the sha3 of given input parameters in the same way solidity would. This means arguments will be ABI converted and tightly packed before being hashed.
// web3.utils.soliditySha3('234564535', '0xfff23243', true, -10);
// auto detects:        uint256,      bytes,     bool,   int256
//  "0x3e27a893dc40ef8a7f0841d96639de2f58a132be5ae466d40087a2cfa83b7179"

// Removes 0x prefix from hex value
// web3.utils.stripHexPrefix('0x234');
