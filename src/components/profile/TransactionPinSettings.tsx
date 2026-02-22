import React, { useState } from 'react';
import { ChevronLeft, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import PinInput from '../PinInput';

interface TransactionPinSettingsProps {
  onBack: () => void;
}

export default function TransactionPinSettings({ onBack }: TransactionPinSettingsProps) {
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPin, setCurrentPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleCurrentComplete = () => {
    // In real app, verify current PIN via API
    setStep('new');
  };

  const handleNewComplete = () => {
    setStep('confirm');
  };

  const handleConfirmComplete = (pin: string) => {
    if (pin !== newPin.join('')) {
      setMessage({ type: 'error', text: 'PINs do not match. Please try again.' });
      setConfirmPin(['', '', '', '']);
      return;
    }

    setIsSaving(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Transaction PIN updated successfully!' });
      setTimeout(() => onBack(), 2000);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="px-5 pt-8 pb-4 sticky top-0 z-20 flex items-center gap-4 bg-gray-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-green-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Transaction PIN</h1>
      </header>

      <div className="px-5 pb-10">
        <div className="bg-orange-50 p-4 rounded-2xl flex gap-3 border border-orange-100 mb-8">
          <ShieldAlert size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-orange-800 leading-relaxed font-medium">
            Your transaction PIN is required for all payments and transfers. Never share this PIN with anyone, including our support team.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex gap-3 items-center border mb-6 ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
          {step === 'current' && (
            <div className="w-full animate-in fade-in duration-300">
              <PinInput 
                pin={currentPin} 
                setPin={setCurrentPin} 
                onComplete={handleCurrentComplete}
                label="Enter Current 4-Digit PIN"
                disabled={isSaving}
              />
              <button 
                onClick={() => setStep('new')}
                className="mt-6 text-xs font-bold text-green-600 hover:text-green-700 underline block mx-auto"
              >
                Forgot PIN? Reset via Email
              </button>
            </div>
          )}

          {step === 'new' && (
            <div className="w-full animate-in slide-in-from-right-4 duration-300">
              <PinInput 
                pin={newPin} 
                setPin={setNewPin} 
                onComplete={handleNewComplete}
                label="Enter New 4-Digit PIN"
                disabled={isSaving}
              />
              <button 
                onClick={() => setStep('current')}
                className="mt-6 text-xs font-bold text-gray-400 hover:text-gray-600 block mx-auto"
              >
                Go Back
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="w-full animate-in slide-in-from-right-4 duration-300">
              <PinInput 
                pin={confirmPin} 
                setPin={setConfirmPin} 
                onComplete={handleConfirmComplete}
                label="Confirm New 4-Digit PIN"
                disabled={isSaving}
              />
              {isSaving && (
                <div className="mt-6 flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving PIN...
                </div>
              )}
              <button 
                onClick={() => setStep('new')}
                className="mt-6 text-xs font-bold text-gray-400 hover:text-gray-600 block mx-auto"
              >
                Change New PIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
