App = {
    web3: null,
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x27D8D15CbC94527cAdf5eC14B69519aE23288B95",
    ownerID: "0x56c6595dC06a34a1677eD8770b6E1c7920ABb68f",
    originFarmerID: "0x56c6595dC06a34a1677eD8770b6E1c7920ABb68f",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        console.log("readForm...")
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            "sku: ", App.sku, "\n",
            "upc: ", App.upc, "\n",
            "ownerID: ", App.ownerID, "\n",
            "originFarmerID: ", App.originFarmerID, "\n",
            "originFarmName: ", App.originFarmName, "\n",
            "originFarmInformation: ", App.originFarmInformation, "\n",
            "originFarmLatitude: ", App.originFarmLatitude, "\n",
            "originFarmLongitude: ", App.originFarmLongitude, "\n",
            "productNotes: ", App.productNotes, "\n",
            "productPrice: ", App.productPrice, "\n",
            "distributorID: ", App.distributorID, "\n",
            "retailerID: ", App.retailerID, "\n",
            "consuemrID: ", App.consumerID, "\n",
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            console.log("window.ethereum...")
            if (window.ethereum) {
                App.web3Provider = window.ethereum;
                console.log("window.ethereum: ", window.ethereum)
                try {
                    // Request account access
                    await window.ethereum.enable();
                    //await window.ethereum.requestAccounts()
                } catch (error) {
                    // User denied account access...
                    console.error("User denied account access")
                }
            }
            // Legacy dapp browsers...
            else if (window.web3) {
                App.web3Provider = window.web3.currentProvider;
            }
            // If no injected web3 instance is detected, fall back to Ganache
            else {
                console.log("Using localhost:8545")
                App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            }
        }

        // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        App.web3 = new Web3(App.web3Provider);
        // console.log(App.web3)
        // await App.web3.net.getId((err, netID) => {
        //     if (err){
        //         console.error(err)
        //         throw new Error(err.message);
        //     }
        //     console.log("Network ID: ", netID)
        // })
        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        // Retrieving accounts
        App.web3.eth.getAccounts(function (err, res) {
            if (err) {
                console.log('Error:', err);
                return;
            }
            App.metamaskAccountID = res[0];
            App.web3.eth.defaultAccount = res[0]
            console.log(res)
            // App.web3.eth.unlockAccount(App.web3.eth.defaultAccount, "test", 36000, (err, result) => {
            //     if (err){
            //         console.error("unlockAccount error: ", err)
            //     }
            //     console.log("unlockAccount result: ", result)
            // })
            console.log("metamaskAccountID: ", res[0])
        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain = '../../build/contracts/SupplyChain.json';

        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function (data) {
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            App.fetchItemBufferOne();
            App.fetchItemBufferTwo();
            App.fetchEvents();

        });
        console.log("App: ", App)
        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function (event) {
        event.preventDefault();
        App.readForm()

        App.getMetaskAccountID();
        var processId = parseInt($(event.target).data('id'));
        console.log("hanndleButtonClick - processID: ", processId)

        switch (processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
        }
    },

    harvestItem: async function (event) {
        event.preventDefault();

        const supplyChain = await App.contracts.SupplyChain.deployed()
        console.log("SupplyChain.deployed: ", supplyChain)
        supplyChain.harvestItem(
            App.upc,
            App.metamaskAccountID,
            App.originFarmName,
            App.originFarmInformation,
            App.originFarmLatitude,
            App.originFarmLongitude,
            App.productNotes
        ).then(function (result) {
            $("#ftc-item").text(result);
            console.log('harvestItem promise result:', result);
        }).catch(function (err) {
            console.error("ERROR: harvestItem: ", err.message)
        });


        // App.contracts.SupplyChain.deployed().then(function(instance) {
        //     console.log("instance: ", instance)
        //     console.log(
        //         "UPC: ", App.upc, "\n",
        //         "OriginFarmerID: ", App.metamaskAccountID, "\n",
        //         "OriginFarmInformation: ", App.originFarmInformation, "\n",
        //         "OriginFarmLatitude: " , App.originFarmLatitude, "\n",
        //         "OriginFarmLongitude: ", App.originFarmLongitude, "\n",
        //         "Product Notes: ", App.productNotes
        //     )
        //     return instance.harvestItem(
        //         App.upc,
        //         App.metamaskAccountID, // originFarmerID
        //         App.originFarmName,
        //         App.originFarmInformation,
        //         App.originFarmLatitude,
        //         App.originFarmLongitude,
        //         App.productNotes
        //     );
        // }).then(function(result) {
        //     $("#ftc-item").text(result);
        //     console.log('harvestItem promise result:',result);
        // }).catch(function(err) {
        //     console.error("ERROR: harvestItem: ", err.message)
        // });
    },

    processItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.processItem(App.upc, {from: App.metamaskAccountID});
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('processItem', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    packItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.packItem(App.upc, {from: App.metamaskAccountID});
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('packItem', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    sellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            const productPrice = web3.toWei(1, "ether");
            console.log('productPrice', productPrice);
            return instance.sellItem(App.upc, App.productPrice, {from: App.metamaskAccountID});
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('sellItem', result);
        }).catch(function (err) {
            console.error(err.message);
        });
    },

    buyItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            const walletValue = web3.toWei(3, "ether");
            return instance.buyItem(App.upc, {from: App.metamaskAccountID, value: walletValue});
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('buyItem', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    shipItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.shipItem(App.upc, {from: App.metamaskAccountID});
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('shipItem', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    receiveItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('receiveItem', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.purchaseItem(App.upc, {from: App.metamaskAccountID});
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('purchaseItem', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    fetchItemBufferOne: function () {
        //var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        console.log('upc', App.upc);

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.fetchItemBufferOne(App.upc);
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('fetchItemBufferOne', result);
        }).catch(function (err) {
            console.error("fetchItemBufferOne: ", err.message);
        });
    },

    fetchItemBufferTwo: function () {
        ///    event.preventDefault();
        ///    var processId = parseInt($(event.target).data('id'));

        App.contracts.SupplyChain.deployed().then(function (instance) {
            return instance.fetchItemBufferTwo.call(App.upc);
        }).then(function (result) {
            $("#ftc-item").text(result);
            console.log('fetchItemBufferTwo', result);
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                    App.contracts.SupplyChain.currentProvider,
                    arguments
                );
            };
        }

        App.contracts.SupplyChain.deployed().then(function (instance) {
            var events = instance.allEvents(function (err, log) {
                if (!err)
                    $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
            });
        }).catch(function (err) {
            console.log(err.message);
        });

    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
