import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle, Lightbulb, Cpu } from 'lucide-react';

const LogicGateSimulator = ({ onComplete }) => {
  const [inputs, setInputs] = useState({
    A: false,
    B: false
  });
  const [outputs, setOutputs] = useState({
    AND: false,
    OR: false,
    NOT: false
  });
  const [currentGate, setCurrentGate] = useState('AND');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [experimentsCompleted, setExperimentsCompleted] = useState([]);

  // Calculate outputs based on inputs
  useEffect(() => {
    const newOutputs = {
      AND: inputs.A && inputs.B,
      OR: inputs.A || inputs.B,
      NOT: !inputs.A
    };
    setOutputs(newOutputs);
  }, [inputs]);

  const toggleInput = (input) => {
    setInputs(prev => ({
      ...prev,
      [input]: !prev[input]
    }));
  };

  const resetSimulator = () => {
    setInputs({ A: false, B: false });
    setCurrentGate('AND');
    setScore(0);
    setCompleted(false);
    setExperimentsCompleted([]);
  };

  const handleGateClick = (gate) => {
    setCurrentGate(gate);
    if (!experimentsCompleted.includes(gate)) {
      setExperimentsCompleted(prev => [...prev, gate]);
      setScore(prev => prev + 10);
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    onComplete({
      score: 100,
      timeSpent: '15 minutes',
      gatesTested: ['AND', 'OR', 'NOT'],
      inputsTested: 4
    });
  };

  const GateInput = ({ label, value, onClick }) => (
    <motion.button
      onClick={onClick}
      className={`gate-input ${value ? 'active' : ''}`}
      aria-label={`Toggle input ${label}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: value ? '#3b82f6' : '#ffffff',
        borderColor: value ? '#2563eb' : '#d1d5db'
      }}
    >
      <span className="text-lg font-bold">{label}</span>
      <div className={`absolute inset-0 rounded-full ${value ? 'bg-blue-500' : 'bg-gray-300'} opacity-20`} />
    </motion.button>
  );

  const GateOutput = ({ label, value }) => (
    <motion.div 
      className={`gate-output ${value ? 'active' : 'inactive'}`}
      animate={{
        backgroundColor: value ? '#22c55e' : '#ef4444',
        borderColor: value ? '#16a34a' : '#dc2626'
      }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-lg font-bold">{value ? '1' : '0'}</span>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          backgroundColor: value ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );

  const GateSelector = ({ gate, label, description }) => (
    <motion.button
      onClick={() => handleGateClick(gate)}
      className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
        currentGate === gate
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        {experimentsCompleted.includes(gate) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="absolute top-2 right-2">
        <Cpu className="w-4 h-4 text-gray-400" />
      </div>
    </motion.button>
  );

  return (
    <div className="lab-container p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Logic Gate Simulator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Master digital electronics with interactive AND, OR, and NOT gate simulations
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="lab-card mb-8">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 text-yellow-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Select a logic gate from the options below</li>
                <li>Toggle the input switches (A, B) to see how the output changes</li>
                <li>Observe the truth table for each gate</li>
                <li>Complete all gates to finish the lab</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Gate Selector */}
        <div className="lab-card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Logic Gate</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GateSelector
              gate="AND"
              label="AND Gate"
              description="Output is 1 only when both inputs are 1"
            />
            <GateSelector
              gate="OR"
              label="OR Gate"
              description="Output is 1 when at least one input is 1"
            />
            <GateSelector
              gate="NOT"
              label="NOT Gate"
              description="Output is the inverse of the input"
            />
          </div>
        </div>

          {/* Circuit Visualization */}
          <div className="lab-card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              {currentGate} Gate Circuit
            </h2>
            
            {/* Circuit Board */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-4 border-gray-700 shadow-2xl">
              {/* Circuit Grid */}
              <div className="relative">
                {/* Grid Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4a5568" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Circuit Components */}
                <div className="relative z-10 flex items-center justify-center space-x-12">
                  {/* Input A */}
                  <div className="text-center">
                    <div className="relative">
                      <GateInput
                        label="A"
                        value={inputs.A}
                        onClick={() => toggleInput('A')}
                      />
                      {/* Wire from Input A */}
                      <motion.div
                        className="absolute top-8 left-8 w-16 h-1 bg-yellow-400 shadow-lg"
                        animate={{
                          backgroundColor: inputs.A ? '#10b981' : '#6b7280'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-300 mt-2 font-mono">Input A</p>
                    <div className={`text-xs mt-1 font-mono ${inputs.A ? 'text-green-400' : 'text-gray-400'}`}>
                      {inputs.A ? 'HIGH (1)' : 'LOW (0)'}
                    </div>
                  </div>

                  {/* Gate Circuit */}
                  <div className="relative">
                    {/* Gate Symbol */}
                    <motion.div 
                      className="w-24 h-16 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center shadow-lg"
                      animate={{
                        borderColor: outputs[currentGate] ? '#10b981' : '#6b7280',
                        boxShadow: outputs[currentGate] ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 8px rgba(0,0,0,0.3)'
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-3xl font-bold text-white">
                        {currentGate === 'AND' ? '&' : currentGate === 'OR' ? '≥1' : '1'}
                      </span>
                    </motion.div>
                    
                    {/* Gate Label */}
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-400 font-mono">{currentGate} GATE</span>
                    </div>

                    {/* Input Wires */}
                    <motion.div
                      className="absolute top-8 -left-12 w-12 h-1 bg-yellow-400"
                      animate={{
                        backgroundColor: inputs.A ? '#10b981' : '#6b7280'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {currentGate !== 'NOT' && (
                      <motion.div
                        className="absolute top-8 -right-12 w-12 h-1 bg-yellow-400"
                        animate={{
                          backgroundColor: inputs.B ? '#10b981' : '#6b7280'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    {/* Output Wire */}
                    <motion.div
                      className="absolute top-8 right-8 w-16 h-1 bg-yellow-400"
                      animate={{
                        backgroundColor: outputs[currentGate] ? '#10b981' : '#6b7280'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Output */}
                  <div className="text-center">
                    <div className="relative">
                      <GateOutput
                        label={currentGate}
                        value={outputs[currentGate]}
                      />
                    </div>
                    <p className="text-sm text-gray-300 mt-2 font-mono">Output</p>
                    <div className={`text-xs mt-1 font-mono ${outputs[currentGate] ? 'text-green-400' : 'text-gray-400'}`}>
                      {outputs[currentGate] ? 'HIGH (1)' : 'LOW (0)'}
                    </div>
                  </div>

                  {/* Input B (only for AND and OR gates) */}
                  {currentGate !== 'NOT' && (
                    <div className="text-center">
                      <div className="relative">
                        <GateInput
                          label="B"
                          value={inputs.B}
                          onClick={() => toggleInput('B')}
                        />
                        {/* Wire from Input B */}
                        <motion.div
                          className="absolute top-8 right-8 w-16 h-1 bg-yellow-400"
                          animate={{
                            backgroundColor: inputs.B ? '#10b981' : '#6b7280'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-gray-300 mt-2 font-mono">Input B</p>
                      <div className={`text-xs mt-1 font-mono ${inputs.B ? 'text-green-400' : 'text-gray-400'}`}>
                        {inputs.B ? 'HIGH (1)' : 'LOW (0)'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Circuit Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">CIRCUIT TYPE</div>
                    <div className="text-sm font-mono text-white">{currentGate} Logic Gate</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">POWER STATUS</div>
                    <div className="text-sm font-mono text-green-400">ONLINE</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">OUTPUT STATE</div>
                    <div className={`text-sm font-mono ${outputs[currentGate] ? 'text-green-400' : 'text-gray-400'}`}>
                      {outputs[currentGate] ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Truth Table */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Truth Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3">A</th>
                    {currentGate !== 'NOT' && <th className="text-left py-2 px-3">B</th>}
                    <th className="text-left py-2 px-3">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGate === 'NOT' ? (
                    <>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">0</td>
                        <td className="py-2 px-3 font-bold text-green-600">1</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">1</td>
                        <td className="py-2 px-3 font-bold text-red-600">0</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">0</td>
                        <td className="py-2 px-3">0</td>
                        <td className="py-2 px-3 font-bold text-red-600">0</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">0</td>
                        <td className="py-2 px-3">1</td>
                        <td className="py-2 px-3 font-bold text-red-600">0</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3">1</td>
                        <td className="py-2 px-3">0</td>
                        <td className="py-2 px-3 font-bold text-red-600">0</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">1</td>
                        <td className="py-2 px-3">1</td>
                        <td className="py-2 px-3 font-bold text-green-600">1</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lab-card">
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetSimulator}
              className="btn btn-secondary"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            
            {!completed && (
              <button
                onClick={handleComplete}
                className="btn btn-success"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Lab
              </button>
            )}
            
            {completed && (
              <div className="flex items-center space-x-2 text-success-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Lab Completed!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicGateSimulator;
