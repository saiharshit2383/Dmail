import React, { useState, useEffect } from 'react';
import { Send, Image, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Web3 from 'web3';
import axios from 'axios'; // Import axios
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contracts/DecentralizedEmail';
import { getWalletByEmail } from '../lib/email';

declare let window: any; // for `window.ethereum`
 
const PINATA_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';  
const PINATA_API_KEY = '02b70619b8159494d1b6' 
const PINATA_SECRET_KEY = '1540e9df61d57c63380e6aff994dd57052c5aed6f27d92faba5478fbc6ffcbf6 '

export function ComposeEmail() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [imageHash, setImageHash] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // New state to hold the image file
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setWeb3(web3Instance);
      setContract(contractInstance);
    } else {
      toast.error('Ethereum wallet not found. Please install MetaMask.');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
      }
    }
  };

  const uploadImageToIPFS = async () => {
    if (!imageFile) {
      toast.error('No image selected');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', imageFile);
  
    try {
      const response = await axios.post(PINATA_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      });
  
      const { IpfsHash } = response.data; // The IPFS hash of the uploaded file
      setImageHash(IpfsHash); // Store the hash in state
  
      console.log('Uploaded Image Hash:', IpfsHash); // Log the hash directly from the response
  
      toast.success('Image uploaded successfully to IPFS!');
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      toast.error('Failed to upload image');
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!web3 || !contract) {
      toast.error('Web3 or contract is not initialized');
      return;
    }

    // Check if MetaMask is connected
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      toast.error('Wallet not connected');
      return;
    }
    const senderAddress = accounts[0];

    try {
      setLoading(true);

      // Get wallet address from email
      const receiverAddress = await getWalletByEmail(to);
      if (!receiverAddress) {
        toast.error('Recipient email not found');
        return;
      }

      // Call the sendEmail function on the smart contract
      await contract.methods
        .sendEmail(receiverAddress, subject, content, imageHash)
        .send({ from: senderAddress });

      // Transaction sent successfully
      toast.success('Email sent successfully!');
      console.log(receiverAddress, subject, content, imageHash)
      setTo('');
      setSubject('');
      setContent('');
      setImageHash('');
      setImageFile(null); // Reset the file input
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Compose New Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To (@dmail.org)</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="recipient@dmail.org"
            pattern=".*@dmail\.org$"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter subject"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
            placeholder="Write your message..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload (IPFS)</label>
          <div className="flex gap-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              onClick={uploadImageToIPFS}
            >
              <Image className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Email
            </>
          )}
        </button>
      </form>
    </div>
  );
}
