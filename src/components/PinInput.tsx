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
  const lastTriggeredPin = useRef('');

  useEffect(() => {
    // Focus first input on mount
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  // Handle the completion event inside a useEffect hook.
  // This guarantees that the callback is executed in a render cycle
  // where the parent state has already updated, avoiding stale closures.
  useEffect(() => {
    const pinStr = pin.join('');
    if (pinStr.length === 4 && pinStr !== lastTriggeredPin.current) {
      lastTriggeredPin.current = pinStr;
      if (onComplete) {
        onComplete(pinStr);
      }
    } else if (pinStr.length < 4) {
      lastTriggeredPin.current = '';
    }
  }, [pin, onComplete]);

  const handlePasteData = (data: string) => {
    const pastedData = data.replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 0) return;

    const newPin = ['', '', '', ''];
    pastedData.split('').forEach((digit, i) => {
      if (i < 4) newPin[i] = digit;
    });
    setPin(newPin);

    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(pastedData.length, 3);
    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, '');

    // Check if the user pasted a multi-digit string (like a 4-digit PIN)
    if (cleanValue.length >= 4) {
      handlePasteData(cleanValue);
      return;
    }

    if (cleanValue === '') {
      const newPin = [...pin];
      newPin[index] = '';
      setPin(newPin);
      return;
    }

    // Take the last character typed
    const digit = cleanValue.slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Auto-focus next input
    if (index < 3 && inputRefs.current[index + 1]) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if ((e.key === 'Backspace' || e.keyCode === 8) && index > 0) {
      if (!pin[index]) {
        // Current box is empty, delete previous and focus previous
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 0);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePasteData(pastedData);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const target = e.target;
    target.select();
    // iOS Safari / WebView fallback
    setTimeout(() => {
      try {
        target.setSelectionRange(0, target.value.length);
      } catch (err) {
        // ignore if not supported
      }
    }, 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).select();
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
            value={pin[index]}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onClick={handleClick}
            className={`w-14 h-14 text-center text-2xl font-bold bg-gray-50 border rounded-xl outline-none transition-all ${
              error 
                ? 'border-red-500 ring-2 ring-red-100' 
                : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-2 text-center font-medium">{error}</p>}
    </div>
  );
}
