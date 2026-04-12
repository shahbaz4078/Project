import { getWeb3 } from '../config/web3.js';
import { env } from '../config/env.js';
import abi from '../abi/shipmentAuditAbi.js';
import { BlockchainRecord } from '../models/BlockchainRecord.js';

let account;

function normalizeKey(key) {
  const k = String(key).trim();
  return k.startsWith('0x') ? k : `0x${k}`;
}

function getAccount(w3) {
  if (!env.ethPrivateKey) return null;
  if (!account) account = w3.eth.accounts.privateKeyToAccount(normalizeKey(env.ethPrivateKey));
  return account;
}

function shipmentRefBytes32(w3, shipmentMongoId) {
  return w3.utils.keccak256(w3.utils.utf8ToHex(String(shipmentMongoId)));
}

function payloadHashBytes32(w3, payload) {
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return w3.utils.keccak256(w3.utils.utf8ToHex(json));
}

export function isChainConfigured() {
  return Boolean(env.chainRpcUrl && env.shipmentAuditContract && env.ethPrivateKey);
}

/**
 * Records an audit hash on-chain (if configured) and always persists BlockchainRecord.
 */
export async function recordShipmentAudit({ shipmentId, eventType, payload }) {
  const w3 = getWeb3();
  const snapshot = typeof payload === 'string' ? payload : JSON.stringify(payload);
  let payloadHash = '';
  let refHex = '';

  if (w3) {
    refHex = shipmentRefBytes32(w3, shipmentId);
    payloadHash = payloadHashBytes32(w3, snapshot);
  } else {
    const crypto = await import('crypto');
    refHex = crypto.createHash('sha256').update(String(shipmentId)).digest('hex');
    payloadHash = crypto.createHash('sha256').update(snapshot).digest('hex');
  }

  const doc = await BlockchainRecord.create({
    shipmentId,
    eventType,
    payloadHash,
    payloadSnapshot: snapshot.slice(0, 65536),
  });

  if (!isChainConfigured() || !w3) {
    await BlockchainRecord.findByIdAndUpdate(doc._id, {
      errorMessage: !w3 ? 'CHAIN_RPC_URL not set' : 'Contract or private key not configured',
    });
    return doc;
  }

  const acc = getAccount(w3);
  if (!acc) {
    await BlockchainRecord.findByIdAndUpdate(doc._id, { errorMessage: 'ETH_PRIVATE_KEY missing' });
    return doc;
  }

  w3.eth.accounts.wallet.add(acc);
  const contract = new w3.eth.Contract(abi, env.shipmentAuditContract);

  try {
    const gas = await contract.methods.recordAudit(refHex, payloadHash).estimateGas({ from: acc.address });
    const gasBn = typeof gas === 'bigint' ? gas : BigInt(gas);
    const receipt = await contract.methods.recordAudit(refHex, payloadHash).send({
      from: acc.address,
      gas: String(gasBn + BigInt(20000)),
    });

    const chainIdRaw = env.chainId ?? (await w3.eth.getChainId());
    const chainIdNum = typeof chainIdRaw === 'bigint' ? Number(chainIdRaw) : Number(chainIdRaw);

    await BlockchainRecord.findByIdAndUpdate(doc._id, {
      txHash: receipt.transactionHash?.toString(),
      blockNumber: receipt.blockNumber != null ? Number(receipt.blockNumber) : undefined,
      chainId: chainIdNum,
      fromAddress: acc.address,
      confirmed: true,
    });

    return BlockchainRecord.findById(doc._id);
  } catch (e) {
    await BlockchainRecord.findByIdAndUpdate(doc._id, {
      errorMessage: e.message || String(e),
    });
    return BlockchainRecord.findById(doc._id);
  }
}

export { shipmentRefBytes32, payloadHashBytes32 };
