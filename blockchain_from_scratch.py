import hashlib
import datetime
import copy

class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.hashing()

    def hashing(self):
        key = hashlib.sha256() # Hash object that you can feed byte like objects to with the update() method
        key.update(str(self.index).encode('utf-8')) # Encode because it needs to be byte like object
        key.update(str(self.timestamp).encode('utf-8'))
        key.update(str(self.data).encode('utf-8'))
        key.update(str(self.previous_hash).encode('utf-8'))
        # return key.digest() # Returns a bytes object which contains bytes in the whole range from 0 - 255
        return key.hexdigest() # Like digest() but returns string object of double length, containing only hexadecimal digits. This is used to exchange the value safely in email or other non-binary environments

class BlockChain:
    def __init__(self):
        self.blocks = [self.get_genesis_block()]

    def get_genesis_block(self):
        return Block(0, datetime.datetime.utcnow(), "Genesis Block", "arbitrary")
    
    def add_block(self, data):
        self.blocks.append(Block(len(self.blocks),
                                        datetime.datetime.utcnow(),
                                        data,
                                        self.blocks[len(self.blocks)-1].hash))
    
    def get_chain_size(self):
        return len(self.blocks) - 1 # Exclude genesis block

    def verify(self, verbose=True):
        flag = True
        for i in range(1, len(self.blocks)):
            if self.blocks[i].index != i: # Checking if no missing or extra blocks
                flag = False
                if verbose:
                    print(f"Wrong block index at block {i}")
            if self.blocks[i-1].hash != self.blocks[i].previous_hash: # Checking if previous hash has been altered
                flag = False
                if verbose:
                    print(f"Wrong previous hash at block {i}")
            if self.blocks[i].hash != self.blocks[i].hashing(): # Check if current hash is correctly stored in the next blocks previous hash
                flag = False
                if verbose:
                    print(f"Wrong hash at block {i}")
            if self.blocks[i-1].timestamp >= self.blocks[i].timestamp: # Check if there has been any backdating in previous blocks
                flag = False
                if verbose:
                    print(f"Backdating at block {i}")
        return flag

    def fork(self, head="latest"): # Used to branch out of a chain/use data outside of the chain
        if head in ["latest", "whole", "all"]:
            return copy.deepcopy(self) # Deepcopy since they are mutable. Changes to the deepcopy() object will not affect the copied object
        else:
            c = copy.deepcopy(self)
            c.blocks = c.blocks[0:head+1]
            return c
    
    def get_root(self, chain_2):
        min_chain_size = min(self.get_chain_size(), chain_2.get_chain_size())
        for i in range(1, min_chain_size+1):
            if self.blocks[i] != chain_2.blocks[i]:
                return self.fork(i-1)
        return self.fork(min_chain_size)

    
blockchain = BlockChain()
blockchain.add_block("This is the first block.")
blockchain.add_block("This is the second block")
blockchain.add_block("This is the third block")
if not blockchain.verify():
    raise RuntimeError("New block(s) failed verification")
else:
    print("New block(s) verified")

for block in blockchain.blocks:
    print(f"INDEX: {block.index}")
    print(f"HASH: {block.hash}")
    print(f"TIMESTAMP: {block.timestamp}")
    print(f"DATA: {block.data}")
    print(f"PREVIOUS HASH: {block.previous_hash}")
    print("----------------------------------------------------------------------------------------------")
print(f"CHAIN SIZE: {blockchain.get_chain_size()}")
print("----------------------------------------------------------------------------------------------")
print("----------------------------------------------------------------------------------------------")

# Changing previous data on the blockchain
blockchain.blocks[1].data = "THIS IS NEW DATA"
if not blockchain.verify():
    raise RuntimeError("Block(s) failed verification")
else:
    print("New block(s) verified")


