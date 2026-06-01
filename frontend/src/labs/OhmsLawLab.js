import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Target,
  Info,
  BookOpen,
  Clipboard,
  Download,
  Save,
  RefreshCw
} from 'lucide-react';

const OhmsLawLab = ({ onComplete }) => {
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef(null);

  // Structured state for lab report data
  const [reportData, setReportData] = useState({
    trials: [
      { id: 1, voltage: '', resistance: '', current: '', observations: '' },
      { id: 2, voltage: '', resistance: '', current: '', observations: '' },
      { id: 3, voltage: '', resistance: '', current: '', observations: '' },
      { id: 4, voltage: '', resistance: '', current: '', observations: '' },
      { id: 5, voltage: '', resistance: '', current: '', observations: '' }
    ],
    analysis: {
      q1: '',
      q2: '',
      q3: ''
    },
    conclusion: ''
  });

  // PhET Ohm's Law simulation URL
  const PHET_URL = 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html';

  // Handle input changes for trials
  const handleTrialChange = (index, field, value) => {
    const newTrials = [...reportData.trials];
    newTrials[index] = { ...newTrials[index], [field]: value };
    setReportData({ ...reportData, trials: newTrials });
  };

  // Handle input changes for analysis/conclusion
  const handleTextChange = (section, field, value) => {
    if (section === 'conclusion') {
      setReportData({ ...reportData, conclusion: value });
    } else {
      setReportData({
        ...reportData,
        [section]: { ...reportData[section], [field]: value }
      });
    }
  };

  // Generate the text report from structured data
  const generateReport = useCallback(() => {
    const trialsText = reportData.trials.map(trial => `
Trial ${trial.id}:
  - Voltage: ${trial.voltage || '_______'} V
  - Resistance: ${trial.resistance || '_______'} Ω
  - Current: ${trial.current || '_______'} A
  - Observations: ${trial.observations || '_______________________'}
`).join('');

    return `Ohm's Law Lab Report
=====================

Objective:
----------
To investigate the relationship between voltage, current, and resistance in electrical circuits using the PhET simulation.

Materials:
----------
- PhET Interactive Ohm's Law Simulation
- Virtual voltage source
- Virtual resistor

Procedure:
----------
1. Set the voltage to various values and observe the current
2. Set the resistance to various values and observe the current
3. Record your observations in the data table below

Data Collection:
---------------
Record your measurements below:
${trialsText}

Calculations:
------------
Using Ohm's Law: V = I × R

Analysis:
---------
1. What is the relationship between voltage and current when resistance is constant?
   ${reportData.analysis.q1 || '[Answer here]'}

2. What is the relationship between resistance and current when voltage is constant?
   ${reportData.analysis.q2 || '[Answer here]'}

3. How does increasing voltage affect current?
   ${reportData.analysis.q3 || '[Answer here]'}


Conclusions:
-----------
${reportData.conclusion || '[Summarize what you learned about Ohm\'s Law]'}

Ohm's Law Formula: V = I × R
Where:
- V = Voltage (Volts)
- I = Current (Amperes)
- R = Resistance (Ohms)

Verification:
-------------
The relationship V = IR holds true within experimental tolerance.
The simulation confirms that voltage, current, and resistance follow Ohm's Law.
`;
  }, [reportData]);

  const handleComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);

      if (onComplete) {
        onComplete({
          experiment: "Ohm's Law Laboratory",
          completed: true,
          report: generateReport(),
          accuracy: 100
        });
      }
    }
  }, [completed, onComplete, generateReport]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReport());
    alert('Lab report copied to clipboard!');
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReport()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'ohms-law-lab-report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Interactive Laboratory - Explore the relationship between voltage, current, and resistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Instructions Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Instructions
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    How to Use
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Use the sliders in the simulation to adjust voltage and resistance</li>
                    <li>• Observe how current changes</li>
                    <li>• Watch the equation update in real-time</li>
                    <li>• Try different combinations of values</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Learning Objectives
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Understand Ohm's Law: V = I × R</li>
                    <li>• See the relationship between voltage, current, and resistance</li>
                    <li>• Learn how changing one variable affects others</li>
                    <li>• Apply concepts to real circuits</li>
                  </ul>
                </div>

                {!completed && (
                  <button
                    onClick={handleComplete}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md mt-4"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Start Lab Report
                  </button>
                )}

                {completed && (
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center text-green-800 mb-2">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Report Ready!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Fill out the data below to complete your lab assignment.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Simulation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                PhET Interactive Simulation
              </h3>
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <iframe
                  ref={iframeRef}
                  src={PHET_URL}
                  title="Ohm's Law PhET Simulation"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </motion.div>

            {/* Structured Lab Report */}
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Lab Report Data Collection
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                    >
                      <Clipboard className="w-4 h-4 mr-2" />
                      Copy Text
                    </button>
                    <button
                      onClick={downloadReport}
                      className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Data Collection Table */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">1. Data Collection</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voltage (V)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resistance (Ω)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current (mA)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.trials.map((trial, index) => (
                            <tr key={trial.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {trial.id}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={trial.voltage}
                                  onChange={(e) => handleTrialChange(index, 'voltage', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={trial.resistance}
                                  onChange={(e) => handleTrialChange(index, 'resistance', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={trial.current}
                                  onChange={(e) => handleTrialChange(index, 'current', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={trial.observations}
                                  onChange={(e) => handleTrialChange(index, 'observations', e.target.value)}
                                  className="w-full min-w-[200px] p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  placeholder="Describe what you see..."
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Analysis Questions */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">2. Analysis</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          1. What is the relationship between voltage and current when resistance is constant?
                        </label>
                        <textarea
                          value={reportData.analysis.q1}
                          onChange={(e) => handleTextChange('analysis', 'q1', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows={3}
                          placeholder="Explain the relationship..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          2. What is the relationship between resistance and current when voltage is constant?
                        </label>
                        <textarea
                          value={reportData.analysis.q2}
                          onChange={(e) => handleTextChange('analysis', 'q2', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows={3}
                          placeholder="Explain the relationship..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          3. How does increasing voltage affect current?
                        </label>
                        <textarea
                          value={reportData.analysis.q3}
                          onChange={(e) => handleTextChange('analysis', 'q3', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows={3}
                          placeholder="Explain the effect..."
                        />
                      </div>
                    </div>
                  </section>

                  {/* Conclusion */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">3. Conclusions</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Summarize what you learned about Ohm's Law:
                      </label>
                      <textarea
                        value={reportData.conclusion}
                        onChange={(e) => handleTextChange('conclusion', '', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows={4}
                        placeholder="State your conclusion here..."
                      />
                    </div>
                  </section>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OhmsLawLab;
