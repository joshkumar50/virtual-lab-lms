import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import CircuitAnalysisLab from '../labs/CircuitAnalysisLab';

const CircuitAnalysisLabStandalone = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  const handleLabComplete = (data) => {
    setCompletionData(data);
    setIsCompleted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link
                to="/courses"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Courses
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-blue-600">
                <Zap className="h-6 w-6 mr-2" />
                <span className="font-semibold">Circuit Analysis Lab</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Lab Content */}
      <div className="relative">
        {!isCompleted ? (
          <CircuitAnalysisLab onComplete={handleLabComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Circuit Analysis Lab Completed!
                </h1>
                
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {completionData?.score || 0}
                      </div>
                      <div className="text-sm text-gray-600">Final Score</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {completionData?.experimentsCompleted || 0}/{completionData?.totalExperiments || 0}
                      </div>
                      <div className="text-sm text-gray-600">Experiments</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800">Lab Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Circuits Analyzed:</span>
                        <span className="font-medium">{completionData?.labData?.circuitsAnalyzed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Components:</span>
                        <span className="font-medium">{completionData?.labData?.totalComponents || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Analysis Accuracy:</span>
                        <span className="font-medium text-green-600">Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setIsCompleted(false);
                      setCompletionData(null);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                  
                  <Link
                    to="/courses"
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
                  >
                    Back to Courses
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Virtual Lab LMS - Circuit Analysis Laboratory
            </p>
            <p className="text-xs mt-1 text-gray-500">
              Interactive electrical circuit simulation and analysis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CircuitAnalysisLabStandalone;

