import Web3 from 'web3';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contracts/DecentralizedEmail';

// Function to get Web3 provider using window.ethereum
export async function getEthereumProvider(): Promise<Web3 | null> {
  if (typeof window.ethereum === 'undefined') return null;

  try {
    // Create Web3 instance with window.ethereum as the provider
    const web3 = new Web3(window.ethereum);
    return web3;
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
}

// Function to get the contract instance
export async function getContract(
  web3: Web3
): Promise<any | null> {  // Using 'any' for contract type as Web3.js doesn't have its own TypeScript types for contracts
  try {
    // Get the user's signer (account)
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      console.error('No accounts found');
      return null;
    }
    const signer = accounts[0]; // Take the first account as the signer

    // Create contract instance
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
      from: signer,
    });
    return contract;
  } catch (error) {
    console.error('Error creating contract:', error);
    return null;
  }
}
