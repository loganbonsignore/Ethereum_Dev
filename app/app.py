from flask import Flask, render_template, request
from web3 import Web3

# Connect to ethereum node
w3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/58ea22f2caa14187bd2b8c0682c84848')) # Key obtained from infura.io

############################ Begin Definitions ############################
class Node:
    def __init__(self):
        pass

    def get_gas_price(self, unit_type="gwei"):
        # Returns gas price in units specified
        # 'Ether', 'gwei', 'wei' are most popular
        if unit_type == "wei":
            return w3.eth.gas_price
        # Execute with provided unit type
        else:
            gas_price_wei = w3.eth.gas_price
            return w3.fromWei(gas_price_wei, unit_type)

class User:
    def __init__(self, metamask, ledger=None):
        self.metamask = metamask
        self.ledger = ledger
        
    







############################# End Definitions #############################

# Instanciate NodeHandler class
ledger = "0xD806e6019AC21714B3B96b0731DD0715Ef2f08AC"
metamask = "0x97BAd4347C45b8DF0F4ebf24D8F0250c8366F8ef"

node = Node()

# initiate app
app = Flask(__name__)

# define routes
@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html", 
        gas_price=node.get_gas_price(),
        block_number=w3.eth.get_block_number(),
    )

@app.route("/account", methods=["GET", "POST"])
def account():
    
    return render_template("account.html", )










# Run app
if __name__ == "__main__":
    app.run(debug=True)
