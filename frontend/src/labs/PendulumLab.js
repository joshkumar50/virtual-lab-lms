import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Target,
    Info,
    BookOpen,
    Clipboard,
    Download,
    Timer,
    Save,
    RefreshCw
} from 'lucide-react';

const PendulumLab = ({ onComplete }) => {
    const [completed, setCompleted] = useState(false);
    const iframeRef = useRef(null);

    // PhET Pendulum Lab simulation URL - Locked to 'Lab' screen
    const PHET_URL = 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html?screens=3';

    // Structured state for lab report data
    const [reportData, setReportData] = useState({
        part1: [
            { id: 1, length: '', time10: '', period: '' },
            { id: 2, length: '', time10: '', period: '' },
            { id: 3, length: '', time10: '', period: '' }
        ],
        part2: [
            { id: 4, mass: '', period: '' },
            { id: 5, mass: '', period: '' }
        ],
        part3: [
            { id: 6, amplitude: '', period: '' },
            { id: 7, amplitude: '', period: '' }
        ],
        observations: {
            q1: '',
            q2: '',
            q3: ''
        },
        analysis: {
            q1: '',
            q2: '',
            q3: ''
        },
        conclusion: ''
    });

    // Handle input changes
    const handleDataChange = (part, index, field, value) => {
        const newData = [...reportData[part]];
        newData[index] = { ...newData[index], [field]: value };
        setReportData({ ...reportData, [part]: newData });
    };

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
        return `Pendulum Lab Report
=====================

Objective:
----------
To investigate the factors affecting the period of a pendulum (length, mass, and amplitude) using the interactive simulation.

Materials:
----------
- Interactive Pendulum Simulation
- Virtual Stopwatch
- Virtual Protractor
- Rulers

Procedure:
----------
1. Set the pendulum to a specific length.
2. Measure the time for 10 oscillations to calculate the period (T).
3. Repeat the experiment by changing the length while keeping mass and amplitude constant.
4. Repeat the experiment by changing the mass while keeping length and amplitude constant.
5. Repeat the experiment by changing the amplitude while keeping length and mass constant.
6. Record all data in the tables below.

Data Collection:
---------------

Part 1: Effect of Length (Mass = 1.0kg, Amplitude = 10°)
Trial 1:
  - Length: ${reportData.part1[0].length || '_______'} m
  - Time for 10 swings: ${reportData.part1[0].time10 || '_______'} s
  - Period (T): ${reportData.part1[0].period || '_______'} s

Trial 2:
  - Length: ${reportData.part1[1].length || '_______'} m
  - Time for 10 swings: ${reportData.part1[1].time10 || '_______'} s
  - Period (T): ${reportData.part1[1].period || '_______'} s

Trial 3:
  - Length: ${reportData.part1[2].length || '_______'} m
  - Time for 10 swings: ${reportData.part1[2].time10 || '_______'} s
  - Period (T): ${reportData.part1[2].period || '_______'} s

Part 2: Effect of Mass (Length = 0.70m, Amplitude = 10°)
Trial 4:
  - Mass: ${reportData.part2[0].mass || '_______'} kg
  - Period (T): ${reportData.part2[0].period || '_______'} s

Trial 5:
  - Mass: ${reportData.part2[1].mass || '_______'} kg
  - Period (T): ${reportData.part2[1].period || '_______'} s

Part 3: Effect of Amplitude (Length = 0.70m, Mass = 1.0kg)
Trial 6:
  - Amplitude: ${reportData.part3[0].amplitude || '_______'} °
  - Period (T): ${reportData.part3[0].period || '_______'} s

Trial 7:
  - Amplitude: ${reportData.part3[1].amplitude || '_______'} °
  - Period (T): ${reportData.part3[1].period || '_______'} s

Observations:
-------------
1. What happened to the period when you increased the length?
   ${reportData.observations.q1 || '[Answer here]'}

2. What effect did changing the mass have on the period?
   ${reportData.observations.q2 || '[Answer here]'}

3. What effect did changing the initial amplitude (up to 20°) have on the period?
   ${reportData.observations.q3 || '[Answer here]'}


Analysis:
---------
1. Based on your data, which variable(s) significantly affect the period of a pendulum?
   ${reportData.analysis.q1 || '[Answer here]'}

2. Use the formula T = 2π√(L/g) to calculate the theoretical period for your longest length.
   (Use g = 9.8 m/s²)
   Calculation:
   ${reportData.analysis.q2 || '[Answer here]'}

3. Compare your measured period with the theoretical value. What is the percentage error?
   ${reportData.analysis.q3 || '[Answer here]'}


Conclusions:
-----------
${reportData.conclusion || '[Summarize your findings about pendulum motion and the factors that influence its period]'}

Key Concepts:
- Period (T) is the time for one complete back-and-forth swing.
- Only length and gravity affect the period of a simple pendulum (for small angles).
- Mass and amplitude (small angles) do not affect the period.

Verification:
-------------
The data collected clearly shows the relationship between pendulum length and its period of oscillation.
`;
    }, [reportData]);

    const handleComplete = useCallback(() => {
        if (!completed) {
            setCompleted(true);

            if (onComplete) {
                onComplete({
                    experiment: "Pendulum Laboratory",
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
        element.download = 'pendulum-lab-report.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Pendulum Laboratory
                    </motion.h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                        Interactive Laboratory - Explore the harmonic motion of a pendulum
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
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                                        <Info className="w-4 h-4 mr-1" />
                                        How to Use
                                    </h4>
                                    <ul className="text-sm text-orange-800 space-y-2">
                                        <li>• Drag pendulum to start oscillation</li>
                                        <li>• Adjust length and mass strings</li>
                                        <li>• Use stopwatch for period timing</li>
                                        <li>• Record 10 swings and divide by 10</li>
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
                                    title="Pendulum Laboratory"
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
                                    {/* Part 1: Effect of Length */}
                                    <section>
                                        <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                                            Part 1: Effect of Length (Mass = 1.0kg, Amplitude = 10°)
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (m)</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time for 10 swings (s)</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period T (s)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {reportData.part1.map((trial, index) => (
                                                        <tr key={trial.id}>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{trial.id}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" value={trial.length} onChange={(e) => handleDataChange('part1', index, 'length', e.target.value)} className="w-24 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="0.00" />
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" value={trial.time10} onChange={(e) => handleDataChange('part1', index, 'time10', e.target.value)} className="w-24 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="0.00" />
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" value={trial.period} onChange={(e) => handleDataChange('part1', index, 'period', e.target.value)} className="w-24 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="0.00" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* Part 2: Effect of Mass */}
                                    <section>
                                        <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                                            Part 2: Effect of Mass (Length = 0.70m, Amplitude = 10°)
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mass (kg)</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period T (s)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {reportData.part2.map((trial, index) => (
                                                        <tr key={trial.id}>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{trial.id}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" value={trial.mass} onChange={(e) => handleDataChange('part2', index, 'mass', e.target.value)} className="w-24 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="0.00" />
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" value={trial.period} onChange={(e) => handleDataChange('part2', index, 'period', e.target.value)} className="w-24 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="0.00" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* Part 3: Effect of Amplitude */}
                                    <section>
                                        <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                                            Part 3: Effect of Amplitude (Length = 0.70m, Mass = 1.0kg)
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amplitude (°)</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period T (s)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {reportData.part3.map((trial, index) => (
                                                        <tr key={trial.id}>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{trial.id}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" value={trial.amplitude} onChange={(e) => handleDataChange('part3', index, 'amplitude', e.target.value)} className="w-24 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="0" />
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <input type="number" value={trial.period} onChange={(e) => handleDataChange('part3', index, 'period', e.target.value)} className="w-24 p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="0.00" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* Observations & Analysis */}
                                    <section>
                                        <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Observations & Analysis</h4>
                                        <div className="space-y-4">
                                            {['What happened to the period when you increased the length?',
                                                'What effect did changing the mass have on the period?',
                                                'What effect did changing the initial amplitude (up to 20°) have on the period?'].map((q, i) => (
                                                    <div key={i}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{i + 1}. {q}</label>
                                                        <input type="text" value={reportData.observations[`q${i + 1}`]} onChange={(e) => handleTextChange('observations', `q${i + 1}`, e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" placeholder="Answer here..." />
                                                    </div>
                                                ))}

                                            <div className="mt-6 border-t pt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    1. Based on your data, which variable(s) significantly affect the period of a pendulum?
                                                </label>
                                                <textarea value={reportData.analysis.q1} onChange={(e) => handleTextChange('analysis', 'q1', e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" rows={2} placeholder="Analysis here..." />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    2. Calculation: T = 2π√(L/g) (Theoretical Period)
                                                </label>
                                                <textarea value={reportData.analysis.q2} onChange={(e) => handleTextChange('analysis', 'q2', e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm font-mono" rows={3} placeholder="Show calculation..." />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    3. Comparison and Percentage Error:
                                                </label>
                                                <textarea value={reportData.analysis.q3} onChange={(e) => handleTextChange('analysis', 'q3', e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm" rows={2} placeholder="Compare values..." />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Conclusion */}
                                    <section>
                                        <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Conclusions</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Summarize your findings about pendulum motion:
                                            </label>
                                            <textarea
                                                value={reportData.conclusion}
                                                onChange={(e) => handleTextChange('conclusion', '', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
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

export default PendulumLab;
