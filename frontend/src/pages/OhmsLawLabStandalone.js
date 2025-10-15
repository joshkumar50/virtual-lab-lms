import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import OhmsLawLab from '../labs/OhmsLawLab';

const OhmsLawLabStandalone = () => {
  const [report, setReport] = useState('');
  const handleComplete = (results) => {
    // Build a simple report string students can copy
    const lines = [
      `Ohm's Law Lab Report`,
      `Voltage (V): ${results?.voltage ?? 'N/A'}`,
      `Current (I): ${results?.current ?? 'N/A'}`,
      `Resistance (R): ${results?.resistance ?? (results?.voltage && results?.current ? (results.voltage / results.current).toFixed(2) : 'N/A')}`,
      `Power (P): ${results?.power ?? (results?.voltage && results?.current ? (results.voltage * results.current).toFixed(2) : 'N/A')}`,
      `Accuracy: ${results?.accuracy ?? 'N/A'}%`,
      `Measurements: ${results?.measurements ?? 'N/A'}`
    ];
    setReport(lines.join('\n'));
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              Virtual Lab LMS - Ohm's Law Laboratory
            </div>
          </div>
        </div>
      </div>

      {/* Lab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OhmsLawLab onComplete={handleComplete} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Copy Report</h3>
          <p className="text-sm text-gray-600 mb-3">After finishing the lab, click Copy and paste the text into your assignment submission.</p>
          <textarea className="w-full h-64 border border-gray-200 rounded-lg p-3 text-sm" value={report} onChange={(e)=>setReport(e.target.value)} placeholder="Complete the lab to generate a report here..." />
          <button className="btn btn-primary mt-3" onClick={() => { navigator.clipboard.writeText(report || ''); }}>Copy Report</button>
        </div>
      </div>
    </div>
  );
};

export default OhmsLawLabStandalone;
