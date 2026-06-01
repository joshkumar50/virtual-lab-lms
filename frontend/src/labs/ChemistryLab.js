import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Target,
  Info,
  BookOpen,
  Clipboard,
  Download,
  Beaker,
  Save,
  RefreshCw
} from 'lucide-react';

const ChemistryLab = ({ onComplete }) => {
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef(null);

  // PhET pH Scale simulation URL - Opens directly to Macro view only
  const PHET_URL = 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html?screens=1';

  // Structured state for lab report data
  const [reportData, setReportData] = useState({
    trials: [
      { id: 1, solution: '', ph: '', hConc: '', ohConc: '', color: '', type: '' },
      { id: 2, solution: '', ph: '', hConc: '', ohConc: '', color: '', type: '' },
      { id: 3, solution: '', ph: '', hConc: '', ohConc: '', color: '', type: '' },
      { id: 4, solution: '', ph: '', hConc: '', ohConc: '', color: '', type: '' },
      { id: 5, solution: '', ph: '', hConc: '', ohConc: '', color: '', type: '' }
    ],
    observations: {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      q5: ''
    },
    calculations: '',
    analysis: {
      q1: '',
      q2: '',
      q3: '',
      q4: ''
    },
    conclusion: ''
  });

  // Handle input changes for trials
  const handleTrialChange = (index, field, value) => {
    const newTrials = [...reportData.trials];
    newTrials[index] = { ...newTrials[index], [field]: value };
    setReportData({ ...reportData, trials: newTrials });
  };

  // Handle input changes for other sections
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
    const trialsText = reportData.trials.map(trial => `
Trial ${trial.id}:
  - Solution: ${trial.solution || '_______________________'}
  - Initial pH: ${trial.ph || '_______'}
  - H+ Concentration: ${trial.hConc || '_______'} M
  - OH- Concentration: ${trial.ohConc || '_______'} M
  - pH Paper Color: ${trial.color || '_______________________'}
  - Classification: ${trial.type || '_______ (Acid/Base/Neutral)'}
`).join('');

    return `Chemistry pH Lab Report
=======================

Objective:
----------
To investigate pH scales, acid-base properties, and chemical indicators using the PhET pH Scale simulation.

Materials:
----------
- PhET pH Scale Interactive Simulation
- Various virtual solutions (acids, bases, neutral)
- Virtual pH meter and pH paper
- Water

Procedure:
----------
1. Select different solutions from the dropdown menu
2. Use the pH meter to measure the pH value
3. Observe the color of the pH paper indicator
4. Test both acidic and basic solutions
5. Dilute solutions with water and observe pH changes
6. Record all measurements and observations

Data Collection:
---------------
Record your measurements below:
${trialsText}

Observations:
-------------
1. How does pH relate to acidity and basicity?
   ${reportData.observations.q1 || '[Answer here]'}

2. What happens to the color of pH paper at different pH levels?
   ${reportData.observations.q2 || '[Answer here]'}

3. Describe the relationship between pH and H+ concentration:
   ${reportData.observations.q3 || '[Answer here]'}

4. What effect does dilution have on the pH of acidic solutions?
   ${reportData.observations.q4 || '[Answer here]'}

5. What effect does dilution have on the pH of basic solutions?
   ${reportData.observations.q5 || '[Answer here]'}


Calculations:
------------
Using the formulas:
- pH = -log[H+]
- pOH = -log[OH-]
- pH + pOH = 14

${reportData.calculations || '[Show your calculations here for at least 2 different solutions]'}

Analysis:
---------
1. Relationship between pH and hydrogen ion concentration:
   ${reportData.analysis.q1 || '[Answer here]'}

2. Comparison of different acids at same concentration:
   ${reportData.analysis.q2 || '[Answer here]'}

3. Comparison of different bases at same concentration:
   ${reportData.analysis.q3 || '[Answer here]'}

4. Effect of dilution on both acids and bases:
   ${reportData.analysis.q4 || '[Answer here]'}


Conclusions:
-----------
${reportData.conclusion || '[Summarize what you learned about pH, acids, bases, and indicators]'}

Key Concepts:
- pH scale ranges from 0 to 14
- pH < 7 indicates acidic solutions
- pH = 7 indicates neutral solutions
- pH > 7 indicates basic solutions
- Lower pH means higher H+ concentration
- pH = -log[H+]

Verification:
-------------
The pH measurements observed confirm the relationship between acidity, basicity, and pH values.
The color changes in pH paper correlate with the measured pH values.
`;
  }, [reportData]);

  const handleComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);

      if (onComplete) {
        onComplete({
          experiment: "Chemistry pH Laboratory",
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
    element.download = 'chemistry-ph-lab-report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Chemistry pH Lab
          </motion.h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Interactive Laboratory - Explore acids, bases, and pH measurement
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
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    How to Use
                  </h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>• Select solutions from the dropdown menu</li>
                    <li>• Use the pH meter to measure pH values</li>
                    <li>• Observe pH paper color changes</li>
                    <li>• Add water to dilute solutions</li>
                    <li>• Check H+ and OH- concentrations</li>
                    <li>• Record all measurements for your report</li>
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
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '550px' }}>
                <iframe
                  ref={iframeRef}
                  src={PHET_URL}
                  title="pH Scale PhET Simulation"
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
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solution</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">H+ (M)</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OH- (M)</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.trials.map((trial, index) => (
                            <tr key={trial.id}>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={trial.solution}
                                  onChange={(e) => handleTrialChange(index, 'solution', e.target.value)}
                                  className="w-32 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                  placeholder="Solution Name"
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={trial.ph}
                                  onChange={(e) => handleTrialChange(index, 'ph', e.target.value)}
                                  className="w-16 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={trial.hConc}
                                  onChange={(e) => handleTrialChange(index, 'hConc', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                  placeholder="1.0e-7"
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={trial.ohConc}
                                  onChange={(e) => handleTrialChange(index, 'ohConc', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                  placeholder="1.0e-7"
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={trial.color}
                                  onChange={(e) => handleTrialChange(index, 'color', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                  placeholder="Color"
                                />
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <select
                                  value={trial.type}
                                  onChange={(e) => handleTrialChange(index, 'type', e.target.value)}
                                  className="w-24 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                >
                                  <option value="">Select...</option>
                                  <option value="Acid">Acid</option>
                                  <option value="Base">Base</option>
                                  <option value="Neutral">Neutral</option>
                                </select>
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
                      {['How does pH relate to acidity and basicity?',
                        'What happens to the color of pH paper at different pH levels?',
                        'Describe the relationship between pH and H+ concentration:',
                        'What effect does dilution have on the pH of acidic solutions?',
                        'What effect does dilution have on the pH of basic solutions?'].map((q, i) => (
                          <div key={i}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {i + 1}. {q}
                            </label>
                            <textarea
                              value={reportData.observations[`q${i + 1}`]}
                              onChange={(e) => handleTextChange('observations', `q${i + 1}`, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
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
                        Show your calculations here for at least 2 different solutions:
                      </label>
                      <textarea
                        value={reportData.calculations}
                        onChange={(e) => handleTextChange('calculations', '', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm font-mono"
                        rows={6}
                        placeholder="Show your work..."
                      />
                    </div>
                  </section>

                  {/* Analysis */}
                  <section>
                    <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">4. Analysis</h4>
                    <div className="space-y-4">
                      {['Relationship between pH and hydrogen ion concentration:',
                        'Comparison of different acids at same concentration:',
                        'Comparison of different bases at same concentration:',
                        'Effect of dilution on both acids and bases:'].map((q, i) => (
                          <div key={i}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {i + 1}. {q}
                            </label>
                            <textarea
                              value={reportData.analysis[`q${i + 1}`]}
                              onChange={(e) => handleTextChange('analysis', `q${i + 1}`, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
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
                        Summarize what you learned about pH, acids, bases, and indicators:
                      </label>
                      <textarea
                        value={reportData.conclusion}
                        onChange={(e) => handleTextChange('conclusion', '', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
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

export default ChemistryLab;
