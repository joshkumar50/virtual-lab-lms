import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Zap, 
  Target, 
  Settings, 
  Eye, 
  BarChart3, 
  Battery,
  Plus,
  Minus,
  Calculator,
  Activity,
  Square
} from 'lucide-react';

const OhmsLawLab = ({ onComplete }) => {
  const [voltage, setVoltage] = useState(12); // V
  const [resistance, setResistance] = useState(4); // Ω
  const [current, setCurrent] = useState(3); // A
  const [power, setPower] = useState(36); // W
  const [isAnimating, setIsAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [experimentMode, setExperimentMode] = useState('voltage'); // voltage, current, resistance
  const [showCalculations, setShowCalculations] = useState(true);
  const [showCircuit, setShowCircuit] = useState(true);
  const [circuitComponents, setCircuitComponents] = useState([
    { id: 'battery', type: 'battery', x: 100, y: 200, voltage: 12 },
    { id: 'resistor1', type: 'resistor', x: 300, y: 200, resistance: 4 },
    { id: 'wire1', type: 'wire', x: 200, y: 200, length: 100 },
    { id: 'wire2', type: 'wire', x: 400, y: 200, length: 100 }
  ]);
  const [experimentHistory, setExperimentHistory] = useState([]);
  const [currentExperiment, setCurrentExperiment] = useState(1);
  const [targetValues] = useState({
    voltage: 12,
    current: 3,
    resistance: 4
  });
  const [tolerance] = useState(0.1); // 10% tolerance
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [measurements, setMeasurements] = useState({
    voltage: 12,
    current: 3,
    resistance: 4,
    power: 36
  });

  const animationRef = useRef();
  const canvasRef = useRef();

  // Calculate derived values using Ohm's Law
  useEffect(() => {
    let calculatedCurrent, calculatedVoltage, calculatedResistance, calculatedPower;
    
    switch (experimentMode) {
      case 'voltage':
        calculatedCurrent = voltage / resistance;
        calculatedPower = voltage * calculatedCurrent;
        setCurrent(calculatedCurrent);
        setPower(calculatedPower);
        break;
      case 'current':
        calculatedVoltage = current * resistance;
        calculatedPower = calculatedVoltage * current;
        setVoltage(calculatedVoltage);
        setPower(calculatedPower);
        break;
      case 'resistance':
        calculatedResistance = voltage / current;
        calculatedPower = voltage * current;
        setResistance(calculatedResistance);
        setPower(calculatedPower);
        break;
      default:
        // Default case - no action needed
        break;
    }

    // Update measurements
    setMeasurements({
      voltage: voltage,
      current: current,
      resistance: resistance,
      power: power
    });

    // Add to graph data
    setGraphData(prev => [...prev.slice(-19), {
      voltage: voltage,
      current: current,
      resistance: resistance,
      power: power,
      timestamp: Date.now()
    }]);

  }, [voltage, current, resistance, power, experimentMode]);

  // Animation loop
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        // Simulate electrical flow animation
        setCircuitComponents(prev => prev.map(comp => ({
          ...comp,
          animationPhase: (comp.animationPhase || 0) + 0.1
        })));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  // Define calculateAccuracy first
  const calculateAccuracy = useCallback(() => {
    const voltageError = Math.abs(voltage - targetValues.voltage) / targetValues.voltage;
    const currentError = Math.abs(current - targetValues.current) / targetValues.current;
    const resistanceError = Math.abs(resistance - targetValues.resistance) / targetValues.resistance;
    
    return Math.max(0, 100 - ((voltageError + currentError + resistanceError) / 3) * 100);
  }, [voltage, current, resistance, targetValues]);

  // Check if experiment is completed
  useEffect(() => {
    const isVoltageCorrect = Math.abs(voltage - targetValues.voltage) <= tolerance;
    const isCurrentCorrect = Math.abs(current - targetValues.current) <= tolerance;
    const isResistanceCorrect = Math.abs(resistance - targetValues.resistance) <= tolerance;

    if (isVoltageCorrect && isCurrentCorrect && isResistanceCorrect && !completed) {
      setCompleted(true);
      onComplete && onComplete({
        experiment: 'Ohm\'s Law',
        voltage: voltage,
        current: current,
        resistance: resistance,
        power: power,
        accuracy: calculateAccuracy()
      });
    }
  }, [voltage, current, resistance, power, targetValues, tolerance, completed, onComplete, calculateAccuracy]);

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetExperiment = () => {
    setVoltage(12);
    setCurrent(3);
    setResistance(4);
    setPower(36);
    setIsAnimating(false);
    setCompleted(false);
    setExperimentHistory([]);
    setCurrentExperiment(1);
    setGraphData([]);
  };

  const addExperiment = () => {
    const newExperiment = {
      id: currentExperiment + 1,
      voltage: voltage,
      current: current,
      resistance: resistance,
      power: power,
      timestamp: new Date().toISOString()
    };
    
    setExperimentHistory(prev => [...prev, newExperiment]);
    setCurrentExperiment(prev => prev + 1);
  };

  const drawCircuit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw circuit components
    circuitComponents.forEach(component => {
      switch (component.type) {
        case 'battery':
          drawBattery(ctx, component);
          break;
        case 'resistor':
          drawResistor(ctx, component);
          break;
        case 'wire':
          drawWire(ctx, component);
          break;
        default:
          // Unknown component type - skip
          break;
      }
    });

    // Draw current flow animation
    if (isAnimating) {
      drawCurrentFlow(ctx);
    }
  }, [circuitComponents, isAnimating]);

  const drawBattery = (ctx, component) => {
    const { x, y, voltage } = component;
    
    // Battery body
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x - 20, y - 15, 40, 30);
    
    // Battery terminals
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(x - 25, y - 10, 5, 20);
    ctx.fillRect(x + 20, y - 10, 5, 20);
    
    // Voltage label
    ctx.fillStyle = '#2d3748';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, x, y - 25);
  };

  const drawResistor = (ctx, component) => {
    const { x, y, resistance } = component;
    
    // Resistor body
    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(x - 30, y - 8, 60, 16);
    
    // Resistor bands
    ctx.fillStyle = '#2d3748';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x - 25 + i * 15, y - 6, 3, 12);
    }
    
    // Resistance label
    ctx.fillStyle = '#2d3748';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${resistance}Ω`, x, y - 20);
  };

  const drawWire = (ctx, component) => {
    const { x, y, length } = component;
    
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  };

  const drawCurrentFlow = (ctx) => {
    // Draw animated current flow
    const animationPhase = Date.now() * 0.005;
    
    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = animationPhase * 20;
    
    ctx.beginPath();
    ctx.moveTo(120, 200);
    ctx.lineTo(280, 200);
    ctx.stroke();
    
    ctx.setLineDash([]);
  };

  useEffect(() => {
    drawCircuit();
  }, [drawCircuit]);

  const experiments = [
    {
      title: "Voltage Control",
      description: "Adjust voltage and observe current changes",
      target: { voltage: 12, current: 3, resistance: 4 },
      mode: 'voltage'
    },
    {
      title: "Current Control", 
      description: "Adjust current and observe voltage changes",
      target: { voltage: 12, current: 3, resistance: 4 },
      mode: 'current'
    },
    {
      title: "Resistance Control",
      description: "Adjust resistance and observe current changes", 
      target: { voltage: 12, current: 3, resistance: 4 },
      mode: 'resistance'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Ohm's Law Laboratory
          </motion.h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the relationship between voltage, current, and resistance in electrical circuits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Circuit Controls
              </h3>

              {/* Experiment Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiment Mode
                </label>
                <select
                  value={experimentMode}
                  onChange={(e) => setExperimentMode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="voltage">Control Voltage</option>
                  <option value="current">Control Current</option>
                  <option value="resistance">Control Resistance</option>
                </select>
              </div>

              {/* Voltage Control */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Battery className="w-4 h-4 mr-1" />
                  Voltage (V)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setVoltage(Math.max(0, voltage - 0.5))}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4 text-red-600" />
                  </button>
                  <input
                    type="number"
                    value={voltage}
                    onChange={(e) => setVoltage(parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-center font-mono"
                    step="0.1"
                    min="0"
                    max="24"
                  />
                  <button
                    onClick={() => setVoltage(Math.min(24, voltage + 0.5))}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>

              {/* Current Control */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Current (A)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrent(Math.max(0, current - 0.1))}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4 text-red-600" />
                  </button>
                  <input
                    type="number"
                    value={current}
                    onChange={(e) => setCurrent(parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-center font-mono"
                    step="0.1"
                    min="0"
                    max="10"
                  />
                  <button
                    onClick={() => setCurrent(Math.min(10, current + 0.1))}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>

              {/* Resistance Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  Resistance (Ω)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setResistance(Math.max(0.1, resistance - 0.1))}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4 text-red-600" />
                  </button>
                  <input
                    type="number"
                    value={resistance}
                    onChange={(e) => setResistance(parseFloat(e.target.value) || 0.1)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-center font-mono"
                    step="0.1"
                    min="0.1"
                    max="100"
                  />
                  <button
                    onClick={() => setResistance(Math.min(100, resistance + 0.1))}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={isAnimating ? stopAnimation : startAnimation}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    isAnimating 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isAnimating ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={resetExperiment}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>

              <button
                onClick={addExperiment}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experiment
              </button>

              {/* Display Options */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showCalculations}
                    onChange={(e) => setShowCalculations(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show Calculations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showCircuit}
                    onChange={(e) => setShowCircuit(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show Circuit</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showGraph}
                    onChange={(e) => setShowGraph(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show Graph</span>
                </label>
              </div>
            </motion.div>

            {/* Measurements Display */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Live Measurements
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Voltage</span>
                  <span className="text-lg font-bold text-blue-900">{voltage.toFixed(2)} V</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Current</span>
                  <span className="text-lg font-bold text-green-900">{current.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-900">Resistance</span>
                  <span className="text-lg font-bold text-red-900">{resistance.toFixed(2)} Ω</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Power</span>
                  <span className="text-lg font-bold text-purple-900">{power.toFixed(2)} W</span>
                </div>
              </div>

              {completed && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Experiment Completed!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Accuracy: {calculateAccuracy().toFixed(1)}%
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Circuit Visualization */}
            {showCircuit && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Circuit Visualization
                </h3>
                
                <div className="relative bg-gray-100 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="border border-gray-300 rounded-lg bg-white"
                  />
                  
                  {/* Circuit Labels */}
                  <div className="absolute top-2 left-2 text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <div className="w-4 h-4 bg-gray-600 mr-2"></div>
                      Battery: {voltage}V
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-4 h-2 bg-red-500 mr-2"></div>
                      Resistor: {resistance}Ω
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-1 bg-blue-500 mr-2"></div>
                      Wire
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ohm's Law Formula and Calculations */}
            {showCalculations && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Ohm's Law Calculations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Formula Display */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Ohm's Law Formula</h4>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-blue-600">V = I × R</div>
                      <div className="text-sm text-gray-600">Voltage = Current × Resistance</div>
                      <div className="text-lg font-semibold text-green-600">P = V × I</div>
                      <div className="text-sm text-gray-600">Power = Voltage × Current</div>
                    </div>
                  </div>

                  {/* Current Calculation */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Current Calculation</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-blue-800">I = V ÷ R</div>
                      <div className="text-sm text-blue-800">I = {voltage}V ÷ {resistance}Ω</div>
                      <div className="text-lg font-bold text-blue-900">I = {current.toFixed(2)}A</div>
                    </div>
                  </div>

                  {/* Power Calculation */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-3">Power Calculation</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-purple-800">P = V × I</div>
                      <div className="text-sm text-purple-800">P = {voltage}V × {current.toFixed(2)}A</div>
                      <div className="text-lg font-bold text-purple-900">P = {power.toFixed(2)}W</div>
                    </div>
                  </div>

                  {/* Resistance Calculation */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-3">Resistance Calculation</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-red-800">R = V ÷ I</div>
                      <div className="text-sm text-red-800">R = {voltage}V ÷ {current.toFixed(2)}A</div>
                      <div className="text-lg font-bold text-red-900">R = {resistance.toFixed(2)}Ω</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Experiment History */}
            {experimentHistory.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Experiment History
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">#</th>
                        <th className="text-left py-2">Voltage (V)</th>
                        <th className="text-left py-2">Current (A)</th>
                        <th className="text-left py-2">Resistance (Ω)</th>
                        <th className="text-left py-2">Power (W)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experimentHistory.map((exp, index) => (
                        <tr key={exp.id} className="border-b border-gray-100">
                          <td className="py-2">{exp.id}</td>
                          <td className="py-2">{exp.voltage.toFixed(2)}</td>
                          <td className="py-2">{exp.current.toFixed(2)}</td>
                          <td className="py-2">{exp.resistance.toFixed(2)}</td>
                          <td className="py-2">{exp.power.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Experiment Instructions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experiments.map((exp, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{exp.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{exp.description}</p>
                <div className="text-xs text-gray-500">
                  Target: V={exp.target.voltage}V, I={exp.target.current}A, R={exp.target.resistance}Ω
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Learning Objectives:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Understand the relationship between voltage, current, and resistance</li>
              <li>• Apply Ohm's Law (V = I × R) in practical circuits</li>
              <li>• Calculate electrical power using P = V × I</li>
              <li>• Observe how changing one parameter affects others</li>
              <li>• Develop intuition about electrical circuit behavior</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OhmsLawLab;
