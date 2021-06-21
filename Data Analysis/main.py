from web3 import Web3
import requests
import json

# Connect to Ethereum node
web3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/58ea22f2caa14187bd2b8c0682c84848'))

ETHERSCAN_API_KEY = "6AMB9PGBYJ5AHHCZHCCZAU5Y7E4KEVET47"

############################### Start definitions ###############################

class TransactionHandler:
    def __init__(self):
        pass

    def get_contract_name(self, contract_address: str) -> str or None:
        """
        Arguements:
            contract_address: contract address of smart contract to find name of
        Returns:
            String value of contracts name if available OR None if name is not available
        Notes:
            Calls Etherscan's source code API endpoint to find the smart contract's name
        """
        # Get contract name from source code
        source_code_endpoint = f"https://api.etherscan.io/api?module=contract&action=getsourcecode&address={contract_address}&apikey={ETHERSCAN_API_KEY}"
        source_code = json.loads(requests.get(source_code_endpoint).text)
        try:
            return source_code["result"][0]["ContractName"]
        except (KeyError, TypeError):
            return None

    def get_transaction_type(self, tx: str or dict) -> str:
        """
        Arguements:
            tx: Tx hash (str) OR Tx object (dict)
        Returns:
            String value representing type of transaction
        """
        # If 'tx' arguement is a transaction hash, get transaction object
        if isinstance(tx, str):
            tx = web3.eth.get_transaction(tx)
        # If "input" is not empty ('0x0'), "to" is not empty and "value" is equal to 0 -> smart contract transaction
        if tx["input"] != "0x" and tx["to"] != None and tx["value"] == 0:
            return "contract_invoked"
        # If "input" is empty ('0x') and "value" is not equal to 0 -> wallet-to-wallet transaction
        elif tx["input"] == "0x" and tx["value"] != 0:
            return "wallet_to_wallet"
        # If "to" is empty and "value" is equal to 0 -> contract creation transaction
        elif tx["to"] == None and tx["value"] == 0:
            return "contract_creation"
        else:
            raise RuntimeError(f"Unknown transaction type found for {tx['hash']}")

    def decode_transaction_input(self, tx: str or dict) -> dict:
        """
        Arguements:
            tx_input: Raw input data from transaction. 
            contract_address: Smart contract address. Use the "to" address on an Ethereum transaction.
        Returns:
            Dictionary containing the smart contract function's name, arguments and transaction parameters.
        Notes:
            Can only decode transactions with transaction type 'contract_invoked' returned by get_transaction_type()
        """
        # If 'tx' arguement is a transaction hash, get transaction object
        if isinstance(tx, str):
            tx = web3.eth.get_transaction(tx)
        # Check for supported transaction type
        if self.get_transaction_type(tx) != "contract_invoked":
            raise RuntimeError(f"Cannot parse input of transaction with type '{self.get_transaction_type(tx)}'.")
        # Get ABI for smart contract NOTE: Use "to" address as smart contract 'interacted with'
        abi_endpoint = f"https://api.etherscan.io/api?module=contract&action=getabi&address={tx['to']}&apikey={ETHERSCAN_API_KEY}"
        abi = json.loads(requests.get(abi_endpoint).text)
        # If Etherscan API returns 'Contract source code not verified', raise error
        if abi["result"] == "Contract source code not verified":
            raise RuntimeError(f"{abi['result']}. Recommended to hard-code the ABI of this smart contract address {tx['to']}.")
        # Create contract object in web3
        contract = web3.eth.contract(address=tx["to"], abi=abi["result"])
        # Decode transaction input data using Contract object's decode_function_input() method
        func_obj, func_params = contract.decode_function_input(tx["input"])
        return {
            "func_name": func_obj.fn_name,
            "args": tuple(func_params.keys()),
            "params": tuple(func_params.values()),
        }

############################### End definitions ###############################

# Tx hash's of different tx types
token_swap = "0xac80bab0940f061e184b0dda380d994e6fc14ab5d0c6f689035631c81bfe220b" # "value" == 0, "to"/"from"/"input" are not empty
wallet_to_wallet = "0xc46bfff90f8a55a1037f62ab3183bc840b3e7eff6f84a0b6e142f849ee4b20be" # "input" is empty ('0x'), "value" != 0
contract_creation = "0x4ff39eceee7ba9a63736eae38be69b10347975ff5fa4d9b85743a51e1c384094" # "to" is empty ('0x0' or 'None'), "value" == 0, "input" is bytecode

# Instantiate transaction handler
th = TransactionHandler()

# Get raw transaction
tx = web3.eth.get_transaction(token_swap)
# Get/Decode transaction data
contract_name = th.get_contract_name(tx["to"])
input_data = th.decode_transaction_input(tx)
# Return data to user
print(f"Contract Name: {contract_name}")
print(f"Function Name: {input_data['func_name']}")
print(f"Function Arguements: {input_data['args']}")
print(f"Tx Parameters: {input_data['params']}")





# To Do: Breakdown transaction vs transaction receipt, block
    # Explore source code of contrat creation tx
# Final visualization in Flask


