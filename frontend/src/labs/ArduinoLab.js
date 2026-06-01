import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Target,
    Info,
    BookOpen,
    Clipboard,
    Download,
    Cpu,
    Code,
    Save,
    MessageSquare
} from 'lucide-react';

const ArduinoLab = ({ onComplete }) => {
    const [completed, setCompleted] = useState(false);
    const iframeRef = useRef(null);

    // Structured state for Arduino lab report
    const [reportData, setReportData] = useState({
        code: '',
        hardwareSetup: '',
        observations: '',
        analysis: {
            logic: '',
            pinConfig: '',
            challenges: ''
        },
        conclusion: ''
    });

    // Wokwi Arduino Uno embed URL
    const WOKWI_URL = 'https://wokwi.com/projects/new/arduino-uno?embed=1';

    const handleTextChange = (section, field, value) => {
        if (field === '') {
            setReportData({ ...reportData, [section]: value });
        } else {
            setReportData({
                ...reportData,
                [section]: { ...reportData[section], [field]: value }
            });
        }
    };

    const generateReport = useCallback(() => {
        return `Arduino Uno Robotics Lab Report
=================================

Objective:
----------
To learn embedded systems programming and circuit integration using the Wokwi simulator.

Board: Arduino Uno
-----------------

Code Implementation:
-------------------
${reportData.code || '[Paste your code here]'}

Hardware Setup:
--------------
${reportData.hardwareSetup || '[Describe which pins and components you used]'}

Observations:
------------
${reportData.observations || '[Describe what happens when you run the code]'}

Logic Analysis:
--------------
1. How does your code logic handle the hardware inputs/outputs?
   ${reportData.analysis.logic || '[Answer here]'}

2. Explain your pin configuration (Digital/Analog usage):
   ${reportData.analysis.pinConfig || '[Answer here]'}

3. What challenges did you face during this lab?
   ${reportData.analysis.challenges || '[Answer here]'}

Conclusion:
-----------
${reportData.conclusion || '[Summarize what you learned about Arduino and Embedded Systems]'}

Verification:
-------------
The code was tested in the Wokwi simulator and behavior was verified.
`;
    }, [reportData]);

    const handleComplete = useCallback(() => {
        if (!completed) {
            setCompleted(true);
            if (onComplete) {
                onComplete({
                    experiment: "Arduino Uno Robotics Laboratory",
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
        element.download = 'arduino-lab-report.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center"
                    >
                        <Cpu className="w-10 h-10 mr-4 text-blue-600" />
                        Arduino Uno Robotics Laboratory
                    </motion.h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
                        Interactive Embedded Systems Lab - Program and simulate Arduino Uno circuits
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
                            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                                <Target className="w-5 h-5 mr-2" />
                                Lab Tasks
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                        <Code className="w-4 h-4 mr-1" />
                                        Blink Challenge
                                    </h4>
                                    <ul className="text-sm text-blue-800 space-y-2">
                                        <li>• Code an LED to blink every 500ms</li>
                                        <li>• Use Pin 13 (Built-in LED) or external</li>
                                        <li>• Modify frequency to 1000ms</li>
                                        <li>• Observe the difference</li>
                                    </ul>
                                </div>

                                <div className="bg-emerald-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-emerald-900 mb-2 flex items-center">
                                        <BookOpen className="w-4 h-4 mr-1" />
                                        Concepts
                                    </h4>
                                    <ul className="text-sm text-emerald-800 space-y-1">
                                        <li>• setup() vs loop()</li>
                                        <li>• pinMode(), digitalWrite()</li>
                                        <li>• delay() utility</li>
                                        <li>• Serial communication</li>
                                    </ul>
                                </div>

                                {!completed && (
                                    <button
                                        onClick={handleComplete}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md mt-4"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Submit Lab Completion
                                    </button>
                                )}

                                {completed && (
                                    <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-4 text-center">
                                        <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                        <span className="font-medium text-emerald-800 block">Task Verified!</span>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            Now fill in the report details below.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Simulator & Report */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Wokwi Simulator */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200"
                        >
                            <div className="bg-slate-800 text-white p-3 flex justify-between items-center">
                                <span className="font-mono text-sm">Wokwi Arduino Simulator v1.0</span>
                                <span className="flex items-center text-xs">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                                    Live Simulation
                                </span>
                            </div>
                            <div className="relative w-full bg-slate-900" style={{ height: '600px' }}>
                                <iframe
                                    ref={iframeRef}
                                    src={WOKWI_URL}
                                    title="Arduino Wokwi Simulation"
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                />
                            </div>
                        </motion.div>

                        {/* Structured Lab Report */}
                        {completed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
                            >
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <h3 className="text-xl font-semibold text-slate-900 flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                                        Arduino Lab Report
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button onClick={copyToClipboard} className="btn-secondary py-1 text-sm bg-slate-100 px-3 rounded-md hover:bg-slate-200 flex items-center">
                                            <Clipboard className="w-4 h-4 mr-1" /> Copy
                                        </button>
                                        <button onClick={downloadReport} className="btn-secondary py-1 text-sm bg-blue-50 text-blue-600 px-3 rounded-md hover:bg-blue-100 flex items-center">
                                            <Download className="w-4 h-4 mr-1" /> Save PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Code Implementation</label>
                                        <textarea
                                            value={reportData.code}
                                            onChange={(e) => handleTextChange('code', '', e.target.value)}
                                            className="w-full p-3 font-mono text-sm bg-slate-900 text-emerald-400 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 h-48"
                                            placeholder="// Paste your Arduino C++ code here..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Hardware/Pin Setup</label>
                                            <textarea
                                                value={reportData.hardwareSetup}
                                                onChange={(e) => handleTextChange('hardwareSetup', '', e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                                rows={4}
                                                placeholder="e.g., LED connected to Pin 13 with 220 Ohm resistor..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Observations</label>
                                            <textarea
                                                value={reportData.observations}
                                                onChange={(e) => handleTextChange('observations', '', e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                                rows={4}
                                                placeholder="What happened when you clicked 'Play'?"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <h4 className="font-medium text-slate-800">Technical Analysis</h4>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Explain your code logic (How does the loop function?)</label>
                                            <textarea
                                                value={reportData.analysis.logic}
                                                onChange={(e) => handleTextChange('analysis', 'logic', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                                rows={2}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Pin Configuration Strategy</label>
                                            <textarea
                                                value={reportData.analysis.pinConfig}
                                                onChange={(e) => handleTextChange('analysis', 'pinConfig', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-md text-sm"
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Conclusion</label>
                                        <textarea
                                            value={reportData.conclusion}
                                            onChange={(e) => handleTextChange('conclusion', '', e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                            rows={3}
                                            placeholder="What are the key takeaways from this lab?"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArduinoLab;
