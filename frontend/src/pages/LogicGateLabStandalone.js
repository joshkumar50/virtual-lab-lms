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
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LogicGateSimulator onComplete={handleLabComplete} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Copy Report</h3>
          <textarea className="w-full h-64 border border-gray-200 rounded-lg p-3 text-sm" value={report} onChange={(e)=>setReport(e.target.value)} placeholder="Complete the lab to generate a report here..." />
          <button className="btn btn-primary mt-3" onClick={() => navigator.clipboard.writeText(report || '')}>Copy Report</button>
        </div>
      </div>
    </div>
  );
};

export default LogicGateLabStandalone;
