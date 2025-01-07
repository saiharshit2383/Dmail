# Decentralized Email Application

A decentralized email application built using modern web technologies that leverages blockchain for secure messaging. This project integrates IPFS for file storage and uses Supabase for user authentication. By combining traditional web development technologies with blockchain-based solutions, this application ensures data privacy, security, and decentralization.

## Tech Stack

- **React**: A JavaScript library for building user interfaces, enabling the creation of dynamic, single-page applications.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development, providing a streamlined approach to styling components.
- **Vite**: A fast build tool and development server for modern web applications, offering an optimized development experience.
- **Supabase**: An open-source Firebase alternative for authentication, database services, and real-time functionalities. Supabase is used to manage users and handle email data in a secure and scalable way.
- **Solidity**: A smart contract language used to write decentralized applications (dApps) on the Ethereum blockchain. Solidity is used to create the contract for managing and storing email data securely.
- **Remix IDE**: A development environment for Solidity smart contracts that simplifies the process of writing, testing, and deploying smart contracts to the Ethereum blockchain.
- **Pinata API Gateway**: A service for pinning files to IPFS (InterPlanetary File System) and providing reliable access to decentralized content. Pinata ensures that uploaded files are stored in a decentralized and persistent manner.

## Features

- **Decentralized Inbox**: Store and retrieve emails securely on the blockchain. With the help of Solidity smart contracts, the emails are immutable and decentralized, preventing unauthorized access.
- **File Storage**: Upload and retrieve images or files securely through IPFS using the Pinata API Gateway. The files are distributed and stored across multiple nodes, ensuring redundancy and availability.
- **User Authentication**: Implemented using Supabase for user sign-in and management, allowing users to create accounts and sign in securely.
- **Responsive UI**: Fully responsive user interface built with React and Tailwind CSS to provide a seamless experience across devices.
- **Smart Contract Integration**: Interaction with Ethereum smart contracts to handle email data, ensuring that messages are sent and received securely without reliance on traditional centralized servers.

## How It Works

This decentralized email application operates differently from conventional email services. Here's a breakdown of the main components:

### 1. **Blockchain and Ethereum Smart Contracts**

At the core of the application is the Ethereum blockchain, which acts as a decentralized ledger to store and validate email transactions. Instead of relying on centralized servers to store email data, email messages are stored on-chain. Each email is represented by a transaction on the blockchain, with critical data such as the sender, recipient, subject, and content stored in smart contracts. 

Smart contracts are self-executing contracts with the terms of the agreement directly written into code. These contracts are deployed on the Ethereum blockchain and can be interacted with via decentralized applications (dApps). Solidity, the programming language used to write smart contracts, allows us to define these contracts and the logic that governs them.

### 2. **Supabase for User Authentication**

Supabase is used for user authentication and managing user data. When a user signs up or logs in, their credentials are securely managed by Supabase, and their session is maintained through JWT tokens. Supabase also stores user-related metadata, such as email preferences, and interacts with the Ethereum blockchain to manage email transactions securely.

### 3. **IPFS and Pinata API for File Storage**

The InterPlanetary File System (IPFS) is a decentralized file storage protocol. Files are uploaded to the IPFS network and assigned a unique CID (Content Identifier). These files are distributed across multiple nodes, ensuring redundancy and availability even if some nodes go offline.

Pinata is a service that acts as an API gateway for IPFS, offering a reliable solution to pin files on the network, ensuring that files remain available and persistent. This application uses Pinata to upload images or attachments associated with email messages.

### 4. **Frontend Interaction with Smart Contracts**

The frontend is built using React and communicates with the Ethereum blockchain using Web3.js or Ethers.js. The React app allows users to compose and send emails, upload attachments, and view received messages. The frontend interacts with smart contracts deployed on the Ethereum network, where each email transaction is stored as a contract call.

When a user sends an email, the email data (such as subject, body, sender, and recipient) is passed to the Ethereum smart contract. The email is then saved in the blockchain as a transaction. The recipient can view the email by querying the contract, ensuring that the email data is secure, verifiable, and tamper-proof.

### 5. **Pinning Files on IPFS**

When a user uploads an image or an attachment, the file is first uploaded to the Pinata API Gateway, which pin the file to the IPFS network. The uploaded file is assigned a CID, which is then stored in the smart contract as part of the email data. This way, the recipient can retrieve the file from IPFS using the CID associated with the email.

### 6. **Decentralization and Privacy**

One of the primary benefits of this application is its decentralized nature. Since the data is stored on the blockchain and IPFS, there is no central authority that controls or can access the content. Emails are private and secure, ensuring that no single entity has access to users' personal data. This also eliminates the risk of data breaches or censorship typically associated with traditional email providers.

## Installation

To get started with the project, follow these steps:

### Prerequisites

Ensure you have the following installed:

- Node.js (v16.x or higher)
- npm or yarn (depending on your preference)
- MetaMask or another Ethereum wallet

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gkprasanth/dmail.git
   cd dmail
