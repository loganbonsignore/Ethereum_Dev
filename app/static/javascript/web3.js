const etherscan_api_key = "6AMB9PGBYJ5AHHCZHCCZAU5Y7E4KEVET47"
const metamask_address = "0x97BAd4347C45b8DF0F4ebf24D8F0250c8366F8ef"
const ledger_address = "0xD806e6019AC21714B3B96b0731DD0715Ef2f08AC"

// Contract addresses
var chainlinkContract = "0x514910771af9ca656af840dff83e8264ecf986ca";
var shopxContract = "0x7BEF710a5759d197EC0Bf621c3Df802C2D60D848";
var paidContract = "0x8c8687fC965593DFb2F0b4EAeFD55E9D8df348df";
var aaveContract = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"
var stakedAaveContract = "0x4da27a545c0c5B758a6BA100e3a049001de870f5"
var b20Contract = "0xc4De189Abf94c57f396bD4c52ab13b954FebEfD8"
var aiozContract = "0x626E8036dEB333b408Be468F951bdB42433cBF18"
var croContract = "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b"

let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

// Get gas price in wei then convert to gwei
// web3.eth.getGasPrice().then(function(gasPriceWei) {
//     let gasPrice = web3.utils.fromWei(gasPriceWei, "gwei");
//     console.log(gasPrice);
// });

// Get balance of address in wei
// web3.eth.getBalance(user.metamask).then(console.log);

// Get block number
// web3.eth.getBlockNumber().then(console.log);

// Get block matching block number or block hash
// web3.eth.getBlock("latest", false).then(console.log);

// Get number of transactions in block
// web3.eth.getBlockTransactionCount("latest").then(console.log);

// Check if address is valid
// console.log(web3.utils.isAddress(user.metamask));

// Hash something
// let hash = web3.utils.toHex("This is Logans Hash");
// console.log(hash);

// Converts hex to utf-8 text (ascii also available)
// let text = web3.utils.hexToUtf8(hash);
// console.log(text);






