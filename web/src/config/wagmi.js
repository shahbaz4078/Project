import { createConfig, http } from 'wagmi';
import { polygonMumbai, localhost } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [polygonMumbai, localhost],
  connectors: [
    injected(),
    metaMask()
  ],
  transports: {
    [polygonMumbai.id]: http(),
    [localhost.id]: http()
  }
});

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
