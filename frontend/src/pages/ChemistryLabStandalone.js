import React, { useState } from 'react';
import ChemistryLab from '../labs/ChemistryLab';
import Navbar from '../components/Navbar';

const ChemistryLabStandalone = () => {
  const [report, setReport] = useState('');
  const handleLabComplete = (results) => {
    const text = [
      'Chemistry Lab Report',
      `pH (initial): ${results?.pH_initial ?? 'N/A'}`,
      `pH (final): ${results?.pH_final ?? 'N/A'}`,
      `Color Change: ${results?.color_change ?? 'N/A'}`,
      `Reaction Time: ${results?.reaction_time ?? 'N/A'} s`,
      `Accuracy: ${results?.accuracy ?? 'N/A'}%`
    ].join('\n');
    setReport(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChemistryLab onComplete={handleLabComplete} />
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

export default ChemistryLabStandalone;

