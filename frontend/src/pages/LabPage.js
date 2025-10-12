import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Download,
  Upload,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LogicGateSimulator from '../labs/LogicGateSimulator';
import OhmsLawLab from '../labs/OhmsLawLab';
import DoubleSlitLab from '../labs/DoubleSlitLab';
import ChemistryLab from '../labs/ChemistryLab';
import CircuitAnalysisLab from '../labs/CircuitAnalysisLab';

const LabPage = () => {
  const { courseId, labId } = useParams();
  const [labResults, setLabResults] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mock lab data
  const labData = {
    1: {
      title: 'Logic Gate Simulator',
      description: 'Learn the fundamentals of AND, OR, and NOT gates through interactive simulations.',
      type: 'engineering',
      duration: '2 hours',
      objectives: [
        'Understand basic logic gate operations',
        'Practice with AND, OR, and NOT gates',
        'Analyze gate behavior with different inputs',
        'Design simple logic circuits'
      ]
    },
    2: {
      title: 'Ohm\'s Law Laboratory',
      description: 'Explore electrical circuits and understand the relationship between voltage, current, and resistance.',
      type: 'physics',
      duration: '1.5 hours',
      objectives: [
        'Understand Ohm\'s Law (V = I × R)',
        'Analyze the relationship between voltage, current, and resistance',
        'Calculate electrical power using P = V × I',
        'Observe how changing one parameter affects others'
      ]
    },
    3: {
      title: 'pH Color Change Lab',
      description: 'Explore pH levels, acid-base reactions, and color changes in chemistry.',
      type: 'chemistry',
      duration: '1 hour',
      objectives: [
        'Understand pH scale and acid-base concepts',
        'Perform virtual titrations',
        'Observe color changes with indicators',
        'Analyze chemical reactions'
      ]
    },
    4: {
      title: 'Circuit Analysis Lab',
      description: 'Build and analyze electrical circuits with interactive components and real-time calculations.',
      type: 'engineering',
      duration: '2 hours',
      objectives: [
        'Understand basic circuit components (resistors, capacitors, voltage sources)',
        'Analyze series and parallel circuits',
        'Calculate voltage, current, and power',
        'Apply Ohm\'s law and circuit analysis techniques'
      ]
    },
    5: {
      title: 'Double Slit Experiment',
      description: 'Explore wave interference and diffraction with interactive double slit simulation.',
      type: 'physics',
      duration: '1.5 hours',
      objectives: [
        'Understand wave interference and diffraction principles',
        'Analyze double slit interference patterns',
        'Calculate fringe spacing and wavelength relationships',
        'Observe constructive and destructive interference'
      ]
    }
  };

  const currentLab = labData[labId] || labData[1];

  const handleLabComplete = (results) => {
    setLabResults(results);
    setIsCompleted(true);
  };

  const handleSubmitResults = () => {
    // Submit results to backend
    console.log('Submitting lab results:', labResults);
    // Show success message
  };

  const renderLabComponent = () => {
    switch (labId) {
      case '1':
        return <LogicGateSimulator onComplete={handleLabComplete} />;
      case '2':
        return <OhmsLawLab onComplete={handleLabComplete} />;
      case '3':
        return <ChemistryLab onComplete={handleLabComplete} />;
      case '4':
        return <CircuitAnalysisLab onComplete={handleLabComplete} />;
      case '5':
        return <DoubleSlitLab onComplete={handleLabComplete} />;
      default:
        return <LogicGateSimulator onComplete={handleLabComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to={`/course/${courseId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Course
          </Link>
        </div>

        {/* Lab Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentLab.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {currentLab.description}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">{currentLab.duration}</span>
              </div>
              {isCompleted && (
                <div className="flex items-center space-x-1 text-success-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentLab.objectives.map((objective, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lab Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          {renderLabComponent()}
        </motion.div>

        {/* Lab Results */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card mt-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lab Results
            </h2>
            
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span className="font-medium text-success-800">Lab Completed Successfully!</span>
              </div>
              <p className="text-sm text-success-700">
                Great job! You've completed all the required tasks for this lab.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSubmitResults}
                className="btn btn-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Results
              </button>
              <button className="btn btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </button>
              <button className="btn btn-secondary">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Lab
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LabPage;
