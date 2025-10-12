import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  CheckCircle, 
  Zap, 
  Plus,
  Trash2,
  Calculator,
  Activity,
  Target,
  Play,
  Eye
} from 'lucide-react';

const CircuitAnalysisLab = ({ onComplete }) => {
  // Circuit state
  const [circuit, setCircuit] = useState({
    components: [],
    connections: [],
    nodes: []
  });
  
  // Analysis state
  const [analysis, setAnalysis] = useState({
    voltages: {},
    currents: {},
    powers: {},
    isSimulating: false,
    simulationResults: null
  });
  
  // UI state
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [completedExperiments, setCompletedExperiments] = useState([]);
  const [score, setScore] = useState(0);
  const [currentExperiment, setCurrentExperiment] = useState('basic');
  
  // Component library
  const componentTypes = {
    resistor: {
      name: 'Resistor',
      symbol: 'R',
      icon: '⚡',
      defaultValue: 100,
      unit: 'Ω',
      color: '#8B4513'
    },
    capacitor: {
      name: 'Capacitor',
      symbol: 'C',
      icon: '⚡',
      defaultValue: 10,
      unit: 'μF',
      color: '#4169E1'
    },
    voltageSource: {
      name: 'Voltage Source',
      symbol: 'V',
      icon: '🔋',
      defaultValue: 12,
      unit: 'V',
      color: '#FF6347'
    },
    currentSource: {
      name: 'Current Source',
      symbol: 'I',
      icon: '⚡',
      defaultValue: 1,
      unit: 'A',
      color: '#32CD32'
    },
    led: {
      name: 'LED',
      symbol: 'LED',
      icon: '💡',
      defaultValue: 2.1,
      unit: 'V',
      color: '#FFD700'
    }
  };

  // Predefined circuit templates
  const circuitTemplates = {
    basic: {
      name: 'Basic Series Circuit',
      description: 'Simple series circuit with resistor and voltage source',
      components: [
        { id: 'v1', type: 'voltageSource', value: 12, position: { x: 100, y: 200 }, connections: ['n1', 'n2'] },
        { id: 'r1', type: 'resistor', value: 100, position: { x: 200, y: 200 }, connections: ['n2', 'n3'] },
        { id: 'r2', type: 'resistor', value: 200, position: { x: 300, y: 200 }, connections: ['n3', 'n1'] }
      ],
      nodes: [
        { id: 'n1', position: { x: 100, y: 180 } },
        { id: 'n2', position: { x: 200, y: 180 } },
        { id: 'n3', position: { x: 300, y: 180 } }
      ]
    },
    parallel: {
      name: 'Parallel Circuit',
      description: 'Parallel resistors with voltage source',
      components: [
        { id: 'v1', type: 'voltageSource', value: 12, position: { x: 100, y: 200 }, connections: ['n1', 'n2'] },
        { id: 'r1', type: 'resistor', value: 100, position: { x: 200, y: 150 }, connections: ['n2', 'n3'] },
        { id: 'r2', type: 'resistor', value: 200, position: { x: 200, y: 250 }, connections: ['n2', 'n3'] }
      ],
      nodes: [
        { id: 'n1', position: { x: 100, y: 180 } },
        { id: 'n2', position: { x: 200, y: 180 } },
        { id: 'n3', position: { x: 300, y: 180 } }
      ]
    },
    rc: {
      name: 'RC Circuit',
      description: 'Resistor-Capacitor circuit for time analysis',
      components: [
        { id: 'v1', type: 'voltageSource', value: 12, position: { x: 100, y: 200 }, connections: ['n1', 'n2'] },
        { id: 'r1', type: 'resistor', value: 1000, position: { x: 200, y: 200 }, connections: ['n2', 'n3'] },
        { id: 'c1', type: 'capacitor', value: 100, position: { x: 300, y: 200 }, connections: ['n3', 'n1'] }
      ],
      nodes: [
        { id: 'n1', position: { x: 100, y: 180 } },
        { id: 'n2', position: { x: 200, y: 180 } },
        { id: 'n3', position: { x: 300, y: 180 } }
      ]
    }
  };

  // Circuit analysis functions
  const calculateCircuitAnalysis = () => {
    const results = {
      voltages: {},
      currents: {},
      powers: {},
      totalResistance: 0,
      totalCurrent: 0,
      totalPower: 0
    };

    // Simple series circuit analysis
    if (currentExperiment === 'basic') {
      const voltageSource = circuit.components.find(c => c.type === 'voltageSource');
      const resistors = circuit.components.filter(c => c.type === 'resistor');
      
      if (voltageSource && resistors.length > 0) {
        // Calculate total resistance (series)
        const totalResistance = resistors.reduce((sum, r) => sum + r.value, 0);
        const totalCurrent = voltageSource.value / totalResistance;
        
        results.totalResistance = totalResistance;
        results.totalCurrent = totalCurrent;
        results.totalPower = voltageSource.value * totalCurrent;
        
        // Calculate individual voltages and powers
        resistors.forEach((resistor, index) => {
          const voltage = resistor.value * totalCurrent;
          const power = voltage * totalCurrent;
          
          results.voltages[resistor.id] = voltage;
          results.currents[resistor.id] = totalCurrent;
          results.powers[resistor.id] = power;
        });
      }
    }
    
    // Parallel circuit analysis
    else if (currentExperiment === 'parallel') {
      const voltageSource = circuit.components.find(c => c.type === 'voltageSource');
      const resistors = circuit.components.filter(c => c.type === 'resistor');
      
      if (voltageSource && resistors.length > 0) {
        // Calculate total resistance (parallel)
        const totalResistance = 1 / resistors.reduce((sum, r) => sum + (1 / r.value), 0);
        const totalCurrent = voltageSource.value / totalResistance;
        
        results.totalResistance = totalResistance;
        results.totalCurrent = totalCurrent;
        results.totalPower = voltageSource.value * totalCurrent;
        
        // Calculate individual currents and powers
        resistors.forEach(resistor => {
          const current = voltageSource.value / resistor.value;
          const power = voltageSource.value * current;
          
          results.voltages[resistor.id] = voltageSource.value;
          results.currents[resistor.id] = current;
          results.powers[resistor.id] = power;
        });
      }
    }
    
    // RC circuit analysis
    else if (currentExperiment === 'rc') {
      const voltageSource = circuit.components.find(c => c.type === 'voltageSource');
      const resistor = circuit.components.find(c => c.type === 'resistor');
      const capacitor = circuit.components.find(c => c.type === 'capacitor');
      
      if (voltageSource && resistor && capacitor) {
        const resistance = resistor.value;
        const capacitance = capacitor.value * 1e-6; // Convert μF to F
        const timeConstant = resistance * capacitance;
        
        results.totalResistance = resistance;
        results.totalCurrent = voltageSource.value / resistance;
        results.totalPower = voltageSource.value * results.totalCurrent;
        
        results.voltages[resistor.id] = voltageSource.value;
        results.currents[resistor.id] = results.totalCurrent;
        results.powers[resistor.id] = results.totalPower;
        
        results.voltages[capacitor.id] = 0; // Initially discharged
        results.currents[capacitor.id] = results.totalCurrent;
        results.powers[capacitor.id] = 0;
        
        results.timeConstant = timeConstant;
      }
    }

    return results;
  };

  // Load circuit template
  const loadCircuitTemplate = (templateKey) => {
    const template = circuitTemplates[templateKey];
    if (template) {
      setCircuit({
        components: template.components,
        connections: [],
        nodes: template.nodes
      });
      setCurrentExperiment(templateKey);
      setShowResults(false);
    }
  };

  // Add component to circuit
  const addComponent = (type) => {
    const newComponent = {
      id: `${type}_${Date.now()}`,
      type: type,
      value: componentTypes[type].defaultValue,
      position: { x: 150 + Math.random() * 200, y: 150 + Math.random() * 100 },
      connections: []
    };
    
    setCircuit(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  // Update component value
  const updateComponentValue = (componentId, newValue) => {
    setCircuit(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId ? { ...comp, value: newValue } : comp
      )
    }));
  };

  // Remove component
  const removeComponent = (componentId) => {
    setCircuit(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== componentId)
    }));
  };

  // Run circuit simulation
  const runSimulation = () => {
    setAnalysis(prev => ({ ...prev, isSimulating: true }));
    
    setTimeout(() => {
      const results = calculateCircuitAnalysis();
      setAnalysis(prev => ({
        ...prev,
        isSimulating: false,
        simulationResults: results,
        voltages: results.voltages,
        currents: results.currents,
        powers: results.powers
      }));
      setShowResults(true);
      
      // Check if experiment is completed
      checkExperimentCompletion(results);
    }, 1500);
  };

  // Check experiment completion
  const checkExperimentCompletion = (results) => {
    let completed = false;
    
    if (currentExperiment === 'basic' && results.totalResistance > 0) {
      completed = true;
    } else if (currentExperiment === 'parallel' && results.totalResistance > 0) {
      completed = true;
    } else if (currentExperiment === 'rc' && results.timeConstant > 0) {
      completed = true;
    }
    
    if (completed && !completedExperiments.includes(currentExperiment)) {
      setCompletedExperiments(prev => [...prev, currentExperiment]);
      setScore(prev => prev + 25);
      
      if (completedExperiments.length + 1 === Object.keys(circuitTemplates).length) {
        setScore(prev => prev + 25); // Bonus for completing all
        setTimeout(() => {
          onComplete && onComplete({
            score: score + 50,
            experimentsCompleted: completedExperiments.length + 1,
            totalExperiments: Object.keys(circuitTemplates).length,
            labData: {
              circuitsAnalyzed: completedExperiments.length + 1,
              totalComponents: circuit.components.length,
              analysisResults: results
            }
          });
        }, 1000);
      }
    }
  };

  // Reset circuit
  const resetCircuit = () => {
    setCircuit({ components: [], connections: [], nodes: [] });
    setAnalysis({ voltages: {}, currents: {}, powers: {}, isSimulating: false, simulationResults: null });
    setShowResults(false);
    setSelectedComponent(null);
  };

  // Component value input
  const ComponentValueInput = ({ component }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(component.value);

    const handleSave = () => {
      updateComponentValue(component.id, tempValue);
      setIsEditing(false);
    };

    return (
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(parseFloat(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-sm border rounded"
              min="0"
              step="0.1"
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              ✓
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
          >
            {component.value} {componentTypes[component.type].unit}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Activity className="mr-3 text-blue-600" />
                Circuit Analysis Lab
              </h1>
              <p className="text-gray-600 mt-2">
                Build and analyze electrical circuits with interactive components
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {completedExperiments.length}/{Object.keys(circuitTemplates).length}
                </div>
                <div className="text-sm text-gray-500">Experiments</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Circuit Templates */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Target className="mr-2 text-blue-600" />
                Circuit Templates
              </h3>
              <div className="space-y-2">
                {Object.entries(circuitTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => loadCircuitTemplate(key)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      currentExperiment === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Component Library */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Plus className="mr-2 text-green-600" />
                Add Components
              </h3>
              <div className="space-y-2">
                {Object.entries(componentTypes).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => addComponent(type)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{config.icon}</span>
                      <span className="font-medium">{config.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{config.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Controls */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Calculator className="mr-2 text-purple-600" />
                Analysis
              </h3>
              <div className="space-y-3">
                <button
                  onClick={runSimulation}
                  disabled={analysis.isSimulating || circuit.components.length === 0}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {analysis.isSimulating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2" />
                      Run Analysis
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetCircuit}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  <RotateCcw className="mr-2" />
                  Reset Circuit
                </button>
              </div>
            </div>
          </div>

          {/* Circuit Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Zap className="mr-2 text-yellow-600" />
                  Circuit Canvas
                </h3>
                <div className="text-sm text-gray-500">
                  {circuit.components.length} components
                </div>
              </div>
              
              <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 h-96 overflow-hidden">
                {circuit.components.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Zap className="mx-auto h-12 w-12 mb-4" />
                      <p className="text-lg font-medium">No components added</p>
                      <p className="text-sm">Add components from the panel to start building</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {circuit.components.map((component) => (
                      <motion.div
                        key={component.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute cursor-pointer p-3 rounded-lg border-2 transition-all ${
                          selectedComponent?.id === component.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        style={{
                          left: component.position.x,
                          top: component.position.y,
                          backgroundColor: componentTypes[component.type].color + '20'
                        }}
                        onClick={() => setSelectedComponent(component)}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {componentTypes[component.type].symbol}
                          </div>
                          <div className="text-xs text-gray-600">
                            {component.value} {componentTypes[component.type].unit}
                          </div>
                        </div>
                        
                        {selectedComponent?.id === component.id && (
                          <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            {componentTypes[component.type].name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeComponent(component.id);
                                setSelectedComponent(null);
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 h-full">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Eye className="mr-2 text-green-600" />
                Analysis Results
              </h3>
              
              {!showResults ? (
                <div className="text-center text-gray-500 py-8">
                  <Calculator className="mx-auto h-12 w-12 mb-4" />
                  <p>Run analysis to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysis.simulationResults && (
                    <>
                      {/* Overall Results */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-medium text-blue-800 mb-2">Circuit Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Resistance:</span>
                            <span className="font-medium">{analysis.simulationResults.totalResistance.toFixed(2)} Ω</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Current:</span>
                            <span className="font-medium">{analysis.simulationResults.totalCurrent.toFixed(3)} A</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Power:</span>
                            <span className="font-medium">{analysis.simulationResults.totalPower.toFixed(2)} W</span>
                          </div>
                          {analysis.simulationResults.timeConstant && (
                            <div className="flex justify-between">
                              <span>Time Constant:</span>
                              <span className="font-medium">{analysis.simulationResults.timeConstant.toFixed(6)} s</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Component Results */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Component Analysis</h4>
                        {circuit.components.map((component) => (
                          <div key={component.id} className="bg-gray-50 rounded-lg p-2">
                            <div className="font-medium text-sm">
                              {componentTypes[component.type].symbol} ({component.value} {componentTypes[component.type].unit})
                            </div>
                            <div className="text-xs space-y-1 mt-1">
                              {analysis.simulationResults.voltages[component.id] !== undefined && (
                                <div className="flex justify-between">
                                  <span>Voltage:</span>
                                  <span>{analysis.simulationResults.voltages[component.id].toFixed(3)} V</span>
                                </div>
                              )}
                              {analysis.simulationResults.currents[component.id] !== undefined && (
                                <div className="flex justify-between">
                                  <span>Current:</span>
                                  <span>{analysis.simulationResults.currents[component.id].toFixed(3)} A</span>
                                </div>
                              )}
                              {analysis.simulationResults.powers[component.id] !== undefined && (
                                <div className="flex justify-between">
                                  <span>Power:</span>
                                  <span>{analysis.simulationResults.powers[component.id].toFixed(3)} W</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Component Details Panel */}
        {selectedComponent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-6 right-6 bg-white rounded-xl shadow-lg p-4 border-t-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{componentTypes[selectedComponent.type].icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {componentTypes[selectedComponent.type].name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {componentTypes[selectedComponent.type].symbol} Component
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ComponentValueInput component={selectedComponent} />
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Indicators */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Experiment Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(circuitTemplates).map(([key, template]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border-2 transition-all ${
                  completedExperiments.includes(key)
                    ? 'border-green-500 bg-green-50'
                    : currentExperiment === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </div>
                  {completedExperiments.includes(key) && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitAnalysisLab;

