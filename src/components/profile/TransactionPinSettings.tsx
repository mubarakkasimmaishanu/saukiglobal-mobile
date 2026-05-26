import React, { useState } from 'react';
import { ChevronLeft, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import PinInput from '../PinInput';
import { api } from '../../services/api';

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

    api.changePin(currentPin.join(''), newPin.join(''))
      .then((res) => {
        setIsSaving(false);
        if (res.success) {
          setMessage({ type: 'success', text: res.message || 'Transaction PIN updated successfully!' });
          setTimeout(() => onBack(), 2000);
        } else {
          setMessage({ type: 'error', text: res.message || 'Failed to update transaction PIN.' });
        }
      })
      .catch((err) => {
        setIsSaving(false);
        setMessage({ type: 'error', text: err.message || 'An error occurred. Please try again.' });
      });
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans pb-12 mesh-gradient animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="py-8 flex items-center gap-4 bg-transparent">
          <button onClick={onBack} className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Transaction PIN</h1>
        </header>

        <div className="glass-panel p-4 flex gap-3 border-white/5 mb-8">
          <ShieldAlert size={20} className="text-[#66df75] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#e1e3e4]/60 leading-relaxed font-bold uppercase tracking-wider">
            Your transaction PIN is required for all payments and transfers. Never share this PIN with anyone under any circumstance.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex gap-3 items-center border mb-6 ${
            message.type === 'success' ? 'bg-[#66df75]/10 border-[#66df75]/20 text-[#66df75]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
          } text-xs font-bold animate-in zoom-in-95`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <p>{message.text}</p>
          </div>
        )}

        <div className="glass-panel p-8 border-white/5 flex flex-col items-center shadow-xl">
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
                onClick={() => {
                  if (window.confirm('A password reset pin code will be dispatched to your registered email. Proceed?')) {
                    setIsSaving(true);
                    api.forgotPin()
                      .then((res) => {
                        setIsSaving(false);
                        if (res.success) {
                          alert(res.message || 'Reset code sent! You can now set your new PIN.');
                          setStep('new');
                        } else {
                          alert(res.message || 'Failed to request PIN reset.');
                        }
                      })
                      .catch((err) => {
                        setIsSaving(false);
                        alert(err.message || 'An error occurred.');
                      });
                  }
                }}
                disabled={isSaving}
                className="mt-6 text-xs font-bold text-[#66df75] hover:text-[#66df75]/85 disabled:text-gray-600 underline block mx-auto uppercase tracking-wider transition-colors"
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
                className="mt-6 text-xs font-bold text-gray-400 hover:text-white block mx-auto uppercase tracking-wider"
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
                <div className="mt-6 flex items-center justify-center gap-2 text-[#66df75] font-bold text-xs uppercase tracking-wider">
                  <RefreshCw size={14} className="animate-spin text-[#66df75]" />
                  Saving PIN...
                </div>
              )}
              <button 
                onClick={() => setStep('new')}
                className="mt-6 text-xs font-bold text-gray-400 hover:text-white block mx-auto uppercase tracking-wider"
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
