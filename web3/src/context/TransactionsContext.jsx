import React, { useState } from "react";
import { rinkebyHtml, rinkebyWss } from "../utils/constants.js";
import { contractABI, contractAddress, privateKey } from "../utils/constants.js"; //these imports are for method 2/3(see below)
import { ethers } from "ethers";
export const TransactionContext = React.createContext();



export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedText, setConfirmedText] = useState("");
  let hashes = [];
  let transactionHash = "";
  let provider = null;
  const defaultTestHtml = rinkebyHtml;
  const defaultTestWss = rinkebyWss; //please note that the default testnet is chosen as rinkeby, you may change the address in ../utils/constants.js
  const Web3 = require('web3');
  var web3 = new Web3(defaultTestHtml);

  const printTransaction = async (hash, index) => {
    let tx = await web3.eth.getTransaction(hash);
    console.log(`===== Numer #${index + 1}th transaction detail:===========`) // a visual separator
    console.log(`Transaction is confirmed. Transaction Hash: - ${hash}`);
    console.log('TX confirmation: ', tx.transactionIndex); // "null" when transaction is pending
    console.log('TX nonce: ', tx.nonce); // number of transactions made by the sender prior to this one
    console.log('TX block hash: ', tx.blockHash); // hash of the block where this transaction was in. "null" when transaction is pending
    console.log('TX block number: ', tx.blockNumber); // number of the block where this transaction was in. "null" when transaction is pending
    console.log('TX sender address: ', tx.from); // address of the sender
    console.log('TX amount(in Ether): ', web3.utils.fromWei(tx.value, 'ether')); // value transferred in ether
    console.log('TX date: ', new Date()); // transaction date
    console.log('TX gas price: ', tx.gasPrice); // gas price provided by the sender in wei
    console.log('TX gas: ', tx.gas); // gas provided by the sender.
    console.log('TX input: ', tx.input); // the data sent along with the transaction.
    console.log('==========================') // a visual separator
    console.log('');
  }
  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };
  //Subscribe to new block headers to check if transactions have completed
  //I have also tried subscribing to 'logs', but it does not track the transaction hash if it is sent by metamask API
  //If I emit the transfer event using smart contract, 'logs' can track the contract address
  //However the token transaction time maybe different from the smart contract interaction time, so I did not use it
  const subscribeTransaction = async () => {
    try {
      var web3_ws = new Web3(new Web3.providers.WebsocketProvider(defaultTestWss));
      let totalTransactionsFound = [];
      const subscription = web3_ws.eth.subscribe('newBlockHeaders',
        (err, res) => {
          if (err) console.error(err);
        });
      subscription.on('data', (block) => {
        setTimeout(async () => {
          try {
            let blockHash = block.hash;
            let latestBlock = await web3_ws.eth.getBlock(blockHash);
            let blockTransactions = latestBlock.transactions;
            let transactionsFound = blockTransactions.filter(tx => hashes.includes(tx));
            if (transactionsFound && transactionsFound.length >= 1) {
              for (let i = 0; i < transactionsFound.length; i++) {
                totalTransactionsFound.push(transactionsFound[i]);
                printTransaction(transactionsFound[i], i);
              }
            }
            if(totalTransactionsFound.length >= hashes.length){
              setConfirmedText("Your transactions are confirmed.\n Please refer to console for details.");
              setIsLoading(false);
              web3_ws.eth.clearSubscriptions();
              alert("Your transactions are confirmed. Please refer to console for details.");
            }
          } catch (err) {
            console.error(err);
          }
        })

      });

    }
    catch (error) {
      console.log(error);
      alert(error);
      throw new Error("Subscription failed");
    }
  }

  //function to send transfer request
  //I have implemented several methods to send transaction, and turn out I found that first method is the simplest way
  //where the third method is the most stable way to fire a batch request, so I adopted method 3
  //Nevertheless, I still included other methods for reference
  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      if (window.ethereum) {
        //===== First Method Start =====
        //First method is using window.ethereum.request from metamask to send transaction
        /*
        const { addressTo, amount } = formData;
        var { addressToList } = [];
        
        if(addressTo.includes(",")){
          addressToList = addressTo.split(',');
        }
        console.log("addressToList", addressToList);
        if(addressToList && addressToList.length > 1){
          var Web3 = require("web3");
          var web3 = new Web3(new Web3.providers.WebsocketProvider(defaultTestWss));
          const batch = new web3.BatchRequest();
          for(let i = 0; i < addressToList.length; i++){
            const parsedAmount = ethers.utils.parseEther(amount);
            const txParams = {
              from: currentAccount,
              to: addressToList[i],
              gas: "0x5208",
              value: parsedAmount._hex,
            };
            var request = window.ethereum.request({
              method: "eth_sendTransaction",
              params: [txParams],
            }, (err, res) => {console.log(err, res)});
            var callBack = (err, res) => {console.log(err, res);}
            batch.add(request, callBack);
          }
          const { response } = await batch.execute();
          console.log("batch response: ", response);
        }
        else{        
        const parsedAmount = ethers.utils.parseEther(amount);
        const txParams = {
          from: currentAccount,
          to: addressTo,
          gas: "0x5208",
          value: parsedAmount._hex,
        };
        const firstHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });
        transactionHash = firstHash;
        setConfirmedText(`Please wait. Your transaction is waiting to be confirmed. Transaction Hash: ${transactionHash}`);
        setIsLoading(true);
        subscribeTransaction();
      }
      */
        //===== First Method End =====

        //===== Second Method Start =====
        //Second method creates a contract and subscribe to transfer event of the contract address.
        //However, Transfer event in smart contract and actual money transfer may not finish at the same time.
        //So I put the below function in comment for your reference.
        //You may refer to the ./smart_contract folder from root of project to view the solidity code
        /*
        const createEthereumContract = () => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          var contract = new ethers.Contract(contractAddress, contractABI, signer);
          return contract;
        };
        const transactionsContract = createEthereumContract();
        const contractHash = await transactionsContract.sendTransaction(
          addressTo, parsedAmount, message, {gasLimit: 500000});
        transactionsContract.sendTransaction(addressTo, parsedAmount, message);
        transactionHash = contractHash.hash;
        subscribeTransaction();
        */
        //===== Second Method End =====

        //===== Third Method Start =====
        //Third method uses web3.eth.sendSignedTransaction api to send transaction
        //And it supports sending BatchRequest
        setIsLoading(true);
        let UIprompt = "";
        UIprompt = "Please wait. Your transaction is waiting to be confirmed."
        setConfirmedText(UIprompt);
        UIprompt = "";
        const { addressTo, amount } = formData;
        var { addressToList } = [];
        try {
          if (addressTo.includes(",")) {
            addressToList = addressTo.split(',');//catch error here
          }
          else {
            addressToList = [addressTo];
          }
        }
        catch (err) {
          alert(`Failed to parse address: ${err}`);
        }

        const batch = new web3.BatchRequest();
        let transactionCount = await web3.eth.getTransactionCount(currentAccount);

        for (let i = 0; i < addressToList.length; i++) {
          let transactionParams = {
            from: currentAccount,
            to: addressToList[i].trim(),
            value: web3.utils.toWei(amount.toString(), 'ether'),
            gas: '21000',
            nonce: transactionCount + i,
          };
          const createTransaction = await web3.eth.accounts.signTransaction(
            transactionParams,
            privateKey
          );
          batch.add(web3.eth.sendSignedTransaction.request(
            createTransaction.rawTransaction
            , (err, hash) => {
              if (!err) {
                UIprompt += `Your transaction with hash: ${hash} is sent to Ethereum. Please wait.         \r\n`;
                console.log(`Transaction with hash: ${hash} is sent to Ethereum         `);
                hashes.push(hash);
              }
              else {
                console.log(`Error occurred during transaction to ${hash}: ${err}`);
                UIprompt += `Your transaction with hash ${hash} has error. Error: ${err}         `;
              }
              
              setConfirmedText(UIprompt);
            }));
        }
        batch.execute();
        subscribeTransaction();

        //===== Forth Method: Ethers.js =====
        /*
        setIsLoading(true);
        const { addressTo, amount } = formData;
        var { addressToList } = [];
        const  Tx  = require('@ethereumjs/tx');
        const  Common  = require('@ethereumjs/common');
        const common = new Common.default({ chain: 'rinkeby' });
        if(addressTo.includes(",")){
          addressToList = addressTo.split(',');
        }
        else{
          addressToList = [addressTo];
        }
        const batch = new web3.BatchRequest();
          for(let i = 0; i < addressToList.length; i++){
            const parsedAmount = web3.utils.toWei(amount, 'ether');
            var newNonce = "";
            let transactionCount = await web3.eth.getTransactionCount(currentAccount);

            const transactionParams = 
              {
                from: currentAccount,
                to: addressToList[i],
                value: parsedAmount._hex,
                gasLimit: web3.utils.toHex(21000),
                gasPrice: web3.utils.toHex(10e9),
                //...i !== 0 && {nonce: newNonce}
                nonce: transactionCount + 1
              };
            var tx = Tx.Transaction.fromTxData(transactionParams, {common});
            const pk = Buffer.from(privateKey, 'hex');
            const signedTx = tx.sign(pk);
            console.log(`signedTx: ${JSON.stringify(signedTx)}`);
            const serializedTx = signedTx.serialize()
            
            let rawReceipt = await web3.eth.accounts.signTransaction(
              transactionParams,
              privateKey
            );
            
            console.log(`Raw Receipt:${JSON.stringify(rawReceipt)}`);
            /*
            batch.add(web3.eth.sendSignedTransaction.request(
              rawReceipt.transactionHash
            , (error, receipt) => {
              console.log(`error from sendsigntrans: ${error}`);
              let txHash = receipt.transactionHash;
              setConfirmedText("Your transaction is confirmed. You can refer to console for details.");
              setIsLoading(false);
              let tx = "";
              web3.eth.getTransaction(txHash)
              .then((trans) => {tx = trans})
              newNonce = parseInt(tx.nonce) + 1;
              console.log('=====================================') // a visual separator
              console.log(`Transaction is confirmed. Transaction Hash: - ${txHash}`);
              console.log('TX confirmation: ', tx.transactionIndex); // "null" when transaction is pending
              console.log('TX nonce: ', tx.nonce); // number of transactions made by the sender prior to this one
              console.log('TX block hash: ', tx.blockHash); // hash of the block where this transaction was in. "null" when transaction is pending
              console.log('TX block number: ', tx.blockNumber); // number of the block where this transaction was in. "null" when transaction is pending
              console.log('TX sender address: ', tx.from); // address of the sender
              console.log('TX amount(in Ether): ', web3.utils.fromWei(tx.value, 'ether')); // value transferred in ether
              console.log('TX date: ', new Date()); // transaction date
              console.log('TX gas price: ', tx.gasPrice); // gas price provided by the sender in wei
              console.log('TX gas: ', tx.gas); // gas provided by the sender.
              console.log('TX input: ', tx.input); // the data sent along with the transaction.
              console.log('=====================================') // a visual separator
    
            }))
            console.log(`rawReceipt.tranHash:${rawReceipt.transactionHash}`);
            web3.eth.sendSignedTransaction(web3.utils.toHex(serializedTx))
            .on('receipt', console.log)
            .catch(e => console.log('error: ', e));
            web3.eth.sendSignedTransaction(
              rawReceipt.transactionHash
            ).then((receipt) => {
              console.log(`Trasaction successful with has: ${receipt.transactionHash}`);
            })
          }
        */



        //=====
        /*
           var Tx = require('ethereumjs-tx').Transaction;
           var transactionCount = await web3.eth.getTransactionCount(currentAccount)
           const accountNonce = '0x' + (transactionCount + 1).toString(16);
           const latestBlock = await web3.eth.getBlock("latest");
           //var gasLimit = web3.utils.toHex(latestBlock.gasLimit);
           var gasLimit = web3.utils.toHex(21000);
           console.log(`gasLimit:${gasLimit}`);
           var gasPrice = "";
           web3.eth.getGasPrice()
           .then((result) => {
             //gasPrice = web3.utils.toHex(result);
             gasPrice = web3.utils.toWei("1500000000");
             console.log(`gasPrice:${gasPrice}`);
           })
           var rawTx = {
             nonce: accountNonce,
             to: addressTo,
             gasPrice: '0x59637a5e',
             gasLimit: gasLimit,
             value: parsedAmount._hex
           }
           var tx = new Tx(rawTx, {'chain': 'rinkeby'})
           var privateKeyBuffer = Buffer.from(privateKey, 'hex')
           //tx.sign(privateKeyBuffer)
           var serializedTx = tx.serialize();
           
           var secondHash = "";
           
           web3.eth.sendTransaction('0x' + serializedTx.toString('hex'))
           .on("transactionHash", (hash) => {
             secondHash = hash;
             transactionHash = secondHash;
           })
           .on("receipt", (receipt) => {
             console.log("Transfer receipt is avilable.");
           })
           .on('confirmation', (confirmationNumber, receipt, latestBlockHash) => {
             console.log("Transfer confirmed!");
             console.log(`confirmation number: ${confirmationNumber}`);
             console.log(`latestBlockHash: ${latestBlockHash}`);
           })
           */
        //===== Third Method End =====


      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      alert(error);

      throw new Error("No ethereum object");

    }
  };

  //connect to metamask wallet and retrieve account address
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      var Web3HttpProvider = require('web3-providers-http');
      provider = new Web3HttpProvider(defaultTestHtml);
      if (provider) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length) {
          setCurrentAccount(accounts[0]);
        } else {
          console.log("No accounts found");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        isLoading,
        handleTransfer,
        handleChange,
        formData,
        confirmedText
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

