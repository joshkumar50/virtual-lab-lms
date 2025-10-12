import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle, Lightbulb, Droplets, Beaker, TestTube } from 'lucide-react';

const ChemistryLab = ({ onComplete }) => {
  const [ph, setPh] = useState(7.0);
  const [volume, setVolume] = useState(0);
  const [isAnimating, setAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentExperiment, setCurrentExperiment] = useState('ph_test');
  const [score, setScore] = useState(0);
  const [experimentsCompleted, setExperimentsCompleted] = useState([]);
  const [solutionType, setSolutionType] = useState('water'); // water, acid, base
  const [indicator, setIndicator] = useState('universal'); // universal, phenolphthalein, bromothymol

  // pH color mapping
  const getPHColor = (phValue) => {
    if (phValue < 3) return '#8B0000'; // Dark red
    if (phValue < 4) return '#FF0000'; // Red
    if (phValue < 5) return '#FF4500'; // Orange red
    if (phValue < 6) return '#FFA500'; // Orange
    if (phValue < 7) return '#FFFF00'; // Yellow
    if (phValue === 7) return '#00FF00'; // Green (neutral)
    if (phValue < 8) return '#00FFFF'; // Cyan
    if (phValue < 9) return '#0000FF'; // Blue
    if (phValue < 10) return '#800080'; // Purple
    if (phValue < 11) return '#FF00FF'; // Magenta
    return '#8B008B'; // Dark magenta
  };

  // Get pH description
  const getPHDescription = (phValue) => {
    if (phValue < 3) return 'Very Strong Acid';
    if (phValue < 4) return 'Strong Acid';
    if (phValue < 5) return 'Moderate Acid';
    if (phValue < 6) return 'Weak Acid';
    if (phValue < 7) return 'Slightly Acidic';
    if (phValue === 7) return 'Neutral';
    if (phValue < 8) return 'Slightly Basic';
    if (phValue < 9) return 'Weak Base';
    if (phValue < 10) return 'Moderate Base';
    if (phValue < 11) return 'Strong Base';
    return 'Very Strong Base';
  };

  // Add acid/base drops
  const addDrop = (type) => {
    setAnimating(true);
    setVolume(prev => prev + 1);
    
    if (type === 'acid') {
      setPh(prev => Math.max(0, prev - 0.5));
      setSolutionType('acid');
    } else {
      setPh(prev => Math.min(14, prev + 0.5));
      setSolutionType('base');
    }

    setTimeout(() => setAnimating(false), 500);
  };

  const resetLab = () => {
    setPh(7.0);
    setVolume(0);
    setCompleted(false);
    setScore(0);
    setExperimentsCompleted([]);
    setSolutionType('water');
    setCurrentExperiment('ph_test');
  };

  const handleExperimentClick = (experiment) => {
    setCurrentExperiment(experiment);
    if (!experimentsCompleted.includes(experiment)) {
      setExperimentsCompleted(prev => [...prev, experiment]);
      setScore(prev => prev + 25);
    }
  };

  const handleComplete = () => {
    setCompleted(true);
    onComplete({
      score: 100,
      timeSpent: '20 minutes',
      experimentsCompleted: ['pH Testing', 'Acid-Base Titration', 'Color Analysis'],
      dataPoints: 8
    });
  };

  const ExperimentButton = ({ experiment, label, description, icon: Icon }) => (
    <motion.button
      onClick={() => handleExperimentClick(experiment)}
      className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
        currentExperiment === experiment
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">{label}</h3>
        </div>
        {experimentsCompleted.includes(experiment) && (
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
    </motion.button>
  );

  return (
    <div className="lab-container p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TestTube className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chemistry pH Lab
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Explore pH levels, acid-base reactions, and color changes in chemistry
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-green-600">{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full"
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
                <li>Select an experiment from the options below</li>
                <li>Add acid or base drops to change the pH</li>
                <li>Observe the color changes in the solution</li>
                <li>Record your observations and complete all experiments</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Experiment Selector */}
        <div className="lab-card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Experiment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExperimentButton
              experiment="ph_test"
              label="pH Testing"
              description="Test different pH levels and observe color changes"
              icon={Droplets}
            />
            <ExperimentButton
              experiment="acid_base"
              label="Acid-Base Titration"
              description="Perform titration and find equivalence point"
              icon={Beaker}
            />
            <ExperimentButton
              experiment="color_analysis"
              label="Color Analysis"
              description="Analyze color changes with different indicators"
              icon={TestTube}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="lab-card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Laboratory Controls</h2>
            
            {/* Solution Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Solution Type</label>
              <div className="flex space-x-2">
                {['water', 'acid', 'base'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSolutionType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      solutionType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Drops */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Drops</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => addDrop('acid')}
                  className="btn btn-danger flex-1"
                  disabled={isAnimating}
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Add Acid Drop
                </button>
                <button
                  onClick={() => addDrop('base')}
                  className="btn btn-primary flex-1"
                  disabled={isAnimating}
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Add Base Drop
                </button>
              </div>
            </div>

            {/* Indicator Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Indicator</label>
              <select
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                className="input"
              >
                <option value="universal">Universal Indicator</option>
                <option value="phenolphthalein">Phenolphthalein</option>
                <option value="bromothymol">Bromothymol Blue</option>
              </select>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <button
                onClick={resetLab}
                className="btn btn-secondary w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Lab
              </button>
              
              {!completed && (
                <button
                  onClick={handleComplete}
                  className="btn btn-success w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Lab
                </button>
              )}
              
              {completed && (
                <div className="flex items-center justify-center space-x-2 text-success-600 p-4 bg-success-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Lab Completed!</span>
                </div>
              )}
            </div>
          </div>

          {/* Visualization */}
          <div className="lab-card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Laboratory Visualization</h2>
            
            <div className="relative">
              {/* Beaker */}
              <div className="relative mx-auto w-64 h-80">
                {/* Beaker Shape */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 rounded-b-3xl border-4 border-gray-300 shadow-lg">
                  {/* Solution */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-b-3xl"
                    style={{
                      height: '60%',
                      backgroundColor: getPHColor(ph)
                    }}
                    animate={{
                      backgroundColor: getPHColor(ph)
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Solution Animation */}
                    <motion.div
                      className="absolute inset-0 rounded-b-3xl opacity-30"
                      animate={{
                        background: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {/* Drop Animation */}
                  {isAnimating && (
                    <motion.div
                      className="absolute top-4 left-1/2 w-2 h-2 bg-blue-500 rounded-full"
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: 200, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
                
                {/* pH Scale */}
                <div className="absolute -right-16 top-0 w-12 h-full bg-gradient-to-b from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-lg border-2 border-gray-300">
                  <div className="absolute inset-0 flex flex-col justify-between text-xs font-bold text-white">
                    <span className="bg-black bg-opacity-50 px-1 rounded">14</span>
                    <span className="bg-black bg-opacity-50 px-1 rounded">7</span>
                    <span className="bg-black bg-opacity-50 px-1 rounded">0</span>
                  </div>
                </div>
              </div>

              {/* Data Display */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Current pH</div>
                  <div className="text-2xl font-bold" style={{ color: getPHColor(ph) }}>
                    {ph.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">{getPHDescription(ph)}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Volume Added</div>
                  <div className="text-2xl font-bold text-gray-900">{volume}</div>
                  <div className="text-xs text-gray-500">drops</div>
                </div>
              </div>

              {/* Color Chart */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">pH Color Chart</h3>
                <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
                  {Array.from({ length: 15 }, (_, i) => {
                    const phValue = i;
                    return (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: getPHColor(phValue) }}
                        title={`pH ${phValue}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>7</span>
                  <span>14</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemistryLab;
