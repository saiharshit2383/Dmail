import { useState, useEffect } from 'react';
import Web3 from 'web3'; // Import Web3.js
import { getEmailByWallet } from '../lib/email';
import { getContract } from '../lib/ethereum'; // You will need to update getContract to work with Web3.js

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any | null>(null);  // Use 'any' or your own contract type for Web3.js
  const [provider, setProvider] = useState<Web3 | null>(null);  // Use Web3 provider type
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Initialize Web3 provider
      const web3 = new Web3(window.ethereum);
      setProvider(web3);

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get list of accounts
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }

      const normalizedAccount = accounts[0];

      // Initialize the contract (You will need to update getContract for Web3.js)
      const contract = await getContract(web3);
      if (!contract) {
        throw new Error('Failed to create contract');
      }

      // Set state
      setAccount(normalizedAccount);
      setContract(contract);

      // Fetch email based on wallet address
      const email = await getEmailByWallet(normalizedAccount);
      if (email) {
        setUserEmail(email);
      } else {
        setShowRegisterModal(true);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum === 'undefined') return;

      const web3 = new Web3(window.ethereum);
      setProvider(web3);

      try {
        // Get list of accounts
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          const normalizedAccount = accounts[0];

          // Initialize contract
          const contract = await getContract(web3);
          if (!contract) return;

          setAccount(normalizedAccount);
          setContract(contract);

          // Fetch email based on wallet address
          const email = await getEmailByWallet(normalizedAccount);
          if (email) {
            setUserEmail(email);
          } else {
            setShowRegisterModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        const normalizedAccount = accounts[0];
        setAccount(normalizedAccount);

        // Fetch email based on wallet address
        const email = await getEmailByWallet(normalizedAccount);
        setUserEmail(email);

        if (!email) {
          setShowRegisterModal(true);
        }
      } else {
        setAccount(null);
        setContract(null);
        setUserEmail(null);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  return {
    account,
    contract,
    provider,
    connectWallet,
    userEmail,
    showRegisterModal,
    setShowRegisterModal,
    setUserEmail,
    isLoading,
    error,
  };
}
