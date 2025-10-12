import React from 'react';
import LogicGateSimulator from '../labs/LogicGateSimulator';

const LogicGateLabStandalone = () => {
  const handleLabComplete = (results) => {
    console.log('Logic Gate Lab completed with results:', results);
    alert(`Lab completed! Score: ${results.score}, Time: ${results.timeSpent}`);
  };

  return (
    <div className="min-h-screen">
      <LogicGateSimulator onComplete={handleLabComplete} />
    </div>
  );
};

export default LogicGateLabStandalone;
