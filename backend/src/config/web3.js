import Web3 from 'web3';
import { env } from './env.js';

let web3;

export function getWeb3() {
  if (!env.chainRpcUrl) return null;
  if (!web3) web3 = new Web3(env.chainRpcUrl);
  return web3;
}
