const HDWallet = require('truffle-hdwallet-provider');
const infuraKey = "5e00cd1e089b435eb21bb2402b2045d6";

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
    compilers: {
        solc: {
            version: "^0.4.24",
            parser: "solcjs",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 10000
                }
            }
        }
    },
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*" // Match any network id
        },
        rinkeby: {
            provider: function () {
                return new HDWallet(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`);
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: 10000000000
        }
    },
};