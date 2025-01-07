import React from 'react';
import { ComposeEmail } from './components/ComposeEmail';
import { EmailList } from './components/EmailList';
import { WalletConnect } from './components/WalletConnect';
import { RegisterEmailModal } from './components/RegisterEmailModal';
import { Inbox, PenSquare } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useWallet } from './hooks/useWallet';

function App() {
  const [activeTab, setActiveTab] = React.useState<'inbox' | 'compose'>('inbox');
  const { account, userEmail, showRegisterModal, setShowRegisterModal, setUserEmail } = useWallet();

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Decentralized Email</h1>
            <div className="flex items-center space-x-4">
              {account && userEmail && (
                <>
                  <span className="text-sm text-gray-600">{userEmail}</span>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab('inbox')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        activeTab === 'inbox'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Inbox className="w-5 h-5" />
                      Inbox
                    </button>
                    <button
                      onClick={() => setActiveTab('compose')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        activeTab === 'compose'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <PenSquare className="w-5 h-5" />
                      Compose
                    </button>
                  </div>
                </>
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!account ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Decentralized Email</h2>
            <p className="text-gray-600 mb-8">Connect your wallet to start sending and receiving emails.</p>
          </div>
        ) : !userEmail ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Register Your Email</h2>
            <p className="text-gray-600 mb-8">Please register your @dmail.org email address to continue.</p>
          </div>
        ) : (
          activeTab === 'inbox' ? <EmailList /> : <ComposeEmail />
        )}
      </main>

      {account && showRegisterModal && (
        <RegisterEmailModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          walletAddress={account}
          onSuccess={(email) => setUserEmail(email)}
        />
      )}
    </div>
  );
}

export default App;