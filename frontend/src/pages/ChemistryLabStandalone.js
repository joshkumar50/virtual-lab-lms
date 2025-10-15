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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ChemistryLab onComplete={handleLabComplete} />
      </div>
    </div>
  );
};

export default ChemistryLabStandalone;

