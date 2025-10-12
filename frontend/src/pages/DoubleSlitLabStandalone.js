import React from 'react';
import DoubleSlitLab from '../labs/DoubleSlitLab';

const DoubleSlitLabStandalone = () => {
  const handleLabComplete = (results) => {
    console.log('Lab completed with results:', results);
    alert(`Lab completed! Score: ${results.score}, Time: ${results.timeSpent}`);
  };

  return (
    <div className="min-h-screen">
      <DoubleSlitLab onComplete={handleLabComplete} />
    </div>
  );
};

export default DoubleSlitLabStandalone;

