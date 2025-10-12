import React from 'react';
import ChemistryLab from '../labs/ChemistryLab';
import Navbar from '../components/Navbar';

const ChemistryLabStandalone = () => {
  const handleLabComplete = (results) => {
    console.log('Chemistry Lab Results:', results);
    // Here you would typically save results to backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ChemistryLab onComplete={handleLabComplete} />
    </div>
  );
};

export default ChemistryLabStandalone;

