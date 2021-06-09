// Etherscan API key
const etherscan_api_key = "6AMB9PGBYJ5AHHCZHCCZAU5Y7E4KEVET47"

// Wallet Addresses
const metamask_address = "0x97BAd4347C45b8DF0F4ebf24D8F0250c8366F8ef"
const ledger_address = "0xD806e6019AC21714B3B96b0731DD0715Ef2f08AC"
var ethWalletAddress = ledger_address

// Contract addresses
var chainlinkContract = "0x514910771af9ca656af840dff83e8264ecf986ca";
var shopxContract = "0x7BEF710a5759d197EC0Bf621c3Df802C2D60D848";
var paidContract = "0x8c8687fC965593DFb2F0b4EAeFD55E9D8df348df";
var aaveContract = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"
var stakedAaveContract = "0x4da27a545c0c5B758a6BA100e3a049001de870f5"
var b20Contract = "0xc4De189Abf94c57f396bD4c52ab13b954FebEfD8"
var aiozContract = "0x626E8036dEB333b408Be468F951bdB42433cBF18"
var croContract = "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b"

// Instanciating Web3 object
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

// ############################### Start Definitions ###############################

function decimals_to_units(tokenUnits, decimals) {
    `
    Converts token units to 'human-friendly' decimal notation
    Arguments:
        1) Token units in original format
        2) Number of decimals the token has
    `
    if (tokenUnits === "unavailable") {
        return tokenUnits;
    }
    let decimalsInt = parseInt(decimals);
    let tokenUnit = tokenUnits.slice(0, -decimalsInt) + "." + tokenUnits.slice(-decimalsInt);
    return parseFloat(tokenUnit);
}

async function getTokenInfo(smartContractAddress, ethWalletAddress) {
    `
    Retrieves token information provided by smart contract
    Arguments:
        1) Smart contract address of the token of interest
        2) Ethereum wallet address of the wallet you want to find balance of given token
    `
    // ABI endpoint provided by Etherscan
    let etherscan_abi_endpoint = `https://api.etherscan.io/api?module=contract&action=getabi&address=${smartContractAddress}&apikey=${etherscan_api_key}`
    // Call the endpoint
    let abi = await d3.json(etherscan_abi_endpoint);
    // Create Web3 contract object
    let contract = new web3.eth.Contract(JSON.parse(abi.result), smartContractAddress);
    // Unit Decimals
    try {
        var decimals = await contract.methods.decimals().call();
    } catch (error) {
        var decimals = "0";
    }
    // Balance on Ethereum Wallet
    try {
        var balance = await contract.methods.balanceOf(ethWalletAddress).call();
    } catch (error) {
        var balance = "unavailable";
    }
    // Token Name
    try {
        var name = await contract.methods.name().call();
    } catch (error) {
        var name = "unavailable";
    }
    // Total Supply
    try {
        var totalSupply = await contract.methods.totalSupply().call();
    } catch (error) {
        var totalSupply = "unavailable";
    }
    // Token Symbol
    try {
        var tokenSymbol = await contract.methods.symbol().call();
    } catch (error) {
        var tokenSymbol = "unavailable";
    }
    return {
        "Token Name": name,
        "Token Symbol": tokenSymbol,
        "Token Total Supply": decimals_to_units(totalSupply, decimals),
        "Wallet Balance": decimals_to_units(balance, decimals),
    }
}

function updateTokenInfo(contractAddress, ethWalletAddress) {
    `
    Gets token information/ balance infomation for given contract and wallet addresses
    `
    // Remove old information if present
    let tokenInfo = d3.select("#token-information").selectAll("p")
    if (tokenInfo) {tokenInfo.remove();}
    
    // Add new token information to page
    getTokenInfo(contractAddress, ethWalletAddress)
        // Use promise returned to display information
        .then(info => {
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
    let ethBalanceInfo = d3.select("#eth-balance").selectAll("p")
    if (ethBalanceInfo) {ethBalanceInfo.remove();}
    // Add new ETH balance information to page
    web3.eth.getBalance(ethAddress)
        .then(balance => {
            // Convert Wei to Eth
            let ethBalance = web3.utils.fromWei(balance, "ether");
            // Add to webpage
            d3.select("#eth-balance").append("p").text(`ETH Balance: ${ethBalance}`);
        })
        .catch(error => {
            d3.select("#eth-balance").append("p").text(`Cannot load ETH balance due to query error: ${error}`);
        })
    }

function displayBlockInformation(blockNumber="latest", transactionDisplay=false) {
    `
    Displays block information
    Arguments:
        1) blockNumber - Block number or hash to display
        2) transactionDisplay - If true: display full transactions, if false: display hashed transactions
    `
    blockInfoElem = d3.select("#block-information");
    web3.eth.getBlock(blockNumber, transactionDisplay).then(data => {
        blockInfoElem.append("h2").text("Block Information");
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
    let text = web3.utils.hexToUtf8(hash);
    // Add text to web page
    d3.select("#hash-to-text-container").append("p").text(text);
}

// ################################ End Definitions ################################

// Event handlers
addressInput = d3.select("#wallet-address");
contractInput = d3.select("#contract-address");
blockButton = d3.select("#block-button");
hashTestInput = d3.select("#hash-test");
hashFactoryInput = d3.select("#hash-factory");
hashToTextInput = d3.select("#hash-to-text");

addressInput.on("change", handleTextInputs);
addressInput.on("onsubmit", handleTextInputs);
contractInput.on("change", handleTextInputs);
contractInput.on("onsubmit", handleTextInputs);
blockButton.on("click", displayBlockInformation);
hashTestInput.on("change", isHash);
hashTestInput.on("onsubmit", isHash);
hashFactoryInput.on("change", textToHash);
hashFactoryInput.on("onsubmit", textToHash);
hashToTextInput.on("change", hashToText);
hashToTextInput.on("onsubmit", hashToText);










