import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Wallet, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

interface WalletViewProps {
  onClose: () => void;
}

export function WalletView({ onClose }: WalletViewProps) {
  const { state, initiatePayment } = useApp();
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [status, setStatus] = useState<string | null>(null);
  const wallet = state.wallet;

  const handleDeposit = async () => {
    setIsDepositing(true);
    setStatus('Processing...');
    try {
      const result = await initiatePayment(state.currentUser?.phone || '', parseInt(depositAmount));
      setStatus(result.message);
      if (result.success) {
        setTimeout(() => setStatus(null), 5000);
      }
    } catch (err) {
      setStatus('Failed to initiate payment');
    } finally {
      setIsDepositing(false);
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Wallet not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title">My Wallet</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white text-center">
          <p className="text-white/70 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold mb-6">
            {wallet.currency} {wallet.balance.toLocaleString()}
          </p>

          <div className="space-y-3">
            <div className="flex gap-2 bg-white/10 p-1 rounded-xl">
              <input 
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 bg-transparent border-none text-center focus:ring-0 text-white font-semibold"
                placeholder="Amount"
              />
              <span className="pr-4 py-2 text-white/50 font-medium">KES</span>
            </div>

            <Button 
              onClick={handleDeposit}
              disabled={isDepositing}
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 h-12"
            >
              {isDepositing ? 'Processing...' : 'Quick Deposit'}
            </Button>
            
            {status && (
              <p className="text-caption text-emerald-400 animate-pulse">{status}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4">
            <p className="text-caption text-gray-500 mb-1">Total Earned</p>
            <p className="text-xl font-semibold text-emerald-600">
              +{wallet.currency} {wallet.transactions
                .filter(t => t.type === 'credit')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-caption text-gray-500 mb-1">Total Spent</p>
            <p className="text-xl font-semibold text-red-500">
              -{wallet.currency} {wallet.transactions
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Transactions</h3>
            <button className="text-sm text-emerald-600 flex items-center gap-1">
              <History className="w-4 h-4" />
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {wallet.transactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'credit' ? (
                      <ArrowDownRight className={`w-5 h-5 text-emerald-600`} />
                    ) : (
                      <ArrowUpRight className={`w-5 h-5 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <p className="text-caption text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {tx.type === 'credit' ? '+' : '-'} {wallet.currency} {tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-small text-blue-800">
            <strong>Note:</strong> This is a demo wallet. Real payments will be processed through Zenti in the live version.
          </p>
        </div>
      </div>
    </div>
  );
}
