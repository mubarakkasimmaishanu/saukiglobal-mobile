import React, { useRef, useEffect } from 'react';

interface PinInputProps {
  pin: string[];
  setPin: (pin: string[]) => void;
  onComplete?: (pin: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function PinInput({ pin, setPin, onComplete, label, error, disabled }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit && value !== '') return;

    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Auto-focus next input
    if (digit && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newPin.every(d => d !== '') && onComplete) {
      onComplete(newPin.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0 && inputRefs.current[index - 1]) {
      // Move focus to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 0) return;

    const newPin = [...pin];
    pastedData.split('').forEach((digit, i) => {
      if (i < 4) newPin[i] = digit;
    });
    setPin(newPin);

    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();

    if (newPin.every(d => d !== '') && onComplete) {
      onComplete(newPin.join(''));
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-bold text-gray-700 mb-3 text-center">{label}</label>}
      <div className="flex justify-center gap-4">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={pin[index]}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`w-14 h-14 text-center text-2xl font-bold bg-gray-50 border rounded-xl outline-none transition-all ${
              error 
                ? 'border-red-500 ring-2 ring-red-100' 
                : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-2 text-center font-medium">{error}</p>}
    </div>
  );
}
