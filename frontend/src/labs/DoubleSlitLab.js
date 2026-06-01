import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Target,
  Info,
  BookOpen,
  Clipboard,
  Download,
  Waves,
  Save,
  RefreshCw
} from 'lucide-react';

const DoubleSlitLab = ({ onComplete }) => {
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef(null);

  // PhET Wave Interference simulation URL - Opens directly to Slits screen
  const PHET_URL = 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_all.html?screens=3';

  // Structured state for lab report data
  const [reportData, setReportData] = useState({
    configurations: [
      { id: 1, wavelength: '', separation: '', pattern: '', fringe: '' },
      { id: 2, wavelength: '', separation: '', pattern: '', fringe: '' },
      { id: 3, wavelength: '', separation: '', pattern: '', fringe: '' },
      { id: 4, wavelength: '', separation: '', pattern: '', fringe: '' },
      { id: 5, wavelength: '', separation: '', pattern: '', fringe: '' }
    ],
    observations: {
      q1: '',
      q2: '',
      q3: '',
      q4: ''
    },
    calculations: '',
    analysis: {
      q1: '',
      q2: '',
      q3: ''
    },
    conclusion: ''
  });

  // Handle input changes
  const handleConfigChange = (index, field, value) => {
    const newConfigs = [...reportData.configurations];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setReportData({ ...reportData, configurations: newConfigs });
  };

  const handleTextChange = (section, field, value) => {
    if (section === 'conclusion' || section === 'calculations') {
      setReportData({ ...reportData, [section]: value });
    } else {
      setReportData({
        ...reportData,
        [section]: { ...reportData[section], [field]: value }
      });
    }
  };

  // Generate the text report from structured data
  const generateReport = useCallback(() => {
    const configText = reportData.configurations.map(config => `
Configuration ${config.id}:
  - Wavelength: ${config.wavelength || '_______'} nm
  - Slit Separation: ${config.separation || '_______'} μm
  - Pattern Observed: ${config.pattern || '_______________________'}
  - Fringe Spacing: ${config.fringe || '_______'} (estimate)
`).join('');

    return `Double Slit Experiment Lab Report
===================================

Objective:
----------
To investigate wave interference patterns and observe the double slit phenomenon using the PhET Wave Interference simulation.

Materials:
----------
- PhET Wave Interference Interactive Simulation
- Virtual light source
- Virtual double slit barrier
- Virtual detection screen

Procedure:
----------
1. Select the "Slits" screen in the simulation
2. Choose "Light" as the wave source
3. Adjust the wavelength using the slider
4. Observe the interference pattern on the screen
5. Modify slit width and separation
6. Record observations for different configurations
7. Analyze the pattern changes

Data Collection:
---------------
Record your measurements below:
${configText}

Observations:
-------------
1. What happens to the interference pattern when you increase the wavelength?
   ${reportData.observations.q1 || '[Answer here]'}

2. How does changing the slit separation affect the fringe spacing?
   ${reportData.observations.q2 || '[Answer here]'}

3. What effect does slit width have on the pattern?
   ${reportData.observations.q3 || '[Answer here]'}

4. Describe the difference between constructive and destructive interference:
   ${reportData.observations.q4 || '[Answer here]'}


Calculations:
------------
Using the formula: Δy = λD/d
Where:
- Δy = fringe spacing
- λ = wavelength
- D = screen distance
- d = slit separation

${reportData.calculations || '[Show your calculations here]'}

Analysis:
---------
1. Relationship between wavelength and fringe spacing:
   ${reportData.analysis.q1 || '[Answer here]'}

2. Relationship between slit separation and fringe spacing:
   ${reportData.analysis.q2 || '[Answer here]'}

3. How does this demonstrate wave nature of light?
   ${reportData.analysis.q3 || '[Answer here]'}


Conclusions:
-----------
${reportData.conclusion || '[Summarize what you learned about wave interference and the double slit experiment]'}

Key Concepts:
- Constructive interference occurs when path difference = nλ (n = 0, 1, 2, ...)
- Destructive interference occurs when path difference = (n + 1/2)λ
- The double slit experiment demonstrates wave-particle duality

Verification:
-------------
The interference pattern observed confirms the wave nature of light.
The relationship between wavelength, slit separation, and fringe spacing follows the equation Δy = λD/d.
`;
  }, [reportData]);

  const handleComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);

      if (onComplete) {
        onComplete({
          experiment: "Double Slit Experiment",
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
    element.download = 'double-slit-lab-report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Double Slit Experiment
          </motion.h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Interactive Wave Simulation - Explore wave interference and diffraction patterns
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
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    How to Use
                  </h4>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li>• Select <strong>"Light"</strong> wave type</li>
                    <li>• Use the wavelength slider to change light color</li>
                    <li>• Adjust slit width and separation</li>
                    <li>• Click the laser to turn it on/off</li>
                    <li>• Observe the interference pattern</li>
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
                Interactive Laboratory
              </h3>
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  ref={iframeRef}
                  src={PHET_URL}
                  title="Wave Interference PhET Simulation"
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Config</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wavelength (nm)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Separation (μm)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pattern</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fringe Spacing</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.configurations.map((config, index) => (
                            <tr key={config.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {config.id}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={config.wavelength}
                                  onChange={(e) => handleConfigChange(index, 'wavelength', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={config.separation}
                                  onChange={(e) => handleConfigChange(index, 'separation', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={config.pattern}
                                  onChange={(e) => handleConfigChange(index, 'pattern', e.target.value)}
                                  className="w-32 p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                                  placeholder="Describe..."
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={config.fringe}
                                  onChange={(e) => handleConfigChange(index, 'fringe', e.target.value)}
                                  className="w-32 p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                                  placeholder="Estimate"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Observations */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">2. Observations</h4>
                    <div className="space-y-4">
                      {['What happens to the interference pattern when you increase the wavelength?',
                        'How does changing the slit separation affect the fringe spacing?',
                        'What effect does slit width have on the pattern?',
                        'Describe the difference between constructive and destructive interference:'].map((q, i) => (
                          <div key={i}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {i + 1}. {q}
                            </label>
                            <textarea
                              value={reportData.observations[`q${i + 1}`]}
                              onChange={(e) => handleTextChange('observations', `q${i + 1}`, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                              rows={2}
                              placeholder="Answer here..."
                            />
                          </div>
                        ))}
                    </div>
                  </section>

                  {/* Calculations */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">3. Calculations</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Show calculations using Δy = λD/d:
                      </label>
                      <textarea
                        value={reportData.calculations}
                        onChange={(e) => handleTextChange('calculations', '', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm font-mono"
                        rows={5}
                        placeholder="Show your work..."
                      />
                    </div>
                  </section>

                  {/* Analysis */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">4. Analysis</h4>
                    <div className="space-y-4">
                      {['Relationship between wavelength and fringe spacing:',
                        'Relationship between slit separation and fringe spacing:',
                        'How does this demonstrate wave nature of light?'].map((q, i) => (
                          <div key={i}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {i + 1}. {q}
                            </label>
                            <textarea
                              value={reportData.analysis[`q${i + 1}`]}
                              onChange={(e) => handleTextChange('analysis', `q${i + 1}`, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                              rows={2}
                              placeholder="Analysis here..."
                            />
                          </div>
                        ))}
                    </div>
                  </section>

                  {/* Conclusion */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">5. Conclusions</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Summarize what you learned about wave interference:
                      </label>
                      <textarea
                        value={reportData.conclusion}
                        onChange={(e) => handleTextChange('conclusion', '', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
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

export default DoubleSlitLab;
