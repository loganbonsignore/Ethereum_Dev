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
        "name": name,
        "symbol": tokenSymbol,
        "balance": decimals_to_units(balance, decimals),
        "totalSupply": decimals_to_units(totalSupply, decimals)
    }
}

function updateTokenInfo(contractAddress, ethWalletAddress) {
    `
    Updates webpage with new information at time of user interaction
    `
    // Remove old token information if present
    let tokenInfo = d3.select("#token-information").selectAll("p")
    if (tokenInfo) {
        tokenInfo.remove();
    }
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

function handleWalletChange() {
    // Update new wallet address
    if (d3.event.target.value === "metamask") {
        var ethWalletAddress = metamask_address;
    } else if (d3.event.target.value === "ledger") {
        var ethWalletAddress = ledger_address;
    }
    // Update information displayed on webpage
    updateTokenInfo(contractAddress, ethWalletAddress)
}

// ################################ End Definitions ################################
let contractAddress = chainlinkContract

// Get html button references
var metamask = d3.select("#metamask");
var ledger = d3.select("#ledger");

// Event listeners 
metamask.on("click", handleWalletChange);
ledger.on("click", handleWalletChange);

// Runs at time of website load
updateTokenInfo(contractAddress, ethWalletAddress);



// Input field
contractField = d3.select("#contract-address")
contractField.on("change", handle)
contractField.on("onsubmit", handle)

function handle() {
    var inputVal = document.getElementById("contract-address").value;
    if (!inputVal) {} else {updateTokenInfo(inputVal, ethWalletAddress);}
}








