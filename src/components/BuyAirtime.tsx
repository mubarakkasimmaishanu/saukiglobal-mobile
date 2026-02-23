import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Phone,
  Contact,
  CheckCircle2,
  Lock,
  RefreshCcw,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface BuyAirtimeProps {
  onBack: () => void;
}

export default function BuyAirtime({ onBack }: BuyAirtimeProps) {
  const { user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState('vtu'); // 'vtu' or 'a2c'
  const [step, setStep] = useState('form'); // 'form', 'pin', 'success'

  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [detectedNetwork, setDetectedNetwork] = useState<any>(null);
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);

  // Nigerian Network Prefixes for Auto-Detection
  const networks: Record<string, any> = {
    mtn: { name: 'MTN', color: 'bg-yellow-400', text: 'text-yellow-900', border: 'border-yellow-400', prefixes: ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906'] },
    airtel: { name: 'Airtel', color: 'bg-red-500', text: 'text-white', border: 'border-red-500', prefixes: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'] },
    glo: { name: 'GLO', color: 'bg-green-500', text: 'text-white', border: 'border-green-500', prefixes: ['0805', '0807', '0811', '0815', '0705', '0905'] },
    '9mobile': { name: '9mobile', color: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-800', prefixes: ['0809', '0818', '0817', '0909', '0908'] }
  };

  const quickAmounts = [100, 200, 500, 1000];

  // Auto-detect network based on the first 4 digits
  useEffect(() => {
    if (phone.length >= 4) {
      const prefix = phone.substring(0, 4);
      let found = null;
      for (const [key, net] of Object.entries(networks)) {
        if (net.prefixes.includes(prefix)) {
          found = { id: key, ...net };
          break;
        }
      }
      setDetectedNetwork(found);
    } else {
      setDetectedNetwork(null);
    }
  }, [phone]);

  // Calculate discount: Resellers get 4%, Basic gets 0%
  const isReseller = user?.isReseller ?? false;
  const discountRate = isReseller ? 0.04 : 0;
  const numAmount = Number(amount) || 0;
  const amountToPay = numAmount - (numAmount * discountRate);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11 || !amount || Number(amount) < 50) return;
    if (user && amountToPay > user.balance) {
      alert('Insufficient wallet balance');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = async () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);

    try {
      await api.addTransaction({
        type: 'Airtime',
        amount: amountToPay,
        status: 'Success',
        details: `${detectedNetwork?.name || 'Airtime'} VTU to ${phone}`,
        recipient: phone,
        network: detectedNetwork?.name
      });
      await refreshUser();
      setStep('success');
    } catch (error) {
      alert('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">

        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white sticky top-0 z-20 flex items-center border-b border-gray-100">
          <button
            onClick={() => {
              if (step === 'success') { setStep('form'); setPhone(''); setAmount(''); }
              else if (step === 'pin') setStep('form');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Airtime Services</h1>
        </header>

        {/* STEP 1: FILL DETAILS */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Tabs */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('vtu')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'vtu' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Buy Airtime
                </button>
                <button
                  onClick={() => setActiveTab('a2c')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'a2c' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <RefreshCcw size={14} /> Airtime 2 Cash
                </button>
              </div>
            </div>

            {activeTab === 'a2c' ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <RefreshCcw size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[250px]">
                  Convert your excess airtime back to cash in your wallet at the best rates. Stay tuned!
                </p>
                <button
                  onClick={() => setActiveTab('vtu')}
                  className="mt-6 text-sm font-bold text-green-600 bg-green-50 px-6 py-3 rounded-full"
                >
                  Go back to Top-up
                </button>
              </div>
            ) : (
              <div className="p-5">
                {/* Wallet Balance */}
                <div className="flex items-center justify-between bg-green-50 p-4 rounded-2xl mb-6 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-green-800 font-medium">Available Balance</p>
                      <p className="text-sm font-bold text-green-900">₦ {user?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-6">

                  {/* Phone Number Input with Auto-Detect */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                      {detectedNetwork && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${detectedNetwork.color} ${detectedNetwork.text}`}>
                          {detectedNetwork.name}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        placeholder="0801 234 5678"
                        maxLength={11}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className={`w-full pl-11 pr-12 py-4 bg-gray-50 border-2 rounded-xl text-lg text-gray-900 font-bold focus:outline-none transition-all tracking-wide ${detectedNetwork ? detectedNetwork.border : 'border-gray-200 focus:border-green-500'
                          }`}
                      />
                      <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-600 hover:text-green-700">
                        <Contact size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Manual Network Selection (Fallback if not detected) */}
                  {!detectedNetwork && phone.length > 4 && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex gap-2 mb-4">
                      <AlertCircle size={16} className="text-red-500 mt-0.5" />
                      <p className="text-xs text-red-700 font-medium">Unrecognized prefix. Please select network manually below.</p>
                    </div>
                  )}

                  {!detectedNetwork && (
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(networks).map(([key, net]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDetectedNetwork({ id: key, ...net })}
                          className={`py-2 rounded-lg text-xs font-bold border ${net.color} bg-opacity-10 text-gray-700 border-gray-200 hover:border-gray-300`}
                        >
                          {net.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₦)</label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold text-lg">₦</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        min="50"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Quick Amounts */}
                    <div className="flex gap-2">
                      {quickAmounts.map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className="flex-1 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors"
                        >
                          ₦{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discount Banner (Tier-Aware) */}
                  {Number(amount) > 0 && isReseller && (
                    <div className="flex justify-between items-center px-4 py-3 bg-green-50 rounded-xl border border-green-100">
                      <span className="text-xs text-green-800 font-medium">Reseller Discount (4%)</span>
                      <span className="text-sm font-bold text-green-700">- ₦{(Number(amount) * discountRate).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(amount) > 0 && !isReseller && (
                    <div className="flex justify-between items-center px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-xs text-amber-800 font-medium">Upgrade to Reseller for 4% discount</span>
                      <span className="text-sm font-bold text-amber-600">Save ₦{(Number(amount) * 0.04).toFixed(0)}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={phone.length < 11 || !amount || !detectedNetwork}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-between items-center px-6"
                    >
                      <span>Pay</span>
                      <span>₦{amountToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PIN VERIFICATION */}
        {step === 'pin' && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Recharge</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Sending <strong className="text-gray-800">₦{amount} {detectedNetwork.name}</strong> to <strong className="text-gray-800">{phone}</strong>.
            </p>

            <PinInput
              pin={transactionPin}
              setPin={setTransactionPin}
              onComplete={handlePinSubmit}
              disabled={isProcessing}
            />

            <button
              onClick={handlePinSubmit}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center animate-in zoom-in-95 duration-500 pt-12">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 relative">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recharge Successful!</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-[250px] text-center">
              You have successfully sent ₦{amount} {detectedNetwork.name} to <strong className="text-gray-800">{phone}</strong>.
            </p>

            <div className="w-full bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-3 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Sent</span>
                <span className="font-bold text-gray-900">₦{amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Charged</span>
                <span className="font-bold text-green-600">₦{amountToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-500">New Balance</span>
                <span className="font-bold text-gray-900">₦{user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={() => { setStep('form'); setPhone(''); setAmount(''); setTransactionPin(['', '', '', '']); }}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all mb-3"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
