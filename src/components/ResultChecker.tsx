import React from 'react';
import ExamPins from './ExamPins';

interface ResultCheckerProps {
  onBack: () => void;
  onFund?: () => void;
}

export default function ResultChecker({ onBack, onFund }: ResultCheckerProps) {
  return <ExamPins onBack={onBack} onFund={onFund} />;
}
