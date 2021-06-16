// Etherscan API key
const etherscan_api_key = "6AMB9PGBYJ5AHHCZHCCZAU5Y7E4KEVET47"

// Instanciating Web3 object
var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/58ea22f2caa14187bd2b8c0682c84848'));

// connect to Moralis server
Moralis.initialize("ztbetcwuKQcDFGlvpLvHZ2PfyCl0UP6Ng6Uobe33");
Moralis.serverURL = "https://0rdxew1zpnxb.moralis.io:2053/server";


function loginMetamask() {
    Moralis.Web3.authenticate().then(function (user) {
        console.log(user.get('ethAddress'));
    })
}

async function logoutMetamask() {
    await Moralis.User.logOut();
}


metamaskLogin = d3.select("#metamaskLogin")
metamaskLogin.on("click", loginMetamask)

metamaskLogin = d3.select("#metamaskLogout")
metamaskLogin.on("click", logoutMetamask)