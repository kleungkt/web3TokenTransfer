import abi from "./Transactions.json";

export const contractAddress = "0xaab7C3ffF181bFEaF3469bfFa8bF7536E7509816";
export const contractABI = abi.abi;

export const ropstenWss = 'wss://ropsten.infura.io/ws/v3/2bdf1c37b60147b598123edc3e903793';
export const ropstenHtml = 'https://ropsten.infura.io/v3/2bdf1c37b60147b598123edc3e903793';
export const rinkebyWss = 'wss://rinkeby.infura.io/ws/v3/2bdf1c37b60147b598123edc3e903793'
export const rinkebyHtml = 'https://rinkeby.infura.io/v3/2bdf1c37b60147b598123edc3e903793';
export const privateKey = process.env.pk;