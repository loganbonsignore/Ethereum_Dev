"""
Exploring the Ethereum blockchain
"""

# My ETH addresses
ledger = "0xD806e6019AC21714B3B96b0731DD0715Ef2f08AC"
metamask = "0x97BAd4347C45b8DF0F4ebf24D8F0250c8366F8ef"

# Uses a remote node provider to interact with Ethereum blockchain (Infura)
from web3 import Web3
from pprint import pprint

# Provided from Infura's website when project created
# Connection to ethereum node
w3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/58ea22f2caa14187bd2b8c0682c84848'))

# Get ETH balance for wallet address
ledger_balance = w3.eth.get_balance(ledger)
metamask_balance = w3.eth.get_balance(metamask)

# Get latest Block
"""
Block height – The block number and length of the blockchain (in blocks) on creation of the current block.
Timestamp – The time at which a miner mined the block.
Transactions – The number of transactions included within the block.
Miner – The address of the miner who mined the block.
Reward – The amount of ETH awarded to the miner for adding the block (standard 2ETH reward + any transaction fees of transactions included in the block).
Difficulty – The difficulty associated with mining the block.
Size – The size of the data within the block (measured in bytes).
Gas used – The total units of gas used by the transactions in the block.
Gas limit – The total gas limits set by the transactions in the block.
Extra data – Any extra data the miner has included in the block.
Hash – The cryptographic hash that represents the block header (the unique identifier of the block).
Parent hash – The hash of the block that came before the current block.
Sha3Uncles – The combined hash of all uncles for a given parent.
StateRoot – The root hash of Merkle trie which stores the entire state of the system.
Nonce – A value used to demonstrate proof-of-work for a block by the miner.
"""
block = w3.eth.get_block("latest", full_transactions=False)

# Get first transaction of the block
"""
Transaction hash – A hash generated when the transaction is submitted.
Status – An indication of whether the transaction is pending, failed or a success.
Block – The block in which the transaction has been included.
Timestamp – The time at which a miner mined the transaction.
From – The address of the account that submitted the transaction.
To – The address of the recipient or smart contract that the transaction interacts with.
Tokens transferred – A list of tokens that were transferred as part of the transaction.
Tokens transferred – A list of tokens that were transferred as part of the transaction.
Value – The total ETH value being transferred.
Transaction fee – The amount paid to the miner to process the transaction (calculated by gas price*gas used).
Gas limit – The maximum numbers of gas units this transaction can consume.
Gas used – The actual amount of gas units the transaction consumed.
Gas price – The price set per gas unit.
Nonce – The transaction number for the from address (bear in mind this starts at 0 so a nonce of 100 would actually be the 101st transaction submitted by this account.
Input data – Any extra information required by the transaction.
"""
transaction = block.transactions[0]

# Verify address
result = Web3.isAddress(ledger)

# Get gas Price
w3.eth.gas_price

# Get block Number
w3.eth.block_number
w3.eth.get_block_number()

# Get chain ID
w3.eth.chain_id