import React, { useState } from 'react';
import LogicGateSimulator from '../labs/LogicGateSimulator';

const LogicGateLabStandalone = () => {
  const [report, setReport] = useState('');
  const handleLabComplete = (results) => {
    const text = [
      'Logic Gates Lab Report',
      `Correct Outputs: ${results?.correct ?? 'N/A'}`,
      `Score: ${results?.score ?? 'N/A'}`,
      `Time Spent: ${results?.timeSpent ?? 'N/A'}`
    ].join('\n');
    setReport(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LogicGateSimulator onComplete={handleLabComplete} />
      </div>
    </div>
  );
};

export default LogicGateLabStandalone;
