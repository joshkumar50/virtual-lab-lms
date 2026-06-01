import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import ArduinoLab from '../labs/ArduinoLab';

const ArduinoLabStandalone = () => {
    const [report, setReport] = useState('');
    const handleComplete = (results) => {
        // Report is handled inside ArduinoLab, onComplete provides metadata
        console.log('Lab completed:', results);
    };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/"
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Home
                            </Link>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <Link
                                to="/"
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Home
                            </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                            Virtual Lab LMS - Arduino Uno Robotics Laboratory
                        </div>
                    </div>
                </div>
            </div>

            {/* Lab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <ArduinoLab onComplete={handleComplete} />
            </div>
        </div>
    );
};

export default ArduinoLabStandalone;
